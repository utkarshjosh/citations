import { Center, Loader, Stack, Text } from '@mantine/core';
import PropTypes from 'prop-types';

export const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  return (
    <Center style={{ minHeight: '200px' }}>
      <Stack align="center" gap="md">
        <Loader size={size} />
        {message && (
          <Text size="sm" c="dimmed">
            {message}
          </Text>
        )}
      </Stack>
    </Center>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
};

export default LoadingSpinner;
