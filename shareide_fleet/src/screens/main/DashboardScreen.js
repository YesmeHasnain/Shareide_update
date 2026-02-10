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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { rideAPI } from '../../api/ride';
import locationService from '../../utils/locationService';
import rideRequestService from '../../utils/rideRequestService';
import SideDrawer from '../../components/SideDrawer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PRIMARY = '#FCC014';
const DARK = '#0F0F1E';
const DARK2 = '#1A1A2E';

const DashboardScreen = ({ navigation }) => {
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
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
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

        {/* Top Header */}
        <View style={[styles.topHeader, { paddingTop: insets.top + 8 }]}>
          {/* Left: Menu */}
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => setDrawerOpen(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="menu" size={22} color={DARK} />
          </TouchableOpacity>

          {/* Center: Greeting + Status */}
          <View style={styles.headerCenter}>
            <Text style={styles.greetingText}>Hi, {getUserName()}</Text>
            <View style={styles.headerStatusRow}>
              <View style={[styles.headerStatusDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
              <Text style={[styles.headerStatusText, { color: isOnline ? '#10B981' : '#9CA3AF' }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
          </View>

          {/* Right: Notifications */}
          <TouchableOpacity
            style={styles.headerBtn}
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={DARK} />
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
          style={[styles.centerBtn, { bottom: 310 + insets.bottom }]}
          onPress={initializeLocation}
          activeOpacity={0.7}
        >
          <Ionicons name="locate" size={22} color={PRIMARY} />
        </TouchableOpacity>

        {/* Logo + Toggle */}
        <View style={[styles.logoToggleContainer, { bottom: 250 + insets.bottom }]}>
          {/* Logo */}
          <View style={styles.logoBg}>
            <Image
              source={require('../../../assets/logodarkmode.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Active Toggle */}
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
                    <Ionicons name="checkmark" size={16} color="#10B981" />
                  ) : (
                    <Ionicons name="close" size={16} color="#9CA3AF" />
                  )}
                </View>
                <Text style={[
                  styles.toggleLabel,
                  isOnline ? styles.toggleLabelOn : styles.toggleLabelOff,
                ]}>
                  {isOnline ? 'ACTIVE' : 'OFFLINE'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {isOnline && (
            <Animated.View style={[
              styles.activePulse,
              {
                transform: [{ scale: pulseAnim }],
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.6],
                  outputRange: [0.4, 0],
                }),
              },
            ]} />
          )}
        </View>
      </View>

      {/* Bottom Panel */}
      <Animated.View style={[
        styles.bottomPanel,
        {
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
            <Text style={styles.earningsLabel}>Today's Earnings</Text>
            <Text style={styles.earningsAmount}>Rs. {stats.today_earnings.toLocaleString()}</Text>
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

        {/* Action Buttons Row */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionCard, !isApproved && { opacity: 0.5 }]}
            onPress={() => {
              if (handleRestrictedAction('view ride requests')) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('RideRequests');
            }}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={[DARK, DARK2]}
              style={styles.actionCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.actionIconBg}>
                <Ionicons name="people" size={20} color={PRIMARY} />
              </View>
              <Text style={styles.actionTitle}>Ride Requests</Text>
              <Text style={styles.actionSub}>Find passengers</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, !isApproved && { opacity: 0.5 }]}
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
            <LinearGradient
              colors={[DARK, DARK2]}
              style={styles.actionCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={[styles.actionIconBg, { backgroundColor: '#10B98120' }]}>
                <Ionicons name="add-circle" size={20} color="#10B981" />
              </View>
              <Text style={styles.actionTitle}>Post Ride</Text>
              <Text style={styles.actionSub}>Share a trip</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Wallet')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#FCC014', '#FF9500']}
              style={styles.statIconCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="wallet" size={16} color="#000" />
            </LinearGradient>
            <Text style={styles.statValue}>Rs. {stats.today_earnings}</Text>
            <Text style={styles.statLabel}>Earned</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('RideHistory')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#3B82F6', '#2563EB']}
              style={styles.statIconCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="car" size={16} color="#FFF" />
            </LinearGradient>
            <Text style={styles.statValue}>{stats.today_rides}</Text>
            <Text style={styles.statLabel}>Rides</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => navigation.navigate('Ratings')}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.statIconCircle}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="star" size={16} color="#FFF" />
            </LinearGradient>
            <Text style={styles.statValue}>{stats.rating.toFixed(1)}</Text>
            <Text style={styles.statLabel}>Rating</Text>
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
    backgroundColor: '#F8F9FA',
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
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBtn: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 17,
    fontWeight: '700',
    color: DARK,
  },
  headerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 5,
  },
  headerStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  headerStatusText: {
    fontSize: 12,
    fontWeight: '600',
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
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  // Logo + Toggle
  logoToggleContainer: {
    position: 'absolute',
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  logoBg: {
    backgroundColor: DARK,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 12,
  },
  logoImage: {
    width: 140,
    height: 40,
  },
  toggleOuter: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  toggleTrack: {
    width: 130,
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  toggleThumb: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  toggleLabelOn: {
    color: '#FFFFFF',
    position: 'absolute',
    left: 16,
  },
  toggleLabelOff: {
    color: 'rgba(255,255,255,0.7)',
    position: 'absolute',
    right: 14,
  },
  activePulse: {
    position: 'absolute',
    bottom: -8,
    width: 150,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#10B981',
  },

  // Bottom Panel
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 16,
  },

  // Earnings
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  earningsLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: DARK,
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

  // Action Cards
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  actionCardGradient: {
    padding: 16,
    borderRadius: 20,
  },
  actionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FCC01420',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
});

export default DashboardScreen;
