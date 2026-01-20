import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Alert, ActivityIndicator } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

const RECENT_SEARCHES_KEY = 'recent_searches';

const LocationSearchScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { type, pickup, dropoff } = route.params || {};
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);

  useEffect(() => {
    loadRecentSearches();
  }, []);

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Error loading recent searches:', error);
    }
  };

  const saveRecentSearch = async (location) => {
    try {
      const updated = [location, ...recentSearches.filter(s => s.address !== location.address)].slice(0, 5);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.log('Error saving recent search:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions to use this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const address = geocode
        ? `${geocode.street || ''} ${geocode.city || ''} ${geocode.region || ''}`.trim()
        : 'Current Location';

      const locationData = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        address: address || 'Current Location',
      };

      selectLocation(locationData);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location. Please try again.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const selectLocation = (location) => {
    saveRecentSearch(location);

    if (type === 'pickup') {
      if (dropoff) {
        navigation.navigate('SearchResults', { pickup: location, dropoff });
      } else {
        navigation.navigate('LocationSearch', { type: 'dropoff', pickup: location });
      }
    } else {
      navigation.navigate('SearchResults', { pickup: pickup || {}, dropoff: location });
    }
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      // Mock geocoding - in production, use Google Places API
      const mockLocation = {
        latitude: 24.8607 + (Math.random() * 0.1 - 0.05),
        longitude: 67.0011 + (Math.random() * 0.1 - 0.05),
        address: searchText.trim(),
      };
      selectLocation(mockLocation);
    }
  };

  const suggestedPlaces = [
    { id: 1, name: 'Karachi Airport', address: 'Jinnah International Airport, Karachi', latitude: 24.9008, longitude: 67.1681 },
    { id: 2, name: 'Clifton Beach', address: 'Clifton, Karachi', latitude: 24.7937, longitude: 66.9753 },
    { id: 3, name: 'Dolmen Mall', address: 'Clifton Block 4, Karachi', latitude: 24.8092, longitude: 67.0300 },
    { id: 4, name: 'Saddar', address: 'Saddar Town, Karachi', latitude: 24.8556, longitude: 67.0230 },
    { id: 5, name: 'Gulshan-e-Iqbal', address: 'Gulshan Town, Karachi', latitude: 24.9215, longitude: 67.0934 },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.placeItem, { backgroundColor: colors.surface }]}
      onPress={() => selectLocation({
        latitude: item.latitude,
        longitude: item.longitude,
        address: item.address || item.name,
      })}
    >
      <Text style={styles.placeIcon}>📍</Text>
      <View style={styles.placeInfo}>
        <Text style={[styles.placeName, { color: colors.text }]}>{item.name || item.address}</Text>
        {item.name && <Text style={[styles.placeAddress, { color: colors.textSecondary }]}>{item.address}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {type === 'pickup' ? 'Select Pickup' : 'Select Dropoff'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            value={searchText}
            onChangeText={setSearchText}
            placeholder="Search for a place..."
            placeholderTextColor={colors.textSecondary}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.currentLocationBtn, { backgroundColor: colors.primary }]}
          onPress={getCurrentLocation}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>Use Current Location</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent</Text>
          <FlatList
            data={recentSearches}
            keyExtractor={(item, index) => `recent-${index}`}
            renderItem={renderItem}
            scrollEnabled={false}
          />
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Suggested Places</Text>
        <FlatList
          data={suggestedPlaces}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      </View>
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
  searchContainer: { padding: 16 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 12,
  },
  searchIcon: { fontSize: 18, marginRight: 12 },
  searchInput: { flex: 1, fontSize: 16 },
  clearIcon: { fontSize: 18, color: '#888' },
  currentLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    height: 50,
    gap: 8,
  },
  locationIcon: { fontSize: 18 },
  locationText: { fontSize: 16, fontWeight: '600', color: '#000' },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  placeIcon: { fontSize: 24, marginRight: 12 },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  placeAddress: { fontSize: 14 },
});

export default LocationSearchScreen;
