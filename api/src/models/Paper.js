/**
 * Paper Model
 * Schema for research papers from arXiv
 */

class Paper {
  /**
   * Validate paper data structure
   * @param {Object} data - Paper data to validate
   * @returns {Object} - Validated paper object
   * @throws {Error} - If validation fails
   */
  static validate(data) {
    const errors = [];

    // Required fields validation
    if (!data.arxiv_id || typeof data.arxiv_id !== 'string') {
      errors.push('arxiv_id is required and must be a string');
    }

    if (!data.title || typeof data.title !== 'string') {
      errors.push('title is required and must be a string');
    }

    if (!data.authors || !Array.isArray(data.authors) || data.authors.length === 0) {
      errors.push('authors is required and must be a non-empty array');
    }

    if (!data.abstract || typeof data.abstract !== 'string') {
      errors.push('abstract is required and must be a string');
    }

    if (!data.category || typeof data.category !== 'string') {
      errors.push('category is required and must be a string');
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }

    return this.sanitize(data);
  }

  /**
   * Sanitize and structure paper data
   * @param {Object} data - Raw paper data
   * @returns {Object} - Sanitized paper object
   */
  static sanitize(data) {
    const now = new Date();

    return {
      arxiv_id: data.arxiv_id.trim(),
      title: data.title.trim(),
      authors: data.authors.map(author => author.trim()),
      abstract: data.abstract.trim(),
      summary: data.summary?.trim() || null,
      why_it_matters: data.why_it_matters?.trim() || null,
      applications: Array.isArray(data.applications) 
        ? data.applications.map(app => app.trim()) 
        : [],
      category: data.category.trim(),
      pdf_url: data.pdf_url?.trim() || null,
      arxiv_url: data.arxiv_url?.trim() || null,
      published_date: data.published_date ? new Date(data.published_date) : null,
      likes_count: data.likes_count || 0,
      views_count: data.views_count || 0,
      processed: data.processed || false,
      processed_at: data.processed_at ? new Date(data.processed_at) : null,
      created_at: data.created_at ? new Date(data.created_at) : now,
      updated_at: data.updated_at ? new Date(data.updated_at) : now
    };
  }

  /**
   * Create indexes for the papers collection
   * @param {Object} collection - MongoDB collection
   */
  static async createIndexes(collection) {
    await collection.createIndex({ arxiv_id: 1 }, { unique: true });
    await collection.createIndex({ created_at: -1 });
    await collection.createIndex({ category: 1 });
    await collection.createIndex({ processed: 1 });
    await collection.createIndex({ processed_at: 1 });
    await collection.createIndex({ likes_count: -1 });
    await collection.createIndex({ published_date: -1 });
    await collection.createIndex({ category: 1, created_at: -1 });
    await collection.createIndex({ category: 1, likes_count: -1 });
  }

  /**
   * Get collection schema for validation (MongoDB schema validation)
   * @returns {Object} - MongoDB validation schema
   */
  static getValidationSchema() {
    return {
      $jsonSchema: {
        bsonType: 'object',
        required: ['arxiv_id', 'title', 'authors', 'abstract', 'category', 'created_at'],
        properties: {
          arxiv_id: {
            bsonType: 'string',
            description: 'arXiv paper ID - required and must be unique'
          },
          title: {
            bsonType: 'string',
            description: 'Paper title - required'
          },
          authors: {
            bsonType: 'array',
            minItems: 1,
            items: {
              bsonType: 'string'
            },
            description: 'List of paper authors - required'
          },
          abstract: {
            bsonType: 'string',
            description: 'Paper abstract - required'
          },
          summary: {
            bsonType: ['string', 'null'],
            description: 'Plain English summary (3-5 lines)'
          },
          why_it_matters: {
            bsonType: ['string', 'null'],
            description: 'Why this research matters'
          },
          applications: {
            bsonType: 'array',
            items: {
              bsonType: 'string'
            },
            description: 'Practical applications and use cases'
          },
          category: {
            bsonType: 'string',
            description: 'arXiv category - required'
          },
          pdf_url: {
            bsonType: ['string', 'null'],
            description: 'URL to PDF version'
          },
          arxiv_url: {
            bsonType: ['string', 'null'],
            description: 'URL to arXiv page'
          },
          published_date: {
            bsonType: ['date', 'null'],
            description: 'Paper publication date'
          },
          likes_count: {
            bsonType: 'int',
            minimum: 0,
            description: 'Number of likes'
          },
          views_count: {
            bsonType: 'int',
            minimum: 0,
            description: 'Number of views'
          },
          processed: {
            bsonType: 'bool',
            description: 'Whether paper has been processed by LLM'
          },
          processed_at: {
            bsonType: ['date', 'null'],
            description: 'When paper was processed'
          },
          created_at: {
            bsonType: 'date',
            description: 'Record creation timestamp - required'
          },
          updated_at: {
            bsonType: 'date',
            description: 'Record update timestamp'
          }
        }
      }
    };
  }
}

export default Paper;
