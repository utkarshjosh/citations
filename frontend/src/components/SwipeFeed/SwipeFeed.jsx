import { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Text, Center, Loader, Stack } from '@mantine/core';
import { SwipeableCard } from '../SwipeableCard';
import PropTypes from 'prop-types';

export const SwipeFeed = ({
  papers = [],
  onLike,
  onSave,
  onShare,
  onLoadMore,
  hasMore = false,
  isLoading = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const isScrollingRef = useRef(false);
  const touchStartRef = useRef(0);

  // Preload next paper when approaching end
  useEffect(() => {
    if (currentIndex >= papers.length - 2 && hasMore && !isLoading) {
      onLoadMore?.();
    }
  }, [currentIndex, papers.length, hasMore, isLoading, onLoadMore]);

  // Track current card based on scroll position
  const handleScroll = useCallback(() => {
    if (!containerRef.current || isScrollingRef.current) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const windowHeight = window.innerHeight;

    // Calculate which card is currently in view
    const index = Math.round(scrollTop / windowHeight);

    if (index !== currentIndex && index >= 0 && index < papers.length) {
      setCurrentIndex(index);
    }

    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // Snap to nearest card after scrolling stops
    scrollTimeoutRef.current = setTimeout(() => {
      const targetIndex = Math.round(scrollTop / windowHeight);
      if (targetIndex >= 0 && targetIndex < papers.length) {
        container.scrollTo({
          top: targetIndex * windowHeight,
          behavior: 'smooth',
        });
      }
    }, 150);
  }, [currentIndex, papers.length]);

  // Prevent pull-to-refresh on mobile browsers
  const handleTouchStart = useCallback(e => {
    touchStartRef.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(e => {
    if (!containerRef.current) return;

    const touchY = e.touches[0].clientY;
    const touchDiff = touchY - touchStartRef.current;
    const scrollTop = containerRef.current.scrollTop;

    // Prevent pull-to-refresh when at top and pulling down
    if (scrollTop === 0 && touchDiff > 0) {
      e.preventDefault();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Add passive: false to enable preventDefault for pull-to-refresh prevention
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll, handleTouchStart, handleTouchMove]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = e => {
      if (!containerRef.current) return;

      const windowHeight = window.innerHeight;
      const container = containerRef.current;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (currentIndex < papers.length - 1) {
          isScrollingRef.current = true;
          container.scrollTo({
            top: (currentIndex + 1) * windowHeight,
            behavior: 'smooth',
          });
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 500);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        if (currentIndex > 0) {
          isScrollingRef.current = true;
          container.scrollTo({
            top: (currentIndex - 1) * windowHeight,
            behavior: 'smooth',
          });
          setTimeout(() => {
            isScrollingRef.current = false;
          }, 500);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, papers.length]);

  if (!papers.length && !isLoading) {
    return (
      <Center style={{ height: '100vh', background: 'var(--color-primary-base)' }}>
        <Stack align="center" gap="md">
          <Text
            style={{
              fontFamily: 'var(--font-family-headline)',
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text)',
            }}
          >
            No papers available
          </Text>
          <Text
            style={{
              fontFamily: 'var(--font-family-body)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-normal)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Check back later for new content
          </Text>
        </Stack>
      </Center>
    );
  }

  return (
    <Box
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        background: '#0E1117', // Primary Base color for distinct contrast
        overflow: 'hidden',
      }}
    >
      {/* Progress indicator */}
      <Box
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 100,
        }}
      >
        <Box
          style={{
            height: '100%',
            background: 'var(--color-primary-accent)',
            width: `${((currentIndex + 1) / papers.length) * 100}%`,
            transition: 'width 0.3s ease',
          }}
        />
      </Box>

      {/* Paper counter */}
      <Box
        style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(10px)',
          padding: '8px 16px',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Text
          style={{
            fontFamily: 'var(--font-family-headline)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text)',
          }}
        >
          {currentIndex + 1} / {papers.length}
        </Text>
      </Box>

      {/* Continuous scroll container */}
      <Box
        ref={containerRef}
        className="swipe-feed-scroll"
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflowY: 'scroll',
          overflowX: 'hidden',
          scrollSnapType: 'y mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
        }}
      >
        {papers.map((paper, index) => (
          <Box
            key={paper.id || index}
            style={{
              position: 'relative',
              width: '100%',
              height: '100vh',
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '60px 16px 20px',
              boxSizing: 'border-box',
              marginBottom: index < papers.length - 1 ? '16px' : '0', // Enhanced 16px gap for better visual separation
            }}
          >
            <Box
              style={{
                width: '100%',
                height: '100%',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              <SwipeableCard
                paper={paper}
                onLike={onLike}
                onSave={onSave}
                onShare={onShare}
                isActive={index === currentIndex}
              />
            </Box>
          </Box>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <Box
            style={{
              position: 'relative',
              width: '100%',
              height: '100vh',
              scrollSnapAlign: 'start',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Stack align="center" gap="xs">
              <Loader size="lg" color="var(--color-primary-accent)" />
              <Text
                style={{
                  fontFamily: 'var(--font-family-body)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-normal)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Loading more papers...
              </Text>
            </Stack>
          </Box>
        )}

        {/* End of feed message */}
        {!hasMore && papers.length > 0 && (
          <Box
            style={{
              position: 'relative',
              width: '100%',
              height: '100vh',
              scrollSnapAlign: 'start',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              style={{
                background: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(10px)',
                padding: '20px 32px',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <Text size="lg" c="white" ta="center" fw={600}>
                🎉 You've reached the end!
              </Text>
              <Text size="sm" c="dimmed" ta="center" mt="xs">
                Check back later for more papers
              </Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

SwipeFeed.propTypes = {
  papers: PropTypes.array.isRequired,
  onLike: PropTypes.func,
  onSave: PropTypes.func,
  onShare: PropTypes.func,
  onLoadMore: PropTypes.func,
  hasMore: PropTypes.bool,
  isLoading: PropTypes.bool,
};

export default SwipeFeed;
