import apiClient from './api';

/**
 * Paper Service - API calls related to research papers
 */

export const paperService = {
  /**
   * Get personalized feed of papers
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise} API response
   */
  getFeed: async (params = {}) => {
    const { page = 1, limit = 20 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get(`/feed?${queryParams}`);
    return response.data;
  },

  /**
   * Get paper by ID
   * @param {string} paperId - Paper ID
   * @returns {Promise} API response
   */
  getPaperById: async paperId => {
    const response = await apiClient.get(`/papers/${paperId}`);
    return response.data;
  },

  /**
   * Search papers
   * @param {Object} params - Search parameters
   * @param {string} params.query - Search query
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise} API response
   */
  searchPapers: async (params = {}) => {
    const { query, page = 1, limit = 20 } = params;
    const queryParams = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await apiClient.get(`/papers/search?${queryParams}`);
    return response.data;
  },

  /**
   * Get paper categories
   * @returns {Promise} API response
   */
  getCategories: async () => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  /**
   * Mark paper as read
   * @param {string} paperId - Paper ID
   * @returns {Promise} API response
   */
  markAsRead: async paperId => {
    const response = await apiClient.post(`/papers/${paperId}/read`);
    return response.data;
  },

  /**
   * Save paper for later
   * @param {string} paperId - Paper ID
   * @returns {Promise} API response
   */
  savePaper: async paperId => {
    const response = await apiClient.post(`/papers/${paperId}/save`);
    return response.data;
  },

  /**
   * Remove saved paper
   * @param {string} paperId - Paper ID
   * @returns {Promise} API response
   */
  unsavePaper: async paperId => {
    const response = await apiClient.delete(`/papers/${paperId}/save`);
    return response.data;
  },

  /**
   * Like a paper
   * @param {string} paperId - Paper ID
   * @param {string} sessionId - Session ID for tracking
   * @returns {Promise} API response
   */
  likePaper: async (paperId, sessionId) => {
    const response = await apiClient.post(`/papers/${paperId}/like`, { sessionId });
    return response.data;
  },

  /**
   * Unlike a paper
   * @param {string} paperId - Paper ID
   * @param {string} sessionId - Session ID for tracking
   * @returns {Promise} API response
   */
  unlikePaper: async (paperId, sessionId) => {
    const response = await apiClient.delete(`/papers/${paperId}/like`, {
      data: { sessionId },
    });
    return response.data;
  },

  /**
   * Track paper view
   * @param {string} paperId - Paper ID
   * @param {string} sessionId - Session ID for tracking
   * @returns {Promise} API response
   */
  viewPaper: async (paperId, sessionId) => {
    const response = await apiClient.post(`/papers/${paperId}/view`, { sessionId });
    return response.data;
  },

  /**
   * Get trending papers
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {number} params.timeWindow - Time window in days (1, 7, 30)
   * @returns {Promise} API response
   */
  getTrending: async (params = {}) => {
    const { page = 1, limit = 20, timeWindow = 7 } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      timeWindow: timeWindow.toString(),
    });

    const response = await apiClient.get(`/trending?${queryParams}`);
    return response.data;
  },

  /**
   * Subscribe to email digest
   * @param {string} email - Email address
   * @param {Array} categories - Category preferences
   * @returns {Promise} API response
   */
  subscribe: async (email, categories = []) => {
    const response = await apiClient.post('/subscribe', { email, categories });
    return response.data;
  },
};

export default paperService;
