import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Keyboard,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PRIMARY = '#FCC014';
const DARK = '#1A1A2E';
const GRAY = '#6B7280';
const GREEN = '#22c55e';
const RED = '#EF4444';
const LIGHT_BG = '#F7F8FA';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const GOOGLE_API_KEY = 'AIzaSyC3D7EgF9_N8jzEYubmJr0uIGbyzGdjOqU';
const RECENT_SEARCHES_KEY = 'recent_searches';
const SAVED_PLACES_KEY = 'saved_places';

const LocationSearchScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const pickupRef = useRef(null);
  const dropoffRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const params = route?.params || {};
  const initialType = params.type || 'dropoff';
  const existingPickup = params.pickup || null;
  const existingDropoff = params.dropoff || null;

  const [activeField, setActiveField] = useState(initialType);
  const [pickupText, setPickupText] = useState(existingPickup?.name || '');
  const [dropoffText, setDropoffText] = useState(existingDropoff?.name || '');
  const [pickupLocation, setPickupLocation] = useState(existingPickup);
  const [dropoffLocation, setDropoffLocation] = useState(existingDropoff);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const searchTimeout = useRef(null);
  const sessionToken = useRef(generateSessionToken());

  function generateSessionToken() {
    return 'xxxx-xxxx-xxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
  }

  useEffect(() => {
    loadRecentSearches();
    loadSavedPlaces();
    getCurrentLocation();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      if (initialType === 'pickup') {
        pickupRef.current?.focus();
      } else {
        dropoffRef.current?.focus();
      }
    }, 300);
  }, []);

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {}
  };

  const loadSavedPlaces = async () => {
    try {
      const saved = await AsyncStorage.getItem(SAVED_PLACES_KEY);
      if (saved) setSavedPlaces(JSON.parse(saved));
    } catch (e) {}
  };

  const saveRecentSearch = async (location) => {
    try {
      const updated = [location, ...recentSearches.filter(s =>
        s.name !== location.name || s.address !== location.address
      )].slice(0, 10);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (e) {}
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setCurrentLocation(coords);

      try {
        const [address] = await Location.reverseGeocodeAsync(coords);
        if (address) {
          const name = address.street
            ? `${address.street}${address.streetNumber ? ' ' + address.streetNumber : ''}`
            : address.name || 'Current Location';
          const area = [address.district, address.city].filter(Boolean).join(', ');
          setCurrentLocation({
            ...coords,
            name: name,
            address: area || 'Your current location',
          });
        }
      } catch (e) {
        setCurrentLocation({
          ...coords,
          name: 'Current Location',
          address: 'Your current location',
        });
      }
    } catch (e) {}
  };

  // Google Places Autocomplete
  const searchWithGoogle = async (text) => {
    try {
      const locationBias = currentLocation
        ? `&location=${currentLocation.latitude},${currentLocation.longitude}&radius=50000`
        : '';
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_API_KEY}&components=country:pk&language=en&sessiontoken=${sessionToken.current}${locationBias}`
      );
      const data = await response.json();
      if (data.status === 'OK' && data.predictions?.length > 0) {
        return data.predictions.map((p) => ({
          id: p.place_id,
          placeId: p.place_id,
          name: p.structured_formatting?.main_text || p.description.split(',')[0],
          address: p.structured_formatting?.secondary_text || p.description.split(',').slice(1).join(',').trim(),
          fullAddress: p.description,
          source: 'google',
        }));
      }
    } catch (e) {}
    return null;
  };

  // Nominatim fallback
  const searchWithNominatim = async (text) => {
    try {
      const locationBias = currentLocation
        ? `&viewbox=${currentLocation.longitude - 0.5},${currentLocation.latitude - 0.5},${currentLocation.longitude + 0.5},${currentLocation.latitude + 0.5}&bounded=0`
        : '&viewbox=60.0,23.0,77.0,37.0&bounded=0';
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=pk&limit=15&addressdetails=1${locationBias}`,
        { headers: { 'User-Agent': 'Shareide/1.0' } }
      );
      const data = await response.json();
      if (data?.length > 0) {
        return data.map((p, i) => ({
          id: p.place_id || i,
          name: p.name || p.display_name.split(',')[0],
          address: p.display_name.split(',').slice(1, 3).join(',').trim(),
          fullAddress: p.display_name,
          latitude: parseFloat(p.lat),
          longitude: parseFloat(p.lon),
          source: 'nominatim',
        }));
      }
    } catch (e) {}
    return [];
  };

  const searchPlaces = async (text) => {
    if (!text || text.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      // Try Google Places first (much better results)
      const googleResults = await searchWithGoogle(text);
      if (googleResults && googleResults.length > 0) {
        setSearchResults(googleResults);
      } else {
        // Fallback to Nominatim
        const nominatimResults = await searchWithNominatim(text);
        setSearchResults(nominatimResults || []);
      }
    } catch (e) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Get coordinates from Google Place Details
  const getPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry,name,formatted_address&key=${GOOGLE_API_KEY}&sessiontoken=${sessionToken.current}`
      );
      const data = await response.json();
      if (data.status === 'OK' && data.result?.geometry) {
        // Generate new session token after place details (billing optimization)
        sessionToken.current = generateSessionToken();
        return {
          latitude: data.result.geometry.location.lat,
          longitude: data.result.geometry.location.lng,
          name: data.result.name,
          address: data.result.formatted_address,
        };
      }
    } catch (e) {}
    return null;
  };

  const handleTextChange = (text) => {
    if (activeField === 'pickup') {
      setPickupText(text);
      setPickupLocation(null);
    } else {
      setDropoffText(text);
      setDropoffLocation(null);
    }

    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchPlaces(text), 300);
  };

  const navigateWithLocations = (pickup, dropoff) => {
    navigation.navigate('RideOptions', { pickup, dropoff });
  };

  const selectLocation = async (location) => {
    Keyboard.dismiss();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    let finalLocation = { ...location };

    // If Google result (no coordinates yet), fetch from Place Details
    if (location.source === 'google' && location.placeId && !location.latitude) {
      setSelecting(true);
      const details = await getPlaceDetails(location.placeId);
      setSelecting(false);
      if (details) {
        finalLocation = {
          ...finalLocation,
          latitude: details.latitude,
          longitude: details.longitude,
          name: finalLocation.name || details.name,
          address: details.address || finalLocation.address,
        };
      } else {
        // Failed to get coordinates - skip
        return;
      }
    }

    saveRecentSearch(finalLocation);

    if (activeField === 'pickup') {
      setPickupLocation(finalLocation);
      setPickupText(finalLocation.name);
      setSearchResults([]);

      if (dropoffLocation) {
        navigateWithLocations(finalLocation, dropoffLocation);
      } else {
        setActiveField('dropoff');
        setDropoffText('');
        setTimeout(() => dropoffRef.current?.focus(), 100);
      }
    } else {
      setDropoffLocation(finalLocation);
      setDropoffText(finalLocation.name);
      setSearchResults([]);

      const finalPickup = pickupLocation || (currentLocation ? {
        ...currentLocation,
        name: currentLocation.name || 'Current Location',
        address: currentLocation.address || 'Your current location',
      } : null);

      if (finalPickup) {
        navigateWithLocations(finalPickup, finalLocation);
      }
    }
  };

  const useCurrentLocation = () => {
    if (!currentLocation) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const loc = {
      ...currentLocation,
      name: currentLocation.name || 'Current Location',
      address: currentLocation.address || 'Your current location',
    };

    setPickupLocation(loc);
    setPickupText(loc.name);
    setSearchResults([]);

    if (activeField === 'pickup' && dropoffLocation) {
      navigateWithLocations(loc, dropoffLocation);
    } else {
      setActiveField('dropoff');
      setDropoffText('');
      setTimeout(() => dropoffRef.current?.focus(), 100);
    }
  };

  const switchFields = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const tempLoc = pickupLocation;
    const tempText = pickupText;
    setPickupLocation(dropoffLocation);
    setPickupText(dropoffText);
    setDropoffLocation(tempLoc);
    setDropoffText(tempText);
  };

  const focusField = (field) => {
    Haptics.selectionAsync();
    setActiveField(field);
    setSearchResults([]);
    if (field === 'pickup') {
      pickupRef.current?.focus();
    } else {
      dropoffRef.current?.focus();
    }
  };

  const clearField = (field) => {
    if (field === 'pickup') {
      setPickupText('');
      setPickupLocation(null);
      setActiveField('pickup');
      setTimeout(() => pickupRef.current?.focus(), 50);
    } else {
      setDropoffText('');
      setDropoffLocation(null);
      setActiveField('dropoff');
      setTimeout(() => dropoffRef.current?.focus(), 50);
    }
    setSearchResults([]);
  };

  const activeText = activeField === 'pickup' ? pickupText : dropoffText;
  const showCurrentLoc = activeField === 'pickup' && currentLocation && pickupText.length === 0;
  const showSaved = activeText.length === 0 && searchResults.length === 0;
  const showRecent = activeText.length === 0 && searchResults.length === 0 && recentSearches.length > 0;

  const renderSavedPlaces = () => {
    const defaultPlaces = [
      { id: 'home', icon: 'home', label: 'Home', color: '#3B82F6', bg: '#EFF6FF' },
      { id: 'work', icon: 'briefcase', label: 'Work', color: '#8B5CF6', bg: '#F5F3FF' },
    ];

    return (
      <View style={styles.savedSection}>
        <Text style={styles.sectionLabel}>SAVED PLACES</Text>
        {defaultPlaces.map((place) => {
          const saved = savedPlaces.find(s => s.type === place.id);
          return (
            <TouchableOpacity
              key={place.id}
              style={styles.savedRow}
              onPress={() => {
                if (saved) {
                  selectLocation(saved);
                } else {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.savedIcon, { backgroundColor: place.bg }]}>
                <Ionicons name={place.icon} size={18} color={place.color} />
              </View>
              <View style={styles.savedInfo}>
                <Text style={styles.savedLabel}>{place.label}</Text>
                <Text style={styles.savedAddr} numberOfLines={1}>
                  {saved?.address || `Set your ${place.label.toLowerCase()} address`}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header with Two Fields */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={DARK} />
        </TouchableOpacity>

        <View style={styles.fieldsContainer}>
          {/* Timeline Dots */}
          <View style={styles.timelineDots}>
            <View style={[styles.dot, { backgroundColor: GREEN }]} />
            <View style={styles.dotLine}>
              <View style={styles.dotLineSegment} />
              <View style={styles.dotLineSegment} />
              <View style={styles.dotLineSegment} />
            </View>
            <View style={[styles.dot, { backgroundColor: RED }]} />
          </View>

          {/* Fields */}
          <View style={styles.fieldsWrap}>
            <TouchableOpacity
              style={[
                styles.inputField,
                activeField === 'pickup' && styles.inputFieldActive,
              ]}
              onPress={() => focusField('pickup')}
              activeOpacity={0.9}
            >
              <TextInput
                ref={pickupRef}
                style={styles.inputText}
                value={pickupText}
                onChangeText={handleTextChange}
                onFocus={() => setActiveField('pickup')}
                placeholder="Pickup location"
                placeholderTextColor="#9CA3AF"
                returnKeyType="next"
                autoCorrect={false}
              />
              {pickupText.length > 0 && (
                <TouchableOpacity
                  onPress={() => clearField('pickup')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.inputField,
                activeField === 'dropoff' && styles.inputFieldActive,
              ]}
              onPress={() => focusField('dropoff')}
              activeOpacity={0.9}
            >
              <TextInput
                ref={dropoffRef}
                style={styles.inputText}
                value={dropoffText}
                onChangeText={handleTextChange}
                onFocus={() => setActiveField('dropoff')}
                placeholder="Where to?"
                placeholderTextColor="#9CA3AF"
                returnKeyType="search"
                autoCorrect={false}
              />
              {dropoffText.length > 0 && (
                <TouchableOpacity
                  onPress={() => clearField('dropoff')}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="close-circle" size={18} color="#D1D5DB" />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          </View>

          {/* Swap Button */}
          <TouchableOpacity
            style={styles.swapBtn}
            onPress={switchFields}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-vertical" size={20} color={GRAY} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Content */}
      <FlatList
        data={searchResults.length > 0 ? searchResults : (showRecent ? recentSearches : [])}
        keyExtractor={(item, i) => item.id?.toString() || i.toString()}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {showCurrentLoc && (
              <TouchableOpacity
                style={styles.currentLocRow}
                onPress={useCurrentLocation}
                activeOpacity={0.7}
              >
                <View style={styles.currentLocIcon}>
                  <Ionicons name="locate" size={20} color={PRIMARY} />
                </View>
                <View style={styles.currentLocInfo}>
                  <Text style={styles.currentLocTitle}>Current Location</Text>
                  <Text style={styles.currentLocAddr} numberOfLines={1}>
                    {currentLocation?.address || 'Using GPS'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {showSaved && renderSavedPlaces()}

            {showRecent && (
              <Text style={styles.sectionLabel}>RECENT</Text>
            )}
            {searchResults.length > 0 && (
              <Text style={styles.sectionLabel}>RESULTS</Text>
            )}
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.placeRow}
            onPress={() => selectLocation(item)}
            activeOpacity={0.6}
          >
            <View style={[
              styles.placeIcon,
              searchResults.length > 0 && { backgroundColor: RED + '10' },
            ]}>
              <Ionicons
                name={searchResults.length > 0 ? 'location' : 'time-outline'}
                size={18}
                color={searchResults.length > 0 ? RED : GRAY}
              />
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.placeAddr} numberOfLines={1}>{item.address}</Text>
            </View>
            <Ionicons name="arrow-forward" size={16} color="#D1D5DB" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          activeText.length > 2 && !searching ? (
            <View style={styles.emptyBox}>
              <Ionicons name="search-outline" size={40} color="#D1D5DB" />
              <Text style={styles.emptyText}>No results found</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          ) : null
        }
      />

      {/* Loading Indicators */}
      {searching && (
        <View style={styles.searchingBar}>
          <ActivityIndicator size="small" color={PRIMARY} />
          <Text style={styles.searchingText}>Searching...</Text>
        </View>
      )}
      {selecting && (
        <View style={styles.selectingOverlay}>
          <View style={styles.selectingBox}>
            <ActivityIndicator size="small" color={PRIMARY} />
            <Text style={styles.selectingText}>Getting location...</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: LIGHT_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Timeline Dots
  timelineDots: {
    width: 24,
    alignItems: 'center',
    paddingVertical: 4,
    marginRight: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotLine: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  dotLineSegment: {
    width: 2,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 1,
  },

  // Fields
  fieldsWrap: {
    flex: 1,
    gap: 8,
  },
  inputField: {
    height: 46,
    backgroundColor: LIGHT_BG,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  inputFieldActive: {
    borderColor: PRIMARY,
    backgroundColor: '#FFFEF5',
  },
  inputText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: DARK,
  },

  // Swap Button
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: LIGHT_BG,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

  // Divider
  divider: {
    height: 6,
    backgroundColor: LIGHT_BG,
  },

  // Current Location
  currentLocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  currentLocIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currentLocInfo: {
    flex: 1,
    marginLeft: 12,
  },
  currentLocTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: DARK,
  },
  currentLocAddr: {
    fontSize: 12,
    fontWeight: '400',
    color: GRAY,
    marginTop: 1,
  },

  // Saved Places
  savedSection: {
    paddingTop: 8,
  },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  savedIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  savedLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: DARK,
  },
  savedAddr: {
    fontSize: 12,
    fontWeight: '400',
    color: GRAY,
    marginTop: 1,
  },

  // Section Label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: '#9CA3AF',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },

  // List
  listContent: {
    paddingBottom: 40,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  placeIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LIGHT_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '500',
    color: DARK,
    marginBottom: 2,
  },
  placeAddr: {
    fontSize: 12,
    fontWeight: '400',
    color: GRAY,
  },

  // Empty State
  emptyBox: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: DARK,
  },
  emptySubtext: {
    fontSize: 13,
    color: GRAY,
  },

  // Searching
  searchingBar: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  searchingText: {
    fontSize: 13,
    fontWeight: '600',
    color: GRAY,
  },

  // Selecting overlay
  selectingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  selectingText: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK,
  },
});

export default LocationSearchScreen;
