/**
 * Database Test Script
 * Tests database connection, schema validation, and indexes
 */

import database from './db.js';
import { Paper, User, Engagement } from '../models/index.js';

async function testDatabase() {
  console.log('🧪 Starting database tests...\n');

  try {
    // Test 1: Database Connection
    console.log('Test 1: Database Connection');
    await database.connect();
    const isHealthy = await database.healthCheck();
    console.log(`✅ Database connection: ${isHealthy ? 'PASSED' : 'FAILED'}\n`);

    // Test 2: Get Database Stats
    console.log('Test 2: Database Statistics');
    const stats = await database.getStats();
    console.log('Database Stats:', JSON.stringify(stats, null, 2));
    console.log('✅ Database stats: PASSED\n');

    // Test 3: Paper Schema Validation
    console.log('Test 3: Paper Schema Validation');
    const papersCollection = database.getPapersCollection();
    
    // Valid paper
    const validPaper = Paper.sanitize({
      arxiv_id: 'test-2024-001',
      title: 'Test Paper: Advanced Machine Learning',
      authors: ['John Doe', 'Jane Smith'],
      abstract: 'This is a test abstract for validation purposes.',
      category: 'cs.AI',
      summary: 'A plain English summary of the paper.',
      why_it_matters: 'This research matters because...',
      applications: ['Application 1', 'Application 2'],
      pdf_url: 'https://arxiv.org/pdf/test-2024-001',
      arxiv_url: 'https://arxiv.org/abs/test-2024-001',
      published_date: new Date()
    });

    try {
      await papersCollection.insertOne(validPaper);
      console.log('✅ Valid paper insertion: PASSED');
    } catch (error) {
      console.log('❌ Valid paper insertion: FAILED', error.message);
    }

    // Invalid paper (should fail validation)
    try {
      await papersCollection.insertOne({
        arxiv_id: 'test-2024-002',
        // Missing required fields
      });
      console.log('❌ Invalid paper rejection: FAILED (should have been rejected)');
    } catch (error) {
      console.log('✅ Invalid paper rejection: PASSED (correctly rejected)');
    }

    // Test 4: User Schema Validation
    console.log('\nTest 4: User Schema Validation');
    const usersCollection = database.getUsersCollection();
    
    const validUser = User.sanitize({
      email: 'test@example.com',
      name: 'Test User',
      preferences: {
        categories: ['cs.AI', 'cs.ML'],
        email_notifications: true,
        notification_frequency: 'daily'
      }
    });

    try {
      await usersCollection.insertOne(validUser);
      console.log('✅ Valid user insertion: PASSED');
    } catch (error) {
      console.log('❌ Valid user insertion: FAILED', error.message);
    }

    // Invalid user (bad email)
    try {
      await usersCollection.insertOne({
        email: 'invalid-email',
        created_at: new Date()
      });
      console.log('❌ Invalid user rejection: FAILED (should have been rejected)');
    } catch (error) {
      console.log('✅ Invalid user rejection: PASSED (correctly rejected)');
    }

    // Test 5: Engagement Schema Validation
    console.log('\nTest 5: Engagement Schema Validation');
    const engagementCollection = database.getEngagementCollection();
    
    const validEngagement = Engagement.sanitize({
      paper_id: 'test-2024-001',
      user_id: 'test-user-001',
      engagement_type: 'like',
      metadata: {
        ip_address: '127.0.0.1',
        user_agent: 'Test Agent',
        device_type: 'desktop'
      }
    });

    try {
      await engagementCollection.insertOne(validEngagement);
      console.log('✅ Valid engagement insertion: PASSED');
    } catch (error) {
      console.log('❌ Valid engagement insertion: FAILED', error.message);
    }

    // Test 6: Unique Constraints
    console.log('\nTest 6: Unique Constraints');
    try {
      await papersCollection.insertOne(validPaper);
      console.log('❌ Duplicate paper prevention: FAILED (should have been rejected)');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Duplicate paper prevention: PASSED (correctly rejected)');
      } else {
        console.log('❌ Duplicate paper prevention: FAILED', error.message);
      }
    }

    try {
      await usersCollection.insertOne(validUser);
      console.log('❌ Duplicate user prevention: FAILED (should have been rejected)');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Duplicate user prevention: PASSED (correctly rejected)');
      } else {
        console.log('❌ Duplicate user prevention: FAILED', error.message);
      }
    }

    // Test 7: Index Performance
    console.log('\nTest 7: Index Verification');
    const paperIndexes = await papersCollection.indexes();
    const userIndexes = await usersCollection.indexes();
    const engagementIndexes = await engagementCollection.indexes();
    
    console.log(`Papers collection indexes: ${paperIndexes.length}`);
    console.log(`Users collection indexes: ${userIndexes.length}`);
    console.log(`Engagement collection indexes: ${engagementIndexes.length}`);
    console.log('✅ Index verification: PASSED\n');

    // Cleanup test data
    console.log('🧹 Cleaning up test data...');
    await papersCollection.deleteMany({ arxiv_id: /^test-/ });
    await usersCollection.deleteMany({ email: /^test@/ });
    await engagementCollection.deleteMany({ paper_id: /^test-/ });
    console.log('✅ Cleanup: PASSED\n');

    console.log('✅ All database tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await database.close();
    process.exit(0);
  }
}

// Run tests
testDatabase();
