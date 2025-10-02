/**
 * Feed Routes
 * Routes for feed-related endpoints
 */

import express from 'express';
import { getFeed, getCategories, getFeedStats } from '../controllers/feedController.js';

const router = express.Router();

/**
 * GET /api/feed
 * Get paginated feed of papers
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 * - category: Filter by category
 * - cursor: Cursor for cursor-based pagination
 * - sort: Sort order ('newest', 'popular', 'trending')
 */
router.get('/', getFeed);

/**
 * GET /api/feed/categories
 * Get list of available categories with counts
 */
router.get('/categories', getCategories);

/**
 * GET /api/feed/category/:category
 * Get papers filtered by specific category
 * 
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 20, max: 100)
 */
router.get('/category/:category', getFeed);

/**
 * GET /api/feed/stats
 * Get feed statistics
 */
router.get('/stats', getFeedStats);

export default router;
