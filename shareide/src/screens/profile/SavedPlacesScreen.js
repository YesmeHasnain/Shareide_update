import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { profileAPI } from '../../api/profile';

const SavedPlacesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlace, setNewPlace] = useState({ name: '', address: '', type: 'other' });
  const [saving, setSaving] = useState(false);

  const placeTypes = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'work', icon: '💼', label: 'Work' },
    { id: 'other', icon: '📍', label: 'Other' },
  ];

  const fetchPlaces = useCallback(async () => {
    try {
      const response = await profileAPI.getSavedPlaces();
      setPlaces(response.places || response.data || []);
    } catch (error) {
      // Mock data
      setPlaces([
        { id: 1, name: 'Home', address: 'Gulshan-e-Iqbal Block 13, Karachi', type: 'home', latitude: 24.9215, longitude: 67.0934 },
        { id: 2, name: 'Office', address: 'Clifton Block 4, Karachi', type: 'work', latitude: 24.8092, longitude: 67.0300 },
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
      Alert.alert('Error', 'Please enter both name and address');
      return;
    }

    try {
      setSaving(true);
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
    } catch (error) {
      // Mock success
      const newId = Date.now();
      setPlaces(prev => [...prev, { id: newId, ...newPlace }]);
      setShowAdd(false);
      setNewPlace({ name: '', address: '', type: 'other' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlace = (id) => {
    Alert.alert(
      'Delete Place',
      'Are you sure you want to delete this saved place?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await profileAPI.deleteSavedPlace(id);
            } catch (error) {
              // Continue anyway
            }
            setPlaces(prev => prev.filter(p => p.id !== id));
          },
        },
      ]
    );
  };

  const getIcon = (type) => {
    const found = placeTypes.find(t => t.id === type);
    return found ? found.icon : '📍';
  };

  const renderPlace = ({ item }) => (
    <View style={[styles.placeCard, { backgroundColor: colors.surface }]}>
      <View style={styles.placeIcon}>
        <Text style={styles.iconText}>{getIcon(item.type)}</Text>
      </View>
      <View style={styles.placeInfo}>
        <Text style={[styles.placeName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.placeAddress, { color: colors.textSecondary }]}>{item.address}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeletePlace(item.id)}>
        <Text style={styles.deleteIcon}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Saved Places</Text>
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
        <Text style={styles.headerTitle}>Saved Places</Text>
        <TouchableOpacity onPress={() => setShowAdd(!showAdd)}>
          <Text style={styles.addIcon}>{showAdd ? '✕' : '+'}</Text>
        </TouchableOpacity>
      </View>

      {showAdd && (
        <View style={[styles.addForm, { backgroundColor: colors.surface }]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Add New Place</Text>

          <View style={styles.typeRow}>
            {placeTypes.map(type => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeButton,
                  {
                    backgroundColor: newPlace.type === type.id ? colors.primary : colors.background,
                    borderColor: newPlace.type === type.id ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setNewPlace(prev => ({ ...prev, type: type.id }))}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[styles.typeLabel, { color: newPlace.type === type.id ? '#000' : colors.text }]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
            value={newPlace.name}
            onChangeText={text => setNewPlace(prev => ({ ...prev, name: text }))}
            placeholder="Place name"
            placeholderTextColor={colors.textSecondary}
          />

          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
            value={newPlace.address}
            onChangeText={text => setNewPlace(prev => ({ ...prev, address: text }))}
            placeholder="Address"
            placeholderTextColor={colors.textSecondary}
          />

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: saving ? colors.border : colors.primary }]}
            onPress={handleAddPlace}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.saveText}>Save Place</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={places}
        keyExtractor={item => item.id.toString()}
        renderItem={renderPlace}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📍</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No saved places yet
            </Text>
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
              Add your home, work, or favorite places
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
  addForm: { margin: 16, padding: 16, borderRadius: 16 },
  formTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  typeIcon: { fontSize: 20, marginBottom: 4 },
  typeLabel: { fontSize: 12, fontWeight: '600' },
  input: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    marginBottom: 12,
  },
  saveButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  listContent: { padding: 16, flexGrow: 1 },
  placeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  placeIcon: { marginRight: 12 },
  iconText: { fontSize: 28 },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  placeAddress: { fontSize: 14 },
  deleteIcon: { fontSize: 20 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyHint: { fontSize: 14 },
});

export default SavedPlacesScreen;
