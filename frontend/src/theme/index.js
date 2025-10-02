import { createTheme } from '@mantine/core';

export const theme = createTheme({
  // Color scheme
  primaryColor: 'blue',
  
  // Brand colors
  colors: {
    brand: [
      '#E3F2FD', // 0 - lightest
      '#BBDEFB', // 1
      '#90CAF9', // 2
      '#64B5F6', // 3
      '#42A5F5', // 4
      '#2196F3', // 5 - primary
      '#1E88E5', // 6
      '#1976D2', // 7
      '#1565C0', // 8
      '#0D47A1', // 9 - darkest
    ],
    dark: [
      '#C1C2C5', // 0
      '#A6A7AB', // 1
      '#909296', // 2
      '#5C5F66', // 3
      '#373A40', // 4
      '#2C2E33', // 5
      '#25262B', // 6
      '#1A1B1E', // 7
      '#141517', // 8
      '#101113', // 9
    ],
  },

  // Typography
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  headings: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontWeight: '700',
    sizes: {
      h1: { fontSize: '2.125rem', lineHeight: '1.3', fontWeight: '700' },
      h2: { fontSize: '1.625rem', lineHeight: '1.35', fontWeight: '700' },
      h3: { fontSize: '1.375rem', lineHeight: '1.4', fontWeight: '600' },
      h4: { fontSize: '1.125rem', lineHeight: '1.45', fontWeight: '600' },
      h5: { fontSize: '1rem', lineHeight: '1.5', fontWeight: '600' },
      h6: { fontSize: '0.875rem', lineHeight: '1.5', fontWeight: '600' },
    },
  },

  // Spacing
  spacing: {
    xs: '0.5rem',   // 8px
    sm: '0.75rem',  // 12px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
  },

  // Breakpoints (mobile-first)
  breakpoints: {
    xs: '36em',   // 576px
    sm: '48em',   // 768px
    md: '62em',   // 992px
    lg: '75em',   // 1200px
    xl: '88em',   // 1408px
  },

  // Radius
  radius: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '0.75rem',  // 12px
    lg: '1rem',     // 16px
    xl: '1.5rem',   // 24px
  },

  // Shadows
  shadows: {
    xs: '0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
    sm: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 10px 15px -5px, rgba(0, 0, 0, 0.04) 0px 7px 7px -5px',
    md: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px',
    lg: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 28px 23px -7px, rgba(0, 0, 0, 0.04) 0px 12px 12px -7px',
    xl: '0 1px 3px rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05) 0px 36px 28px -7px, rgba(0, 0, 0, 0.04) 0px 17px 17px -7px',
  },

  // Component defaults
  components: {
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
    Card: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
        withBorder: true,
      },
    },
    Container: {
      defaultProps: {
        sizes: {
          xs: '100%',  // Mobile-first: full width on mobile
          sm: 540,
          md: 720,
          lg: 960,
          xl: 1140,
        },
      },
    },
    TextInput: {
      defaultProps: {
        radius: 'md',
      },
    },
    Paper: {
      defaultProps: {
        shadow: 'sm',
        radius: 'md',
      },
    },
  },

  // Other settings
  defaultRadius: 'md',
  cursorType: 'pointer',
  focusRing: 'auto',
  
  // Active styles
  activeClassName: 'mantine-active',
  
  // Respect reduced motion
  respectReducedMotion: true,
});

export default theme;
