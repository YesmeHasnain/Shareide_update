// SHAREIDE Fleet - Professional Design System
// Based on Uber, Bolt, Yango Pro, Grab & Careem driver app research
// Optimized for dashboard-mounted phones & night driving

export const lightColors = {
  // Primary - Gold/Yellow (Brand Identity)
  primary: '#FCC014',
  primaryDark: '#E3AD12',
  primaryLight: '#FDCE43',
  primaryMuted: 'rgba(252, 192, 20, 0.12)',
  primaryGlow: 'rgba(252, 192, 20, 0.25)',

  // Secondary - Orange (Accents & Prices)
  secondary: '#F5A623',
  secondaryDark: '#E8930C',
  secondaryLight: '#FFB84D',

  // Background
  background: '#FFFFFF',
  backgroundSecondary: '#F8F9FC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceSecondary: '#F8F9FC',
  inputBackground: '#F5F6F8',

  // Card
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  cardBorder: '#F0F0F3',

  // Text
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textOnPrimary: '#000000',
  textInverse: '#FFFFFF',

  // Border
  border: '#E5E7EB',
  borderLight: '#F0F0F3',
  borderFocused: '#FCC014',

  // Status
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorMuted: 'rgba(239, 68, 68, 0.1)',
  success: '#10B981',
  successLight: '#D1FAE5',
  successMuted: 'rgba(16, 185, 129, 0.1)',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningMuted: 'rgba(245, 158, 11, 0.1)',
  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoMuted: 'rgba(59, 130, 246, 0.1)',

  // Price/Earnings
  price: '#F5A623',
  earnings: '#10B981',
  earningsBackground: 'rgba(16, 185, 129, 0.08)',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.06)',
  shadowDark: 'rgba(0, 0, 0, 0.12)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',

  // Rating
  star: '#FCC014',
  starEmpty: '#E5E7EB',

  // Tab Bar
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#F0F0F3',
  tabBarActive: '#FCC014',
  tabBarInactive: '#9CA3AF',
  tabBarIndicator: '#FCC014',

  // Map
  mapRoute: '#FCC014',
  mapPickup: '#10B981',
  mapDropoff: '#EF4444',
  mapRouteAlt: '#3B82F6',

  // Heatmap / Demand Zones (Uber pattern)
  heatmapHigh: '#EF4444',
  heatmapMedium: '#F59E0B',
  heatmapLow: '#FCC014',

  // Countdown Timer (Uber/Bolt ride acceptance pattern)
  timerActive: '#FCC014',
  timerUrgent: '#EF4444',
  timerTrack: '#E5E7EB',

  // Online/Offline Status
  statusOnline: '#10B981',
  statusOnlineGlow: 'rgba(16, 185, 129, 0.2)',
  statusOffline: '#EF4444',
  statusBusy: '#F59E0B',
  statusActive: '#10B981',
  statusPending: '#F59E0B',
  statusCancelled: '#EF4444',
  statusCompleted: '#3B82F6',

  // SOS / Emergency (DiDi pattern)
  emergency: '#EF4444',
  emergencyBackground: 'rgba(239, 68, 68, 0.08)',
  emergencyBorder: 'rgba(239, 68, 68, 0.2)',

  // Drawer
  drawerBackground: '#0F0F1A',
  drawerSurface: 'rgba(255, 255, 255, 0.06)',
  drawerBorder: 'rgba(255, 255, 255, 0.08)',
  drawerText: 'rgba(255, 255, 255, 0.85)',
  drawerTextMuted: 'rgba(255, 255, 255, 0.45)',

  // Design tokens
  locationAccent: '#1A6B54',
  filterChipActive: '#1A1A2E',
  filterChipInactive: '#F5F6F8',
  filterChipActiveText: '#FFFFFF',
  filterChipInactiveText: '#6B7280',

  // Route visualization
  pickupDot: '#10B981',
  dropoffDot: '#EF4444',
  routeConnector: '#E5E7EB',

  // Pill backgrounds
  pillPickup: '#D1FAE5',
  pillDropoff: '#FEE2E2',
  pillPickupText: '#065F46',
  pillDropoffText: '#991B1B',

  // Progress bar
  progressFill: '#FCC014',
  progressTrack: '#E5E7EB',

  // Gradients (for LinearGradient component)
  gradientPrimary: ['#FCC014', '#F5A623'],
  gradientDark: ['#0F0F1A', '#1A1A2E'],
  gradientSuccess: ['#10B981', '#059669'],
  gradientDanger: ['#EF4444', '#DC2626'],
  gradientBlue: ['#3B82F6', '#2563EB'],
};

