import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

const TipCard = ({ onTipSelect, colors }) => {
  const [selectedTip, setSelectedTip] = useState(null);
  const [customTip, setCustomTip] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const tipAmounts = [20, 50, 100];

  const handleSelect = (amount) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTip(amount);
    setShowCustom(false);
    onTipSelect?.(amount);
  };

  const handleCustom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCustom(true);
    setSelectedTip(null);
  };

  const submitCustomTip = () => {
    const amount = parseFloat(customTip);
    if (amount > 0) {
      setSelectedTip(amount);
      onTipSelect?.(amount);
      setShowCustom(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors?.card || '#FFF' }]}>
      <View style={styles.headerRow}>
        <Ionicons name="heart" size={20} color={colors?.primary || '#FCC014'} />
        <Text style={[styles.title, { color: colors?.text || '#1A1A2E' }]}>
          Tip your driver
        </Text>
      </View>
      <Text style={[styles.subtitle, { color: colors?.textSecondary || '#6B7280' }]}>
        Tips go directly to the driver
      </Text>

      <View style={styles.tipsRow}>
        {tipAmounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={[
              styles.tipBtn,
              {
                backgroundColor: selectedTip === amount
                  ? (colors?.primary || '#FCC014')
                  : (colors?.background || '#F5F5F5'),
                borderColor: selectedTip === amount
                  ? (colors?.primary || '#FCC014')
                  : '#E5E7EB',
              },
            ]}
            onPress={() => handleSelect(amount)}
          >
            <Text style={[
              styles.tipAmount,
              { color: selectedTip === amount ? '#000' : (colors?.text || '#1A1A2E') },
            ]}>
              Rs. {amount}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[
            styles.tipBtn,
            {
              backgroundColor: showCustom
                ? (colors?.primary || '#FCC014')
                : (colors?.background || '#F5F5F5'),
              borderColor: showCustom ? (colors?.primary || '#FCC014') : '#E5E7EB',
            },
          ]}
          onPress={handleCustom}
        >
          <Ionicons
            name="pencil"
            size={16}
            color={showCustom ? '#000' : (colors?.textSecondary || '#6B7280')}
          />
          <Text style={[
            styles.tipAmount,
            { color: showCustom ? '#000' : (colors?.textSecondary || '#6B7280') },
          ]}>
            Custom
          </Text>
        </TouchableOpacity>
      </View>

      {showCustom && (
        <View style={styles.customRow}>
          <Text style={[styles.customPrefix, { color: colors?.text || '#1A1A2E' }]}>Rs.</Text>
          <TextInput
            style={[styles.customInput, { color: colors?.text || '#1A1A2E', borderColor: colors?.primary || '#FCC014' }]}
            value={customTip}
            onChangeText={setCustomTip}
            keyboardType="numeric"
            placeholder="Enter amount"
            placeholderTextColor={colors?.textTertiary || '#9CA3AF'}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.customSubmit, { backgroundColor: colors?.primary || '#FCC014' }]}
            onPress={submitCustomTip}
          >
            <Ionicons name="checkmark" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      )}

      {selectedTip && !showCustom && (
        <View style={[styles.selectedBanner, { backgroundColor: (colors?.success || '#10B981') + '15' }]}>
          <Ionicons name="checkmark-circle" size={16} color={colors?.success || '#10B981'} />
          <Text style={[styles.selectedText, { color: colors?.success || '#10B981' }]}>
            Rs. {selectedTip} tip selected
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { borderRadius: 16, padding: 16, marginBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 13, marginBottom: 12 },
  tipsRow: { flexDirection: 'row', gap: 8 },
  tipBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, gap: 4,
  },
  tipAmount: { fontSize: 14, fontWeight: '600' },
  customRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  customPrefix: { fontSize: 18, fontWeight: '700' },
  customInput: {
    flex: 1, fontSize: 18, fontWeight: '600', borderBottomWidth: 2,
    paddingVertical: 6, textAlign: 'center',
  },
  customSubmit: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  selectedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginTop: 10,
  },
  selectedText: { fontSize: 13, fontWeight: '600' },
});

export default TipCard;
