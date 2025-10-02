/**
 * Feed Controller
 * Handles feed endpoint logic for retrieving paginated papers
 */

import database from '../utils/db.js';

/**
 * Get paginated feed of papers
 * Supports both page-based and cursor-based pagination
 * 
 * Query parameters:
 * - page: Page number (1-indexed, default: 1) - for page-based pagination
 * - limit: Items per page (default: 20, max: 100)
 * - category: Filter by category (optional)
 * - cursor: Cursor for cursor-based pagination (optional, overrides page)
 * - sort: Sort order - 'newest' (default), 'popular', 'trending'
 */
export const getFeed = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category: queryCategory,
      cursor,
      sort = 'newest'
    } = req.query;
    
    // Category can come from route params or query params
    const category = req.params.category || queryCategory;

    // Validate and parse parameters
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build query filter
    // TODO: Re-enable processed filter once papers are processed
    const filter = {}; // Temporarily allow all papers for testing
    // const filter = { processed: true }; // Original filter
    if (category) {
      filter.category = category;
    }

    // Handle cursor-based pagination if cursor is provided
    if (cursor) {
      try {
        const cursorData = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
        
        // Add cursor condition based on sort type
        if (sort === 'newest') {
          filter.created_at = { $lt: new Date(cursorData.created_at) };
        } else if (sort === 'popular') {
          filter.$or = [
            { likes_count: { $lt: cursorData.likes_count } },
            { 
              likes_count: cursorData.likes_count,
              created_at: { $lt: new Date(cursorData.created_at) }
            }
          ];
        }
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid cursor',
          message: 'The provided cursor is malformed or expired'
        });
      }
    }

    // Determine sort order
    let sortOrder = {};
    switch (sort) {
      case 'popular':
        sortOrder = { likes_count: -1, created_at: -1 };
        break;
      case 'trending':
        // For trending, we'll use a combination of recent likes and views
        // This is a simplified version - could be enhanced with time-decay
        sortOrder = { likes_count: -1, views_count: -1, created_at: -1 };
        break;
      case 'newest':
      default:
        sortOrder = { created_at: -1 };
    }

    // Get papers collection
    const collection = database.getPapersCollection();

    // Execute query with pagination
    const papers = await collection
      .find(filter)
      .sort(sortOrder)
      .skip(cursor ? 0 : skip)
      .limit(limitNum)
      .project({
        arxiv_id: 1,
        title: 1,
        authors: 1,
        summary: 1,
        why_it_matters: 1,
        applications: 1,
        category: 1,
        pdf_url: 1,
        arxiv_url: 1,
        published_date: 1,
        likes_count: 1,
        views_count: 1,
        created_at: 1
      })
      .toArray();

    // Get total count for pagination metadata (only for page-based pagination)
    const totalCount = cursor ? null : await collection.countDocuments(filter);

    // Generate next cursor for cursor-based pagination
    let nextCursor = null;
    if (papers.length === limitNum) {
      const lastPaper = papers[papers.length - 1];
      const cursorData = {
        created_at: lastPaper.created_at,
        likes_count: lastPaper.likes_count,
        id: lastPaper._id
      };
      nextCursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
    }

    // Build response
    const response = {
      data: papers,
      pagination: cursor ? {
        // Cursor-based pagination metadata
        limit: limitNum,
        hasMore: papers.length === limitNum,
        nextCursor: nextCursor
      } : {
        // Page-based pagination metadata
        page: pageNum,
        limit: limitNum,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNum),
        hasMore: pageNum * limitNum < totalCount
      },
      filters: {
        category: category || null,
        sort: sort
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching feed:', error);
    next(error);
  }
};

/**
 * Get available categories
 * Returns list of unique categories with paper counts
 */
export const getCategories = async (req, res, next) => {
  try {
    const collection = database.getPapersCollection();

    // Aggregate to get categories with counts
    const categories = await collection.aggregate([
      // { $match: { processed: true } }, // Temporarily disabled for testing
      { 
        $group: { 
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          category: '$_id',
          count: 1
        }
      }
    ]).toArray();

    res.status(200).json({
      data: categories,
      total: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    next(error);
  }
};

/**
 * Get feed statistics
 * Returns overall feed statistics
 */
export const getFeedStats = async (req, res, next) => {
  try {
    const collection = database.getPapersCollection();

    const stats = await collection.aggregate([
      // { $match: { processed: true } }, // Temporarily disabled for testing
      {
        $group: {
          _id: null,
          totalPapers: { $sum: 1 },
          totalLikes: { $sum: '$likes_count' },
          totalViews: { $sum: '$views_count' },
          avgLikes: { $avg: '$likes_count' },
          avgViews: { $avg: '$views_count' }
        }
      },
      {
        $project: {
          _id: 0,
          totalPapers: 1,
          totalLikes: 1,
          totalViews: 1,
          avgLikes: { $round: ['$avgLikes', 2] },
          avgViews: { $round: ['$avgViews', 2] }
        }
      }
    ]).toArray();

    res.status(200).json({
      data: stats[0] || {
        totalPapers: 0,
        totalLikes: 0,
        totalViews: 0,
        avgLikes: 0,
        avgViews: 0
      }
    });
  } catch (error) {
    console.error('Error fetching feed stats:', error);
    next(error);
  }
};
