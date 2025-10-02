/**
 * Engagement Model
 * Schema for tracking user engagement (likes, views, etc.)
 */

class Engagement {
  /**
   * Validate engagement data structure
   * @param {Object} data - Engagement data to validate
   * @returns {Object} - Validated engagement object
   * @throws {Error} - If validation fails
   */
  static validate(data) {
    const errors = [];

    // Required fields validation
    if (!data.paper_id || typeof data.paper_id !== 'string') {
      errors.push('paper_id is required and must be a string');
    }

    if (!data.engagement_type || typeof data.engagement_type !== 'string') {
      errors.push('engagement_type is required and must be a string');
    }

    const validTypes = ['like', 'view', 'share', 'bookmark'];
    if (data.engagement_type && !validTypes.includes(data.engagement_type)) {
      errors.push(`engagement_type must be one of: ${validTypes.join(', ')}`);
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return this.sanitize(data);
  }

  /**
   * Sanitize and structure engagement data
   * @param {Object} data - Raw engagement data
   * @returns {Object} - Sanitized engagement object
   */
  static sanitize(data) {
    const now = new Date();

    return {
      paper_id: data.paper_id.trim(),
      user_id: data.user_id?.trim() || null,
      session_id: data.session_id?.trim() || null,
      engagement_type: data.engagement_type.trim(),
      metadata: {
        ip_address: data.metadata?.ip_address || null,
        user_agent: data.metadata?.user_agent || null,
        referrer: data.metadata?.referrer || null,
        device_type: data.metadata?.device_type || null
      },
      created_at: data.created_at ? new Date(data.created_at) : now
    };
  }

  /**
   * Create indexes for the engagement collection
   * @param {Object} collection - MongoDB collection
   */
  static async createIndexes(collection) {
    await collection.createIndex({ paper_id: 1, user_id: 1, engagement_type: 1 });
    await collection.createIndex({ paper_id: 1, created_at: -1 });
    await collection.createIndex({ user_id: 1, created_at: -1 });
    await collection.createIndex({ session_id: 1 });
    await collection.createIndex({ engagement_type: 1 });
    await collection.createIndex({ created_at: -1 });
    // Compound index for analytics queries
    await collection.createIndex({ paper_id: 1, engagement_type: 1, created_at: -1 });
  }

  /**
   * Get collection schema for validation (MongoDB schema validation)
   * @returns {Object} - MongoDB validation schema
   */
  static getValidationSchema() {
    return {
      $jsonSchema: {
        bsonType: 'object',
        required: ['paper_id', 'engagement_type', 'created_at'],
        properties: {
          paper_id: {
            bsonType: 'string',
            description: 'arXiv paper ID - required'
          },
          user_id: {
            bsonType: ['string', 'null'],
            description: 'User ID (if authenticated)'
          },
          session_id: {
            bsonType: ['string', 'null'],
            description: 'Session ID (for anonymous users)'
          },
          engagement_type: {
            bsonType: 'string',
            enum: ['like', 'view', 'share', 'bookmark'],
            description: 'Type of engagement - required'
          },
          metadata: {
            bsonType: 'object',
            properties: {
              ip_address: {
                bsonType: ['string', 'null'],
                description: 'User IP address'
              },
              user_agent: {
                bsonType: ['string', 'null'],
                description: 'User agent string'
              },
              referrer: {
                bsonType: ['string', 'null'],
                description: 'Referrer URL'
              },
              device_type: {
                bsonType: ['string', 'null'],
                enum: ['mobile', 'tablet', 'desktop', null],
                description: 'Device type'
              }
            }
          },
          created_at: {
            bsonType: 'date',
            description: 'Engagement timestamp - required'
          }
        }
      }
    };
  }

  /**
   * Get engagement statistics for a paper
   * @param {Object} collection - MongoDB collection
   * @param {string} paperId - Paper ID
   * @returns {Promise<Object>} - Engagement statistics
   */
  static async getStats(collection, paperId) {
    const pipeline = [
      { $match: { paper_id: paperId } },
      {
        $group: {
          _id: '$engagement_type',
          count: { $sum: 1 }
        }
      }
    ];

    const results = await collection.aggregate(pipeline).toArray();
    
    const stats = {
      likes: 0,
      views: 0,
      shares: 0,
      bookmarks: 0
    };

    results.forEach(result => {
      stats[`${result._id}s`] = result.count;
    });

    return stats;
  }

  /**
   * Get trending papers based on engagement
   * @param {Object} collection - MongoDB collection
   * @param {number} limit - Number of papers to return
   * @param {number} daysBack - Number of days to look back
   * @returns {Promise<Array>} - Trending papers
   */
  static async getTrending(collection, limit = 10, daysBack = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const pipeline = [
      {
        $match: {
          created_at: { $gte: startDate },
          engagement_type: 'like'
        }
      },
      {
        $group: {
          _id: '$paper_id',
          likes: { $sum: 1 }
        }
      },
      { $sort: { likes: -1 } },
      { $limit: limit }
    ];

    return await collection.aggregate(pipeline).toArray();
  }
}

export default Engagement;
