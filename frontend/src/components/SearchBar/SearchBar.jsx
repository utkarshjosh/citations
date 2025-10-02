import { TextInput, ActionIcon } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useState } from 'react';
import PropTypes from 'prop-types';

export const SearchBar = ({ 
  placeholder = 'Search papers...', 
  onSearch,
  defaultValue = '',
}) => {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(value);
  };

  const handleClear = () => {
    setValue('');
    onSearch?.('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.currentTarget.value)}
        leftSection={<IconSearch size={18} />}
        rightSection={
          value && (
            <ActionIcon 
              variant="subtle" 
              color="gray" 
              onClick={handleClear}
              size="sm"
            >
              <IconX size={16} />
            </ActionIcon>
          )
        }
        size="md"
        radius="md"
      />
    </form>
  );
};

SearchBar.propTypes = {
  placeholder: PropTypes.string,
  onSearch: PropTypes.func,
  defaultValue: PropTypes.string,
};

export default SearchBar;
