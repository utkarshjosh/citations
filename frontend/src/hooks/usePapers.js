import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperService } from '@services';

/**
 * Hook to fetch personalized paper feed
 * @param {Object} params - Query parameters
 * @returns {Object} Query result
 */
export const useFeed = (params = {}) => {
  return useQuery({
    queryKey: ['feed', params],
    queryFn: () => paperService.getFeed(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single paper by ID
 * @param {string} paperId - Paper ID
 * @returns {Object} Query result
 */
export const usePaper = (paperId) => {
  return useQuery({
    queryKey: ['paper', paperId],
    queryFn: () => paperService.getPaperById(paperId),
    enabled: !!paperId,
  });
};

/**
 * Hook to search papers
 * @param {Object} params - Search parameters
 * @returns {Object} Query result
 */
export const useSearchPapers = (params = {}) => {
  return useQuery({
    queryKey: ['papers', 'search', params],
    queryFn: () => paperService.searchPapers(params),
    enabled: !!params.query,
  });
};

/**
 * Hook to fetch categories
 * @returns {Object} Query result
 */
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => paperService.getCategories(),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Hook to mark paper as read
 * @returns {Object} Mutation result
 */
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paperId) => paperService.markAsRead(paperId),
    onSuccess: () => {
      // Invalidate feed query to refetch
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};

/**
 * Hook to save/unsave paper
 * @returns {Object} Mutation result
 */
export const useSavePaper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paperId, save }) => 
      save ? paperService.savePaper(paperId) : paperService.unsavePaper(paperId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });
};
