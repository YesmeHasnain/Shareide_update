import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

const ContactPermissionModal = ({
  visible = false,
  onAllow,
  onDeny,
  title = 'Allow access to contacts',
  description = 'We need access to your contacts to find your friends on Shareide and suggest rides with people you know.',
}) => {
  const { colors } = useTheme();

  const handleAllow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAllow?.();
  };

  const handleDeny = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDeny?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDeny}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          {/* Illustration */}
          <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}20` }]}>
            <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
              <Ionicons name="people" size={32} color="#000000" />
            </View>
          </View>

          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {description}
          </Text>

          <TouchableOpacity
            onPress={handleAllow}
            style={[styles.allowBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Text style={styles.allowText}>Allow access</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeny}
            style={styles.denyBtn}
            activeOpacity={0.7}
          >
            <Text style={[styles.denyText, { color: colors.textSecondary }]}>
              Not now
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 32,
  },
  card: {
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 28,
  },
  allowBtn: {
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  allowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  denyBtn: {
    paddingVertical: 12,
  },
  denyText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ContactPermissionModal;
