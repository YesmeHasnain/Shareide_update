import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

const FilterChips = ({
  options = [],
  selected,
  onSelect,
  style,
  showIcons = false,
}) => {
  const { colors } = useTheme();

  const defaultOptions = [
    { key: 'all', label: 'All', icon: 'people' },
    { key: 'male', label: 'Male only', icon: 'man' },
    { key: 'female', label: 'Female only', icon: 'woman' },
  ];

  const chips = options.length > 0 ? options : defaultOptions;

  const handleSelect = (key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect?.(key);
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.container, style]}
    >
      {chips.map((chip) => {
        const isActive = selected === chip.key;
        return (
          <TouchableOpacity
            key={chip.key}
            onPress={() => handleSelect(chip.key)}
            activeOpacity={0.7}
            style={[
              styles.chip,
              {
                backgroundColor: isActive
                  ? colors.filterChipActive
                  : colors.filterChipInactive,
                borderColor: isActive ? colors.filterChipActive : colors.border,
              },
            ]}
          >
            {showIcons && chip.icon && (
              <Ionicons
                name={chip.icon}
                size={14}
                color={
                  isActive
                    ? colors.filterChipActiveText
                    : colors.filterChipInactiveText
                }
                style={styles.chipIcon}
              />
            )}
            <Text
              style={[
                styles.chipText,
                {
                  color: isActive
                    ? colors.filterChipActiveText
                    : colors.filterChipInactiveText,
                },
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default FilterChips;
