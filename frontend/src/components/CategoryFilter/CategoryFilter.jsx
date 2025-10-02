import { Group, Chip } from '@mantine/core';
import PropTypes from 'prop-types';

export const CategoryFilter = ({ 
  categories = [], 
  selected = null, 
  onChange 
}) => {
  return (
    <Chip.Group value={selected} onChange={onChange}>
      <Group gap="xs">
        <Chip value={null} variant="light">
          All
        </Chip>
        {categories.map((category) => (
          <Chip key={category.id} value={category.id} variant="light">
            {category.name}
          </Chip>
        ))}
      </Group>
    </Chip.Group>
  );
};

CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ),
  selected: PropTypes.string,
  onChange: PropTypes.func,
};

export default CategoryFilter;
