/**
 * Papers Controller
 * Handles paper-specific operations (like, view, etc.)
 */

import { ObjectId } from 'mongodb';
import database from '../utils/db.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Like a paper
 * POST /api/papers/:id/like
 */
export const likePaper = async (req, res) => {
  try {
    const { id } = req.params;
    let { sessionId } = req.body;

    // Generate session ID if not provided
    if (!sessionId) {
      sessionId = uuidv4();
    }

    const papersCollection = database.getPapersCollection();
    const engagementsCollection = database.getCollection('engagements');

    // Validate paper ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid paper ID'
      });
    }

    // Check if paper exists
    const paper = await papersCollection.findOne({ _id: new ObjectId(id) });
    if (!paper) {
      return res.status(404).json({
        success: false,
        error: 'Paper not found'
      });
    }

    // Check if already liked by this session
    const existingLike = await engagementsCollection.findOne({
      paper_id: new ObjectId(id),
      session_id: sessionId,
      type: 'like'
    });

    if (existingLike) {
      return res.status(200).json({
        success: true,
        message: 'Paper already liked',
        data: {
          liked: true,
          likesCount: paper.likes_count || 0,
          sessionId
        }
      });
    }

    // Create engagement record
    await engagementsCollection.insertOne({
      paper_id: new ObjectId(id),
      session_id: sessionId,
      type: 'like',
      created_at: new Date()
    });

    // Increment likes count
    const result = await papersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $inc: { likes_count: 1 },
        $set: { updated_at: new Date() }
      },
      { returnDocument: 'after' }
    );

    res.status(200).json({
      success: true,
      message: 'Paper liked successfully',
      data: {
        liked: true,
        likesCount: result.likes_count || 0,
        sessionId
      }
    });
  } catch (error) {
    console.error('Error liking paper:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like paper'
    });
  }
};

/**
 * Unlike a paper
 * DELETE /api/papers/:id/like
 */
export const unlikePaper = async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Session ID is required'
      });
    }

    const papersCollection = database.getPapersCollection();
    const engagementsCollection = database.getCollection('engagements');

    // Validate paper ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid paper ID'
      });
    }

    // Check if paper exists
    const paper = await papersCollection.findOne({ _id: new ObjectId(id) });
    if (!paper) {
      return res.status(404).json({
        success: false,
        error: 'Paper not found'
      });
    }

    // Remove engagement record
    const deleteResult = await engagementsCollection.deleteOne({
      paper_id: new ObjectId(id),
      session_id: sessionId,
      type: 'like'
    });

    if (deleteResult.deletedCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'Paper was not liked',
        data: {
          liked: false,
          likesCount: paper.likes_count || 0
        }
      });
    }

    // Decrement likes count
    const result = await papersCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { 
        $inc: { likes_count: -1 },
        $set: { updated_at: new Date() }
      },
      { returnDocument: 'after' }
    );

    res.status(200).json({
      success: true,
      message: 'Paper unliked successfully',
      data: {
        liked: false,
        likesCount: Math.max(0, result.likes_count || 0)
      }
    });
  } catch (error) {
    console.error('Error unliking paper:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to unlike paper'
    });
  }
};

/**
 * Track paper view
 * POST /api/papers/:id/view
 */
export const viewPaper = async (req, res) => {
  try {
    const { id } = req.params;
    let { sessionId } = req.body;

    // Generate session ID if not provided
    if (!sessionId) {
      sessionId = uuidv4();
    }

    const papersCollection = database.getPapersCollection();
    const engagementsCollection = database.getCollection('engagements');

    // Validate paper ID
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid paper ID'
      });
    }

    // Check if paper exists
    const paper = await papersCollection.findOne({ _id: new ObjectId(id) });
    if (!paper) {
      return res.status(404).json({
        success: false,
        error: 'Paper not found'
      });
    }

    // Check if already viewed by this session (within last hour to prevent spam)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const existingView = await engagementsCollection.findOne({
      paper_id: new ObjectId(id),
      session_id: sessionId,
      type: 'view',
      created_at: { $gte: oneHourAgo }
    });

    if (!existingView) {
      // Create engagement record
      await engagementsCollection.insertOne({
        paper_id: new ObjectId(id),
        session_id: sessionId,
        type: 'view',
        created_at: new Date()
      });

      // Increment views count
      await papersCollection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $inc: { views_count: 1 },
          $set: { updated_at: new Date() }
        }
      );
    }

    res.status(200).json({
      success: true,
      message: 'View tracked successfully',
      data: {
        sessionId
      }
    });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track view'
    });
  }
};
