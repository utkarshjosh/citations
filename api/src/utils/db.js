/**
 * MongoDB Database Connection Utility
 * Manages connection pooling and provides access to collections
 */

import { MongoClient } from 'mongodb';
import Paper from '../models/Paper.js';
import User from '../models/User.js';
import Engagement from '../models/Engagement.js';

class Database {
  constructor() {
    this.client = null;
    this.db = null;
    this.isConnected = false;
  }

  /**
   * Connect to MongoDB
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.isConnected) {
      return;
    }

    try {
      const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
      const dbName = process.env.MONGODB_DB_NAME || 'brain_scroll';

      console.log('🔌 Connecting to MongoDB...');

      this.client = new MongoClient(uri, {
        maxPoolSize: 50,
        minPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      await this.client.connect();
      
      // Test connection
      await this.client.db('admin').command({ ping: 1 });
      
      this.db = this.client.db(dbName);
      this.isConnected = true;

      console.log('✅ MongoDB connected successfully');

      // Initialize collections and indexes
      await this.initializeCollections();

    } catch (error) {
      console.error('❌ MongoDB connection error:', error);
      throw error;
    }
  }

  /**
   * Initialize collections with schema validation and indexes
   * @returns {Promise<void>}
   */
  async initializeCollections() {
    try {
      console.log('🔧 Initializing collections and indexes...');

      // Get existing collections
      const collections = await this.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);

      // Papers collection
      if (!collectionNames.includes('papers')) {
        await this.db.createCollection('papers', {
          validator: Paper.getValidationSchema()
        });
        console.log('✅ Created papers collection with validation');
      }
      await Paper.createIndexes(this.db.collection('papers'));
      console.log('✅ Papers indexes created');

      // Users collection
      if (!collectionNames.includes('users')) {
        await this.db.createCollection('users', {
          validator: User.getValidationSchema()
        });
        console.log('✅ Created users collection with validation');
      }
      await User.createIndexes(this.db.collection('users'));
      console.log('✅ Users indexes created');

      // Engagement collection
      if (!collectionNames.includes('engagement')) {
        await this.db.createCollection('engagement', {
          validator: Engagement.getValidationSchema()
        });
        console.log('✅ Created engagement collection with validation');
      }
      await Engagement.createIndexes(this.db.collection('engagement'));
      console.log('✅ Engagement indexes created');

      console.log('✅ All collections initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing collections:', error);
      throw error;
    }
  }

  /**
   * Get a collection
   * @param {string} name - Collection name
   * @returns {Object} - MongoDB collection
   */
  getCollection(name) {
    if (!this.isConnected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db.collection(name);
  }

  /**
   * Get papers collection
   * @returns {Object} - Papers collection
   */
  getPapersCollection() {
    return this.getCollection('papers');
  }

  /**
   * Get users collection
   * @returns {Object} - Users collection
   */
  getUsersCollection() {
    return this.getCollection('users');
  }

  /**
   * Get engagement collection
   * @returns {Object} - Engagement collection
   */
  getEngagementCollection() {
    return this.getCollection('engagement');
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
      console.log('🔌 MongoDB connection closed');
    }
  }

  /**
   * Health check
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      if (!this.isConnected) {
        return false;
      }
      await this.client.db('admin').command({ ping: 1 });
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    try {
      const stats = await this.db.stats();
      const papersCount = await this.getPapersCollection().countDocuments();
      const usersCount = await this.getUsersCollection().countDocuments();
      const engagementCount = await this.getEngagementCollection().countDocuments();

      return {
        database: stats.db,
        collections: stats.collections,
        dataSize: stats.dataSize,
        indexSize: stats.indexSize,
        counts: {
          papers: papersCount,
          users: usersCount,
          engagement: engagementCount
        }
      };
    } catch (error) {
      console.error('Error getting database stats:', error);
      throw error;
    }
  }
}

// Create singleton instance
const database = new Database();

export default database;
