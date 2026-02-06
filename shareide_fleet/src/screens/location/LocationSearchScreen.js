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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const RECENT_SEARCHES_KEY = 'driver_recent_searches';

const LocationSearchScreen = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const params = route?.params || {};
  const { onSelect, placeholder } = params;

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searching, setSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    loadRecentSearches();
    getCurrentLocation();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const loadRecentSearches = async () => {
    try {
      const saved = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {}
  };

  const saveRecentSearch = async (location) => {
    try {
      const updated = [location, ...recentSearches.filter(s => s.address !== location.address)].slice(0, 5);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (e) {}
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCurrentLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch (e) {}
  };

  const searchPlaces = async (text) => {
    if (!text || text.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=pk&limit=8&addressdetails=1`,
        { headers: { 'User-Agent': 'ShareideFleet/1.0' } }
      );
      const data = await response.json();
      if (data?.length > 0) {
        setSearchResults(data.map((p, i) => ({
          id: p.place_id || i,
          name: p.name || p.display_name.split(',')[0],
          address: p.display_name,
          shortAddress: p.display_name.split(',').slice(0, 3).join(',').trim(),
          lat: parseFloat(p.lat),
          lng: parseFloat(p.lon),
        })));
      } else {
        setSearchResults([]);
      }
    } catch (e) {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const selectLocation = (location) => {
    Keyboard.dismiss();
    saveRecentSearch(location);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (onSelect) {
      onSelect(location);
    }
    navigation.goBack();
  };

  const useCurrentLoc = async () => {
    if (!currentLocation) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Reverse geocode to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.lat}&lon=${currentLocation.lng}`,
        { headers: { 'User-Agent': 'ShareideFleet/1.0' } }
      );
      const data = await response.json();

      const loc = {
        ...currentLocation,
        name: 'Current Location',
        address: data?.display_name || 'Current Location',
        shortAddress: data?.display_name?.split(',').slice(0, 3).join(',').trim() || 'Current Location',
      };

      if (onSelect) {
        onSelect(loc);
      }
      navigation.goBack();
    } catch (e) {
      const loc = {
        ...currentLocation,
        name: 'Current Location',
        address: 'Current Location',
        shortAddress: 'Current Location',
      };
      if (onSelect) {
        onSelect(loc);
      }
      navigation.goBack();
    }
  };

  const clearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    inputRef.current?.focus();
  };

  const displayList = searchResults.length > 0 ? searchResults : recentSearches;

  return (
    <Animated.View style={[styles.container, { backgroundColor: colors.background, opacity: fadeAnim }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.card }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Select Location</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Box */}
      <View style={[styles.searchBox, { backgroundColor: colors.inputBackground || colors.card }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchText}
          onChangeText={(t) => { setSearchText(t); searchPlaces(t); }}
          placeholder={placeholder || 'Search location'}
          placeholderTextColor={colors.textTertiary}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searching ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : searchText.length > 0 ? (
          <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Use Current Location */}
      {currentLocation && searchText.length === 0 && (
        <TouchableOpacity
          style={[styles.currentLocBtn, { backgroundColor: colors.card }]}
          onPress={useCurrentLoc}
          activeOpacity={0.7}
        >
          <View style={[styles.currentLocIcon, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="locate" size={20} color={colors.primary} />
          </View>
          <View style={styles.currentLocInfo}>
            <Text style={[styles.currentLocTitle, { color: colors.text }]}>Use current location</Text>
            <Text style={[styles.currentLocSubtitle, { color: colors.textSecondary }]}>
              Get your current GPS location
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      )}

      {/* Section Label */}
      {displayList.length > 0 && searchText.length === 0 && (
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECENT SEARCHES</Text>
      )}

      {searchText.length > 0 && searchResults.length > 0 && (
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>SEARCH RESULTS</Text>
      )}

      {/* Results List */}
      <FlatList
        data={displayList}
        keyExtractor={(item, i) => item.id?.toString() || i.toString()}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.placeRow, { backgroundColor: colors.card }]}
            onPress={() => selectLocation(item)}
            activeOpacity={0.6}
          >
            <View style={[styles.placeIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="location" size={18} color={colors.primary} />
            </View>
            <View style={styles.placeInfo}>
              <Text style={[styles.placeName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.placeAddr, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.shortAddress || item.address}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          searchText.length > 2 && !searching ? (
            <View style={styles.emptyBox}>
              <Ionicons name="location-outline" size={48} color={colors.textTertiary} />
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No locations found</Text>
              <Text style={[styles.emptySubtext, { color: colors.textTertiary }]}>
                Try a different search term
              </Text>
            </View>
          ) : null
        }
      />
    </Animated.View>
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 14,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  currentLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  currentLocIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
  },
  currentLocSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  placeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  placeAddr: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default LocationSearchScreen;
