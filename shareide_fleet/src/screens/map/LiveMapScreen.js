import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import locationService from '../../utils/locationService';
import client from '../../api/client';

const PRIMARY_COLOR = '#FCC014';

const LiveMapScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const webViewRef = useRef(null);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    initializeMap();
    const interval = setInterval(fetchNearbyUsers, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOnline) {
      locationService.startTracking((loc) => {
        setCurrentLocation(loc);
        updateMapLocation(loc);
      });
      return () => locationService.stopTracking();
    }
  }, [isOnline]);

  const initializeMap = async () => {
    try {
      const loc = await locationService.getCurrentLocation();
      if (loc) {
        setCurrentLocation(loc);
      }
      await fetchNearbyUsers();
      await fetchDriverStatus();
    } catch (error) {
      console.log('Initialize map error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDriverStatus = async () => {
    try {
      const response = await client.get('/driver/profile');
      if (response.data.success) {
        setIsOnline(response.data.driver?.is_online || false);
      }
    } catch (error) {
      console.log('Fetch driver status error:', error.message);
    }
  };

  const fetchNearbyUsers = async () => {
    try {
      const loc = currentLocation || await locationService.getCurrentLocation();
      if (!loc) return;

      const response = await client.get('/driver/nearby-users', {
        params: {
          latitude: loc.latitude,
          longitude: loc.longitude,
          radius: 5, // 5 km radius
        },
      });

      if (response.data.success) {
        setNearbyUsers(response.data.users || []);
        setMapKey(k => k + 1);
      }
    } catch (error) {
      console.log('Fetch nearby users error:', error.message);
    }
  };

  const updateMapLocation = (loc) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        if (typeof updateDriverLocation === 'function') {
          updateDriverLocation(${loc.latitude}, ${loc.longitude}, ${loc.heading || 0});
        }
        true;
      `);
    }
  };

  const centerOnLocation = () => {
    if (currentLocation && webViewRef.current) {
      webViewRef.current.injectJavaScript(`
        map.setView([${currentLocation.latitude}, ${currentLocation.longitude}], 16);
        true;
      `);
    }
  };

  const refreshMap = async () => {
    setLoading(true);
    await fetchNearbyUsers();
    setLoading(false);
  };

  const getMapHtml = () => {
    const lat = currentLocation?.latitude || 31.5204;
    const lng = currentLocation?.longitude || 74.3587;
    const heading = currentLocation?.heading || 0;

    const usersMarkers = nearbyUsers.map((u, i) => `
      L.marker([${u.latitude}, ${u.longitude}], { icon: userIcon })
        .addTo(map)
        .bindPopup('<b>${u.name || 'Passenger'}</b><br>Looking for ride');
    `).join('\n');

    const mapStyle = isDark
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }

    .driver-marker {
      width: 50px; height: 50px;
      background: ${PRIMARY_COLOR};
      border-radius: 50%;
      border: 4px solid #fff;
      box-shadow: 0 4px 15px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .driver-marker::before {
      content: '';
      position: absolute;
      width: 70px; height: 70px;
      top: -10px; left: -10px;
      background: rgba(252, 192, 20, 0.25);
      border-radius: 50%;
      animation: pulse 2s ease-out infinite;
    }
    .driver-marker::after {
      content: ''; width: 24px; height: 24px;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>') center/contain no-repeat;
      z-index: 1;
    }

    .user-marker {
      width: 36px; height: 36px;
      background: #3B82F6;
      border-radius: 50%;
      border: 3px solid #fff;
      box-shadow: 0 3px 10px rgba(59, 130, 246, 0.4);
      display: flex; align-items: center; justify-content: center;
    }
    .user-marker::after {
      content: ''; width: 18px; height: 18px;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>') center/contain no-repeat;
    }

    @keyframes pulse {
      0% { transform: scale(0.8); opacity: 1; }
      100% { transform: scale(1.5); opacity: 0; }
    }

    .leaflet-popup-content-wrapper {
      border-radius: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
    .leaflet-popup-content {
      margin: 12px 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([${lat}, ${lng}], 15);

    L.tileLayer('${mapStyle}', { maxZoom: 19 }).addTo(map);

    // Driver icon
    const driverIcon = L.divIcon({
      html: '<div class="driver-marker"></div>',
      className: '',
      iconSize: [50, 50],
      iconAnchor: [25, 25]
    });

    // User icon
    const userIcon = L.divIcon({
      html: '<div class="user-marker"></div>',
      className: '',
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });

    // Add driver marker
    let driverMarker = L.marker([${lat}, ${lng}], { icon: driverIcon }).addTo(map);
    driverMarker.bindPopup('<b>You</b><br>Current location');

    // Add user markers
    ${usersMarkers}

    // Function to update driver location
    function updateDriverLocation(lat, lng, heading) {
      driverMarker.setLatLng([lat, lng]);
      map.panTo([lat, lng]);
    }
  </script>
</body>
</html>`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.inputBackground }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>Live Map</Text>

        <TouchableOpacity
          style={[styles.refreshBtn, { backgroundColor: colors.inputBackground }]}
          onPress={refreshMap}
        >
          <Ionicons name="refresh" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Status Bar */}
      <View style={[styles.statusBar, { backgroundColor: colors.card }]}>
        <View style={styles.statusItem}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : colors.textTertiary }]} />
          <Text style={[styles.statusText, { color: colors.text }]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Ionicons name="people" size={16} color={PRIMARY_COLOR} />
          <Text style={[styles.statusText, { color: colors.text }]}>
            {nearbyUsers.length} nearby
          </Text>
        </View>
        <View style={styles.statusDivider} />
        <View style={styles.statusItem}>
          <Ionicons name="location" size={16} color={PRIMARY_COLOR} />
          <Text style={[styles.statusText, { color: colors.text }]}>
            {currentLocation ? 'GPS Active' : 'No GPS'}
          </Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY_COLOR} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading map...</Text>
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            key={mapKey}
            source={{ html: getMapHtml() }}
            style={styles.map}
            scrollEnabled={false}
            javaScriptEnabled
            domStorageEnabled
          />
        )}

        {/* Map Controls */}
        <View style={[styles.mapControls, { bottom: insets.bottom + 100 }]}>
          <TouchableOpacity
            style={[styles.mapBtn, { backgroundColor: colors.card }]}
            onPress={centerOnLocation}
          >
            <Ionicons name="locate" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.mapBtn, { backgroundColor: colors.card }]}
            onPress={() => setMapKey(k => k + 1)}
          >
            <Ionicons name="layers" size={24} color={PRIMARY_COLOR} />
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View style={[styles.legend, { backgroundColor: colors.card, bottom: insets.bottom + 20 }]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: PRIMARY_COLOR }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>You</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Passengers</Text>
          </View>
        </View>
      </View>
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
    fontSize: 18,
    fontWeight: '700',
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  statusDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    gap: 10,
  },
  mapBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legend: {
    position: 'absolute',
    left: 16,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default LiveMapScreen;
