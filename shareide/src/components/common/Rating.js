import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { spacing } from '../../theme/colors';

const Star = ({ filled, half, size, onPress, index, interactive, colors }) => {
  const handlePress = () => {
    if (interactive && onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(index + 1);
    }
  };

  const iconName = filled ? 'star' : half ? 'star-half' : 'star-outline';
  const iconColor = filled || half ? colors.star : colors.starEmpty;

  const star = (
    <View>
      <Ionicons name={iconName} size={size} color={iconColor} />
    </View>
  );

  if (interactive) {
    return (
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
        {star}
      </TouchableOpacity>
    );
  }

  return star;
};

const Rating = ({
  value = 0,
  maxStars = 5,
  size = 20,
  showValue = false,
  showCount = false,
  count,
  interactive = false,
  onChange,
  style,
  spacing: customSpacing = 2,
}) => {
  const { colors } = useTheme();

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < maxStars; i++) {
      const filled = i < Math.floor(value);
      const half = !filled && i < value && value - i >= 0.5;

      stars.push(
        <View key={i} style={{ marginHorizontal: customSpacing }}>
          <Star
            filled={filled}
            half={half}
            size={size}
            onPress={onChange}
            index={i}
            interactive={interactive}
            colors={colors}
          />
        </View>
      );
    }
    return stars;
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.starsContainer}>{renderStars()}</View>
      {showValue && (
        <Text style={[styles.value, { color: colors.text }]}>
          {value.toFixed(1)}
        </Text>
      )}
      {showCount && count !== undefined && (
        <Text style={[styles.count, { color: colors.textSecondary }]}>
          ({count})
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  count: {
    fontSize: 12,
    marginLeft: spacing.xs,
  },
});

export default Rating;
