/**
 * Trending Routes
 * Routes for trending papers
 */

import express from 'express';
import { getTrending } from '../controllers/trendingController.js';

const router = express.Router();

/**
 * GET /api/trending
 * Get trending papers based on engagement metrics
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 50)
 * - timeWindow: Time window in days (default: 7, options: 1, 7, 30)
 * - category: Filter by category (optional)
 */
router.get('/', getTrending);

export default router;
