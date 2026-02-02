// Premium color palette for Shareide
export const lightColors = {
  // Primary colors - Premium Gold
  primary: '#FFD700',
  primaryDark: '#E6C200',
  primaryLight: '#FFE44D',
  primaryGradient: ['#FFD700', '#FFA500'],

  // Secondary colors
  secondary: '#FFA500',
  secondaryDark: '#E69500',
  secondaryLight: '#FFB833',

  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Card colors
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',

  // Text colors
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textOnPrimary: '#000000',
  textInverse: '#FFFFFF',

  // Border colors
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  borderFocused: '#FFD700',

  // Status colors
  error: '#EF4444',
  errorLight: '#FEE2E2',
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Gradient presets
  gradients: {
    primary: ['#FFD700', '#FFA500'],
    primaryDark: ['#E6C200', '#CC8400'],
    gold: ['#FFD700', '#FFB347', '#FFA500'],
    sunset: ['#FF6B6B', '#FFE66D'],
    premium: ['#FFD700', '#F7931E', '#FFA500'],
    dark: ['#1A1A2E', '#16213E'],
    glass: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.7)'],
  },

  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  shadowGold: 'rgba(255, 215, 0, 0.3)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Rating colors
  star: '#FFD700',
  starEmpty: '#E5E7EB',

  // Map colors
  mapRoute: '#FFD700',
  mapPickup: '#10B981',
  mapDropoff: '#EF4444',

  // Status badge colors
  statusActive: '#10B981',
  statusPending: '#F59E0B',
  statusCancelled: '#EF4444',
  statusCompleted: '#3B82F6',
};

export const darkColors = {
  // Primary colors - Premium Gold (stays same for brand consistency)
  primary: '#FFD700',
  primaryDark: '#E6C200',
  primaryLight: '#FFE44D',
  primaryGradient: ['#FFD700', '#FFA500'],

  // Secondary colors
  secondary: '#FFA500',
  secondaryDark: '#E69500',
  secondaryLight: '#FFB833',

  // Background colors - Dark theme
  background: '#0F0F1A',
  backgroundSecondary: '#1A1A2E',
  surface: '#1A1A2E',
  surfaceElevated: '#252540',

  // Card colors
  card: '#1A1A2E',
  cardElevated: '#252540',

  // Text colors
  text: '#FFFFFF',
  textSecondary: '#A0AEC0',
  textTertiary: '#718096',
  textOnPrimary: '#000000',
  textInverse: '#1A1A2E',

  // Border colors
  border: '#2D3748',
  borderLight: '#1A1A2E',
  borderFocused: '#FFD700',

  // Status colors
  error: '#F87171',
  errorLight: '#7F1D1D',
  success: '#34D399',
  successLight: '#064E3B',
  warning: '#FBBF24',
  warningLight: '#78350F',
  info: '#60A5FA',
  infoLight: '#1E3A8A',

  // Gradient presets
  gradients: {
    primary: ['#FFD700', '#FFA500'],
    primaryDark: ['#E6C200', '#CC8400'],
    gold: ['#FFD700', '#FFB347', '#FFA500'],
    sunset: ['#FF6B6B', '#FFE66D'],
    premium: ['#FFD700', '#F7931E', '#FFA500'],
    dark: ['#1A1A2E', '#0F0F1A'],
    glass: ['rgba(26,26,46,0.9)', 'rgba(26,26,46,0.7)'],
  },

  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  shadowGold: 'rgba(255, 215, 0, 0.2)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',

  // Rating colors
  star: '#FFD700',
  starEmpty: '#4A5568',

  // Map colors
  mapRoute: '#FFD700',
  mapPickup: '#34D399',
  mapDropoff: '#F87171',

  // Status badge colors
  statusActive: '#34D399',
  statusPending: '#FBBF24',
  statusCancelled: '#F87171',
  statusCompleted: '#60A5FA',
};

// Typography scale
export const typography = {
  // Font sizes
  h1: 32,
  h2: 28,
  h3: 24,
  h4: 20,
  h5: 18,
  h6: 16,
  body: 16,
  bodySmall: 14,
  caption: 12,
  tiny: 10,

  // Font weights
  light: '300',
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',

  // Line heights
  lineHeightTight: 1.2,
  lineHeightNormal: 1.5,
  lineHeightRelaxed: 1.75,

  // Letter spacing
  letterSpacingTight: -0.5,
  letterSpacingNormal: 0,
  letterSpacingWide: 0.5,
};

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
  massive: 64,
};

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Shadows for different elevations
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  gold: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  goldLg: {
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animation durations
export const animations = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
};
