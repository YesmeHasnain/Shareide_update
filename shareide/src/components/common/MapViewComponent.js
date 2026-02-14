import React, { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

// Clean InDrive-style map theme
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

const MapViewComponent = forwardRef(({
  style,
  pickupLocation,
  dropoffLocation,
  drivers = [],
  showUserLocation = true,
  showCenterButton = false,
  onMapReady,
  onRegionChange,
  onMarkerPress,
  onPress,
  initialRegion,
  centerOnUser = false,
}, ref) => {
  const { colors } = useTheme() || { colors: { primary: '#FCC014' } };
  const nativeMapRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [userLocation, setUserLocation] = useState(initialRegion || {
    latitude: 24.8607,
    longitude: 67.0011,
  });
  const [routeCoords, setRouteCoords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pulse animation
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.6, duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (showUserLocation || centerOnUser) {
      getCurrentLocation();
    } else {
      setLoading(false);
    }
  }, []);

  // Fetch route when pickup/dropoff change
  useEffect(() => {
    const hasPickup = pickupLocation?.latitude && pickupLocation?.longitude;
    const hasDropoff = dropoffLocation?.latitude && dropoffLocation?.longitude;
    if (hasPickup && hasDropoff) {
      fetchRoute(pickupLocation, dropoffLocation);
    } else {
      setRouteCoords([]);
    }
  }, [pickupLocation?.latitude, pickupLocation?.longitude, dropoffLocation?.latitude, dropoffLocation?.longitude]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const newLoc = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setUserLocation(newLoc);
        nativeMapRef.current?.animateToRegion({
          ...newLoc,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }, 800);
      }
    } catch (e) {
      console.log('Location error:', e);
    } finally {
      setLoading(false);
      onMapReady?.();
    }
  };

  const fetchRoute = async (pickup, dropoff) => {
    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${pickup.longitude},${pickup.latitude};${dropoff.longitude},${dropoff.latitude}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      if (data.routes?.[0]) {
        const coords = data.routes[0].geometry.coordinates.map(c => ({
          latitude: c[1],
          longitude: c[0],
        }));
        setRouteCoords(coords);
        nativeMapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 60, bottom: 300, left: 60 },
          animated: true,
        });
      }
    } catch (e) {}
  };

  useImperativeHandle(ref, () => ({
    animateToRegion: (region, duration = 800) => {
      nativeMapRef.current?.animateToRegion({
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: region.latitudeDelta || 0.012,
        longitudeDelta: region.longitudeDelta || 0.012,
      }, duration);
    },
    animateToCoordinate: (coordinate, duration = 800) => {
      nativeMapRef.current?.animateToRegion({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      }, duration);
    },
    fitToCoordinates: (coords, options) => {
      nativeMapRef.current?.fitToCoordinates(coords, options);
    },
  }));

  const hasPickup = pickupLocation?.latitude && pickupLocation?.longitude;
  const hasDropoff = dropoffLocation?.latitude && dropoffLocation?.longitude;

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={nativeMapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          ...userLocation,
          latitudeDelta: 0.012,
          longitudeDelta: 0.012,
        }}
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
        onPress={onPress}
        onRegionChangeComplete={onRegionChange}
      >
        {/* User Location Marker */}
        {showUserLocation && (
          <Marker
            coordinate={userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userMarkerContainer}>
              <Animated.View style={[
                styles.userPulse,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({ inputRange: [1, 1.6], outputRange: [0.3, 0] }),
                },
              ]} />
              <View style={[styles.userDot, { backgroundColor: '#22C55E' }]} />
            </View>
          </Marker>
        )}

        {/* Pickup Marker */}
        {hasPickup && (
          <Marker
            coordinate={pickupLocation}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={[styles.pickupDot, { backgroundColor: '#22C55E' }]} />
          </Marker>
        )}

        {/* Dropoff Marker */}
        {hasDropoff && (
          <Marker
            coordinate={dropoffLocation}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.dropoffDot} />
          </Marker>
        )}

        {/* Route Polyline */}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#000000"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Driver Markers */}
        {drivers.map((driver, idx) => (
          <Marker
            key={driver.id || `driver-${idx}`}
            coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() => onMarkerPress?.('driver', driver)}
          >
            <View style={styles.carMarker}>
              <Ionicons name="car" size={18} color="#1A1A2E" />
            </View>
          </Marker>
        ))}
      </MapView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors?.primary || '#FCC014'} />
        </View>
      )}

      {showCenterButton && (
        <TouchableOpacity
          style={[styles.centerButton, { backgroundColor: colors?.card || '#fff' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            getCurrentLocation();
          }}
        >
          <Ionicons name="locate" size={20} color={colors?.primary || '#FCC014'} />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  // User location marker
  userMarkerContainer: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userPulse: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#22C55E',
  },
  userDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  pickupDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  dropoffDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#1A1A2E',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
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
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default MapViewComponent;
