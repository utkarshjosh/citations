import { useState } from 'react';
import {
  Card,
  Text,
  Badge,
  Group,
  Stack,
  ActionIcon,
  Tooltip,
  Collapse,
  Button,
  Divider,
} from '@mantine/core';
import {
  IconBookmark,
  IconBookmarkFilled,
  IconExternalLink,
  IconHeart,
  IconHeartFilled,
  IconShare,
  IconChevronDown,
  IconChevronUp,
  IconBulb,
  IconRocket,
} from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const MotionCard = motion.create(Card);

export const PaperCard = ({
  paper,
  onSave,
  onRead,
  onLike,
  onShare,
  isSaved = false,
  isLiked = false,
}) => {
  const {
    title,
    summary,
    authors,
    category,
    published_date: publishedDate,
    url,
    why_it_matters: whyItMatters,
    applications,
    likes_count: likesCount = 0,
  } = paper;
  console.log('3333333333333333333333333333');
  console.log(whyItMatters);
  const [expanded, setExpanded] = useState(false);
  const [localLiked, setLocalLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(likesCount);

  const handleSaveClick = e => {
    e.stopPropagation();
    onSave?.(paper);
  };

  const handleLikeClick = e => {
    e.stopPropagation();
    // Optimistic update
    setLocalLiked(!localLiked);
    setLocalLikesCount(prev => (localLiked ? prev - 1 : prev + 1));
    onLike?.(paper, !localLiked);
  };

  const handleShareClick = e => {
    e.stopPropagation();
    onShare?.(paper);
  };

  const handleTitleClick = e => {
    e.stopPropagation();
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
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      padding="md"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        // Mobile-first: optimized touch targets and spacing
        touchAction: 'pan-y',
      }}
    >
      <Stack gap="sm" style={{ flex: 1 }}>
        {/* Header with Title */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Text
            style={{
              fontFamily: 'var(--font-family-headline)',
              fontSize: 'var(--font-size-lg)',
              fontWeight: 'var(--font-weight-semibold)',
              lineHeight: 'var(--line-height-tight)',
              color: 'var(--color-text)',
              flex: 1,
              textDecoration: 'none',
              cursor: 'pointer',
            }}
            lineClamp={2}
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleTitleClick}
          >
            {title}
          </Text>

          <ActionIcon
            variant="subtle"
            color="gray"
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleTitleClick}
            size="sm"
          >
            <IconExternalLink size={16} />
          </ActionIcon>
        </Group>

        {/* Summary */}
        <Text
          style={{
            fontFamily: 'var(--font-family-mono)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-normal)',
            lineHeight: 'var(--line-height-relaxed)',
            color: 'var(--color-text-secondary)',
          }}
          lineClamp={4}
        >
          {summary}
        </Text>

        {/* Why It Matters - Collapsible */}
        {whyItMatters && (
          <>
            <Button
              variant="subtle"
              size="sm"
              leftSection={<IconBulb size={16} />}
              rightSection={expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              onClick={toggleExpanded}
              fullWidth
              justify="space-between"
              styles={{
                root: {
                  paddingLeft: 0,
                  paddingRight: 0,
                },
                inner: {
                  justifyContent: 'space-between',
                },
              }}
            >
              Why It Matters
            </Button>

            <Collapse in={expanded}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Stack
                  gap="sm"
                  p="sm"
                  style={{ backgroundColor: 'var(--mantine-color-gray-0)', borderRadius: '8px' }}
                >
                  <Text
                    style={{
                      fontFamily: 'var(--font-family-mono)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-normal)',
                      lineHeight: 'var(--line-height-relaxed)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {whyItMatters}
                  </Text>

                  {applications && applications.length > 0 && (
                    <>
                      <Divider />
                      <div>
                        <Group gap="xs" mb="xs">
                          <IconRocket size={16} />
                          <Text size="sm" fw={600}>
                            Applications
                          </Text>
                        </Group>
                        <Stack gap="xs">
                          {applications.map((app, idx) => (
                            <Text key={idx} size="sm" pl="md">
                              • {app}
                            </Text>
                          ))}
                        </Stack>
                      </div>
                    </>
                  )}
                </Stack>
              </motion.div>
            </Collapse>
          </>
        )}

        {/* Metadata */}
        <Group gap="xs" mt="auto">
          {category && (
            <Badge variant="light" size="sm">
              {category}
            </Badge>
          )}

          {authors && authors.length > 0 && (
            <Text size="xs" c="dimmed">
              {authors.slice(0, 2).join(', ')}
              {authors.length > 2 && ` +${authors.length - 2}`}
            </Text>
          )}
        </Group>

        {publishedDate && (
          <Text size="xs" c="dimmed">
            {formatDate(publishedDate)}
          </Text>
        )}

        {/* Action Buttons */}
        <Group
          justify="space-between"
          mt="xs"
          pt="xs"
          style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
        >
          <Group gap="xs">
            <Tooltip label={localLiked ? 'Unlike' : 'Like'}>
              <ActionIcon
                variant="subtle"
                color={localLiked ? 'red' : 'gray'}
                onClick={handleLikeClick}
                size="lg"
              >
                <motion.div
                  whileTap={{ scale: 1.3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  {localLiked ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
                </motion.div>
              </ActionIcon>
            </Tooltip>
            {localLikesCount > 0 && (
              <Text size="sm" c="dimmed">
                {localLikesCount}
              </Text>
            )}
          </Group>

          <Group gap="xs">
            <Tooltip label={isSaved ? 'Remove bookmark' : 'Bookmark'}>
              <ActionIcon
                variant="subtle"
                color={isSaved ? 'blue' : 'gray'}
                onClick={handleSaveClick}
                size="lg"
              >
                {isSaved ? <IconBookmarkFilled size={20} /> : <IconBookmark size={20} />}
              </ActionIcon>
            </Tooltip>

            <Tooltip label="Share">
              <ActionIcon variant="subtle" color="gray" onClick={handleShareClick} size="lg">
                <IconShare size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Stack>
    </MotionCard>
  );
};

PaperCard.propTypes = {
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
  onSave: PropTypes.func,
  onRead: PropTypes.func,
  onLike: PropTypes.func,
  onShare: PropTypes.func,
  isSaved: PropTypes.bool,
  isLiked: PropTypes.bool,
};

export default PaperCard;
