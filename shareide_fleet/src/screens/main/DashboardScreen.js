import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { rideAPI } from '../../api/ride';
import locationService from '../../utils/locationService';
import rideRequestService from '../../utils/rideRequestService';

const PRIMARY_COLOR = '#FCC014';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const [stats, setStats] = useState({ today_earnings: 0, today_rides: 0, rating: 5.0 });

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const goButtonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    initializeLocation();
    fetchData();
  }, []);

  useEffect(() => {
    if (isOnline) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.4, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      );
      pulse.start();

      locationService.startTracking((loc) => {
        setCurrentLocation(loc);
        setMapKey(k => k + 1);
      });

      rideRequestService.start({
        onNewRideRequest: (requests) => {
          if (requests.length > 0) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert(
              'New Ride Request!',
              `${requests[0].pickup_location} → ${requests[0].dropoff_location}`,
              [
                { text: 'View', onPress: () => navigation.navigate('RideRequest', { rideId: requests[0].id }) },
                { text: 'Later', style: 'cancel' },
              ]
            );
          }
        },
      });

      return () => {
        pulse.stop();
        locationService.stopTracking();
        rideRequestService.stop();
      };
    } else {
      locationService.stopTracking();
      rideRequestService.stop();
    }
  }, [isOnline]);

  const initializeLocation = async () => {
    const loc = await locationService.getCurrentLocation();
    if (loc) {
      setCurrentLocation(loc);
      setMapKey(k => k + 1);
    }
  };

  const fetchData = async () => {
    try {
      const [statsRes, profileRes] = await Promise.all([
        rideAPI.getDriverStats().catch(() => ({ success: false })),
        rideAPI.getDriverProfile().catch(() => ({ success: false })),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats({
          today_earnings: statsRes.data.today_earnings || 0,
          today_rides: statsRes.data.today_rides || 0,
          rating: statsRes.data.rating || 5.0,
        });
        setIsOnline(statsRes.data.is_online || false);
      }
      if (profileRes.success && profileRes.driver) {
        setIsOnline(profileRes.driver.is_online || false);
      }
    } catch (error) {
      console.log('Fetch error:', error.message);
    }
  };

  const toggleOnline = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Press animation
    Animated.sequence([
      Animated.timing(goButtonScale, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(goButtonScale, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();

    try {
      let loc = currentLocation;
      if (!isOnline && !loc) {
        loc = await locationService.getCurrentLocation();
        if (loc) {
          setCurrentLocation(loc);
          setMapKey(k => k + 1);
        }
      }

      const response = await locationService.updateDriverStatus(!isOnline, loc?.latitude, loc?.longitude);
      if (response.success) {
        setIsOnline(!isOnline);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update status');
    }
  };

  const getUserName = () => {
    if (user?.name) return user.name.split(' ')[0];
    if (user?.first_name) return user.first_name;
    return 'Driver';
  };

  const getMapHtml = () => {
    const lat = currentLocation?.latitude || 31.5204;
    const lng = currentLocation?.longitude || 74.3587;

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
    .marker {
      width: 48px; height: 48px;
      background: ${PRIMARY_COLOR};
      border-radius: 50%;
      border: 4px solid #fff;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    }
    .marker::after {
      content: ''; width: 22px; height: 22px;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23000"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>') center/contain no-repeat;
    }
    .pulse {
      position: absolute; width: 70px; height: 70px; top: -11px; left: -11px;
      background: rgba(252, 192, 20, 0.3); border-radius: 50%;
      animation: pulse 2s ease-out infinite;
    }
    @keyframes pulse { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.5); opacity: 0; } }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lng}], 16);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
    const icon = L.divIcon({ html: '<div class="pulse"></div><div class="marker"></div>', className: '', iconSize: [48, 48], iconAnchor: [24, 24] });
    L.marker([${lat}, ${lng}], { icon }).addTo(map);
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

        {/* Status Bar Accent */}
        <View style={[
          styles.statusAccent,
          { top: insets.top, backgroundColor: isOnline ? '#10B981' : '#EF4444' },
        ]} />

        {/* Top Bar */}
        <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="menu" size={26} color="#1A1A2E" />
          </TouchableOpacity>

          <View style={styles.logoBox}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logoIcon}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={26} color="#1A1A2E" />
          </TouchableOpacity>
        </View>

        {/* Center Location Button */}
        <TouchableOpacity
          style={[styles.centerBtn, { bottom: 290 + insets.bottom }]}
          onPress={initializeLocation}
        >
          <Ionicons name="locate" size={24} color={PRIMARY_COLOR} />
        </TouchableOpacity>

        {/* GO Button - Centered above bottom panel */}
        <View style={[styles.goButtonContainer, { bottom: 248 + insets.bottom }]}>
          {isOnline && (
            <Animated.View style={[
              styles.goButtonPulse,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.4],
                  outputRange: [0.4, 0],
                }),
              },
            ]} />
          )}
          <Animated.View style={{ transform: [{ scale: goButtonScale }] }}>
            <TouchableOpacity
              style={[
                styles.goButton,
                { backgroundColor: isOnline ? '#10B981' : '#1A1A2E' },
              ]}
              onPress={toggleOnline}
              activeOpacity={0.8}
            >
              <Text style={styles.goButtonText}>
                {isOnline ? 'ON' : 'GO'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Bottom Panel */}
      <View style={[styles.bottomPanel, { paddingBottom: insets.bottom + 80 }]}>
        {/* Earnings Header */}
        <View style={styles.earningsRow}>
          <View>
            <Text style={styles.earningsLabel}>Today's Earnings</Text>
            <Text style={styles.earningsAmount}>Rs. {stats.today_earnings}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isOnline ? '#10B98120' : '#EF444420' },
          ]}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isOnline ? '#10B981' : '#EF4444' },
            ]} />
            <Text style={[
              styles.statusText,
              { color: isOnline ? '#10B981' : '#EF4444' },
            ]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>

        {/* Ride Requests Button */}
        <TouchableOpacity
          style={styles.rideRequestsBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('RideRequests');
          }}
          activeOpacity={0.8}
        >
          <View style={styles.rideRequestsIcon}>
            <Ionicons name="people" size={22} color="#FFF" />
          </View>
          <View style={styles.rideRequestsContent}>
            <Text style={styles.rideRequestsTitle}>Ride Requests</Text>
            <Text style={styles.rideRequestsSub}>See passengers looking for rides</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        {/* Post Shared Ride Button */}
        <TouchableOpacity
          style={styles.postRideBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('PostRide', {
              latitude: currentLocation?.latitude,
              longitude: currentLocation?.longitude
            });
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle" size={24} color={PRIMARY_COLOR} />
          <Text style={styles.postRideBtnText}>Post Shared Ride</Text>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        {/* Quick Stats - Dark Cards */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Earnings')}
          >
            <View style={[styles.statIconBg, { backgroundColor: '#FCC01420' }]}>
              <Ionicons name="wallet" size={18} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.statValue}>Rs. {stats.today_earnings}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('RideHistory')}
          >
            <View style={[styles.statIconBg, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="car" size={18} color="#3B82F6" />
            </View>
            <Text style={styles.statValue}>{stats.today_rides}</Text>
            <Text style={styles.statLabel}>Rides</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Ratings')}
          >
            <View style={[styles.statIconBg, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="star" size={18} color="#10B981" />
            </View>
            <Text style={styles.statValue}>{stats.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </TouchableOpacity>
        </View>
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
  statusAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    zIndex: 10,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoIcon: {
    width: 44,
    height: 44,
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
  goButtonContainer: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  goButtonPulse: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B981',
  },
  goButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  goButtonText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 12,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 2,
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A2E',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rideRequestsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    height: 64,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  rideRequestsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rideRequestsContent: {
    flex: 1,
  },
  rideRequestsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rideRequestsSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  postRideBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    height: 54,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  postRideBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginLeft: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
});

export default DashboardScreen;
