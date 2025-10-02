import { Card, Skeleton, Stack, Group } from '@mantine/core';

/**
 * Skeleton loader for PaperCard - optimized for mobile
 */
export const PaperCardSkeleton = () => {
  return (
    <Card 
      padding="md" 
      style={{ 
        height: 'auto',
        minHeight: '280px'
      }}
    >
      <Stack gap="sm">
        {/* Title skeleton */}
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Skeleton height={24} width="85%" radius="sm" />
          <Skeleton height={20} width={20} circle />
        </Group>
        
        {/* Summary skeleton - 3 lines */}
        <Stack gap="xs">
          <Skeleton height={16} radius="sm" />
          <Skeleton height={16} radius="sm" />
          <Skeleton height={16} width="70%" radius="sm" />
        </Stack>

        {/* Why it matters button skeleton */}
        <Skeleton height={32} width="140px" radius="md" mt="xs" />

        {/* Metadata skeleton */}
        <Group gap="xs" mt="sm">
          <Skeleton height={24} width={100} radius="xl" />
          <Skeleton height={16} width={120} radius="sm" />
        </Group>

        <Skeleton height={14} width={80} radius="sm" />

        {/* Action buttons skeleton */}
        <Group justify="space-between" mt="xs" pt="xs">
          <Group gap="xs">
            <Skeleton height={36} width={36} circle />
            <Skeleton height={20} width={30} radius="sm" />
          </Group>
          <Group gap="xs">
            <Skeleton height={36} width={36} circle />
            <Skeleton height={36} width={36} circle />
          </Group>
        </Group>
      </Stack>
    </Card>
  );
};

export default PaperCardSkeleton;
