import React from 'react';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { shadows, borderRadius } from '../../theme/colors';

const IconButton = ({
  icon,
  onPress,
  size = 'medium', // small, medium, large
  variant = 'default', // default, primary, outline, ghost
  color,
  backgroundColor,
  disabled = false,
  loading = false,
  badge,
  style,
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

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { buttonSize: 36, iconSize: 18 };
      case 'large':
        return { buttonSize: 56, iconSize: 28 };
      default:
        return { buttonSize: 44, iconSize: 22 };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: backgroundColor || colors.primary,
          iconColor: color || '#000',
          borderWidth: 0,
          ...shadows.gold,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          iconColor: color || colors.primary,
          borderWidth: 1.5,
          borderColor: colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          iconColor: color || colors.text,
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: backgroundColor || colors.surface,
          iconColor: color || colors.text,
          borderWidth: 0,
          ...shadows.sm,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  const buttonStyle = [
    styles.button,
    {
      width: sizeStyles.buttonSize,
      height: sizeStyles.buttonSize,
      borderRadius: sizeStyles.buttonSize / 2,
      backgroundColor: gradient ? 'transparent' : variantStyles.backgroundColor,
      borderWidth: variantStyles.borderWidth,
      borderColor: variantStyles.borderColor,
    },
    variantStyles,
    disabled && styles.disabled,
    style,
  ];

  const content = (
    <>
      <Ionicons
        name={icon}
        size={sizeStyles.iconSize}
        color={variantStyles.iconColor}
      />
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </>
  );

  if (gradient && variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={colors.gradients?.primary || ['#FFD700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            buttonStyle,
            { backgroundColor: 'transparent' },
            shadows.gold,
          ]}
        >
          {content}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={buttonStyle}
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
});

export default IconButton;
