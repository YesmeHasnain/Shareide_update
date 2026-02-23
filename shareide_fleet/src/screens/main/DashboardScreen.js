import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { rideAPI } from '../../api/ride';
import locationService from '../../utils/locationService';
import rideRequestService from '../../utils/rideRequestService';
import SideDrawer from '../../components/SideDrawer';
import RideRequestPopup from '../../components/RideRequestPopup';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PRIMARY = '#FCC014';
const GO_BTN_SIZE = 120;

const DashboardScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const isApproved = user?.driver?.status === 'approved';
  const driverStatus = user?.driver?.status || 'pending';

  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const [stats, setStats] = useState({ today_earnings: 0, today_rides: 0, rating: 5.0, acceptance_rate: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rideRequests, setRideRequests] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const handleRestrictedAction = (actionName) => {
    if (!isApproved) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(
        'Account Under Review',
        'Your account must be approved before you can ' + actionName + '. We typically review within 24-48 hours.',
        [{ text: 'OK' }]
      );
      return true;
    }
    return false;
  };

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const goButtonScale = useRef(new Animated.Value(1)).current;
  const goGlowAnim = useRef(new Animated.Value(0)).current;
  const bottomSlide = useRef(new Animated.Value(0)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeLocation();
    fetchData();
    Animated.parallel([
      Animated.spring(bottomSlide, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.timing(statsOpacity, { toValue: 1, duration: 600, delay: 300, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isOnline) {
      // Pulse animation for GO button glow
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(goGlowAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(goGlowAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      );
      pulse.start();

      const ringPulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.8, duration: 2000, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ])
      );
      ringPulse.start();

      locationService.startTracking((loc) => {
        setCurrentLocation(loc);
        setMapKey(k => k + 1);
      });

      rideRequestService.start({
        onNewRideRequest: (requests) => {
          if (requests.length > 0) {
            setRideRequests(requests);
            setShowPopup(true);
          }
        },
      });

      return () => {
        pulse.stop();
        ringPulse.stop();
        locationService.stopTracking();
        rideRequestService.stop();
      };
    } else {
      goGlowAnim.setValue(0);
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
          acceptance_rate: statsRes.data.acceptance_rate || 0,
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

    Animated.sequence([
      Animated.timing(goButtonScale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
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
    return 'Captain';
  };

  const handleAcceptRide = (request) => {
    setShowPopup(false);
    setRideRequests([]);
    rideRequestService.clearQueue();
    navigation.navigate('RideRequest', { rideId: request.id });
  };

  const handleDeclineRide = (request) => {
    rideRequestService.markDeclined(request.id);
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
    .driver-marker {
      width: 48px; height: 48px;
      background: #FCC014;
      border-radius: 50%;
      border: 4px solid #fff;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
      position: relative;
    }
    .driver-marker::after {
      content: ''; width: 22px; height: 22px;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23000"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>') center/contain no-repeat;
    }
    .marker-shadow {
      position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%);
      width: 32px; height: 8px;
      background: radial-gradient(ellipse, rgba(0,0,0,0.25), transparent);
      border-radius: 50%;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lng}], 16);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/${isDark ? 'dark_all' : 'voyager'}/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
    const icon = L.divIcon({
      html: '<div class="driver-marker"></div><div class="marker-shadow"></div>',
      className: '', iconSize: [48, 56], iconAnchor: [24, 28]
    });
    L.marker([${lat}, ${lng}], { icon }).addTo(map);
  </script>
</body>
</html>`;
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A14' : '#F5F5F5' }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

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

        {/* Top Bar - Floating */}
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          {/* Menu Button */}
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: isDark ? 'rgba(20,20,35,0.9)' : 'rgba(255,255,255,0.95)' }]}
            onPress={() => setDrawerOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={22} color={isDark ? '#FFF' : '#1A1A2E'} />
          </TouchableOpacity>

          {/* Status Pill */}
          <View style={[styles.statusPill, isOnline ? styles.statusOnline : styles.statusOffline]}>
            <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#9CA3AF' }]} />
            <Text style={[styles.statusText, { color: isOnline ? '#10B981' : '#9CA3AF' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>

          {/* Notifications */}
          <TouchableOpacity
            style={[styles.floatingBtn, { backgroundColor: isDark ? 'rgba(20,20,35,0.9)' : 'rgba(255,255,255,0.95)' }]}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={isDark ? '#FFF' : '#1A1A2E'} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        {/* Approval Banner */}
        {!isApproved && (
          <View style={[styles.approvalBanner, { top: insets.top + 70 }]}>
            <LinearGradient
              colors={driverStatus === 'rejected' ? ['#EF4444', '#DC2626'] : ['#F59E0B', '#D97706']}
              style={styles.approvalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name={driverStatus === 'rejected' ? 'close-circle' : 'time'} size={18} color="#FFF" />
              <Text style={styles.approvalText}>
                {driverStatus === 'rejected'
                  ? 'Application rejected. Contact support.'
                  : 'Account under review. Features unlock after approval.'}
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Center Location Button */}
        <TouchableOpacity
          style={[styles.floatingBtn, styles.centerBtn, {
            bottom: 310 + insets.bottom,
            backgroundColor: isDark ? 'rgba(20,20,35,0.9)' : 'rgba(255,255,255,0.95)',
          }]}
          onPress={initializeLocation}
          activeOpacity={0.7}
        >
          <Ionicons name="locate" size={22} color={PRIMARY} />
        </TouchableOpacity>

        {/* Pending Requests Badge */}
        {showPopup && rideRequests.length > 1 && (
          <View style={[styles.queueBadge, { top: insets.top + 70 }]}>
            <View style={styles.queueBadgeInner}>
              <Text style={styles.queueBadgeText}>{rideRequests.length}</Text>
            </View>
          </View>
        )}
      </View>

      {/* Bottom Panel - InDrive Style */}
      <Animated.View style={[
        styles.bottomPanel,
        {
          backgroundColor: isDark ? '#14142B' : '#FFFFFF',
          paddingBottom: insets.bottom + 80,
          transform: [{
            translateY: bottomSlide.interpolate({
              inputRange: [0, 1],
              outputRange: [300, 0],
            }),
          }],
        },
      ]}>
        {/* GO Button - Centered, Big */}
        <View style={styles.goButtonContainer}>
          {/* Pulse rings when online */}
          {isOnline && (
            <>
              <Animated.View style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.8],
                    outputRange: [0.4, 0],
                  }),
                  borderColor: '#10B981',
                },
              ]} />
              <Animated.View style={[
                styles.pulseRing2,
                {
                  transform: [{ scale: Animated.multiply(pulseAnim, 0.7) }],
                  opacity: pulseAnim.interpolate({
                    inputRange: [1, 1.8],
                    outputRange: [0.3, 0],
                  }),
                  borderColor: '#10B981',
                },
              ]} />
            </>
          )}

          <Animated.View style={{ transform: [{ scale: goButtonScale }], opacity: isApproved ? 1 : 0.4 }}>
            <TouchableOpacity
              onPress={() => { if (!handleRestrictedAction('go online')) toggleOnline(); }}
              activeOpacity={0.8}
              style={styles.goButtonTouchable}
            >
              <LinearGradient
                colors={isOnline ? ['#10B981', '#059669'] : [PRIMARY, '#E5A800']}
                style={styles.goButton}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.goButtonText}>{isOnline ? 'ON' : 'GO'}</Text>
                <Text style={styles.goButtonSubText}>{isOnline ? 'Tap to stop' : 'Tap to start'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Greeting */}
        <Text style={[styles.greeting, { color: isDark ? '#FFF' : '#1A1A2E' }]}>
          {isOnline ? 'You are online' : `Hey ${getUserName()}`}
        </Text>
        <Text style={[styles.greetingSub, { color: isDark ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }]}>
          {isOnline ? 'Waiting for ride requests...' : 'Go online to start earning'}
        </Text>

        {/* Stats Row */}
        <Animated.View style={[styles.statsRow, { opacity: statsOpacity }]}>
          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E1E3A' : '#F9FAFB' }]}>
            <View style={[styles.statIconBg, { backgroundColor: '#FCC01420' }]}>
              <Ionicons name="cash-outline" size={18} color={PRIMARY} />
            </View>
            <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#1A1A2E' }]}>
              Rs. {stats.today_earnings.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF' }]}>Today</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E1E3A' : '#F9FAFB' }]}>
            <View style={[styles.statIconBg, { backgroundColor: '#3B82F620' }]}>
              <Ionicons name="car-outline" size={18} color="#3B82F6" />
            </View>
            <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#1A1A2E' }]}>
              {stats.today_rides}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF' }]}>Rides</Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: isDark ? '#1E1E3A' : '#F9FAFB' }]}>
            <View style={[styles.statIconBg, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="star-outline" size={18} color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: isDark ? '#FFF' : '#1A1A2E' }]}>
              {stats.rating.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF' }]}>Rating</Text>
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: isDark ? '#1E1E3A' : '#F9FAFB' }, !isApproved && { opacity: 0.4 }]}
            onPress={() => {
              if (handleRestrictedAction('view ride requests')) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('RideRequests');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="people" size={20} color={PRIMARY} />
            <Text style={[styles.quickActionText, { color: isDark ? '#FFF' : '#1A1A2E' }]}>Requests</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: isDark ? '#1E1E3A' : '#F9FAFB' }, !isApproved && { opacity: 0.4 }]}
            onPress={() => {
              if (handleRestrictedAction('post rides')) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('PostRide', {
                latitude: currentLocation?.latitude,
                longitude: currentLocation?.longitude,
              });
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle" size={20} color="#10B981" />
            <Text style={[styles.quickActionText, { color: isDark ? '#FFF' : '#1A1A2E' }]}>Post Ride</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: isDark ? '#1E1E3A' : '#F9FAFB' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Earnings');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="bar-chart" size={20} color="#8B5CF6" />
            <Text style={[styles.quickActionText, { color: isDark ? '#FFF' : '#1A1A2E' }]}>Earnings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionBtn, { backgroundColor: isDark ? '#1E1E3A' : '#F9FAFB' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('HeatMap');
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="flame" size={20} color="#EF4444" />
            <Text style={[styles.quickActionText, { color: isDark ? '#FFF' : '#1A1A2E' }]}>Hotspots</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Ride Request Popup */}
      <RideRequestPopup
        requests={rideRequests}
        visible={showPopup}
        onAccept={handleAcceptRide}
        onDecline={handleDeclineRide}
      />

      {/* Side Drawer */}
      <SideDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navigation={navigation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },

  // Top Bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  floatingBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  statusOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  statusOffline: {
    backgroundColor: 'rgba(156, 163, 175, 0.15)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#FFF',
  },

  // Approval Banner
  approvalBanner: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
  },
  approvalGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  approvalText: {
    flex: 1,
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },

  // Center Button
  centerBtn: {
    position: 'absolute',
    right: 16,
  },

  queueBadge: {
    position: 'absolute',
    right: 16,
    zIndex: 20,
  },
  queueBadgeInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  queueBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Bottom Panel
  bottomPanel: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 20,
    marginTop: -30,
  },

  // GO Button
  goButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -GO_BTN_SIZE / 2,
    marginBottom: 12,
    height: GO_BTN_SIZE + 20,
  },
  goButtonTouchable: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 16,
  },
  goButton: {
    width: GO_BTN_SIZE,
    height: GO_BTN_SIZE,
    borderRadius: GO_BTN_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  goButtonText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  goButtonSubText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginTop: -2,
  },
  pulseRing: {
    position: 'absolute',
    width: GO_BTN_SIZE + 30,
    height: GO_BTN_SIZE + 30,
    borderRadius: (GO_BTN_SIZE + 30) / 2,
    borderWidth: 2,
  },
  pulseRing2: {
    position: 'absolute',
    width: GO_BTN_SIZE + 60,
    height: GO_BTN_SIZE + 60,
    borderRadius: (GO_BTN_SIZE + 60) / 2,
    borderWidth: 1.5,
  },

  // Greeting
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  greetingSub: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 16,
  },
  statIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    gap: 10,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default DashboardScreen;
