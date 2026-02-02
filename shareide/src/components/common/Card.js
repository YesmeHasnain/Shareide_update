import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { shadows, borderRadius, spacing } from '../../theme/colors';

const Card = ({
  children,
  onPress,
  variant = 'default', // default, elevated, outlined, gradient
  padding = 'medium', // none, small, medium, large
  margin,
  style,
  gradient,
  animated = true,
  haptic = true,
  shadow = 'md', // none, sm, md, lg, xl, gold
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
          backgroundColor: colors.cardElevated,
          borderWidth: 0,
          ...shadows[shadow],
        };
      case 'outlined':
        return {
          backgroundColor: colors.card,
          borderWidth: 1.5,
          borderColor: colors.border,
        };
      case 'gradient':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
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

  if (variant === 'gradient' && gradient) {
    const content = (
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[cardStyle, shadows[shadow]]}
      >
        {children}
      </LinearGradient>
    );

    if (onPress) {
      return (
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
        >
          {content}
        </TouchableOpacity>
      );
    }

    return content;
  }

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
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
});

export default Card;
