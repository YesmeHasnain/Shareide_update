import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { shadows } from '../../theme/colors';

const SeatSelectorModal = ({
  visible = false,
  onClose,
  onConfirm,
  initialSeats = 1,
  maxSeats = 4,
  minSeats = 1,
}) => {
  const { colors } = useTheme();
  const [seats, setSeats] = useState(initialSeats);

  const increment = () => {
    if (seats < maxSeats) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSeats((s) => s + 1);
    }
  };

  const decrement = () => {
    if (seats > minSeats) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setSeats((s) => s - 1);
    }
  };

  const handleConfirm = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onConfirm?.(seats);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.overlayTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface },
            shadows.xl,
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.border }]} />
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>
            How many seats?
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select the number of seats you need
          </Text>

          {/* Counter */}
          <View style={styles.counterContainer}>
            <TouchableOpacity
              onPress={decrement}
              disabled={seats <= minSeats}
              style={[
                styles.counterBtn,
                {
                  backgroundColor:
                    seats <= minSeats
                      ? colors.borderLight
                      : colors.inputBackground,
                },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="remove"
                size={24}
                color={seats <= minSeats ? colors.textTertiary : colors.text}
              />
            </TouchableOpacity>

            <View style={styles.counterValue}>
              <Text style={[styles.counterNumber, { color: colors.text }]}>
                {seats}
              </Text>
              <Text style={[styles.counterLabel, { color: colors.textSecondary }]}>
                {seats === 1 ? 'seat' : 'seats'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={increment}
              disabled={seats >= maxSeats}
              style={[
                styles.counterBtn,
                {
                  backgroundColor:
                    seats >= maxSeats
                      ? colors.borderLight
                      : colors.inputBackground,
                },
              ]}
              activeOpacity={0.7}
            >
              <Ionicons
                name="add"
                size={24}
                color={seats >= maxSeats ? colors.textTertiary : colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            onPress={handleConfirm}
            style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmText}>
              Confirm {seats} {seats === 1 ? 'seat' : 'seats'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayTouch: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 32,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 32,
  },
  counterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterValue: {
    alignItems: 'center',
    minWidth: 60,
  },
  counterNumber: {
    fontSize: 48,
    fontWeight: '800',
  },
  counterLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: -4,
  },
  confirmBtn: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
});

export default SeatSelectorModal;
