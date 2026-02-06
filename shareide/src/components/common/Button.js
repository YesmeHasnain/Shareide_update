import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius } from '../../theme/colors';

const Button = ({
  title,
  onPress,
  variant = 'primary', // primary, secondary, outline, ghost, danger, text
  size = 'medium', // small, medium, large
  icon,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  textStyle,
  haptic = true,
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
          textColor: '#000000',
          borderColor: 'transparent',
        };
      case 'secondary':
        return {
          background: colors.inputBackground || '#F5F5F5',
          textColor: colors.text,
          borderColor: 'transparent',
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
      case 'text':
        return {
          background: 'transparent',
          textColor: colors.primary,
          borderColor: 'transparent',
        };
      default:
        return {
          background: colors.primary,
          textColor: '#000000',
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
          height: 56,
          paddingHorizontal: 32,
          fontSize: 16,
          iconSize: 22,
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
          size="small"
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
      height: variant === 'text' ? 'auto' : sizeStyles.height,
      paddingHorizontal: variant === 'text' ? 0 : sizeStyles.paddingHorizontal,
      backgroundColor: variantStyles.background,
      borderColor: variantStyles.borderColor,
      borderWidth: variant === 'outline' ? 1.5 : 0,
      width: fullWidth ? '100%' : 'auto',
    },
    disabled && styles.disabled,
    style,
  ];

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
    borderRadius: 27,
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
    fontWeight: '600',
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
