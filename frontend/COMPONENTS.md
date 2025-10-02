# UI Components Documentation

This document describes the reusable UI components available in the Citations frontend.

## Component Library

### PaperCard

A card component for displaying research paper information.

**Location:** `src/components/PaperCard/`

**Props:**

- `paper` (object, required): Paper data object
  - `title` (string): Paper title
  - `summary` (string): Paper summary
  - `authors` (array): List of author names
  - `category` (string): Paper category
  - `publishedDate` (string): Publication date
  - `url` (string): Paper URL
- `onSave` (function): Callback when bookmark button is clicked
- `onRead` (function): Callback when card is clicked
- `isSaved` (boolean): Whether paper is bookmarked

**Example:**

```jsx
import { PaperCard } from '@components';

<PaperCard
  paper={{
    title: 'Attention Is All You Need',
    summary: 'Introduction to Transformer architecture...',
    authors: ['Vaswani', 'Shazeer'],
    category: 'Machine Learning',
    publishedDate: '2023-12-15',
    url: 'https://arxiv.org/abs/1234',
  }}
  onSave={paper => console.log('Save', paper)}
  onRead={paper => console.log('Read', paper)}
  isSaved={false}
/>;
```

**Features:**

- Animated entrance with Framer Motion
- Bookmark toggle button
- External link button
- Truncated text with line clamp
- Responsive design
- Author list with overflow handling

---

### LoadingSpinner

A centered loading spinner with optional message.

**Location:** `src/components/LoadingSpinner/`

**Props:**

- `message` (string): Loading message to display
- `size` (string): Loader size ('xs', 'sm', 'md', 'lg', 'xl')

**Example:**

```jsx
import { LoadingSpinner } from '@components';

<LoadingSpinner message="Loading papers..." size="lg" />;
```

---

### ErrorMessage

An error alert component with optional retry button.

**Location:** `src/components/ErrorMessage/`

**Props:**

- `title` (string): Error title
- `message` (string): Error message
- `onRetry` (function): Callback for retry button

**Example:**

```jsx
import { ErrorMessage } from '@components';

<ErrorMessage
  title="Failed to load papers"
  message="Something went wrong. Please try again."
  onRetry={() => refetch()}
/>;
```

---

### SearchBar

A search input with clear button and submit handling.

**Location:** `src/components/SearchBar/`

**Props:**

- `placeholder` (string): Input placeholder text
- `onSearch` (function): Callback when search is submitted
- `defaultValue` (string): Initial search value

**Example:**

```jsx
import { SearchBar } from '@components';

<SearchBar
  placeholder="Search papers..."
  onSearch={query => console.log('Search:', query)}
  defaultValue=""
/>;
```

**Features:**

- Search icon on left
- Clear button (X) on right when text is present
- Submit on Enter key
- Controlled input

---

### CategoryFilter

A chip group for filtering by category.

**Location:** `src/components/CategoryFilter/`

**Props:**

- `categories` (array): Array of category objects
  - `id` (string): Category ID
  - `name` (string): Category display name
- `selected` (string): Currently selected category ID
- `onChange` (function): Callback when selection changes

**Example:**

```jsx
import { CategoryFilter } from '@components';

<CategoryFilter
  categories={[
    { id: 'ml', name: 'Machine Learning' },
    { id: 'cv', name: 'Computer Vision' },
  ]}
  selected="ml"
  onChange={categoryId => console.log('Selected:', categoryId)}
/>;
```

---

## Theme Configuration

The app uses a custom Mantine theme defined in `src/theme/index.js`.

### Brand Colors

- **Primary:** Blue (#2196F3)
- **Brand palette:** 10 shades from light to dark
- **Dark mode:** Custom dark palette

### Typography

- **Font Family:** System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- **Headings:** Bold weights with responsive sizes
- **Line Heights:** Optimized for readability

### Spacing Scale

- `xs`: 8px
- `sm`: 12px
- `md`: 16px (default)
- `lg`: 24px
- `xl`: 32px

### Breakpoints (Mobile-First)

- `xs`: 576px
- `sm`: 768px
- `md`: 992px
- `lg`: 1200px
- `xl`: 1408px

### Border Radius

- `xs`: 4px
- `sm`: 8px
- `md`: 12px (default)
- `lg`: 16px
- `xl`: 24px

### Shadows

Five levels of elevation (xs, sm, md, lg, xl) with subtle, modern shadows.

### Component Defaults

All Mantine components have sensible defaults:

- Buttons: medium radius
- Cards: small shadow, medium radius, with border
- Inputs: medium radius
- Papers: small shadow, medium radius

---

## Responsive Design

All components follow mobile-first design principles:

### SimpleGrid Responsive Columns

```jsx
<SimpleGrid cols={{ base: 1, sm: 1, md: 2, lg: 3 }} spacing="lg">
  {/* Content */}
</SimpleGrid>
```

- **base (mobile):** 1 column
- **sm (tablet):** 1 column
- **md (small desktop):** 2 columns
- **lg (large desktop):** 3 columns

### Container Sizes

- **xs:** 540px
- **sm:** 720px
- **md:** 960px
- **lg:** 1140px
- **xl:** 1320px (default)

---

## Animations

Components use Framer Motion for smooth animations:

```jsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  {/* Content */}
</motion.div>;
```

---

## Icons

The app uses Tabler Icons from `@tabler/icons-react`:

```jsx
import { IconSearch, IconBookmark, IconX } from '@tabler/icons-react';

<IconSearch size={18} />;
```

---

## Best Practices

1. **Import from index:** Always import components from `@components`
2. **Use path aliases:** Leverage configured aliases (@components, @hooks, etc.)
3. **Prop validation:** All components use PropTypes for type checking
4. **Accessibility:** Components follow WCAG guidelines
5. **Mobile-first:** Design for mobile, enhance for desktop
6. **Performance:** Components are optimized and tree-shakeable

---

## Adding New Components

1. Create component directory in `src/components/`
2. Create `ComponentName.jsx` with component code
3. Create `index.js` with exports
4. Add export to `src/components/index.js`
5. Document in this file

Example structure:

```
src/components/
  MyComponent/
    MyComponent.jsx
    index.js
```
