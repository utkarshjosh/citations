/**
 * Subscribe Routes
 * Routes for email subscription
 */

import express from 'express';
import { subscribe, unsubscribe, verifyEmail } from '../controllers/subscribeController.js';

const router = express.Router();

/**
 * POST /api/subscribe
 * Subscribe to email digest
 * 
 * Body:
 * - email: Email address (required)
 * - categories: Array of category IDs (optional)
 */
router.post('/', subscribe);

/**
 * POST /api/subscribe/unsubscribe
 * Unsubscribe from email digest
 * 
 * Body:
 * - email: Email address (required)
 * - token: Unsubscribe token (optional, from email link)
 */
router.post('/unsubscribe', unsubscribe);

/**
 * GET /api/subscribe/verify/:token
 * Verify email subscription (double opt-in)
 */
router.get('/verify/:token', verifyEmail);

export default router;
