import { Center, Loader, Stack, Text } from '@mantine/core';
import { useInfiniteScroll } from '@hooks';
import { ErrorMessage, SwipeFeed } from '@components';
import { useState, useEffect, useCallback } from 'react';
import { paperService } from '../services/paperService';
import { getSessionId, addLikedPaper, removeLikedPaper, isPaperLiked } from '../utils/session';

const Feed = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const sessionId = getSessionId();

  // Use infinite scroll hook
  const {
    papers,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    fetchNextPage,
  } = useInfiniteScroll({ category: selectedCategories[0] });

  useEffect(() => {
    // Load selected categories from localStorage
    const saved = localStorage.getItem('selectedCategories');
    if (saved) {
      try {
        setSelectedCategories(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse categories:', e);
      }
    }
  }, []);

  const handleSavePaper = useCallback((paper, saved) => {
    console.log('Save paper:', paper, saved);
    // TODO: Implement save functionality with API
    // Store in localStorage for now
    const savedPapers = JSON.parse(localStorage.getItem('savedPapers') || '[]');
    if (saved) {
      savedPapers.push(paper.id || paper._id);
    } else {
      const index = savedPapers.indexOf(paper.id || paper._id);
      if (index > -1) savedPapers.splice(index, 1);
    }
    localStorage.setItem('savedPapers', JSON.stringify(savedPapers));
  }, []);

  const handleLikePaper = useCallback(
    async (paper, liked) => {
      const paperId = paper.id || paper._id;

      try {
        if (liked) {
          // Like the paper
          await paperService.likePaper(paperId, sessionId);
          addLikedPaper(paperId);
        } else {
          // Unlike the paper
          await paperService.unlikePaper(paperId, sessionId);
          removeLikedPaper(paperId);
        }
      } catch (error) {
        console.error('Error updating like status:', error);
        // TODO: Show error toast notification
        // Revert optimistic update if needed
      }
    },
    [sessionId]
  );

  const handleSharePaper = useCallback(paper => {
    if (navigator.share) {
      navigator
        .share({
          title: paper.title,
          text: paper.summary,
          url: paper.url,
        })
        .catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(paper.url);
      // TODO: Show toast notification
      console.log('Link copied to clipboard');
    }
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Initial loading state
  if (isLoading) {
    return (
      <Center style={{ height: '100vh', background: 'var(--color-primary-base)' }}>
        <Stack gap="md" align="center">
          <Loader size="xl" color="var(--color-primary-accent)" />
          <Text
            style={{
              fontFamily: 'var(--font-family-headline)',
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text)',
            }}
          >
            Citations
          </Text>
          <Text
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-normal)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Loading your feed...
          </Text>
        </Stack>
      </Center>
    );
  }

  // Error state
  if (isError) {
    return (
      <Center style={{ height: '100vh', background: '#0a0a0a', padding: '20px' }}>
        <ErrorMessage
          title="Failed to load papers"
          message={error?.message || 'Something went wrong. Please try again later.'}
          onRetry={refetch}
        />
      </Center>
    );
  }

  // Use real data from API
  const displayPapers = papers.length > 0 ? papers : [];

  return (
    <SwipeFeed
      papers={displayPapers}
      onLike={handleLikePaper}
      onSave={handleSavePaper}
      onShare={handleSharePaper}
      onLoadMore={handleLoadMore}
      hasMore={hasNextPage}
      isLoading={isFetchingNextPage}
    />
  );
};

export default Feed;
