// Citations - "The Edge of Insight" Color Palette
// Dark mode optimized for focused, intellectual reading
// Focus: Precision, Depth, Frontier - High contrast for nighttime reading

export const colors = {
  // Primary Base (Dark Mode) - The Canvas
  primaryBase: '#0E1117', // Deep, near-black background

  // Secondary Base (Cards/Containers) - The Depth
  secondaryBase: '#1C212B', // Slightly lighter for cards

  // Primary Accent - The Insight
  primaryAccent: '#00D0FF', // Electric blue/cyan for highlights

  // Secondary Accent - The Text/Authority
  secondaryAccent: '#94A3B8', // Cool gray/blue for body text

  // Success/Trend - The Signal
  successTrend: '#70E0A7', // Calm green for high impact badges

  // Extended palette for consistency
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#00D0FF', // Primary accent
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94A3B8', // Secondary accent
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },

  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#70E0A7', // Success/trend
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Vibrant gradients for Citations brand
  gradients: {
    primary: 'linear-gradient(135deg, #00D0FF 0%, #70E0A7 100%)',
    card: 'linear-gradient(135deg, #1C212B 0%, rgba(0, 208, 255, 0.05) 100%)',
    subtle: 'linear-gradient(135deg, #00D0FF 0%, rgba(112, 224, 167, 0.3) 100%)',
    whyItMatters:
      'linear-gradient(135deg, rgba(0, 208, 255, 0.08) 0%, rgba(112, 224, 167, 0.05) 100%)',
    hover: 'linear-gradient(135deg, rgba(0, 208, 255, 0.1) 0%, rgba(112, 224, 167, 0.08) 100%)',
  },

  // Dark mode optimized for Citations
  dark: {
    bg: '#0E1117', // Primary base
    surface: '#1C212B', // Secondary base
    surfaceHover: '#252b3a',
    border: '#2d3748',
    text: '#ffffff',
    textSecondary: '#94A3B8', // Secondary accent
    textTertiary: '#64748b',
    accent: '#00D0FF', // Primary accent
    success: '#70E0A7', // Success/trend
  },

  // Light mode for Citations
  light: {
    bg: '#ffffff', // Clean white background
    surface: '#f8fafc', // Light gray surface
    surfaceHover: '#f1f5f9',
    border: '#e2e8f0',
    text: '#0f172a', // Dark text
    textSecondary: '#475569', // Medium gray text
    textTertiary: '#64748b',
    accent: '#00D0FF', // Same vibrant accent
    success: '#70E0A7', // Same success color
  },
};

// Category-specific colors using Citations palette
export const categoryColors = {
  'cs.AI': { gradient: colors.gradients.primary, color: colors.primaryAccent },
  'cs.LG': { gradient: colors.gradients.subtle, color: colors.secondaryAccent },
  'cs.CL': { gradient: colors.gradients.card, color: colors.primaryAccent },
  'cs.CV': { gradient: colors.gradients.primary, color: colors.successTrend },
  'cs.NE': { gradient: colors.gradients.subtle, color: colors.primaryAccent },
  'cs.RO': { gradient: colors.gradients.card, color: colors.secondaryAccent },
  'cs.CR': { gradient: colors.gradients.primary, color: colors.primaryAccent },
  default: { gradient: colors.gradients.card, color: colors.secondaryAccent },
};

// Get color for category
export const getCategoryColor = category => {
  return categoryColors[category] || categoryColors.default;
};

// Interaction colors for Citations
export const interactionColors = {
  like: colors.secondaryAccent,
  likeActive: colors.successTrend,
  bookmark: colors.secondaryAccent,
  bookmarkActive: colors.primaryAccent,
  share: colors.secondaryAccent,
  shareActive: colors.primaryAccent,
  save: colors.secondaryAccent,
  saveActive: colors.primaryAccent,
  discuss: colors.secondaryAccent,
  discussActive: colors.primaryAccent,
};

export default colors;
