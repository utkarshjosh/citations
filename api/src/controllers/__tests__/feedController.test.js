/**
 * Feed Controller Tests
 * Tests for feed endpoint functionality
 */

import { getFeed, getCategories, getFeedStats } from '../feedController.js';
import database from '../../utils/db.js';

// Mock the database module
jest.mock('../../utils/db.js');

describe('Feed Controller', () => {
  let mockReq;
  let mockRes;
  let mockNext;
  let mockCollection;

  beforeEach(() => {
    // Reset mocks
    mockReq = {
      query: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();

    // Mock collection methods
    mockCollection = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      project: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      countDocuments: jest.fn(),
      aggregate: jest.fn().mockReturnThis()
    };

    database.getPapersCollection = jest.fn().mockReturnValue(mockCollection);
  });

  describe('getFeed', () => {
    it('should return paginated feed with default parameters', async () => {
      const mockPapers = [
        {
          _id: '1',
          arxiv_id: '2024.001',
          title: 'Test Paper 1',
          authors: ['Author 1'],
          summary: 'Summary 1',
          category: 'cs.AI',
          created_at: new Date('2024-01-01'),
          likes_count: 10,
          views_count: 100
        },
        {
          _id: '2',
          arxiv_id: '2024.002',
          title: 'Test Paper 2',
          authors: ['Author 2'],
          summary: 'Summary 2',
          category: 'cs.ML',
          created_at: new Date('2024-01-02'),
          likes_count: 5,
          views_count: 50
        }
      ];

      mockCollection.toArray.mockResolvedValue(mockPapers);
      mockCollection.countDocuments.mockResolvedValue(100);

      await getFeed(mockReq, mockRes, mockNext);

      expect(mockCollection.find).toHaveBeenCalledWith({ processed: true });
      expect(mockCollection.sort).toHaveBeenCalledWith({ created_at: -1 });
      expect(mockCollection.skip).toHaveBeenCalledWith(0);
      expect(mockCollection.limit).toHaveBeenCalledWith(20);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockPapers,
        pagination: {
          page: 1,
          limit: 20,
          total: 100,
          totalPages: 5,
          hasMore: true
        },
        filters: {
          category: null,
          sort: 'newest'
        }
      });
    });

    it('should filter by category', async () => {
      mockReq.query = { category: 'cs.AI' };
      mockCollection.toArray.mockResolvedValue([]);
      mockCollection.countDocuments.mockResolvedValue(0);

      await getFeed(mockReq, mockRes, mockNext);

      expect(mockCollection.find).toHaveBeenCalledWith({
        processed: true,
        category: 'cs.AI'
      });
    });

    it('should handle custom page and limit', async () => {
      mockReq.query = { page: '3', limit: '10' };
      mockCollection.toArray.mockResolvedValue([]);
      mockCollection.countDocuments.mockResolvedValue(50);

      await getFeed(mockReq, mockRes, mockNext);

      expect(mockCollection.skip).toHaveBeenCalledWith(20); // (3-1) * 10
      expect(mockCollection.limit).toHaveBeenCalledWith(10);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            page: 3,
            limit: 10,
            total: 50,
            totalPages: 5
          })
        })
      );
    });

    it('should enforce maximum limit of 100', async () => {
      mockReq.query = { limit: '500' };
      mockCollection.toArray.mockResolvedValue([]);
      mockCollection.countDocuments.mockResolvedValue(0);

      await getFeed(mockReq, mockRes, mockNext);

      expect(mockCollection.limit).toHaveBeenCalledWith(100);
    });

    it('should sort by popular', async () => {
      mockReq.query = { sort: 'popular' };
      mockCollection.toArray.mockResolvedValue([]);
      mockCollection.countDocuments.mockResolvedValue(0);

      await getFeed(mockReq, mockRes, mockNext);

      expect(mockCollection.sort).toHaveBeenCalledWith({
        likes_count: -1,
        created_at: -1
      });
    });

    it('should handle cursor-based pagination', async () => {
      const cursorData = {
        created_at: '2024-01-01T00:00:00.000Z',
        likes_count: 10,
        id: '123'
      };
      const cursor = Buffer.from(JSON.stringify(cursorData)).toString('base64');
      mockReq.query = { cursor };

      const mockPapers = Array(20).fill({
        _id: '1',
        arxiv_id: '2024.001',
        title: 'Test',
        created_at: new Date(),
        likes_count: 5
      });

      mockCollection.toArray.mockResolvedValue(mockPapers);

      await getFeed(mockReq, mockRes, mockNext);

      expect(mockCollection.skip).toHaveBeenCalledWith(0);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          pagination: expect.objectContaining({
            hasMore: true,
            nextCursor: expect.any(String)
          })
        })
      );
    });

    it('should handle invalid cursor', async () => {
      mockReq.query = { cursor: 'invalid-cursor' };

      await getFeed(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid cursor',
        message: 'The provided cursor is malformed or expired'
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockCollection.toArray.mockRejectedValue(error);

      await getFeed(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getCategories', () => {
    it('should return categories with counts', async () => {
      const mockCategories = [
        { category: 'cs.AI', count: 50 },
        { category: 'cs.ML', count: 30 },
        { category: 'cs.CV', count: 20 }
      ];

      mockCollection.toArray.mockResolvedValue(mockCategories);

      await getCategories(mockReq, mockRes, mockNext);

      expect(mockCollection.aggregate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockCategories,
        total: 3
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockCollection.toArray.mockRejectedValue(error);

      await getCategories(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getFeedStats', () => {
    it('should return feed statistics', async () => {
      const mockStats = [
        {
          totalPapers: 100,
          totalLikes: 500,
          totalViews: 5000,
          avgLikes: 5,
          avgViews: 50
        }
      ];

      mockCollection.toArray.mockResolvedValue(mockStats);

      await getFeedStats(mockReq, mockRes, mockNext);

      expect(mockCollection.aggregate).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        data: mockStats[0]
      });
    });

    it('should return default stats when no data', async () => {
      mockCollection.toArray.mockResolvedValue([]);

      await getFeedStats(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith({
        data: {
          totalPapers: 0,
          totalLikes: 0,
          totalViews: 0,
          avgLikes: 0,
          avgViews: 0
        }
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Database error');
      mockCollection.toArray.mockRejectedValue(error);

      await getFeedStats(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
