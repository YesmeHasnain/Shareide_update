import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { shadows, borderRadius, spacing } from '../../theme/colors';

const Card = ({
  children,
  onPress,
  variant = 'default', // default, elevated, outlined
  padding = 'medium', // none, small, medium, large
  margin,
  style,
  haptic = true,
  shadow = 'md', // none, sm, md, lg
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (haptic && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const getPadding = () => {
    switch (padding) {
      case 'none':
        return 0;
      case 'small':
        return spacing.md;
      case 'medium':
        return spacing.lg;
      case 'large':
        return spacing.xxl;
      default:
        return spacing.lg;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.card,
          borderWidth: 0,
          ...shadows[shadow],
        };
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderWidth: 0,
          ...shadows[shadow],
        };
    }
  };

  const cardStyle = [
    styles.card,
    getVariantStyles(),
    { padding: getPadding() },
    margin && { margin },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={cardStyle}
        activeOpacity={0.7}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
});

export default Card;
