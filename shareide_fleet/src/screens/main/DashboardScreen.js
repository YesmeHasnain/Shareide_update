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

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY = '#FCC014';

const DashboardScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const isApproved = user?.driver?.status === 'approved';
  const driverStatus = user?.driver?.status || 'pending';

  const [isOnline, setIsOnline] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapKey, setMapKey] = useState(0);
  const [stats, setStats] = useState({ today_earnings: 0, today_rides: 0, rating: 5.0 });
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const goButtonScale = useRef(new Animated.Value(1)).current;
  const bottomSlide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    initializeLocation();
    fetchData();
    Animated.spring(bottomSlide, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (isOnline) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.6, duration: 1500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
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
    .marker-wrapper { position: relative; }
    .marker {
      width: 52px; height: 52px;
      background: linear-gradient(135deg, #FCC014 0%, #FF9500 100%);
      border-radius: 50%;
      border: 4px solid #fff;
      box-shadow: 0 6px 20px rgba(252,192,20,0.5);
      display: flex; align-items: center; justify-content: center;
    }
    .marker::after {
      content: ''; width: 24px; height: 24px;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23000"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>') center/contain no-repeat;
    }
    .pulse-ring {
      position: absolute; width: 80px; height: 80px; top: -14px; left: -14px;
      border-radius: 50%;
      border: 3px solid rgba(252, 192, 20, 0.4);
      animation: pulseRing 2s ease-out infinite;
    }
    .pulse-fill {
      position: absolute; width: 80px; height: 80px; top: -14px; left: -14px;
      background: rgba(252, 192, 20, 0.15);
      border-radius: 50%;
      animation: pulseFill 2s ease-out infinite;
    }
    @keyframes pulseRing { 0% { transform: scale(0.5); opacity: 1; } 100% { transform: scale(1.8); opacity: 0; } }
    @keyframes pulseFill { 0% { transform: scale(0.5); opacity: 0.4; } 100% { transform: scale(1.5); opacity: 0; } }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    const map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${lat}, ${lng}], 16);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/${isDark ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
    const icon = L.divIcon({
      html: '<div class="marker-wrapper"><div class="pulse-fill"></div><div class="pulse-ring"></div><div class="marker"></div></div>',
      className: '', iconSize: [52, 52], iconAnchor: [26, 26]
    });
    L.marker([${lat}, ${lng}], { icon }).addTo(map);
  </script>
</body>
</html>`;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />

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

        {/* Top Header with integrated toggle */}
        <View style={[styles.topHeader, { paddingTop: insets.top + 8 }]}>
          {/* Left: Menu */}
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.card || colors.surface }]}
            onPress={() => setDrawerOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={22} color={colors.text} />
          </TouchableOpacity>

          {/* Center: Online/Offline Toggle */}
          <Animated.View style={{ transform: [{ scale: goButtonScale }], opacity: isApproved ? 1 : 0.5 }}>
            <TouchableOpacity
              onPress={() => { if (!handleRestrictedAction('go online')) toggleOnline(); }}
              activeOpacity={0.8}
              style={styles.toggleOuter}
            >
              <LinearGradient
                colors={isOnline ? ['#10B981', '#059669'] : ['#374151', '#1F2937']}
                style={styles.toggleTrack}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={[
                  styles.toggleThumb,
                  isOnline ? styles.toggleThumbOn : styles.toggleThumbOff,
                ]}>
                  {isOnline ? (
                    <Ionicons name="checkmark" size={14} color="#10B981" />
                  ) : (
                    <Ionicons name="close" size={14} color="#9CA3AF" />
                  )}
                </View>
                <Text style={[
                  styles.toggleLabel,
                  isOnline ? styles.toggleLabelOn : styles.toggleLabelOff,
                ]}>
                  {isOnline ? 'ONLINE' : 'OFFLINE'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Right: Notifications */}
          <TouchableOpacity
            style={[styles.headerBtn, { backgroundColor: colors.card || colors.surface }]}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.text} />
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
              <Ionicons name={driverStatus === 'rejected' ? 'close-circle' : 'time'} size={20} color="#FFF" />
              <Text style={styles.approvalText}>
                {driverStatus === 'rejected'
                  ? 'Your application was rejected. Please contact support.'
                  : 'Account under review. Features will unlock once approved.'}
              </Text>
            </LinearGradient>
          </View>
        )}

        {/* Center Location Button */}
        <TouchableOpacity
          style={[styles.centerBtn, { bottom: 180 + insets.bottom, backgroundColor: colors.card || colors.surface }]}
          onPress={initializeLocation}
          activeOpacity={0.7}
        >
          <Ionicons name="locate" size={22} color={PRIMARY} />
        </TouchableOpacity>

        {isOnline && (
          <Animated.View style={[
            styles.activePulse,
            {
              bottom: 170 + insets.bottom,
              transform: [{ scale: pulseAnim }],
              opacity: pulseAnim.interpolate({
                inputRange: [1, 1.6],
                outputRange: [0.3, 0],
              }),
            },
          ]} />
        )}
      </View>

      {/* Compact Bottom Panel */}
      <Animated.View style={[
        styles.bottomPanel,
        {
          backgroundColor: colors.card || colors.surface,
          paddingBottom: insets.bottom + 80,
          transform: [{
            translateY: bottomSlide.interpolate({
              inputRange: [0, 1],
              outputRange: [200, 0],
            }),
          }],
        },
      ]}>
        {/* Earnings Row */}
        <View style={styles.earningsRow}>
          <View>
            <Text style={[styles.earningsLabel, { color: colors.textTertiary }]}>Today's Earnings</Text>
            <Text style={[styles.earningsAmount, { color: colors.text }]}>Rs. {stats.today_earnings.toLocaleString()}</Text>
          </View>
          <TouchableOpacity
            style={styles.earningsDetailBtn}
            onPress={() => navigation.navigate('Earnings')}
            activeOpacity={0.7}
          >
            <Text style={styles.earningsDetailText}>Details</Text>
            <Ionicons name="chevron-forward" size={14} color={PRIMARY} />
          </TouchableOpacity>
        </View>

        {/* Compact Action Buttons Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: isDark ? colors.backgroundSecondary : '#0F0F1E' }, !isApproved && { opacity: 0.5 }]}
            onPress={() => {
              if (handleRestrictedAction('view ride requests')) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('RideRequests');
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.actionIconBg, { backgroundColor: '#FCC01420' }]}>
              <Ionicons name="people" size={18} color={PRIMARY} />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Ride Requests</Text>
              <Text style={styles.actionSub}>Find passengers</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: isDark ? colors.backgroundSecondary : '#0F0F1E' }, !isApproved && { opacity: 0.5 }]}
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
            <View style={[styles.actionIconBg, { backgroundColor: '#10B98120' }]}>
              <Ionicons name="add-circle" size={18} color="#10B981" />
            </View>
            <View style={styles.actionTextCol}>
              <Text style={styles.actionTitle}>Post Ride</Text>
              <Text style={styles.actionSub}>Share a trip</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </View>
      </Animated.View>

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

  // Top Header
  topHeader: {
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
  headerBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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

  // Toggle in header
  toggleOuter: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  toggleTrack: {
    width: 120,
    height: 40,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  toggleThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  toggleThumbOn: {
    position: 'absolute',
    right: 4,
  },
  toggleThumbOff: {
    position: 'absolute',
    left: 4,
  },
  toggleLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  toggleLabelOn: {
    color: '#FFFFFF',
    position: 'absolute',
    left: 14,
  },
  toggleLabelOff: {
    color: 'rgba(255,255,255,0.7)',
    position: 'absolute',
    right: 12,
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
    borderRadius: 16,
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

  // Center button
  centerBtn: {
    position: 'absolute',
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  activePulse: {
    position: 'absolute',
    alignSelf: 'center',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#10B981',
  },

  // Compact Bottom Panel
  bottomPanel: {
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

  // Earnings
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  earningsLabel: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  earningsAmount: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  earningsDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FCC01415',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  earningsDetailText: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },

  // Compact Action Buttons
  actionRow: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 16,
  },
  actionIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
    marginTop: 1,
  },
});

export default DashboardScreen;
