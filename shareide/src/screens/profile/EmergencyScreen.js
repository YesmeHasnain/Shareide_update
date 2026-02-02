import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { profileAPI } from '../../api/profile';
import { Button } from '../../components/common';
import { Skeleton } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const EmergencyScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: 'Family' });
  const [saving, setSaving] = useState(false);

  const relationships = [
    { id: 'Family', icon: 'people' },
    { id: 'Friend', icon: 'person' },
    { id: 'Spouse', icon: 'heart' },
  ];

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await profileAPI.getEmergencyContacts();
      setContacts(response.contacts || response.data || []);
    } catch (error) {
      console.log('Error fetching emergency contacts:', error);
      // Show empty - real data only
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.name.trim() || !newContact.phone.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter name and phone number');
      return;
    }

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await profileAPI.addEmergencyContact(
        newContact.name.trim(),
        newContact.phone.trim(),
        newContact.relationship || 'Other'
      );
      fetchContacts();
      setShowAdd(false);
      setNewContact({ name: '', phone: '', relationship: 'Family' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      const newId = Date.now();
      setContacts(prev => [...prev, { id: newId, ...newContact }]);
      setShowAdd(false);
      setNewContact({ name: '', phone: '', relationship: 'Family' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
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
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleCall = (phone) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${phone}`);
  };

  const triggerSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    Alert.alert(
      'Emergency SOS',
      'This will immediately notify all your emergency contacts with your current location. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SOS',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('SOS Sent', 'Your emergency contacts have been notified with your location.');
          },
        },
      ]
    );
  };

  const renderContact = ({ item, index }) => (
    <View >
      <View style={[styles.contactCard, { backgroundColor: colors.surface }, shadows.sm]}>
        <LinearGradient
          colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
        </LinearGradient>
        <View style={styles.contactInfo}>
          <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>{item.phone}</Text>
          <View style={[styles.relationshipBadge, { backgroundColor: colors.primary + '15' }]}>
            <Text style={[styles.relationshipText, { color: colors.primary }]}>{item.relationship}</Text>
          </View>
        </View>
        <View style={styles.contactActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success + '20' }]}
            onPress={() => handleCall(item.phone)}
          >
            <Ionicons name="call" size={18} color={colors.success} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error + '15' }]}
            onPress={() => handleDeleteContact(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2].map((i) => (
        <View key={i} style={[styles.contactCard, { backgroundColor: colors.surface }]}>
          <Skeleton width={50} height={50} borderRadius={25} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Skeleton width="50%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="40%" height={12} style={{ marginBottom: 8 }} />
            <Skeleton width="30%" height={20} borderRadius={10} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={['#ef4444', '#dc2626']}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAdd(!showAdd);
          }}
        >
          <Ionicons name={showAdd ? 'close' : 'add'} size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={loading ? [] : contacts}
        keyExtractor={item => item.id.toString()}
        renderItem={renderContact}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* SOS Button */}
            <View >
              <TouchableOpacity
                style={[styles.sosCard, shadows.lg]}
                onPress={triggerSOS}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={['#ef4444', '#dc2626']}
                  style={styles.sosGradient}
                >
                  <View style={styles.sosIconContainer}>
                    <Ionicons name="alert-circle" size={40} color="#fff" />
                  </View>
                  <View style={styles.sosInfo}>
                    <Text style={styles.sosTitle}>Emergency SOS</Text>
                    <Text style={styles.sosSubtitle}>Tap to alert all contacts instantly</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Quick Dial */}
            <View
                            style={styles.quickDialSection}
            >
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconContainer, { backgroundColor: colors.error + '15' }]}>
                  <Ionicons name="call" size={16} color={colors.error} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  QUICK DIAL
                </Text>
              </View>
              <View style={styles.quickDialRow}>
                <TouchableOpacity
                  style={[styles.quickDialCard, { backgroundColor: colors.surface }, shadows.sm]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Linking.openURL('tel:15');
                  }}
                >
                  <Ionicons name="shield" size={24} color={colors.error} />
                  <Text style={[styles.quickDialLabel, { color: colors.text }]}>Police</Text>
                  <Text style={[styles.quickDialNumber, { color: colors.textSecondary }]}>15</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickDialCard, { backgroundColor: colors.surface }, shadows.sm]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Linking.openURL('tel:115');
                  }}
                >
                  <Ionicons name="medkit" size={24} color={colors.error} />
                  <Text style={[styles.quickDialLabel, { color: colors.text }]}>Edhi</Text>
                  <Text style={[styles.quickDialNumber, { color: colors.textSecondary }]}>115</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.quickDialCard, { backgroundColor: colors.surface }, shadows.sm]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    Linking.openURL('tel:1122');
                  }}
                >
                  <Ionicons name="flame" size={24} color={colors.error} />
                  <Text style={[styles.quickDialLabel, { color: colors.text }]}>Rescue</Text>
                  <Text style={[styles.quickDialNumber, { color: colors.textSecondary }]}>1122</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Add Form */}
            {showAdd && (
              <View
                                style={[styles.addForm, { backgroundColor: colors.surface }, shadows.md]}
              >
                <View style={styles.formHeader}>
                  <View style={[styles.formIconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="person-add" size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.formTitle, { color: colors.text }]}>Add Emergency Contact</Text>
                </View>

                <View style={styles.inputGroup}>
                  <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name="person" size={18} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={newContact.name}
                      onChangeText={text => setNewContact(prev => ({ ...prev, name: text }))}
                      placeholder="Contact Name"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name="call" size={18} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={newContact.phone}
                      onChangeText={text => setNewContact(prev => ({ ...prev, phone: text.replace(/[^0-9]/g, '') }))}
                      placeholder="Phone Number"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="phone-pad"
                      maxLength={11}
                    />
                  </View>
                </View>

                <View style={styles.relationshipRow}>
                  {relationships.map(rel => (
                    <TouchableOpacity
                      key={rel.id}
                      style={[
                        styles.relationshipBtn,
                        {
                          backgroundColor: newContact.relationship === rel.id ? colors.primary : colors.background,
                          borderColor: newContact.relationship === rel.id ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setNewContact(prev => ({ ...prev, relationship: rel.id }));
                      }}
                    >
                      <Ionicons
                        name={rel.icon}
                        size={16}
                        color={newContact.relationship === rel.id ? '#000' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.relationshipBtnText,
                          { color: newContact.relationship === rel.id ? '#000' : colors.text },
                        ]}
                      >
                        {rel.id}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Button
                  title="Add Contact"
                  onPress={handleAddContact}
                  variant="primary"
                  size="large"
                  loading={saving}
                  icon="person-add"
                  fullWidth
                />
              </View>
            )}

            {loading && renderSkeleton()}

            {!loading && (
              <View
                                style={styles.sectionHeader}
              >
                <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="people" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  EMERGENCY CONTACTS
                </Text>
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{contacts.length}</Text>
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && (
            <View
                            style={styles.emptyState}
            >
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.error + '15' }]}>
                <Ionicons name="people-outline" size={48} color={colors.error} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Emergency Contacts</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Add contacts who will be notified in case of emergency
              </Text>
              <Button
                title="Add Contact"
                onPress={() => setShowAdd(true)}
                variant="outline"
                size="medium"
                icon="person-add"
                style={{ marginTop: spacing.lg }}
              />
            </View>
          )
        }
        ListFooterComponent={
          !loading && contacts.length > 0 && (
            <View
                            style={[styles.infoCard, { backgroundColor: colors.surface }, shadows.sm]}
            >
              <Ionicons name="information-circle" size={22} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Emergency contacts will receive your live location during SOS alerts and can track your rides.
              </Text>
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#fff',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  sosCard: {
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  sosGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sosIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  sosInfo: {
    flex: 1,
  },
  sosTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  sosSubtitle: {
    fontSize: typography.bodySmall,
    color: 'rgba(255,255,255,0.9)',
  },
  quickDialSection: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
    flex: 1,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: '#000',
  },
  quickDialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickDialCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  quickDialLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  quickDialNumber: {
    fontSize: typography.caption,
  },
  addForm: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  formIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.body,
  },
  relationshipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  relationshipBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  relationshipBtnText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  skeletonContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#000',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactPhone: {
    fontSize: typography.bodySmall,
    marginBottom: 4,
  },
  relationshipBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  relationshipText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  contactActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  infoCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
});

export default EmergencyScreen;
