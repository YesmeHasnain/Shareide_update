import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme/colors';

const Divider = ({
  label,
  variant = 'full', // full, inset, middle
  thickness = 1,
  color,
  spacing: customSpacing = 'medium', // none, small, medium, large
  style,
}) => {
  const { colors } = useTheme();

  const getSpacing = () => {
    switch (customSpacing) {
      case 'none':
        return 0;
      case 'small':
        return spacing.sm;
      case 'large':
        return spacing.xxl;
      default:
        return spacing.lg;
    }
  };

  const getInset = () => {
    switch (variant) {
      case 'inset':
        return spacing.lg;
      case 'middle':
        return spacing.xxxl;
      default:
        return 0;
    }
  };

  const dividerColor = color || colors.border;
  const verticalSpacing = getSpacing();
  const horizontalInset = getInset();

  if (label) {
    return (
      <View style={[styles.container, { marginVertical: verticalSpacing }, style]}>
        <View
          style={[
            styles.line,
            {
              backgroundColor: dividerColor,
              height: thickness,
            },
          ]}
        />
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
        <View
          style={[
            styles.line,
            {
              backgroundColor: dividerColor,
              height: thickness,
            },
          ]}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: dividerColor,
          height: thickness,
          marginVertical: verticalSpacing,
          marginHorizontal: horizontalInset,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
  },
  label: {
    paddingHorizontal: spacing.md,
    fontSize: 12,
    fontWeight: '500',
  },
  divider: {
    width: '100%',
  },
});

export default Divider;
