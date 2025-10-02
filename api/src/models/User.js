/**
 * User Model
 * Schema for user accounts and preferences
 */

class User {
  /**
   * Validate user data structure
   * @param {Object} data - User data to validate
   * @returns {Object} - Validated user object
   * @throws {Error} - If validation fails
   */
  static validate(data) {
    const errors = [];

    // Email validation
    if (!data.email || typeof data.email !== 'string') {
      errors.push('email is required and must be a string');
    } else if (!this.isValidEmail(data.email)) {
      errors.push('email must be a valid email address');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return this.sanitize(data);
  }

  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - True if valid email
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Sanitize and structure user data
   * @param {Object} data - Raw user data
   * @returns {Object} - Sanitized user object
   */
  static sanitize(data) {
    const now = new Date();

    return {
      email: data.email.trim().toLowerCase(),
      name: data.name?.trim() || null,
      preferences: {
        categories: Array.isArray(data.preferences?.categories) 
          ? data.preferences.categories 
          : [],
        email_notifications: data.preferences?.email_notifications !== false,
        notification_frequency: data.preferences?.notification_frequency || 'daily'
      },
      subscription_status: data.subscription_status || 'active',
      last_active: data.last_active ? new Date(data.last_active) : now,
      created_at: data.created_at ? new Date(data.created_at) : now,
      updated_at: data.updated_at ? new Date(data.updated_at) : now
    };
  }

  /**
   * Create indexes for the users collection
   * @param {Object} collection - MongoDB collection
   */
  static async createIndexes(collection) {
    await collection.createIndex({ email: 1 }, { unique: true });
    await collection.createIndex({ created_at: -1 });
    await collection.createIndex({ subscription_status: 1 });
    await collection.createIndex({ last_active: -1 });
    await collection.createIndex({ 'preferences.categories': 1 });
  }

  /**
   * Get collection schema for validation (MongoDB schema validation)
   * @returns {Object} - MongoDB validation schema
   */
  static getValidationSchema() {
    return {
      $jsonSchema: {
        bsonType: 'object',
        required: ['email', 'created_at'],
        properties: {
          email: {
            bsonType: 'string',
            pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
            description: 'User email address - required and must be unique'
          },
          name: {
            bsonType: ['string', 'null'],
            description: 'User name'
          },
          preferences: {
            bsonType: 'object',
            properties: {
              categories: {
                bsonType: 'array',
                items: {
                  bsonType: 'string'
                },
                description: 'Preferred research categories'
              },
              email_notifications: {
                bsonType: 'bool',
                description: 'Whether user wants email notifications'
              },
              notification_frequency: {
                bsonType: 'string',
                enum: ['daily', 'weekly', 'never'],
                description: 'How often to send notifications'
              }
            }
          },
          subscription_status: {
            bsonType: 'string',
            enum: ['active', 'unsubscribed', 'bounced'],
            description: 'Email subscription status'
          },
          last_active: {
            bsonType: 'date',
            description: 'Last activity timestamp'
          },
          created_at: {
            bsonType: 'date',
            description: 'Account creation timestamp - required'
          },
          updated_at: {
            bsonType: 'date',
            description: 'Account update timestamp'
          }
        }
      }
    };
  }
}

export default User;
