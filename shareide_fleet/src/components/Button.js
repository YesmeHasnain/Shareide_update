import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography, spacing } from '../theme/colors';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary', // primary, secondary, outline, text
  size = 'medium', // small, medium, large
  icon,
  iconPosition = 'left',
  style,
  textStyle
}) => {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'secondary':
        return colors.inputBackground;
      case 'outline':
      case 'text':
        return 'transparent';
      default:
        return colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return colors.textSecondary;
    switch (variant) {
      case 'secondary':
        return colors.text;
      case 'outline':
        return colors.primary;
      case 'text':
        return colors.primary;
      default:
        return '#000000';
    }
  };

  const getHeight = () => {
    switch (size) {
      case 'small':
        return 40;
      case 'large':
        return 56;
      default:
        return 50;
    }
  };

  const getBorderRadius = () => {
    switch (size) {
      case 'small':
        return 10;
      case 'large':
        return 28;
      default:
        return 14;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return typography.bodySmall;
      case 'large':
        return typography.body;
      default:
        return typography.body;
    }
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator color={getTextColor()} />;
    }

    const textElement = (
      <Text
        style={[
          styles.text,
          { color: getTextColor(), fontSize: getFontSize() },
          textStyle,
        ]}
      >
        {title}
      </Text>
    );

    if (icon) {
      return (
        <View style={styles.contentRow}>
          {iconPosition === 'left' && (
            <Ionicons name={icon} size={20} color={getTextColor()} style={styles.iconLeft} />
          )}
          {textElement}
          {iconPosition === 'right' && (
            <Ionicons name={icon} size={20} color={getTextColor()} style={styles.iconRight} />
          )}
        </View>
      );
    }

    return textElement;
  };

  const isPrimary = variant === 'primary' && !disabled;

  return (
    <AnimatedTouchable
      style={[
        styles.button,
        {
          backgroundColor: getBackgroundColor(),
          height: getHeight(),
          borderRadius: getBorderRadius(),
          borderColor: variant === 'outline' ? colors.primary : 'transparent',
          borderWidth: variant === 'outline' ? 2 : 0,
          transform: [{ scale: scaleAnim }],
          // Shadow for primary buttons
          ...(isPrimary ? {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 4,
          } : {}),
        },
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      {renderContent()}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  text: {
    fontWeight: '600',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: spacing.sm,
  },
  iconRight: {
    marginLeft: spacing.sm,
  },
});

export default Button;
