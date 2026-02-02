import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing } from '../../theme/colors';

const Badge = ({
  label,
  variant = 'default', // default, success, warning, error, info, primary
  size = 'medium', // small, medium, large
  icon,
  gradient = false,
  style,
}) => {
  const { colors } = useTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: colors.successLight,
          textColor: colors.success,
        };
      case 'warning':
        return {
          backgroundColor: colors.warningLight,
          textColor: colors.warning,
        };
      case 'error':
        return {
          backgroundColor: colors.errorLight,
          textColor: colors.error,
        };
      case 'info':
        return {
          backgroundColor: colors.infoLight,
          textColor: colors.info,
        };
      case 'primary':
        return {
          backgroundColor: colors.primary + '20',
          textColor: colors.primaryDark,
        };
      default:
        return {
          backgroundColor: colors.surface,
          textColor: colors.textSecondary,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: spacing.xs,
          paddingHorizontal: spacing.sm,
          fontSize: 10,
          iconSize: 10,
        };
      case 'large':
        return {
          paddingVertical: spacing.sm + 2,
          paddingHorizontal: spacing.lg,
          fontSize: 14,
          iconSize: 16,
        };
      default:
        return {
          paddingVertical: spacing.xs + 2,
          paddingHorizontal: spacing.md,
          fontSize: 12,
          iconSize: 12,
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const badgeStyle = [
    styles.badge,
    {
      backgroundColor: gradient ? 'transparent' : variantStyles.backgroundColor,
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
    },
    style,
  ];

  const content = (
    <>
      {icon && (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={gradient ? '#000' : variantStyles.textColor}
          style={styles.icon}
        />
      )}
      <Text
        style={[
          styles.text,
          {
            color: gradient ? '#000' : variantStyles.textColor,
            fontSize: sizeStyles.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </>
  );

  if (gradient) {
    return (
      <LinearGradient
        colors={colors.gradients?.primary || ['#FFD700', '#FFA500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={badgeStyle}
      >
        {content}
      </LinearGradient>
    );
  }

  return <View style={badgeStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  icon: {
    marginRight: spacing.xs,
  },
  text: {
    fontWeight: '600',
  },
});

export default Badge;
