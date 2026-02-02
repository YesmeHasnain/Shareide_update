import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  TextInput,
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

const SavedPlacesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: '', address: '', type: 'other' });
  const [saving, setSaving] = useState(false);

  const placeTypes = [
    { id: 'home', icon: 'home', label: 'Home', color: '#3B82F6' },
    { id: 'work', icon: 'briefcase', label: 'Work', color: '#8B5CF6' },
    { id: 'other', icon: 'location', label: 'Other', color: '#F59E0B' },
  ];

  const fetchPlaces = useCallback(async () => {
    try {
      const response = await profileAPI.getSavedPlaces();
      setPlaces(response.places || response.data || []);
    } catch (error) {
      setPlaces([
        { id: 1, name: 'Home', address: 'Gulshan-e-Iqbal Block 13, Karachi', type: 'home' },
        { id: 2, name: 'Office', address: 'Clifton Block 4, Karachi', type: 'work' },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlaces();
  }, [fetchPlaces]);

  const handleAddPlace = async () => {
    if (!newPlace.name.trim() || !newPlace.address.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter both name and address');
      return;
    }

    try {
      setSaving(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await profileAPI.addSavedPlace(
        newPlace.name.trim(),
        newPlace.address.trim(),
        24.8607 + (Math.random() * 0.1 - 0.05),
        67.0011 + (Math.random() * 0.1 - 0.05),
        newPlace.type
      );
      fetchPlaces();
      setShowAdd(false);
      setNewPlace({ name: '', address: '', type: 'other' });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      const newId = Date.now();
      setPlaces(prev => [...prev, { id: newId, ...newPlace }]);
      setShowAdd(false);
      setNewPlace({ name: '', address: '', type: 'other' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlace = (id) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Delete Place', 'Are you sure you want to delete this saved place?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await profileAPI.deleteSavedPlace(id);
          } catch (error) {}
          setPlaces(prev => prev.filter(p => p.id !== id));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const getPlaceType = (type) => placeTypes.find(t => t.id === type) || placeTypes[2];

  const renderPlace = ({ item, index }) => {
    const placeType = getPlaceType(item.type);

    return (
      <View >
        <TouchableOpacity
          style={[styles.placeCard, { backgroundColor: colors.surface }, shadows.sm]}
          activeOpacity={0.8}
        >
          <View style={[styles.placeIconContainer, { backgroundColor: placeType.color + '20' }]}>
            <Ionicons name={placeType.icon} size={22} color={placeType.color} />
          </View>
          <View style={styles.placeInfo}>
            <Text style={[styles.placeName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.placeAddress, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.address}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.deleteButton, { backgroundColor: colors.error + '15' }]}
            onPress={() => handleDeletePlace(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.placeCard, { backgroundColor: colors.surface }]}>
          <Skeleton width={44} height={44} borderRadius={22} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="90%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Saved Places</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAdd(!showAdd);
          }}
        >
          <Ionicons name={showAdd ? 'close' : 'add'} size={24} color="#000" />
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={loading ? [] : places}
        keyExtractor={item => item.id.toString()}
        renderItem={renderPlace}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {showAdd && (
              <View
                                style={[styles.addForm, { backgroundColor: colors.surface }, shadows.md]}
              >
                <View style={styles.formHeader}>
                  <View style={[styles.formIconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Ionicons name="add-circle" size={20} color={colors.primary} />
                  </View>
                  <Text style={[styles.formTitle, { color: colors.text }]}>Add New Place</Text>
                </View>

                <View style={styles.typeRow}>
                  {placeTypes.map(type => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.typeButton,
                        {
                          backgroundColor: newPlace.type === type.id ? type.color : colors.background,
                          borderColor: newPlace.type === type.id ? type.color : colors.border,
                        },
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setNewPlace(prev => ({ ...prev, type: type.id }));
                      }}
                    >
                      <Ionicons
                        name={type.icon}
                        size={18}
                        color={newPlace.type === type.id ? '#fff' : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.typeLabel,
                          { color: newPlace.type === type.id ? '#fff' : colors.text },
                        ]}
                      >
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.inputGroup}>
                  <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name="bookmark" size={18} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={newPlace.name}
                      onChangeText={text => setNewPlace(prev => ({ ...prev, name: text }))}
                      placeholder="Place name (e.g., Home)"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name="location" size={18} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={newPlace.address}
                      onChangeText={text => setNewPlace(prev => ({ ...prev, address: text }))}
                      placeholder="Full address"
                      placeholderTextColor={colors.textTertiary}
                    />
                  </View>
                </View>

                <Button
                  title="Save Place"
                  onPress={handleAddPlace}
                  variant="primary"
                  size="large"
                  loading={saving}
                  icon="checkmark"
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
                  <Ionicons name="bookmark" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  YOUR SAVED PLACES
                </Text>
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>{places.length}</Text>
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
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="location-outline" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Saved Places</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Add your frequently visited places for quick booking
              </Text>
              <Button
                title="Add Your First Place"
                onPress={() => setShowAdd(true)}
                variant="outline"
                size="medium"
                icon="add-circle"
                style={{ marginTop: spacing.lg }}
              />
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
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#000',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
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
  typeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  typeLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
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
  skeletonContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  placeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: {
    flex: 1,
  },
  placeName: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeAddress: {
    fontSize: typography.bodySmall,
    lineHeight: 18,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
});

export default SavedPlacesScreen;
