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
    publishedDate,
    url,
    whyItMatters,
    applications,
    likesCount = 0,
  } = paper;

  const [expanded, setExpanded] = useState(false);
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localSaved, setLocalSaved] = useState(isSaved);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);

  const categoryStyle = getCategoryColor(category);
  const paperId = paper.id || paper._id;

  // Check if paper is liked on mount
  useEffect(() => {
    if (paperId) {
      setLocalLiked(isPaperLiked(paperId));
    }
  }, [paperId]);

  const handleLikeClick = e => {
    e.stopPropagation();
    setLocalLiked(!localLiked);
    setLocalLikesCount(prev => (localLiked ? prev - 1 : prev + 1));
    onLike?.(paper, !localLiked);
  };

  const handleSaveClick = e => {
    e.stopPropagation();
    setLocalSaved(!localSaved);
    onSave?.(paper, !localSaved);
  };

  const handleShareClick = e => {
    e.stopPropagation();
    onShare?.(paper);
  };

  const toggleExpanded = e => {
    e.stopPropagation();
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
          background: '#1C212B', // Secondary Base color for distinct cards
          borderRadius: '16px',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 2px 8px rgba(0, 0, 0, 0.3)', // Enhanced shadow for depth
          border: '1px solid rgba(148, 163, 184, 0.15)', // Slightly more visible border
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

        {/* Subtle inner glow for depth */}
        <Box
          style={{
            position: 'absolute',
            top: '1px',
            left: '1px',
            right: '1px',
            bottom: '1px',
            background:
              'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
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
            color: '#94A3B8', // Secondary Accent color
            paddingBottom: '80px', // Reserve space for action buttons
          }}
        >
          {/* Top metadata line - Type | Date | Source */}
          <Group gap="xs" style={{ marginBottom: '4px' }}>
            <Text
              size="xs"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                color: '#94A3B8',
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
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#00D0FF', // Primary Accent
                marginLeft: 'auto',
              }}
            >
              <IconExternalLink size={14} />
            </ActionIcon>
          </Group>

          {/* Title - Large, prominent */}
          <Text
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '20px',
              fontWeight: 600, // Semibold
              lineHeight: 1.3,
              color: '#FFFFFF', // Pure white for maximum contrast
              marginBottom: '8px',
            }}
            lineClamp={2}
          >
            {title}
          </Text>

          {/* Abstract/Summary - Monospace, limited lines */}
          <Text
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: 1.5,
              color: '#94A3B8', // Secondary Accent
              marginBottom: '12px',
            }}
            lineClamp={3}
          >
            {summary}
          </Text>

          {/* Why It Matters - High-density expandable section */}
          {whyItMatters && (
            <Box>
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
                  background: 'rgba(0, 208, 255, 0.1)', // Primary Accent with low opacity
                  color: '#00D0FF', // Primary Accent
                  border: '1px solid rgba(0, 208, 255, 0.2)',
                  fontWeight: 600,
                  fontSize: '12px',
                  height: '32px',
                  marginBottom: '8px',
                }}
              >
                Why It Matters
              </Button>

              <Collapse in={expanded}>
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                >
                  <Box
                    p="sm"
                    style={{
                      background: 'rgba(0, 208, 255, 0.05)',
                      borderRadius: '8px',
                      border: '1px solid rgba(0, 208, 255, 0.1)',
                    }}
                  >
                    <Text
                      size="sm"
                      style={{
                        color: '#94A3B8',
                        lineHeight: 1.4,
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: '13px',
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
                              color: '#00D0FF',
                              fontFamily: 'Inter, sans-serif',
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
                                color: '#94A3B8',
                                fontFamily: 'JetBrains Mono, monospace',
                                fontSize: '12px',
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

          {/* Authors - Compact metadata */}
          {authors && authors.length > 0 && (
            <Text
              size="xs"
              style={{
                color: '#94A3B8',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '12px',
                marginTop: 'auto',
                paddingTop: '8px',
                paddingBottom: '8px', // Add bottom padding to ensure visibility
                borderTop: '1px solid rgba(148, 163, 184, 0.1)',
                maxHeight: '40px', // Limit height to prevent overflow
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {Array.isArray(authors)
                ? authors
                    .slice(0, 2)
                    .filter(a => a && typeof a === 'string')
                    .join(', ')
                : typeof authors === 'string'
                  ? authors
                  : ''}
              {Array.isArray(authors) && authors.length > 2 && ` +${authors.length - 2}`}
            </Text>
          )}
        </Stack>

        {/* Action buttons - Compact high-density layout */}
        <Box
          style={{
            position: 'absolute',
            right: '16px',
            bottom: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 2,
            maxHeight: '60px', // Ensure buttons stay within card
            overflow: 'hidden',
          }}
        >
          {/* Like button */}
          <Tooltip label={localLiked ? 'Unlike' : 'Like'} position="left">
            <Box style={{ textAlign: 'center' }}>
              <motion.div whileTap={{ scale: 1.1 }}>
                <ActionIcon
                  size={40}
                  radius="md"
                  onClick={handleLikeClick}
                  style={{
                    background: localLiked
                      ? '#00D0FF' // Primary Accent
                      : 'rgba(148, 163, 184, 0.2)', // Secondary Accent with opacity
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                  }}
                >
                  {localLiked ? (
                    <IconHeartFilled size={18} color="white" />
                  ) : (
                    <IconHeart size={18} color="#94A3B8" />
                  )}
                </ActionIcon>
              </motion.div>
              {localLikesCount > 0 && (
                <Text
                  size="xs"
                  fw={600}
                  mt={2}
                  style={{
                    color: '#94A3B8',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '10px',
                  }}
                >
                  {localLikesCount}
                </Text>
              )}
            </Box>
          </Tooltip>

          {/* Bookmark button */}
          <Tooltip label={localSaved ? 'Remove bookmark' : 'Bookmark'} position="left">
            <motion.div whileTap={{ scale: 1.1 }}>
              <ActionIcon
                size={40}
                radius="md"
                onClick={handleSaveClick}
                style={{
                  background: localSaved ? '#70E0A7' : 'rgba(148, 163, 184, 0.2)', // Success color or Secondary Accent
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                }}
              >
                {localSaved ? (
                  <IconBookmarkFilled size={18} color="white" />
                ) : (
                  <IconBookmark size={18} color="#94A3B8" />
                )}
              </ActionIcon>
            </motion.div>
          </Tooltip>

          {/* Share button */}
          <Tooltip label="Share" position="left">
            <motion.div whileTap={{ scale: 1.1 }}>
              <ActionIcon
                size={40}
                radius="md"
                onClick={handleShareClick}
                style={{
                  background: 'rgba(148, 163, 184, 0.2)',
                  border: '1px solid rgba(148, 163, 184, 0.3)',
                }}
              >
                <IconShare size={18} color="#94A3B8" />
              </ActionIcon>
            </motion.div>
          </Tooltip>
        </Box>
      </Box>
    </motion.div>
  );
};

SwipeableCard.propTypes = {
  paper: PropTypes.shape({
    title: PropTypes.string.isRequired,
    summary: PropTypes.string,
    authors: PropTypes.arrayOf(PropTypes.string),
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
