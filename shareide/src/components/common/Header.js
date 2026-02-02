import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography } from '../../theme/colors';

const HeaderButton = ({ icon, onPress, badge, color = '#000' }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.headerButton}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={24} color={color} />
      {badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const Header = ({
  title,
  subtitle,
  leftIcon = 'arrow-back',
  rightIcon,
  rightIcon2,
  onLeftPress,
  onRightPress,
  onRight2Press,
  rightBadge,
  variant = 'primary', // primary, transparent, solid
  gradient,
  centerComponent,
  style,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const getVariantStyles = () => {
    switch (variant) {
      case 'transparent':
        return {
          backgroundColor: 'transparent',
          textColor: colors.text,
          iconColor: colors.text,
        };
      case 'solid':
        return {
          backgroundColor: colors.background,
          textColor: colors.text,
          iconColor: colors.text,
        };
      default:
        return {
          backgroundColor: colors.primary,
          textColor: '#000000',
          iconColor: '#000000',
        };
    }
  };

  const variantStyles = getVariantStyles();

  const headerContent = (
    <>
      <View style={styles.leftContainer}>
        {onLeftPress ? (
          <HeaderButton
            icon={leftIcon}
            onPress={onLeftPress}
            color={variantStyles.iconColor}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <View style={styles.centerContainer}>
        {centerComponent || (
          <>
            <Text
              style={[styles.title, { color: variantStyles.textColor }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[styles.subtitle, { color: variantStyles.textColor, opacity: 0.7 }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </>
        )}
      </View>

      <View style={styles.rightContainer}>
        {rightIcon2 && onRight2Press && (
          <HeaderButton
            icon={rightIcon2}
            onPress={onRight2Press}
            color={variantStyles.iconColor}
          />
        )}
        {rightIcon && onRightPress ? (
          <HeaderButton
            icon={rightIcon}
            onPress={onRightPress}
            badge={rightBadge}
            color={variantStyles.iconColor}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </>
  );

  const headerStyle = [
    styles.header,
    { paddingTop: insets.top + spacing.sm },
    style,
  ];

  if (variant === 'primary' && (gradient || colors.gradients?.primary)) {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <LinearGradient
          colors={gradient || colors.gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={headerStyle}
        >
          {headerContent}
        </LinearGradient>
      </>
    );
  }

  return (
    <>
      <StatusBar
        barStyle={variant === 'primary' ? 'dark-content' : 'default'}
      />
      <View style={[headerStyle, { backgroundColor: variantStyles.backgroundColor }]}>
        {headerContent}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  leftContainer: {
    width: 48,
    alignItems: 'flex-start',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightContainer: {
    width: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.h5,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.caption,
    fontWeight: '500',
    marginTop: 2,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
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

export default Header;
