import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';
import { paperService } from '@services';

/**
 * Hook for infinite scroll feed with intersection observer
 * @param {Object} params - Query parameters
 * @param {string} params.category - Category filter
 * @returns {Object} Infinite query result with observer ref
 */
export const useInfiniteScroll = (params = {}) => {
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['feed', 'infinite', params],
    queryFn: ({ pageParam = 1 }) => 
      paperService.getFeed({ 
        ...params, 
        page: pageParam, 
        limit: 10 // Mobile-optimized: smaller batches for faster initial load
      }),
    getNextPageParam: (lastPage, allPages) => {
      // Check if there are more pages
      if (!lastPage?.data || lastPage.data.length === 0) {
        return undefined;
      }
      
      // If we got less than the limit, we're at the end
      if (lastPage.data.length < 10) {
        return undefined;
      }
      
      return allPages.length + 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  // Intersection Observer callback
  const handleObserver = useCallback(
    (entries) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  // Setup intersection observer
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    const options = {
      root: null,
      rootMargin: '100px', // Load before user reaches the end
      threshold: 0.1,
    };

    observerRef.current = new IntersectionObserver(handleObserver, options);
    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  // Flatten pages into single array
  const papers = data?.pages?.flatMap((page) => page.data || []) || [];
  
  // Get total count from first page
  const totalCount = data?.pages?.[0]?.total || 0;

  return {
    papers,
    totalCount,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    loadMoreRef, // Attach this ref to the sentinel element
  };
};

export default useInfiniteScroll;
