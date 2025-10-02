/**
 * Trending Controller
 * Handles trending papers based on engagement metrics
 */

import database from '../utils/db.js';

/**
 * Get trending papers
 * GET /api/trending
 */
export const getTrending = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      timeWindow = 7,
      category
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const timeWindowNum = [1, 7, 30].includes(parseInt(timeWindow)) ? parseInt(timeWindow) : 7;
    const skip = (pageNum - 1) * limitNum;

    const papersCollection = database.getPapersCollection();

    // Calculate date threshold
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - timeWindowNum);

    // Build query
    const query = {
      processed: true,
      created_at: { $gte: dateThreshold }
    };

    if (category) {
      query.category = category;
    }

    // Calculate trending score: (likes * 2 + views) / days_old
    // More recent papers get higher scores
    const pipeline = [
      { $match: query },
      {
        $addFields: {
          days_old: {
            $divide: [
              { $subtract: [new Date(), '$created_at'] },
              1000 * 60 * 60 * 24 // Convert ms to days
            ]
          },
          engagement_score: {
            $add: [
              { $multiply: [{ $ifNull: ['$likes_count', 0] }, 2] },
              { $ifNull: ['$views_count', 0] }
            ]
          }
        }
      },
      {
        $addFields: {
          trending_score: {
            $cond: {
              if: { $eq: ['$days_old', 0] },
              then: '$engagement_score',
              else: {
                $divide: [
                  '$engagement_score',
                  { $add: ['$days_old', 1] } // Add 1 to avoid division by zero
                ]
              }
            }
          }
        }
      },
      { $sort: { trending_score: -1, created_at: -1 } },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          _id: 1,
          arxiv_id: 1,
          title: 1,
          authors: 1,
          summary: 1,
          why_it_matters: 1,
          applications: 1,
          category: 1,
          arxiv_url: 1,
          published_date: 1,
          likes_count: 1,
          views_count: 1,
          created_at: 1,
          trending_score: 1
        }
      }
    ];

    const papers = await papersCollection.aggregate(pipeline).toArray();

    // Get total count for pagination
    const totalCount = await papersCollection.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    res.status(200).json({
      success: true,
      data: {
        papers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalCount,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        },
        meta: {
          timeWindow: timeWindowNum,
          category: category || 'all'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching trending papers:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending papers'
    });
  }
};
