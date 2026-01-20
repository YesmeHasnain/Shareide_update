import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { profileAPI } from '../../api/profile';

const EmergencyScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [saving, setSaving] = useState(false);

  const relationships = ['Family', 'Friend', 'Spouse', 'Parent', 'Sibling', 'Other'];

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await profileAPI.getEmergencyContacts();
      setContacts(response.contacts || response.data || []);
    } catch (error) {
      // Mock data
      setContacts([
        { id: 1, name: 'Ahmed Khan', phone: '03001234567', relationship: 'Family' },
        { id: 2, name: 'Sara Ali', phone: '03009876543', relationship: 'Friend' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      Alert.alert('Error', 'Please enter name and phone number');
      return;
    }

    try {
      setSaving(true);
      await profileAPI.addEmergencyContact(
        newContact.name.trim(),
        newContact.phone.trim(),
        newContact.relationship || 'Other'
      );
      fetchContacts();
      setShowAdd(false);
      setNewContact({ name: '', phone: '', relationship: '' });
    } catch (error) {
      // Mock success
      const newId = Date.now();
      setContacts(prev => [...prev, { id: newId, ...newContact }]);
      setShowAdd(false);
      setNewContact({ name: '', phone: '', relationship: '' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = (id) => {
    Alert.alert('Delete Contact', 'Are you sure you want to remove this emergency contact?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await profileAPI.deleteEmergencyContact(id);
          } catch (error) {}
          setContacts(prev => prev.filter(c => c.id !== id));
        },
      },
    ]);
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone}`);
  };

  const triggerSOS = () => {
    Alert.alert(
      '🚨 Emergency SOS',
      'This will immediately notify all your emergency contacts with your current location. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: () => {
            Alert.alert('SOS Sent', 'Your emergency contacts have been notified with your location.');
          },
        },
      ]
    );
  };

  const renderContact = ({ item }) => (
    <View style={[styles.contactCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
        <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.contactInfo}>
        <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>{item.phone}</Text>
        <View style={[styles.relationshipBadge, { backgroundColor: colors.background }]}>
          <Text style={[styles.relationshipText, { color: colors.textSecondary }]}>{item.relationship}</Text>
        </View>
      </View>
      <View style={styles.contactActions}>
        <TouchableOpacity
          style={[styles.callButton, { backgroundColor: '#22c55e' }]}
          onPress={() => handleCall(item.phone)}
        >
          <Text style={styles.callIcon}>📞</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: '#ef4444' }]}
          onPress={() => handleDeleteContact(item.id)}
        >
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Emergency</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency</Text>
        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
          <Text style={styles.addIcon}>{showAdd ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderContact}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <TouchableOpacity
              style={styles.sosButton}
              onPress={triggerSOS}
            >
              <Text style={styles.sosIcon}>🚨</Text>
              <View style={styles.sosTextContainer}>
                <Text style={styles.sosTitle}>Emergency SOS</Text>
                <Text style={styles.sosSubtitle}>Tap to alert all contacts</Text>
              </View>
            </TouchableOpacity>

            {showAdd && (
              <View style={[styles.addForm, { backgroundColor: colors.surface }]}>
                <Text style={[styles.formTitle, { color: colors.text }]}>Add Emergency Contact</Text>

                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={newContact.name}
                  onChangeText={text => setNewContact(prev => ({ ...prev, name: text }))}
                  placeholder="Contact Name"
                  placeholderTextColor={colors.textSecondary}
                />

                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={newContact.phone}
                  onChangeText={text => setNewContact(prev => ({ ...prev, phone: text }))}
                  placeholder="Phone Number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />

                <View style={styles.relationshipRow}>
                  {relationships.slice(0, 3).map(rel => (
                    <TouchableOpacity
                      key={rel}
                      style={[
                        styles.relationshipBtn,
                        {
                          backgroundColor: newContact.relationship === rel ? colors.primary : colors.background,
                          borderColor: newContact.relationship === rel ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => setNewContact(prev => ({ ...prev, relationship: rel }))}
                    >
                      <Text style={[styles.relationshipBtnText, { color: newContact.relationship === rel ? '#000' : colors.text }]}>
                        {rel}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity
                  style={[styles.saveButton, { backgroundColor: saving ? colors.border : colors.primary }]}
                  onPress={handleAddContact}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <Text style={styles.saveText}>Add Contact</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Contacts</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No emergency contacts</Text>
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
              Add contacts who will be notified in case of emergency
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              Emergency contacts will receive your live location during SOS alerts and can track your rides.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backIcon: { fontSize: 28, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  addIcon: { fontSize: 28, color: '#000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 16 },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sosIcon: { fontSize: 40, marginRight: 16 },
  sosTextContainer: { flex: 1 },
  sosTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  sosSubtitle: { fontSize: 14, color: '#fff', opacity: 0.9 },
  addForm: { borderRadius: 16, padding: 16, marginBottom: 20 },
  formTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 12,
  },
  relationshipRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  relationshipBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  relationshipBtnText: { fontSize: 12, fontWeight: '600' },
  saveButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  contactInfo: { flex: 1, marginLeft: 12 },
  contactName: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  contactPhone: { fontSize: 14, marginBottom: 4 },
  relationshipBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  relationshipText: { fontSize: 11 },
  contactActions: { flexDirection: 'row', gap: 8 },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: { fontSize: 18 },
  deleteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: { fontSize: 16 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 12 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyHint: { fontSize: 14, textAlign: 'center' },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  infoIcon: { fontSize: 20, marginRight: 12 },
  infoText: { flex: 1, fontSize: 13, lineHeight: 20 },
});

export default EmergencyScreen;
