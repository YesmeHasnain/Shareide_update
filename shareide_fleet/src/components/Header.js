import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { spacing, typography } from '../theme/colors';

const HeaderButton = ({ icon, onPress, badge, style, colors }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[
        styles.headerButton,
        { backgroundColor: colors.inputBackground || '#F5F5F5' },
        style,
      ]}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={22} color={colors.text} />
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
  centerComponent,
  style,
  transparent = false,
  variant = 'default', // default, centered-uppercase
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const isUppercase = variant === 'centered-uppercase';

  const headerContent = (
    <>
      <View style={styles.leftContainer}>
        {onLeftPress ? (
          <HeaderButton
            icon={leftIcon}
            onPress={onLeftPress}
            colors={colors}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <View style={styles.centerContainer}>
        {centerComponent || (
          <>
            <Text
              style={[
                styles.title,
                { color: colors.text },
                isUppercase && styles.titleUppercase,
              ]}
              numberOfLines={1}
            >
              {isUppercase ? title?.toUpperCase() : title}
            </Text>
            {subtitle && (
              <Text
                style={[styles.subtitle, { color: colors.textSecondary }]}
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
            colors={colors}
          />
        )}
        {rightIcon && onRightPress ? (
          <HeaderButton
            icon={rightIcon}
            onPress={onRightPress}
            badge={rightBadge}
            colors={colors}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </>
  );

  const headerStyle = [
    styles.header,
    {
      paddingTop: insets.top + spacing.sm,
      backgroundColor: transparent ? 'transparent' : colors.background,
    },
    style,
  ];

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <View style={headerStyle}>
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
    paddingBottom: spacing.md,
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
    fontWeight: '600',
    textAlign: 'center',
  },
  titleUppercase: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
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
