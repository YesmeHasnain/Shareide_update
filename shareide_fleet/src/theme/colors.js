export const COLORS = {
  primary: '#FFD700',
  primaryDark: '#FFC107',
  primaryLight: '#FFEB3B',
  
  background: '#FFFFFF',
  backgroundDark: '#1A1A1A',
  surface: '#F5F5F5',
  surfaceDark: '#2A2A2A',
  
  text: '#212121',
  textDark: '#FFFFFF',
  textSecondary: '#757575',
  
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  border: '#E0E0E0',
  borderDark: '#404040',
};

export const getThemeColors = (isDark) => ({
  primary: COLORS.primary,
  background: isDark ? COLORS.backgroundDark : COLORS.background,
  surface: isDark ? COLORS.surfaceDark : COLORS.surface,
  text: isDark ? COLORS.textDark : COLORS.text,
  textSecondary: COLORS.textSecondary,
  border: isDark ? COLORS.borderDark : COLORS.border,
  success: COLORS.success,
  error: COLORS.error,
  warning: COLORS.warning,
  info: COLORS.info,
});