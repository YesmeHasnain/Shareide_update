import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { Header, Card, Button, MapViewComponent } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_HEIGHT = SCREEN_HEIGHT * 0.4;
const RECENT_SEARCHES_KEY = 'recent_searches';

const PlaceItem = ({ item, colors, onPress, index, icon }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[styles.placeItem, { backgroundColor: colors.card }, shadows.sm]}
      >
        <View style={[styles.placeIconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name={icon || 'location-outline'} size={20} color={colors.primary} />
        </View>
        <View style={styles.placeInfo}>
          <Text style={[styles.placeName, { color: colors.text }]} numberOfLines={1}>
            {item.name || item.address}
          </Text>
          {item.name && (
            <Text style={[styles.placeAddress, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.address}
            </Text>
          )}
        </View>
        <Ionicons name="arrow-forward" size={18} color={colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
};

const LocationSearchScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { type, pickup, dropoff } = route.params || {};
  const mapRef = useRef(null);
  const [searchText, setSearchText] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [mapMode, setMapMode] = useState(false);
  const [selectedMapLocation, setSelectedMapLocation] = useState(null);
  const [centerCoordinate, setCenterCoordinate] = useState(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Animate map mode transitions
  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: mapMode ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [mapMode]);

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
      const updated = [location, ...recentSearches.filter((s) => s.address !== location.address)].slice(0, 5);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.log('Error saving recent search:', error);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        alert('Please enable location permissions to use this feature.');
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
        name: 'Current Location',
      };

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      selectLocation(locationData);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      alert('Failed to get current location. Please try again.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const selectLocation = (location) => {
    saveRecentSearch(location);

    if (type === 'pickup') {
      if (dropoff) {
        navigation.navigate('RideOptions', { pickup: location, dropoff });
      } else {
        navigation.navigate('LocationSearch', { type: 'dropoff', pickup: location });
      }
    } else {
      navigation.navigate('RideOptions', { pickup: pickup || {}, dropoff: location });
    }
  };

  const handleSearch = () => {
    if (searchText.trim()) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const mockLocation = {
        latitude: 24.8607 + (Math.random() * 0.1 - 0.05),
        longitude: 67.0011 + (Math.random() * 0.1 - 0.05),
        address: searchText.trim(),
        name: searchText.trim(),
      };
      selectLocation(mockLocation);
    }
  };

  const toggleMapMode = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMapMode(!mapMode);
    if (!mapMode) {
      setSelectedMapLocation(null);
    }
  };

  const handleMapRegionChange = async (region) => {
    setCenterCoordinate({
      latitude: region.latitude,
      longitude: region.longitude,
    });
  };

  const handleMapRegionChangeComplete = async (region) => {
    setIsLoadingAddress(true);
    try {
      const [geocode] = await Location.reverseGeocodeAsync({
        latitude: region.latitude,
        longitude: region.longitude,
      });

      const address = geocode
        ? `${geocode.street || ''} ${geocode.name || ''}, ${geocode.city || ''} ${geocode.region || ''}`.trim().replace(/^,\s*/, '')
        : 'Selected Location';

      setSelectedMapLocation({
        latitude: region.latitude,
        longitude: region.longitude,
        address: address || 'Selected Location',
        name: geocode?.name || 'Selected Location',
      });
    } catch (error) {
      console.log('Error reverse geocoding:', error);
      setSelectedMapLocation({
        latitude: region.latitude,
        longitude: region.longitude,
        address: 'Selected Location',
        name: 'Selected Location',
      });
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleConfirmMapLocation = () => {
    if (selectedMapLocation) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      selectLocation(selectedMapLocation);
    }
  };

  const suggestedPlaces = [
    { id: 1, name: 'Jinnah International Airport', address: 'Airport Road, Karachi', latitude: 24.9008, longitude: 67.1681, icon: 'airplane-outline' },
    { id: 2, name: 'Clifton Beach', address: 'Sea View, Clifton, Karachi', latitude: 24.7937, longitude: 66.9753, icon: 'water-outline' },
    { id: 3, name: 'Dolmen Mall Clifton', address: 'Block 4, Clifton, Karachi', latitude: 24.8092, longitude: 67.03, icon: 'storefront-outline' },
    { id: 4, name: 'Saddar', address: 'Saddar Town, Karachi', latitude: 24.8556, longitude: 67.023, icon: 'business-outline' },
    { id: 5, name: 'Gulshan-e-Iqbal', address: 'Gulshan Town, Karachi', latitude: 24.9215, longitude: 67.0934, icon: 'home-outline' },
    { id: 6, name: 'Port Grand', address: 'Native Jetty Bridge, Karachi', latitude: 24.8513, longitude: 67.0016, icon: 'restaurant-outline' },
  ];

  const savedPlaces = [
    { id: 'home', name: 'Home', address: 'Block 5, Clifton, Karachi', latitude: 24.8132, longitude: 67.0298, icon: 'home' },
    { id: 'work', name: 'Work', address: 'I.I. Chundrigar Road, Karachi', latitude: 24.8475, longitude: 67.0283, icon: 'briefcase' },
  ];

  const mapHeight = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, MAP_HEIGHT],
  });

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header
        title={type === 'pickup' ? 'Select Pickup' : 'Select Dropoff'}
        onLeftPress={() => navigation.goBack()}
        rightIcon={mapMode ? 'list-outline' : 'map-outline'}
        onRightPress={toggleMapMode}
      />

      {/* Map Section */}
      <Animated.View style={[styles.mapContainer, { height: mapHeight }]}>
        {mapMode && (
          <>
            <MapViewComponent
              ref={mapRef}
              style={styles.map}
              showUserLocation
              showCenterButton
              onRegionChange={handleMapRegionChange}
              onRegionChangeComplete={handleMapRegionChangeComplete}
              centerOnUser
            />

            {/* Center Pin */}
            <View style={styles.centerPinContainer} pointerEvents="none">
              <View style={styles.centerPinWrapper}>
                <View style={[styles.centerPin, { backgroundColor: type === 'pickup' ? colors.success : colors.error }]}>
                  <Ionicons
                    name={type === 'pickup' ? 'radio-button-on' : 'location'}
                    size={18}
                    color="#fff"
                  />
                </View>
                <View style={[styles.centerPinTail, { borderTopColor: type === 'pickup' ? colors.success : colors.error }]} />
                <View style={[styles.centerPinShadow, { backgroundColor: 'rgba(0,0,0,0.2)' }]} />
              </View>
            </View>

            {/* Selected Location Card */}
            <View style={[styles.selectedLocationCard, { backgroundColor: colors.card }, shadows.lg]}>
              <View style={[styles.selectedLocationIcon, { backgroundColor: (type === 'pickup' ? colors.success : colors.error) + '20' }]}>
                <Ionicons
                  name={type === 'pickup' ? 'radio-button-on' : 'location'}
                  size={18}
                  color={type === 'pickup' ? colors.success : colors.error}
                />
              </View>
              <View style={styles.selectedLocationInfo}>
                {isLoadingAddress ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <Text style={[styles.selectedLocationName, { color: colors.text }]} numberOfLines={1}>
                      {selectedMapLocation?.name || 'Move map to select location'}
                    </Text>
                    <Text style={[styles.selectedLocationAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                      {selectedMapLocation?.address || 'Drag the map to pin a location'}
                    </Text>
                  </>
                )}
              </View>
            </View>
          </>
        )}
      </Animated.View>

      {/* Confirm Location Button (when in map mode) */}
      {mapMode && selectedMapLocation && (
        <View style={styles.confirmButtonContainer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirmMapLocation}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={colors.gradients?.primary || ['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.confirmButtonGradient}
            >
              <Ionicons name="checkmark-circle" size={22} color="#000" />
              <Text style={styles.confirmButtonText}>Confirm {type === 'pickup' ? 'Pickup' : 'Dropoff'} Location</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.searchContainer}>
        {/* Search Input */}
        <View>
          <View style={[styles.searchBox, { backgroundColor: colors.surface }, shadows.md]}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="Search for a place..."
              placeholderTextColor={colors.textTertiary}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              autoFocus={!mapMode}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSearchText('');
                }}
              >
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Current Location Button */}
        <View>
          <TouchableOpacity
            style={styles.currentLocationBtn}
            onPress={getCurrentLocation}
            disabled={loadingLocation}
          >
            <LinearGradient
              colors={colors.gradients?.primary || ['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.currentLocationGradient}
            >
              {loadingLocation ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <>
                  <Ionicons name="navigate" size={20} color="#000" />
                  <Text style={styles.currentLocationText}>Use Current Location</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={[]}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={null}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <>
            {/* Saved Places */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="bookmark" size={18} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Saved Places</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('SavedPlaces')}>
                  <Text style={[styles.seeAllText, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
              </View>
              {savedPlaces.map((place, index) => (
                <PlaceItem
                  key={place.id}
                  item={place}
                  colors={colors}
                  icon={place.icon}
                  index={index}
                  onPress={() =>
                    selectLocation({
                      latitude: place.latitude,
                      longitude: place.longitude,
                      address: place.address,
                      name: place.name,
                    })
                  }
                />
              ))}
            </View>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="time" size={18} color={colors.textSecondary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent</Text>
                  </View>
                  <TouchableOpacity
                    onPress={async () => {
                      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
                      setRecentSearches([]);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <Text style={[styles.seeAllText, { color: colors.error }]}>Clear</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((item, index) => (
                  <PlaceItem
                    key={`recent-${index}`}
                    item={item}
                    colors={colors}
                    icon="time-outline"
                    index={index}
                    onPress={() =>
                      selectLocation({
                        latitude: item.latitude,
                        longitude: item.longitude,
                        address: item.address,
                      })
                    }
                  />
                ))}
              </View>
            )}

            {/* Suggested Places */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleRow}>
                  <Ionicons name="compass" size={18} color={colors.info} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Suggested Places</Text>
                </View>
              </View>
              {suggestedPlaces.map((place, index) => (
                <PlaceItem
                  key={place.id}
                  item={place}
                  colors={colors}
                  icon={place.icon}
                  index={index}
                  onPress={() =>
                    selectLocation({
                      latitude: place.latitude,
                      longitude: place.longitude,
                      address: place.address,
                      name: place.name,
                    })
                  }
                />
              ))}
            </View>
          </>
        }
        ListFooterComponent={<View style={{ height: 100 }} />}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  centerPinContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 50, // Offset for the location card
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerPinWrapper: {
    alignItems: 'center',
  },
  centerPin: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    ...shadows.lg,
  },
  centerPinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -4,
  },
  centerPinShadow: {
    width: 20,
    height: 6,
    borderRadius: 10,
    marginTop: 4,
  },
  selectedLocationCard: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  selectedLocationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  selectedLocationInfo: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 40,
  },
  selectedLocationName: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  selectedLocationAddress: {
    fontSize: typography.caption,
  },
  confirmButtonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  confirmButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  confirmButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: spacing.sm,
  },
  confirmButtonText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#000',
  },
  searchContainer: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    height: 56,
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    height: '100%',
  },
  currentLocationBtn: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  currentLocationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: spacing.sm,
  },
  currentLocationText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#000',
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  placeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  placeIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  placeInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  placeName: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: typography.caption,
  },
});

export default LocationSearchScreen;
