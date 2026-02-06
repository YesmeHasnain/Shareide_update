import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const PRIMARY_COLOR = '#FCC014';

const HomeScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [currentLocation, setCurrentLocation] = useState({
    latitude: 24.8607,
    longitude: 67.0011,
  });
  const [mapKey, setMapKey] = useState(0);

  const pickup = route?.params?.pickup;
  const dropoff = route?.params?.dropoff;
  const hasRoute = pickup && dropoff;

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setCurrentLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      setMapKey(k => k + 1);
    } catch (e) {}
  };

  const getUserName = () => {
    if (user?.name) return user.name.split(' ')[0];
    if (user?.first_name) return user.first_name;
    return 'there';
  };

  const getMapHtml = () => {
    const pLat = pickup?.latitude || currentLocation.latitude;
    const pLng = pickup?.longitude || currentLocation.longitude;
    const dLat = dropoff?.latitude;
    const dLng = dropoff?.longitude;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; }
    .pickup-dot { width: 20px; height: 20px; background: ${PRIMARY_COLOR}; border: 4px solid #fff; border-radius: 50%; box-shadow: 0 3px 10px rgba(0,0,0,0.3); }
    .dropoff-marker { width: 20px; height: 28px; position: relative; }
    .dropoff-marker::before { content: ''; position: absolute; width: 20px; height: 20px; background: ${PRIMARY_COLOR}; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); box-shadow: 0 3px 10px rgba(0,0,0,0.3); }
    .dropoff-marker::after { content: ''; position: absolute; top: 5px; left: 5px; width: 10px; height: 10px; background: #fff; border-radius: 50%; transform: rotate(-45deg); }
    .car-marker { width: 36px; height: 36px; background: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 3px 10px rgba(0,0,0,0.2); }
    .car-marker img { width: 24px; height: 24px; }
    .percent-label { background: ${PRIMARY_COLOR}; color: #000; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.2); }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const pPos = [${pLat}, ${pLng}];
    ${hasRoute ? `const dPos = [${dLat}, ${dLng}];` : ''}
    const map = L.map('map', { zoomControl: false, attributionControl: false }).setView(pPos, ${hasRoute ? 14 : 16});
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
    L.marker(pPos, { icon: L.divIcon({ html: '<div class="pickup-dot"></div>', className: '', iconSize: [20, 20], iconAnchor: [10, 10] }) }).addTo(map);
    ${hasRoute ? `
    L.marker(dPos, { icon: L.divIcon({ html: '<div class="dropoff-marker"></div>', className: '', iconSize: [20, 28], iconAnchor: [10, 26] }) }).addTo(map);
    fetch('https://router.project-osrm.org/route/v1/driving/${pLng},${pLat};${dLng},${dLat}?overview=full&geometries=geojson')
      .then(r => r.json()).then(d => {
        if (d.routes?.[0]) {
          const coords = d.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
          L.polyline(coords, { color: '${PRIMARY_COLOR}', weight: 5 }).addTo(map);
          map.fitBounds(L.latLngBounds(coords), { padding: [60, 60] });
          const midIdx = Math.floor(coords.length / 2);
          L.marker(coords[midIdx], { icon: L.divIcon({ html: '<div class="percent-label">45%</div>', className: '', iconSize: [40, 24], iconAnchor: [20, 12] }) }).addTo(map);
        }
      });
    ` : `
    [[pPos[0]+0.003, pPos[1]+0.002], [pPos[0]-0.002, pPos[1]+0.003], [pPos[0]+0.002, pPos[1]-0.003]].forEach(p => {
      L.marker(p, { icon: L.divIcon({ html: '<div class="car-marker"><span style="font-size:18px;">🚗</span></div>', className: '', iconSize: [36, 36], iconAnchor: [18, 18] }) }).addTo(map);
    });
    `}
  </script>
</body>
</html>`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Full Screen Map */}
      <View style={styles.mapContainer}>
        <WebView
          key={mapKey}
          source={{ html: getMapHtml() }}
          style={styles.map}
          scrollEnabled={false}
          javaScriptEnabled
          domStorageEnabled
        />

        {/* Notification Button */}
        <TouchableOpacity
          style={[styles.notificationBtn, { top: insets.top + 16 }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>

        {/* Destination Label (shown when route exists) */}
        {hasRoute && (
          <View style={[styles.destinationLabel, { top: insets.top + 120 }]}>
            <View style={styles.destinationDot}>
              <Ionicons name="location" size={16} color={PRIMARY_COLOR} />
            </View>
            <View>
              <Text style={styles.destinationLabelText}>Destination</Text>
              <Text style={styles.destinationName}>{dropoff?.name || 'Selected Location'}</Text>
            </View>
          </View>
        )}

        {/* Center Location Button */}
        <TouchableOpacity
          style={[styles.centerBtn, { bottom: hasRoute ? 320 + insets.bottom : 280 + insets.bottom }]}
          onPress={getCurrentLocation}
        >
          <Ionicons name="locate" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>
      </View>

      {/* Bottom Panel */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 16 }]}>
        {/* Route Info (when route exists) */}
        {hasRoute && (
          <View style={styles.routeInfo}>
            <View style={styles.routeHeader}>
              <Text style={styles.routeTime}>25 min</Text>
              <Text style={styles.routeDistance}>(15 km)</Text>
            </View>
            <Text style={styles.routeSubtext}>Fastest Route now due to traffic conditions</Text>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
              <View style={styles.progressIndicator}>
                <View style={styles.progressLabel}>
                  <Text style={styles.progressLabelText}>45%</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Location Inputs */}
        <View style={styles.locationInputs}>
          {/* Pickup */}
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('LocationSearch', { type: 'pickup' });
            }}
          >
            <View style={styles.locationDotYellow} />
            <View style={styles.locationInputBox}>
              <Text style={styles.locationText} numberOfLines={1}>
                {pickup?.name || 'Current Location'}
              </Text>
            </View>
          </TouchableOpacity>

          {/* Connector Line */}
          <View style={styles.connectorLine}>
            <View style={styles.connectorDot} />
            <View style={styles.connectorDot} />
            <View style={styles.connectorDot} />
          </View>

          {/* Dropoff */}
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('LocationSearch', { type: 'dropoff', pickup });
            }}
          >
            <View style={styles.locationDotGray} />
            <View style={styles.locationInputBox}>
              <Text style={[styles.locationText, !dropoff && styles.locationPlaceholder]} numberOfLines={1}>
                {dropoff?.name || 'Where to?'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Continue Button (when route exists) */}
        {hasRoute && (
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('RideOptions', { pickup, dropoff });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        )}

        {/* Quick Action Buttons (when no route) */}
        {!hasRoute && (
          <>
            {/* Request a Ride */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('PostRideRequest', {
                  pickup: pickup || { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
                });
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="paper-plane" size={20} color="#000" />
              <Text style={styles.primaryBtnText}>Request a Ride</Text>
            </TouchableOpacity>

            {/* Shared Rides */}
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('AvailableRides', {
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude
                });
              }}
              activeOpacity={0.8}
            >
              <View style={styles.sharedRidesIcon}>
                <Ionicons name="people" size={20} color="#000" />
              </View>
              <View style={styles.sharedRidesContent}>
                <Text style={styles.sharedRidesTitle}>Shared Rides</Text>
                <Text style={styles.sharedRidesSubtitle}>Find rides near you</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </>
        )}
      </View>
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
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  notificationBtn: {
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
  destinationLabel: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 10,
  },
  destinationDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationLabelText: {
    fontSize: 11,
    color: '#6B7280',
  },
  destinationName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  centerBtn: {
    position: 'absolute',
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  routeInfo: {
    marginBottom: 20,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  routeTime: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
  },
  routeDistance: {
    fontSize: 20,
    fontWeight: '500',
    color: '#6B7280',
  },
  routeSubtext: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    position: 'relative',
  },
  progressFill: {
    width: '45%',
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 4,
  },
  progressIndicator: {
    position: 'absolute',
    left: '45%',
    top: -20,
    transform: [{ translateX: -20 }],
  },
  progressLabel: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressLabelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  locationInputs: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  locationDotYellow: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PRIMARY_COLOR,
  },
  locationDotGray: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#E5E7EB',
  },
  locationInputBox: {
    flex: 1,
    height: 48,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  locationText: {
    fontSize: 15,
    color: '#000',
  },
  locationPlaceholder: {
    color: '#9CA3AF',
  },
  connectorLine: {
    marginLeft: 5,
    paddingVertical: 4,
    gap: 4,
  },
  connectorDot: {
    width: 2,
    height: 4,
    backgroundColor: '#E5E7EB',
    marginLeft: 5,
  },
  continueBtn: {
    backgroundColor: PRIMARY_COLOR,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  continueBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  primaryBtn: {
    flexDirection: 'row',
    backgroundColor: PRIMARY_COLOR,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  sharedRidesIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sharedRidesContent: {
    flex: 1,
  },
  sharedRidesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  sharedRidesSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});

export default HomeScreen;
