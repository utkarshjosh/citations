/**
 * Subscribe Controller
 * Handles email subscription for daily digest
 */

import database from '../utils/db.js';
import crypto from 'crypto';

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate verification token
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Subscribe to email digest
 * POST /api/subscribe
 */
export const subscribe = async (req, res) => {
  try {
    const { email, categories = [] } = req.body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Valid email address is required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const subscriptionsCollection = database.getCollection('subscriptions');

    // Check if already subscribed
    const existing = await subscriptionsCollection.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.verified) {
        return res.status(200).json({
          success: true,
          message: 'Email is already subscribed',
          data: {
            email: normalizedEmail,
            verified: true
          }
        });
      } else {
        // Resend verification
        const verificationToken = generateToken();
        await subscriptionsCollection.updateOne(
          { email: normalizedEmail },
          {
            $set: {
              verification_token: verificationToken,
              updated_at: new Date()
            }
          }
        );

        // TODO: Send verification email
        console.log(`Verification token for ${normalizedEmail}: ${verificationToken}`);

        return res.status(200).json({
          success: true,
          message: 'Verification email resent',
          data: {
            email: normalizedEmail,
            verified: false
          }
        });
      }
    }

    // Create new subscription
    const verificationToken = generateToken();
    const subscription = {
      email: normalizedEmail,
      categories: Array.isArray(categories) ? categories : [],
      verified: false,
      verification_token: verificationToken,
      active: true,
      created_at: new Date(),
      updated_at: new Date()
    };

    await subscriptionsCollection.insertOne(subscription);

    // TODO: Send verification email
    console.log(`Verification token for ${normalizedEmail}: ${verificationToken}`);

    res.status(201).json({
      success: true,
      message: 'Subscription created. Please check your email to verify.',
      data: {
        email: normalizedEmail,
        verified: false
      }
    });
  } catch (error) {
    console.error('Error subscribing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to subscribe'
    });
  }
};

/**
 * Unsubscribe from email digest
 * POST /api/subscribe/unsubscribe
 */
export const unsubscribe = async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Valid email address is required'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const subscriptionsCollection = database.getCollection('subscriptions');

    // Build query
    const query = { email: normalizedEmail };
    if (token) {
      query.verification_token = token;
    }

    // Update subscription
    const result = await subscriptionsCollection.updateOne(
      query,
      {
        $set: {
          active: false,
          unsubscribed_at: new Date(),
          updated_at: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Subscription not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed',
      data: {
        email: normalizedEmail
      }
    });
  } catch (error) {
    console.error('Error unsubscribing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unsubscribe'
    });
  }
};

/**
 * Verify email subscription
 * GET /api/subscribe/verify/:token
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required'
      });
    }

    const subscriptionsCollection = database.getCollection('subscriptions');

    // Find and update subscription
    const result = await subscriptionsCollection.findOneAndUpdate(
      { 
        verification_token: token,
        verified: false
      },
      {
        $set: {
          verified: true,
          verified_at: new Date(),
          updated_at: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired verification token'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      data: {
        email: result.email,
        verified: true
      }
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify email'
    });
  }
};
