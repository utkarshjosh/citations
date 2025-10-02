/**
 * Session Management Utility
 * Handles session ID generation and storage for tracking user engagement
 */

const SESSION_KEY = 'citations_session_id';

/**
 * Generate a unique session ID
 */
const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get or create session ID
 */
export const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
};

/**
 * Clear session ID (for testing or logout)
 */
export const clearSessionId = () => {
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Get liked papers from local storage
 */
export const getLikedPapers = () => {
  const liked = localStorage.getItem('liked_papers');
  return liked ? JSON.parse(liked) : [];
};

/**
 * Add paper to liked list
 */
export const addLikedPaper = paperId => {
  const liked = getLikedPapers();
  if (!liked.includes(paperId)) {
    liked.push(paperId);
    localStorage.setItem('liked_papers', JSON.stringify(liked));
  }
};

/**
 * Remove paper from liked list
 */
export const removeLikedPaper = paperId => {
  const liked = getLikedPapers();
  const filtered = liked.filter(id => id !== paperId);
  localStorage.setItem('liked_papers', JSON.stringify(filtered));
};

/**
 * Check if paper is liked
 */
export const isPaperLiked = paperId => {
  const liked = getLikedPapers();
  return liked.includes(paperId);
};

export default {
  getSessionId,
  clearSessionId,
  getLikedPapers,
  addLikedPaper,
  removeLikedPaper,
  isPaperLiked,
};
