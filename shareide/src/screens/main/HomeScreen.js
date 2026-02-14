import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#FCC014';
const DARK = '#1A1A2E';
const GRAY = '#6B7280';
const LIGHT_GRAY = '#F5F5F5';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Clean minimal map style
const MAP_STYLE = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ visibility: 'simplified' }, { color: '#e8f5e9' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9daf8' }] },
  { featureType: 'landscape.man_made', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#e0e0e0' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
  { featureType: 'administrative', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
];

const HomeScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const mapRef = useRef(null);
  const panelAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [currentLocation, setCurrentLocation] = useState({
    latitude: 24.8607,
    longitude: 67.0011,
  });
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null); // { distance, duration }

  const pickup = route?.params?.pickup;
  const dropoff = route?.params?.dropoff;
  const hasRoute = pickup && dropoff;

  // Pulse animation for location marker
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.8, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    getCurrentLocation();
    Animated.parallel([
      Animated.spring(panelAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  // Fetch route when pickup/dropoff change
  useEffect(() => {
    if (hasRoute) {
      fetchRoute();
    } else {
      setRouteCoords([]);
      setRouteInfo(null);
    }
  }, [pickup?.latitude, pickup?.longitude, dropoff?.latitude, dropoff?.longitude]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const newLoc = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setCurrentLocation(newLoc);
      mapRef.current?.animateToRegion({
        ...newLoc,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }, 800);
    } catch (e) {}
  };

  const fetchRoute = async () => {
    if (!pickup || !dropoff) return;
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickup.longitude},${pickup.latitude};${dropoff.longitude},${dropoff.latitude}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.routes?.[0]) {
        const r = data.routes[0];
        const coords = r.geometry.coordinates.map(c => ({
          latitude: c[1],
          longitude: c[0],
        }));
        setRouteCoords(coords);

        // Extract distance and duration
        const distKm = (r.distance / 1000).toFixed(0);
        const durMin = Math.round(r.duration / 60);
        setRouteInfo({ distance: distKm, duration: durMin });

        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 60, bottom: hasRoute ? 380 : 200, left: 60 },
          animated: true,
        });
      }
    } catch (e) {}
  };

  const mapRegion = {
    latitude: pickup?.latitude || currentLocation.latitude,
    longitude: pickup?.longitude || currentLocation.longitude,
    latitudeDelta: hasRoute ? 0.05 : 0.012,
    longitudeDelta: hasRoute ? 0.05 : 0.012,
  };

  // Decorative nearby cars
  const nearbyCars = [
    { latitude: currentLocation.latitude + 0.003, longitude: currentLocation.longitude + 0.002 },
    { latitude: currentLocation.latitude - 0.002, longitude: currentLocation.longitude + 0.004 },
    { latitude: currentLocation.latitude + 0.001, longitude: currentLocation.longitude - 0.003 },
  ];

  // Progress ratio for progress bar (visual only)
  const progressRatio = routeInfo ? 0.45 : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={mapRegion}
          customMapStyle={MAP_STYLE}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          showsTraffic={false}
          showsBuildings={false}
          showsIndoors={false}
          showsPointsOfInterest={false}
          rotateEnabled={false}
          pitchEnabled={false}
        >
          {/* Current Location Marker */}
          <Marker
            coordinate={pickup || currentLocation}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.locationMarkerWrap}>
              <Animated.View style={[
                styles.locationPulse,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({ inputRange: [1, 1.8], outputRange: [0.35, 0] }),
                },
              ]} />
              <View style={styles.locationDot} />
            </View>
          </Marker>

          {/* Dropoff Marker */}
          {hasRoute && (
            <Marker
              coordinate={dropoff}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.dropoffMarkerWrap}>
                <View style={styles.dropoffCircle} />
              </View>
            </Marker>
          )}

          {/* Route Polyline - Yellow like Figma */}
          {routeCoords.length > 0 && (
            <Polyline
              coordinates={routeCoords}
              strokeColor={PRIMARY}
              strokeWidth={5}
              lineCap="round"
              lineJoin="round"
            />
          )}

          {/* Nearby Cars (decorative, only when no route) */}
          {!hasRoute && nearbyCars.map((car, i) => (
            <Marker
              key={`car-${i}`}
              coordinate={car}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={styles.carMarker}>
                <Ionicons name="car" size={16} color={DARK} />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Notification Bell - floating top right */}
        <Animated.View style={[
          styles.notifBtnWrap,
          { top: insets.top + 12, opacity: fadeAnim },
        ]}>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Notifications');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={22} color={DARK} />
          </TouchableOpacity>
        </Animated.View>

        {/* Floating Destination Card on Map (when route exists) */}
        {hasRoute && dropoff?.name && (
          <Animated.View style={[styles.destFloat, { opacity: fadeAnim }]}>
            <View style={styles.destFloatIcon}>
              <Ionicons name="location" size={18} color={PRIMARY} />
            </View>
            <View style={styles.destFloatContent}>
              <Text style={styles.destFloatLabel}>Destination</Text>
              <Text style={styles.destFloatName} numberOfLines={1}>{dropoff.name}</Text>
            </View>
          </Animated.View>
        )}

        {/* Center / My Location Button */}
        <TouchableOpacity
          style={[styles.locateBtn, { bottom: hasRoute ? 400 : 140 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            getCurrentLocation();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={20} color={DARK} />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <Animated.View style={[
        styles.bottomSheet,
        { paddingBottom: insets.bottom + 8 },
        {
          transform: [{
            translateY: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] }),
          }],
        },
      ]}>
        <View style={styles.sheetHandle} />

        {hasRoute ? (
          /* ===== ROUTE INFO STATE ===== */
          <View style={styles.routeContent}>
            {/* Duration & Distance Header */}
            <View style={styles.routeHeader}>
              <Text style={styles.routeTitle}>
                {routeInfo ? `${routeInfo.duration} min` : '...'}{' '}
                <Text style={styles.routeTitleLight}>
                  ({routeInfo ? `${routeInfo.distance} km` : '...'})
                </Text>
              </Text>
            </View>
            <Text style={styles.routeSubtitle}>Fastest Route now due to traffic conditions</Text>

            {/* Progress Bar */}
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
                <View style={[styles.progressArrow, { left: `${Math.max(0, progressRatio * 100 - 5)}%` }]}>
                  <Ionicons name="caret-forward" size={18} color={PRIMARY} />
                </View>
              </View>
            </View>

            {/* Pickup / Dropoff Timeline */}
            <View style={styles.timeline}>
              {/* Pickup Row */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineDotWrap}>
                  <View style={[styles.timelineDot, { backgroundColor: PRIMARY }]} />
                </View>
                <TouchableOpacity
                  style={styles.timelineCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('LocationSearch', { type: 'pickup' });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timelineText} numberOfLines={1}>
                    {pickup?.name || 'Current Location'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Dotted Line */}
              <View style={styles.timelineConnector}>
                <View style={styles.dotLine}>
                  {[0,1,2].map(i => <View key={i} style={styles.dot} />)}
                </View>
              </View>

              {/* Dropoff Row */}
              <View style={styles.timelineRow}>
                <View style={styles.timelineDotWrap}>
                  <View style={[styles.timelineDot, { backgroundColor: '#D1D5DB' }]} />
                  <Ionicons name="location" size={14} color={PRIMARY} style={styles.timelinePin} />
                </View>
                <TouchableOpacity
                  style={styles.timelineCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('LocationSearch', { type: 'dropoff', pickup });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timelineText} numberOfLines={1}>
                    {dropoff?.name || 'Select destination'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          /* ===== INITIAL STATE - Minimal ===== */
          <View style={styles.initialContent} />
        )}

        {/* Find a Ride Button - Always Present */}
        <TouchableOpacity
          style={styles.findRideBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (hasRoute) {
              navigation.navigate('RideOptions', { pickup, dropoff });
            } else {
              navigation.navigate('LocationSearch', { type: 'dropoff' });
            }
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.findRideBtnText}>
            {hasRoute ? 'Find a Ride' : 'Find a Ride'}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },

  /* ===== Map Markers ===== */
  locationMarkerWrap: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PRIMARY,
  },
  locationDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: PRIMARY,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  dropoffMarkerWrap: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropoffCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#D1D5DB',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  carMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  /* ===== Notification Button ===== */
  notifBtnWrap: {
    position: 'absolute',
    right: 16,
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  /* ===== Floating Destination Card ===== */
  destFloat: {
    position: 'absolute',
    left: 16,
    top: '42%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    maxWidth: SCREEN_WIDTH * 0.55,
  },
  destFloatIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FEF9E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destFloatContent: {
    flex: 1,
  },
  destFloatLabel: {
    fontSize: 11,
    color: GRAY,
    fontWeight: '400',
  },
  destFloatName: {
    fontSize: 14,
    fontWeight: '700',
    color: DARK,
    marginTop: 1,
  },

  /* ===== Locate Button ===== */
  locateBtn: {
    position: 'absolute',
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  /* ===== Bottom Sheet ===== */
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },

  /* ===== Initial State (no route) ===== */
  initialContent: {
    height: 8,
  },

  /* ===== Route Info State ===== */
  routeContent: {
    marginBottom: 20,
  },
  routeHeader: {
    marginBottom: 4,
  },
  routeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: DARK,
  },
  routeTitleLight: {
    fontSize: 28,
    fontWeight: '800',
    color: DARK,
  },
  routeSubtitle: {
    fontSize: 13,
    color: GRAY,
    fontWeight: '400',
    marginBottom: 20,
  },

  /* ===== Progress Bar ===== */
  progressWrap: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    height: 8,
    backgroundColor: PRIMARY,
    borderRadius: 4,
  },
  progressArrow: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ===== Timeline ===== */
  timeline: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDotWrap: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelinePin: {
    position: 'absolute',
    bottom: -10,
  },
  timelineCard: {
    flex: 1,
    height: 48,
    backgroundColor: LIGHT_GRAY,
    borderRadius: 24,
    justifyContent: 'center',
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  timelineText: {
    fontSize: 14,
    fontWeight: '500',
    color: DARK,
  },
  timelineConnector: {
    paddingLeft: 12,
    height: 24,
    justifyContent: 'center',
  },
  dotLine: {
    gap: 4,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D1D5DB',
  },

  /* ===== Find a Ride Button ===== */
  findRideBtn: {
    backgroundColor: PRIMARY,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  findRideBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
  },
});

export default HomeScreen;
