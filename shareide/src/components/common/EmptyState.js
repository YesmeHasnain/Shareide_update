import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, borderRadius } from '../../theme/colors';
import Button from './Button';

const EmptyState = ({
  icon = 'search-outline',
  title = 'Nothing here',
  message = 'No items to display',
  actionLabel,
  onAction,
  variant = 'default', // default, error, search
  animated = true,
  style,
}) => {
  const { colors } = useTheme();

  const getVariantIcon = () => {
    switch (variant) {
      case 'error':
        return 'alert-circle-outline';
      case 'search':
        return 'search-outline';
      default:
        return icon;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'error':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getIconColor() + '15' },
        ]}
      >
        <Ionicons
          name={getVariantIcon()}
          size={48}
          color={getIconColor()}
        />
      </View>

      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {message}
      </Text>

      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size="medium"
          style={styles.button}
          fullWidth={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.h4,
    fontWeight: '700',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  button: {
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xxxl,
  },
});

export default EmptyState;
