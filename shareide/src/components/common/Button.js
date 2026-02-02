import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { shadows, borderRadius } from '../../theme/colors';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost, danger
  size = 'medium', // small, medium, large
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
  haptic = true,
  gradient = false,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: colors.primary,
          textColor: colors.textOnPrimary,
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          background: colors.surface,
          textColor: colors.text,
          borderColor: colors.border,
        };
      case 'outline':
        return {
          background: 'transparent',
          textColor: colors.primary,
          borderColor: colors.primary,
        };
      case 'ghost':
        return {
          background: 'transparent',
          textColor: colors.primary,
          borderColor: 'transparent',
        };
      case 'danger':
        return {
          background: colors.error,
          textColor: '#FFFFFF',
          borderColor: 'transparent',
        };
      case 'dark':
        return {
          background: '#1A1A2E',
          textColor: colors.primary,
          borderColor: 'transparent',
        };
      default:
        return {
          background: colors.primary,
          textColor: colors.textOnPrimary,
          borderColor: 'transparent',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: 40,
          paddingHorizontal: 16,
          fontSize: 14,
          iconSize: 16,
        };
      case 'medium':
        return {
          height: 52,
          paddingHorizontal: 24,
          fontSize: 16,
          iconSize: 20,
        };
      case 'large':
        return {
          height: 60,
          paddingHorizontal: 32,
          fontSize: 18,
          iconSize: 24,
        };
      default:
        return {
          height: 52,
          paddingHorizontal: 24,
          fontSize: 16,
          iconSize: 20,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const buttonContent = (
    <View style={styles.contentContainer}>
      {loading ? (
        <ActivityIndicator
          color={variantStyles.textColor}
          size={size === 'small' ? 'small' : 'small'}
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.textColor}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              {
                color: variantStyles.textColor,
                fontSize: sizeStyles.fontSize,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={sizeStyles.iconSize}
              color={variantStyles.textColor}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </View>
  );

  const buttonStyle = [
    styles.button,
    {
      height: sizeStyles.height,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      backgroundColor: gradient ? 'transparent' : variantStyles.background,
      borderColor: variantStyles.borderColor,
      borderWidth: variant === 'outline' || variant === 'secondary' ? 1.5 : 0,
      width: fullWidth ? '100%' : 'auto',
    },
    variant === 'primary' && !gradient && shadows.gold,
    disabled && styles.disabled,
    style,
  ];

  if (gradient && (variant === 'primary' || variant === 'danger')) {
    const gradientColors = variant === 'danger'
      ? ['#EF4444', '#DC2626']
      : colors.gradients?.primary || ['#FFD700', '#FFA500'];

    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled || loading}
        style={fullWidth && { width: '100%' }}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[buttonStyle, { backgroundColor: 'transparent' }]}
        >
          {buttonContent}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={buttonStyle}
      activeOpacity={0.7}
    >
      {buttonContent}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default Button;