export const darkColors = {
  // Primary (stays same for brand consistency)
  primary: '#FCC014',
  primaryDark: '#E3AD12',
  primaryLight: '#FDCE43',
  primaryMuted: 'rgba(252, 192, 20, 0.15)',
  primaryGlow: 'rgba(252, 192, 20, 0.3)',

  // Secondary
  secondary: '#F5A623',
  secondaryDark: '#E8930C',
  secondaryLight: '#FFB84D',

  // Background
  background: '#0F0F1A',
  backgroundSecondary: '#1A1A2E',
  surface: '#1A1A2E',
  surfaceElevated: '#252540',
  surfaceSecondary: '#1A1A2E',
  inputBackground: '#252540',

  // Card
  card: '#1A1A2E',
  cardElevated: '#252540',
  cardBorder: 'rgba(255, 255, 255, 0.06)',

  // Text (off-white for reduced eye strain - Uber dark mode research)
  text: '#F0F0F3',
  textSecondary: '#A0AEC0',
  textTertiary: '#718096',
  textOnPrimary: '#000000',
  textInverse: '#1A1A2E',

  // Border
  border: '#2D3748',
  borderLight: 'rgba(255, 255, 255, 0.06)',
  borderFocused: '#FCC014',

  // Status
  error: '#F87171',
  errorLight: '#7F1D1D',
  errorMuted: 'rgba(248, 113, 113, 0.15)',
  success: '#34D399',
  successLight: '#064E3B',
  successMuted: 'rgba(52, 211, 153, 0.15)',
  warning: '#FBBF24',
  warningLight: '#78350F',
  warningMuted: 'rgba(251, 191, 36, 0.15)',
  info: '#60A5FA',
  infoLight: '#1E3A8A',
  infoMuted: 'rgba(96, 165, 250, 0.15)',

  // Price/Earnings
  price: '#F5A623',
  earnings: '#34D399',
  earningsBackground: 'rgba(52, 211, 153, 0.1)',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(0, 0, 0, 0.85)',

  // Rating
  star: '#FCC014',
  starEmpty: '#4A5568',

  // Tab Bar (dark glass effect)
  tabBarBackground: '#1A1A2E',
  tabBarBorder: 'rgba(255, 255, 255, 0.06)',
  tabBarActive: '#FCC014',
  tabBarInactive: '#718096',
  tabBarIndicator: '#FCC014',

  // Map (auto-dark tiles at night)
  mapRoute: '#FCC014',
  mapPickup: '#34D399',
  mapDropoff: '#F87171',
  mapRouteAlt: '#60A5FA',

  // Heatmap
  heatmapHigh: '#F87171',
  heatmapMedium: '#FBBF24',
  heatmapLow: '#FCC014',

  // Countdown Timer
  timerActive: '#FCC014',
  timerUrgent: '#F87171',
  timerTrack: '#4A5568',

  // Status
  statusOnline: '#34D399',
  statusOnlineGlow: 'rgba(52, 211, 153, 0.25)',
  statusOffline: '#F87171',
  statusBusy: '#FBBF24',
  statusActive: '#34D399',
  statusPending: '#FBBF24',
  statusCancelled: '#F87171',
  statusCompleted: '#60A5FA',

  // SOS
  emergency: '#F87171',
  emergencyBackground: 'rgba(248, 113, 113, 0.1)',
  emergencyBorder: 'rgba(248, 113, 113, 0.25)',

  // Drawer
  drawerBackground: '#0F0F1A',
  drawerSurface: 'rgba(255, 255, 255, 0.06)',
  drawerBorder: 'rgba(255, 255, 255, 0.06)',
  drawerText: 'rgba(255, 255, 255, 0.85)',
  drawerTextMuted: 'rgba(255, 255, 255, 0.4)',

  // Design tokens
  locationAccent: '#34D399',
  filterChipActive: '#FFFFFF',
  filterChipInactive: '#2D3748',
  filterChipActiveText: '#000000',
  filterChipInactiveText: '#A0AEC0',

  // Route visualization
  pickupDot: '#34D399',
  dropoffDot: '#F87171',
  routeConnector: '#4A5568',

  // Pill backgrounds
  pillPickup: 'rgba(52, 211, 153, 0.15)',
  pillDropoff: 'rgba(248, 113, 113, 0.15)',
  pillPickupText: '#34D399',
  pillDropoffText: '#F87171',

  // Progress bar
  progressFill: '#FCC014',
  progressTrack: '#4A5568',

  // Gradients
  gradientPrimary: ['#FCC014', '#F5A623'],
  gradientDark: ['#0F0F1A', '#1A1A2E'],
  gradientSuccess: ['#34D399', '#10B981'],
  gradientDanger: ['#F87171', '#EF4444'],
  gradientBlue: ['#60A5FA', '#3B82F6'],
};

// Typography scale (optimized for legibility while driving - Grab research)
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

  // Large display for earnings/stats (Yango Pro pattern)
  displayLarge: 40,
  displayMedium: 34,
  displaySmall: 28,

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
  letterSpacingExtraWide: 1.5,
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
  pill: 50,
  full: 9999,
};

// Shadows (subtle, professional)
export const shadows = {
  none: {},
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  glow: {
    shadowColor: '#FCC014',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  // Tab bar shadow (Uber style - subtle upward)
  tabBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
};

// Animation durations (optimized for low-end devices - Grab research)
export const animations = {
  fast: 150,
  normal: 250,
  slow: 400,
  verySlow: 600,
};

// Minimum tap target sizes (Grab/Android automotive guidelines)
export const hitSlop = {
  small: { top: 8, bottom: 8, left: 8, right: 8 },
  medium: { top: 12, bottom: 12, left: 12, right: 12 },
  large: { top: 16, bottom: 16, left: 16, right: 16 },
};

// Legacy exports for backward compatibility
export const COLORS = {
  primary: '#FCC014',
  primaryDark: '#E3AD12',
  primaryLight: '#FDCE43',
  background: '#FFFFFF',
  backgroundDark: '#0F0F1A',
  surface: '#F5F5F5',
  surfaceDark: '#1A1A2E',
  text: '#1A1A2E',
  textDark: '#FFFFFF',
  textSecondary: '#6B7280',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  border: '#E5E7EB',
  borderDark: '#2D3748',
};

export const getThemeColors = (isDark) => (isDark ? darkColors : lightColors);
