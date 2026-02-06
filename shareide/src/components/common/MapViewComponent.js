import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Text,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';

const MapViewComponent = forwardRef(({
  style,
  pickupLocation,
  dropoffLocation,
  drivers = [],
  showUserLocation = true,
  showCenterButton = false,
  onMapReady,
  onRegionChange,
  onPress,
  initialRegion,
  centerOnUser = false,
}, ref) => {
  const { colors, isDark } = useTheme() || { colors: { primary: '#FCC014' }, isDark: false };
  const [userLocation, setUserLocation] = useState(initialRegion || {
    latitude: 24.8607,
    longitude: 67.0011,
  });
  const [loading, setLoading] = useState(true);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (showUserLocation || centerOnUser) {
      getCurrentLocation();
    } else {
      setLoading(false);
    }
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        });
        setMapKey(prev => prev + 1);
      }
    } catch (e) {
      console.log('Location error:', e);
    } finally {
      setLoading(false);
      onMapReady?.();
    }
  };

  useImperativeHandle(ref, () => ({
    animateToRegion: (region) => {
      setUserLocation({ latitude: region.latitude, longitude: region.longitude });
      setMapKey(prev => prev + 1);
    },
    animateToCoordinate: (coordinate) => {
      setUserLocation({ latitude: coordinate.latitude, longitude: coordinate.longitude });
      setMapKey(prev => prev + 1);
    },
    fitToCoordinates: () => {
      setMapKey(prev => prev + 1);
    },
  }));

  const getMapHtml = () => {
    const hasPickup = pickupLocation?.latitude && pickupLocation?.longitude;
    const hasDropoff = dropoffLocation?.latitude && dropoffLocation?.longitude;

    // Always use light/white map tiles
    const tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body, #map { width: 100%; height: 100%; background: ${isDark ? '#1a1a2e' : '#E5E3DF'}; }

          .user-marker .dot {
            width: 18px; height: 18px;
            background: #22C55E;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(34,197,94,0.4);
          }
          .user-marker .pulse {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%, -50%);
            width: 40px; height: 40px;
            background: rgba(34,197,94,0.2);
            border-radius: 50%;
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(1.3); opacity: 0; }
          }

          .pickup-marker .dot {
            width: 14px; height: 14px;
            background: #22C55E;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
          }

          .dropoff-marker .pin {
            width: 26px; height: 26px;
            background: #000;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
          }
          .dropoff-marker .pin-inner {
            width: 8px; height: 8px;
            background: #FCC014;
            border-radius: 50%;
            transform: rotate(45deg);
          }

          .car-marker {
            width: 40px; height: 40px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
          }
          .car-marker::before {
            content: '';
            width: 22px; height: 12px;
            background: #FCC014;
            border-radius: 4px 4px 2px 2px;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const userPos = [${userLocation.latitude}, ${userLocation.longitude}];

          const map = L.map('map', {
            zoomControl: false,
            attributionControl: false
          }).setView(userPos, 15);

          L.tileLayer('${tileUrl}', {
            maxZoom: 19
          }).addTo(map);

          // User location marker
          ${showUserLocation ? `
            const userIcon = L.divIcon({
              html: '<div class="user-marker" style="position:relative"><div class="pulse"></div><div class="dot"></div></div>',
              className: '',
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            });
            L.marker(userPos, { icon: userIcon }).addTo(map);
          ` : ''}

          // Pickup marker
          ${hasPickup ? `
            const pickupIcon = L.divIcon({
              html: '<div class="pickup-marker"><div class="dot"></div></div>',
              className: '',
              iconSize: [14, 14],
              iconAnchor: [7, 7]
            });
            L.marker([${pickupLocation.latitude}, ${pickupLocation.longitude}], { icon: pickupIcon }).addTo(map);
          ` : ''}

          // Dropoff marker
          ${hasDropoff ? `
            const dropoffIcon = L.divIcon({
              html: '<div class="dropoff-marker"><div class="pin"><div class="pin-inner"></div></div></div>',
              className: '',
              iconSize: [26, 34],
              iconAnchor: [13, 30]
            });
            L.marker([${dropoffLocation.latitude}, ${dropoffLocation.longitude}], { icon: dropoffIcon }).addTo(map);
          ` : ''}

          // Driver markers (car icons)
          ${drivers.map((driver, idx) => `
            const carIcon${idx} = L.divIcon({
              html: '<div class="car-marker"></div>',
              className: '',
              iconSize: [40, 40],
              iconAnchor: [20, 20]
            });
            L.marker([${driver.latitude}, ${driver.longitude}], { icon: carIcon${idx} }).addTo(map);
          `).join('')}

          // Draw route if both points exist
          ${hasPickup && hasDropoff ? `
            // Fetch real route from OSRM
            fetch('https://router.project-osrm.org/route/v1/driving/${pickupLocation.longitude},${pickupLocation.latitude};${dropoffLocation.longitude},${dropoffLocation.latitude}?overview=full&geometries=geojson')
              .then(res => res.json())
              .then(data => {
                if (data.routes && data.routes[0]) {
                  const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

                  // Route shadow
                  L.polyline(coords, { color: '#000', weight: 7, opacity: 0.15 }).addTo(map);

                  // Main route
                  const route = L.polyline(coords, { color: '#000', weight: 4, opacity: 1 }).addTo(map);

                  map.fitBounds(route.getBounds(), { padding: [50, 50] });
                }
              })
              .catch(() => {
                // Fallback straight line
                L.polyline([[${pickupLocation.latitude}, ${pickupLocation.longitude}], [${dropoffLocation.latitude}, ${dropoffLocation.longitude}]], {
                  color: '#000', weight: 4, opacity: 0.8, dashArray: '8, 8'
                }).addTo(map);
                map.fitBounds([[${pickupLocation.latitude}, ${pickupLocation.longitude}], [${dropoffLocation.latitude}, ${dropoffLocation.longitude}]], { padding: [50, 50] });
              });
          ` : ''}
        </script>
      </body>
      </html>
    `;
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        key={mapKey}
        style={styles.map}
        source={{ html: getMapHtml() }}
        scrollEnabled={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />

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
