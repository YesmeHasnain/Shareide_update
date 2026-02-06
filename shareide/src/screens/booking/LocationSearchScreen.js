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

const RECENT_SEARCHES_KEY = 'recent_searches';

const LocationSearchScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const isDark = theme?.isDark || false;
  const insets = useSafeAreaInsets();
  const inputRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const params = route?.params || {};
  const { type, pickup, dropoff } = params;
  const isPickup = type === 'pickup';

  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [searching, setSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);

  // Colors
  const colors = {
    background: isDark ? '#0f172a' : '#FFFFFF',
    text: isDark ? '#f8fafc' : '#111827',
    textSecondary: isDark ? '#94a3b8' : '#6B7280',
    textTertiary: isDark ? '#64748b' : '#9CA3AF',
    inputBg: isDark ? '#1e293b' : '#F3F4F6',
    border: isDark ? '#334155' : '#E5E7EB',
    primary: '#FCC014',
  };

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
      setCurrentLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
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
        { headers: { 'User-Agent': 'Shareide/1.0' } }
      );
      const data = await response.json();
      if (data?.length > 0) {
        setSearchResults(data.map((p, i) => ({
          id: p.place_id || i,
          name: p.name || p.display_name.split(',')[0],
          address: p.display_name.split(',').slice(1, 3).join(',').trim(),
          fullAddress: p.display_name,
          latitude: parseFloat(p.lat),
          longitude: parseFloat(p.lon),
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

    const pickupLoc = currentLocation ? {
      ...currentLocation,
      name: 'Current Location',
      address: 'Your current location',
    } : null;

    if (isPickup) {
      navigation.navigate('LocationSearch', { type: 'dropoff', pickup: location });
    } else {
      navigation.navigate('RideOptions', {
        pickup: pickup || pickupLoc,
        dropoff: location,
      });
    }
  };

  const useCurrentLoc = () => {
    if (!currentLocation) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const loc = { ...currentLocation, name: 'Current Location', address: 'Your current location' };

    if (isPickup) {
      navigation.navigate('LocationSearch', { type: 'dropoff', pickup: loc });
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
          style={[styles.backBtn, { borderColor: colors.border }]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={[styles.title, { color: colors.text }]}>
        {isPickup ? 'Where are you\nleaving from?' : 'Where are you\nheading?'}
      </Text>

      {/* Search Box */}
      <View style={[styles.searchBox, { backgroundColor: colors.inputBg }]}>
        <Ionicons name="location-outline" size={22} color={colors.textSecondary} />
        <TextInput
          ref={inputRef}
          style={[styles.searchInput, { color: colors.text }]}
          value={searchText}
          onChangeText={(t) => { setSearchText(t); searchPlaces(t); }}
          placeholder="Search"
          placeholderTextColor={colors.textTertiary}
          returnKeyType="search"
          autoCorrect={false}
        />
        {searching ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : searchText.length > 0 ? (
          <TouchableOpacity onPress={clearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={20} color={colors.textTertiary} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Use Current Location */}
      {isPickup && currentLocation && searchText.length === 0 && (
        <TouchableOpacity style={styles.currentLocBtn} onPress={useCurrentLoc} activeOpacity={0.7}>
          <Ionicons name="locate" size={20} color={colors.text} />
          <Text style={[styles.currentLocText, { color: colors.text }]}>Use current location</Text>
        </TouchableOpacity>
      )}

      {/* Section Label */}
      {displayList.length > 0 && searchText.length === 0 && (
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECENT</Text>
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
            style={styles.placeRow}
            onPress={() => selectLocation(item)}
            activeOpacity={0.6}
          >
            <View style={[styles.placeIcon, { backgroundColor: colors.inputBg }]}>
              <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
            </View>
            <View style={styles.placeInfo}>
              <Text style={[styles.placeName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={[styles.placeAddr, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          searchText.length > 2 && !searching ? (
            <View style={styles.emptyBox}>
              <Text style={[styles.emptyText, { color: colors.textTertiary }]}>No results found</Text>
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
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 34,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
  },
  currentLocBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  currentLocText: {
    fontSize: 15,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 40,
  },
  placeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
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
    fontWeight: '500',
    marginBottom: 2,
  },
  placeAddr: {
    fontSize: 13,
  },
  emptyBox: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    fontSize: 15,
  },
});

export default LocationSearchScreen;
