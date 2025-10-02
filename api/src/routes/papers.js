/**
 * Papers Routes
 * Routes for paper-specific endpoints (like, view, etc.)
 */

import express from 'express';
import { likePaper, unlikePaper, viewPaper } from '../controllers/papersController.js';

const router = express.Router();

/**
 * POST /api/papers/:id/like
 * Like a paper
 * 
 * Body:
 * - sessionId: Session identifier for tracking (optional, will be generated if not provided)
 */
router.post('/:id/like', likePaper);

/**
 * DELETE /api/papers/:id/like
 * Unlike a paper
 * 
 * Body:
 * - sessionId: Session identifier for tracking
 */
router.delete('/:id/like', unlikePaper);

/**
 * POST /api/papers/:id/view
 * Track paper view
 * 
 * Body:
 * - sessionId: Session identifier for tracking (optional)
 */
router.post('/:id/view', viewPaper);

export default router;
