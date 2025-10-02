import { Alert, Button, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import PropTypes from 'prop-types';

export const ErrorMessage = ({ 
  title = 'Error', 
  message = 'Something went wrong. Please try again.', 
  onRetry 
}) => {
  return (
    <Alert 
      icon={<IconAlertCircle size={20} />} 
      title={title} 
      color="red"
      variant="light"
    >
      <Stack gap="md">
        {message}
        {onRetry && (
          <Button 
            variant="light" 
            color="red" 
            size="sm" 
            onClick={onRetry}
            style={{ alignSelf: 'flex-start' }}
          >
            Try Again
          </Button>
        )}
      </Stack>
    </Alert>
  );
};

ErrorMessage.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
};

export default ErrorMessage;
