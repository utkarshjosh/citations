import { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import {
  Box,
  Stack,
  Text,
  Badge,
  Group,
  ActionIcon,
  Tooltip,
  Collapse,
  Button,
  Divider,
  Loader,
} from '@mantine/core';
import {
  IconHeart,
  IconHeartFilled,
  IconBookmark,
  IconBookmarkFilled,
  IconShare,
  IconExternalLink,
  IconChevronDown,
  IconChevronUp,
  IconBulb,
  IconRocket,
  IconCheck,
  IconX,
} from '@tabler/icons-react';
import PropTypes from 'prop-types';
import { getCategoryColor } from '../../theme/colors';
import { isPaperLiked } from '../../utils/session';

export const SwipeableCard = ({
  paper,
  onLike,
  onSave,
  onShare,
  isLiked = false,
  isSaved = false,
  isActive = false,
  style = {},
}) => {
  const {
    title,
    summary,
    authors,
    category,
    published_date: publishedDate,
    url,
    arxiv_url,
    why_it_matters: whyItMatters,
    applications,
    likes_count: likesCount = 0,
  } = paper;
  const authorsArray = Array.isArray(authors) ? authors : authors.split(';');
  const [expanded, setExpanded] = useState(false);
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localSaved, setLocalSaved] = useState(isSaved);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);
  const [isLoading, setIsLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const categoryStyle = getCategoryColor(category);
  const paperId = paper.id || paper._id;

  // Check if paper is liked on mount
  useEffect(() => {
    if (paperId) {
      setLocalLiked(isPaperLiked(paperId));
    }
  }, [paperId]);

  // Haptic feedback utility
  const triggerHapticFeedback = (pattern = 50) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  };

  // Show action feedback
  const showActionFeedback = (type, message) => {
    setActionFeedback({ type, message });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleLikeClick = async e => {
    e.stopPropagation();
    triggerHapticFeedback(50);

    setIsLoading(true);
    setLocalLiked(!localLiked);
    setLocalLikesCount(prev => (localLiked ? prev - 1 : prev + 1));

    try {
      await onLike?.(paper, !localLiked);
      showActionFeedback('success', localLiked ? 'Removed from likes' : 'Added to likes');
    } catch (error) {
      // Revert on error
      setLocalLiked(localLiked);
      setLocalLikesCount(prev => (localLiked ? prev + 1 : prev - 1));
      showActionFeedback('error', 'Failed to update like');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveClick = async e => {
    e.stopPropagation();
    triggerHapticFeedback(50);

    setIsLoading(true);
    setLocalSaved(!localSaved);

    try {
      await onSave?.(paper, !localSaved);
      showActionFeedback('success', localSaved ? 'Removed from bookmarks' : 'Saved to bookmarks');
    } catch (error) {
      // Revert on error
      setLocalSaved(localSaved);
      showActionFeedback('error', 'Failed to update bookmark');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareClick = async e => {
    e.stopPropagation();
    triggerHapticFeedback(100);

    setIsLoading(true);

    try {
      await onShare?.(paper);
      showActionFeedback('success', 'Paper shared successfully');
    } catch (error) {
      showActionFeedback('error', 'Failed to share paper');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpanded = e => {
    e.stopPropagation();
    triggerHapticFeedback(25);
    setExpanded(!expanded);
  };

  const formatDate = date => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...style,
      }}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <Box
        style={{
          width: '100%',
          height: '100%',
          background: 'var(--color-surface)', // Use theme-aware surface color
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)', // Use theme-aware shadow
          border: '1px solid var(--color-border)', // Use theme-aware border
          backdropFilter: 'blur(10px)', // Subtle blur effect for modern look
        }}
      >
        {/* Enhanced visual overlay for distinct cards */}
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(0, 208, 255, 0.02) 0%, rgba(112, 224, 167, 0.02) 100%)',
            borderRadius: '16px',
            pointerEvents: 'none',
          }}
        />

        {/* Subtle inner glow for depth - theme-aware */}
        <Box
          style={{
            position: 'absolute',
            top: '1px',
            left: '1px',
            right: '1px',
            bottom: '1px',
            background: `linear-gradient(135deg, 
              rgba(255, 255, 255, 0.05) 0%, 
              rgba(255, 255, 255, 0.02) 100%)`,
            borderRadius: '15px',
            pointerEvents: 'none',
          }}
        />

        {/* Content - High-Density Minimalism Layout */}
        <Stack
          gap="sm"
          style={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            overflow: 'hidden', // Prevent content from overflowing
            color: 'var(--color-secondary-accent)', // Secondary Accent color
            paddingRight: '56px', // Space for minimal action buttons with margin
            paddingBottom: '80px', // Reserve space for authors at bottom
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top metadata line - Type | Date | Source */}
          <Group gap="xs" style={{ marginBottom: '4px' }}>
            <Text
              size="xs"
              style={{
                fontFamily: 'var(--font-family-mono)',
                color: 'var(--color-secondary-accent)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {category || 'Research'} ∣ {formatDate(publishedDate)} ∣ ArXiv
            </Text>
            <ActionIcon
              variant="subtle"
              size="xs"
              component="a"
              href={arxiv_url || url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--color-primary-accent)', // Primary Accent
                marginLeft: 'auto',
              }}
            >
              <IconExternalLink size={14} />
            </ActionIcon>
          </Group>

          {/* Title - Large, prominent */}
          <Text
            style={{
              fontFamily: 'var(--font-family-headline)',
              fontSize: 'var(--font-size-xl)',
              fontWeight: 'var(--font-weight-semibold)',
              lineHeight: 'var(--line-height-tight)',
              color: 'var(--color-text)',
              marginBottom: 'var(--spacing-sm)',
            }}
            lineClamp={2}
          >
            {title}
          </Text>

          {/* Content Area - Dynamic space sharing between summary and Why It Matters */}
          <Box
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0, // Important for flex children
            }}
          >
            {/* Abstract/Summary - Takes full space when Why It Matters is collapsed */}
            <Box
              style={{
                flex: expanded ? 0 : 1, // Collapse when expanded, expand when collapsed
                overflow: 'auto',
                marginBottom: 'var(--spacing-sm)',
                transition: 'flex 0.3s ease',
                minHeight: expanded ? '0px' : '100px', // Minimum height when collapsed
                maxHeight: expanded ? '40px' : 'none', // Limit height when expanded to give more space to applications
              }}
            >
              <Text
                style={{
                  fontFamily: 'var(--font-family-mono)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-normal)',
                  lineHeight: 'var(--line-height-normal)',
                  color: 'var(--color-secondary-accent)',
                }}
              >
                {summary}
              </Text>
            </Box>

            {/* Why It Matters - Smooth expandable section */}
            {whyItMatters && (
              <Box style={{ flexShrink: 0 }}>
                {/* Why It Matters Button - Fixed position in content flow */}
                <Button
                  variant="subtle"
                  size="sm"
                  leftSection={<IconBulb size={14} />}
                  rightSection={
                    expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />
                  }
                  onClick={toggleExpanded}
                  fullWidth
                  style={{
                    background: 'rgba(0, 208, 255, 0.1)',
                    color: 'var(--color-primary-accent)',
                    border: '1px solid rgba(0, 208, 255, 0.2)',
                    fontFamily: 'var(--font-family-headline)',
                    fontWeight: 'var(--font-weight-semibold)',
                    fontSize: 'var(--font-size-xs)',
                    height: '32px',
                    marginBottom: 'var(--spacing-sm)',
                  }}
                >
                  Why It Matters
                </Button>

                {/* Expandable Content - Smooth height transition */}
                <Collapse in={expanded}>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <Box
                      p="sm"
                      style={{
                        background: 'rgba(0, 208, 255, 0.05)',
                        borderRadius: '8px',
                        border: '1px solid rgba(0, 208, 255, 0.1)',
                        maxHeight: '400px', // Increased from 300px to give more space
                        overflow: 'auto',
                        flex: 1, // Take available space
                      }}
                    >
                      <Text
                        size="sm"
                        style={{
                          color: 'var(--color-secondary-accent)',
                          lineHeight: 'var(--line-height-normal)',
                          fontFamily: 'var(--font-family-mono)',
                          fontSize: 'var(--font-size-sm)',
                          marginBottom:
                            applications && applications.length > 0 ? 'var(--spacing-sm)' : 0,
                        }}
                      >
                        {whyItMatters}
                      </Text>

                      {applications && applications.length > 0 && (
                        <>
                          <Divider my="xs" color="rgba(0, 208, 255, 0.2)" />
                          <Group gap="xs" mb="xs">
                            <IconRocket size={14} color="#00D0FF" />
                            <Text
                              size="xs"
                              fw={600}
                              style={{
                                color: 'var(--color-primary-accent)',
                                fontFamily: 'var(--font-family-headline)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                              }}
                            >
                              Applications
                            </Text>
                          </Group>
                          <Stack gap="xs">
                            {applications.map((app, idx) => (
                              <Text
                                key={idx}
                                size="xs"
                                pl="md"
                                style={{
                                  color: 'var(--color-secondary-accent)',
                                  fontFamily: 'var(--font-family-mono)',
                                  fontSize: 'var(--font-size-xs)',
                                }}
                              >
                                • {app}
                              </Text>
                            ))}
                          </Stack>
                        </>
                      )}
                    </Box>
                  </motion.div>
                </Collapse>
              </Box>
            )}
          </Box>
        </Stack>

        {/* Authors - Fixed at bottom, always visible */}
        {authorsArray && authorsArray.length > 0 && (
          <Box
            style={{
              position: 'absolute',
              bottom: '16px', // Position within the card
              left: '16px',
              right: '68px', // Space for minimal action buttons with margin
              zIndex: 2,
            }}
          >
            <Text
              size="xs"
              style={{
                color: 'var(--color-text-secondary)',
                fontFamily: 'var(--font-family-mono)',
                fontSize: 'var(--font-size-xs)',
                padding: '8px 12px',
                background: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '6px',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--color-border)',
                maxHeight: '40px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {authorsArray
                ? authorsArray
                    .slice(0, 2)
                    .filter(a => a && typeof a === 'string')
                    .join(', ')
                : ''}
              {authorsArray.length > 2 ? ` +${authorsArray.length - 2}` : ''}
            </Text>
          </Box>
        )}

        {/* Minimal action buttons - High-density minimalism */}
        <Box
          style={{
            position: 'absolute',
            right: '20px',
            top: '60%',
            transform: 'translateY(-50%)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 2,
            opacity: 0.8, // Subtle presence
            transition: 'opacity 0.2s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.8')}
        >
          {/* Like button - Minimal icon only */}
          <Tooltip label={localLiked ? 'Unlike' : 'Like'} position="left">
            <motion.div
              whileTap={{ scale: 1.2 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.15 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <Box
                onClick={handleLikeClick}
                disabled={isLoading}
                style={{
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {isLoading ? (
                  <Loader size="xs" color="var(--color-secondary-accent)" />
                ) : localLiked ? (
                  <IconHeartFilled size={16} color="var(--color-primary-accent)" />
                ) : (
                  <IconHeart size={16} color="var(--color-secondary-accent)" />
                )}
              </Box>
              {localLikesCount > 0 && (
                <Text
                  size="xs"
                  style={{
                    color: localLiked
                      ? 'var(--color-primary-accent)'
                      : 'var(--color-secondary-accent)',
                    fontFamily: 'var(--font-family-mono)',
                    fontSize: '9px',
                    lineHeight: 1,
                    marginTop: '2px',
                  }}
                >
                  {localLikesCount}
                </Text>
              )}
            </motion.div>
          </Tooltip>

          {/* Bookmark button - Minimal icon only */}
          <Tooltip label={localSaved ? 'Remove bookmark' : 'Bookmark'} position="left">
            <motion.div
              whileTap={{ scale: 1.2 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.15 }}
            >
              <Box
                onClick={handleSaveClick}
                disabled={isLoading}
                style={{
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {isLoading ? (
                  <Loader size="xs" color="var(--color-secondary-accent)" />
                ) : localSaved ? (
                  <IconBookmarkFilled size={16} color="var(--color-success-trend)" />
                ) : (
                  <IconBookmark size={16} color="var(--color-secondary-accent)" />
                )}
              </Box>
            </motion.div>
          </Tooltip>

          {/* Share button - Minimal icon only */}
          <Tooltip label="Share" position="left">
            <motion.div
              whileTap={{ scale: 1.2 }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.15 }}
            >
              <Box
                onClick={handleShareClick}
                disabled={isLoading}
                style={{
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'transparent',
                  transition: 'all 0.2s ease',
                }}
              >
                {isLoading ? (
                  <Loader size="xs" color="var(--color-secondary-accent)" />
                ) : (
                  <IconShare size={16} color="var(--color-secondary-accent)" />
                )}
              </Box>
            </motion.div>
          </Tooltip>
        </Box>

        {/* Action Feedback Toast */}
        <AnimatePresence>
          {actionFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                top: '16px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                background:
                  actionFeedback.type === 'success'
                    ? 'rgba(112, 224, 167, 0.95)'
                    : 'rgba(239, 68, 68, 0.95)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backdropFilter: 'blur(10px)',
                border: `1px solid ${
                  actionFeedback.type === 'success'
                    ? 'rgba(112, 224, 167, 0.3)'
                    : 'rgba(239, 68, 68, 0.3)'
                }`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              {actionFeedback.type === 'success' ? <IconCheck size={14} /> : <IconX size={14} />}
              {actionFeedback.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 5,
                borderRadius: '16px',
                backdropFilter: 'blur(2px)',
              }}
            >
              <Loader size="sm" color="var(--color-primary-accent)" />
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </motion.div>
  );
};

SwipeableCard.propTypes = {
  paper: PropTypes.shape({
    title: PropTypes.string.isRequired,
    summary: PropTypes.string,
    authors: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.string), PropTypes.string]),
    category: PropTypes.string,
    publishedDate: PropTypes.string,
    url: PropTypes.string,
    whyItMatters: PropTypes.string,
    applications: PropTypes.arrayOf(PropTypes.string),
    likesCount: PropTypes.number,
  }).isRequired,
  onLike: PropTypes.func,
  onSave: PropTypes.func,
  onShare: PropTypes.func,
  isLiked: PropTypes.bool,
  isSaved: PropTypes.bool,
  isActive: PropTypes.bool,
  style: PropTypes.object,
};

export default SwipeableCard;
