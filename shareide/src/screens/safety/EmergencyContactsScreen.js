import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, Alert, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import apiClient from '../../api/client';

const defaultColors = {
  primary: '#FCC014', background: '#FFFFFF', card: '#FFFFFF',
  text: '#1A1A2E', textSecondary: '#6B7280', textTertiary: '#9CA3AF',
  border: '#E5E7EB', success: '#10B981', error: '#EF4444',
};

const EmergencyContactsScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => { fetchContacts(); }, []);

  const fetchContacts = async () => {
    try {
      const res = await apiClient.get('/emergency/contacts');
      if (res.data?.success) {
        setContacts(res.data.data || []);
      }
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  const addContact = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      Alert.alert('Error', 'Please fill in both name and phone number');
      return;
    }
    try {
      const res = await apiClient.post('/emergency/contacts', {
        name: newName.trim(),
        phone: newPhone.trim(),
      });
      if (res.data?.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowAdd(false);
        setNewName('');
        setNewPhone('');
        fetchContacts();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add contact');
    }
  };

  const deleteContact = (id) => {
    Alert.alert('Remove Contact', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/emergency/contacts/${id}`);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            fetchContacts();
          } catch (e) { /* silent */ }
        },
      },
    ]);
  };

  const renderContact = ({ item }) => (
    <View style={[styles.contactCard, { backgroundColor: colors.card }, shadows.sm]}>
      <View style={[styles.contactAvatar, { backgroundColor: colors.error + '15' }]}>
        <Ionicons name="person" size={22} color={colors.error} />
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>{item.phone}</Text>
      </View>
      <TouchableOpacity onPress={() => deleteContact(item.id)}>
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Emergency Contacts</Text>
        <TouchableOpacity onPress={() => { setShowAdd(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
          <Ionicons name="add-circle" size={28} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* SOS Info Banner */}
      <View style={[styles.sosBanner, { backgroundColor: colors.error + '10' }]}>
        <Ionicons name="warning" size={24} color={colors.error} />
        <View style={styles.sosBannerInfo}>
          <Text style={[styles.sosBannerTitle, { color: colors.error }]}>SOS Protection</Text>
          <Text style={[styles.sosBannerText, { color: colors.textSecondary }]}>
            During an emergency, pressing the SOS button will alert these contacts with your live location.
          </Text>
        </View>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={renderContact}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Ionicons name="people-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No contacts yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Add trusted contacts for emergency situations
              </Text>
            </View>
          )
        }
      />

      {/* Add Contact Modal */}
      {showAdd && (
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} onPress={() => setShowAdd(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add Emergency Contact</Text>
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Contact Name"
              placeholderTextColor={colors.textTertiary}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={[styles.modalInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              placeholder="Phone Number (e.g., 03001234567)"
              placeholderTextColor={colors.textTertiary}
              value={newPhone}
              onChangeText={setNewPhone}
              keyboardType="phone-pad"
            />
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary }]}
              onPress={addContact}
            >
              <Text style={styles.modalBtnText}>Add Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: typography.h5, fontWeight: '700' },
  sosBanner: {
    flexDirection: 'row', marginHorizontal: spacing.lg, padding: spacing.lg,
    borderRadius: borderRadius.lg, marginBottom: spacing.lg, gap: 12,
  },
  sosBannerInfo: { flex: 1 },
  sosBannerTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  sosBannerText: { fontSize: 13, lineHeight: 18 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 100 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.lg, borderRadius: borderRadius.lg, marginBottom: spacing.md,
  },
  contactAvatar: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  contactInfo: { flex: 1, marginLeft: 12 },
  contactName: { fontSize: 16, fontWeight: '600' },
  contactPhone: { fontSize: 14, marginTop: 2 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptySubtitle: { fontSize: 14, marginTop: 4, textAlign: 'center' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'flex-end' },
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 12 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  modalInput: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12 },
  modalBtn: { paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 4 },
  modalBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
});

export default EmergencyContactsScreen;
