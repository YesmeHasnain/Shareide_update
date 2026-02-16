import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const RidePreferences = ({ onChange, colors }) => {
  const [preferences, setPreferences] = useState({
    is_ac_required: false,
    is_pet_friendly: false,
    is_luggage: false,
    child_seat: false,
    special_requests: '',
  });
  const [showSpecial, setShowSpecial] = useState(false);

  const togglePref = (key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = { ...preferences, [key]: !preferences[key] };
    setPreferences(updated);
    onChange?.(updated);
  };

  const updateSpecial = (text) => {
    const updated = { ...preferences, special_requests: text };
    setPreferences(updated);
    onChange?.(updated);
  };

  const options = [
    { key: 'is_ac_required', icon: 'snow-outline', label: 'AC Required' },
    { key: 'is_pet_friendly', icon: 'paw-outline', label: 'Pet Friendly' },
    { key: 'is_luggage', icon: 'briefcase-outline', label: 'Extra Luggage' },
    { key: 'child_seat', icon: 'people-outline', label: 'Child Seat' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors?.card || '#FFF' }]}>
      <Text style={[styles.title, { color: colors?.text || '#1A1A2E' }]}>
        Ride Preferences
      </Text>

      <View style={styles.optionsGrid}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={[
              styles.optionCard,
              {
                backgroundColor: preferences[opt.key]
                  ? (colors?.primary || '#FCC014') + '18'
                  : (colors?.background || '#F5F5F5'),
                borderColor: preferences[opt.key]
                  ? (colors?.primary || '#FCC014')
                  : 'transparent',
              },
            ]}
            onPress={() => togglePref(opt.key)}
          >
            <Ionicons
              name={opt.icon}
              size={22}
              color={preferences[opt.key] ? (colors?.primary || '#FCC014') : (colors?.textSecondary || '#6B7280')}
            />
            <Text style={[
              styles.optionLabel,
              {
                color: preferences[opt.key]
                  ? (colors?.text || '#1A1A2E')
                  : (colors?.textSecondary || '#6B7280'),
              },
            ]}>
              {opt.label}
            </Text>
            {preferences[opt.key] && (
              <View style={[styles.checkIcon, { backgroundColor: colors?.primary || '#FCC014' }]}>
                <Ionicons name="checkmark" size={12} color="#000" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.specialBtn, { borderColor: colors?.border || '#E5E7EB' }]}
        onPress={() => { setShowSpecial(!showSpecial); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
      >
        <Ionicons name="chatbox-outline" size={18} color={colors?.textSecondary || '#6B7280'} />
        <Text style={[styles.specialLabel, { color: colors?.textSecondary || '#6B7280' }]}>
          {showSpecial ? 'Hide special requests' : 'Add special requests'}
        </Text>
        <Ionicons name={showSpecial ? 'chevron-up' : 'chevron-down'} size={16} color={colors?.textTertiary || '#9CA3AF'} />
      </TouchableOpacity>

      {showSpecial && (
        <TextInput
          style={[styles.specialInput, {
            color: colors?.text || '#1A1A2E',
            borderColor: colors?.border || '#E5E7EB',
            backgroundColor: colors?.background || '#F5F5F5',
          }]}
          value={preferences.special_requests}
          onChangeText={updateSpecial}
          placeholder="E.g., Please drive slowly, fragile items..."
          placeholderTextColor={colors?.textTertiary || '#9CA3AF'}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: 16, padding: 16, marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionCard: {
    width: '48%', flexDirection: 'row', alignItems: 'center',
    padding: 12, borderRadius: 12, borderWidth: 1.5, gap: 8,
  },
  optionLabel: { flex: 1, fontSize: 13, fontWeight: '600' },
  checkIcon: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  specialBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 12, marginTop: 12, borderTopWidth: 1,
  },
  specialLabel: { flex: 1, fontSize: 14 },
  specialInput: {
    borderWidth: 1, borderRadius: 12, padding: 12,
    fontSize: 14, minHeight: 80, marginTop: 8,
  },
});

export default RidePreferences;
