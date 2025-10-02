# Citations Frontend

React application for browsing research papers in plain English.

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router v6** - Client-side routing
- **TanStack Query (React Query)** - Data fetching and caching
- **Axios** - HTTP client
- **Mantine UI** - Component library
- **Framer Motion** - Animation library
- **ESLint & Prettier** - Code quality and formatting

## Project Structure

```
src/
├── assets/          # Static assets (images, fonts, etc.)
├── components/      # Reusable UI components
├── hooks/           # Custom React hooks
│   └── usePapers.js # Paper-related data fetching hooks
├── pages/           # Page components
│   └── Home.jsx     # Home page
├── services/        # API services
│   ├── api.js       # Axios instance with interceptors
│   └── paperService.js # Paper-related API calls
├── styles/          # Global styles
├── utils/           # Utility functions
├── App.jsx          # Root component with routing
└── main.jsx         # Entry point with providers
```

## Path Aliases

The following path aliases are configured in `vite.config.js`:

- `@` → `src/`
- `@components` → `src/components/`
- `@pages` → `src/pages/`
- `@hooks` → `src/hooks/`
- `@services` → `src/services/`
- `@utils` → `src/utils/`
- `@assets` → `src/assets/`
- `@styles` → `src/styles/`

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Citations
VITE_APP_DESCRIPTION=Discover the latest CS research papers
```

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development

```bash
npm run dev
```

Runs the app at [http://localhost:5173](http://localhost:5173)

### Build

```bash
npm run build
```

Builds the app for production to the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint        # Check for issues
npm run lint:fix    # Fix issues automatically
```

### Format

```bash
npm run format
```

## API Integration

The app uses a centralized API client (`src/services/api.js`) with:

- Automatic authorization header injection
- Request/response interceptors
- Error handling
- Base URL configuration from environment variables

### Using API Services

```jsx
import { useFeed } from '@hooks';

function MyComponent() {
  const { data, isLoading, error } = useFeed({ page: 1, limit: 20 });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>{/* Render data */}</div>;
}
```

## React Query

React Query is configured with sensible defaults:

- Retry: 1 attempt
- Refetch on window focus: disabled
- Stale time: 5 minutes

Custom hooks in `src/hooks/usePapers.js` provide easy access to paper-related data.

## Docker

Build and run with Docker:

```bash
docker build -t citations-frontend .
docker run -p 5173:5173 citations-frontend
```

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) in the root directory.
