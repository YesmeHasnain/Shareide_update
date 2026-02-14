import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  Platform,
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
const LIGHT_BG = '#F7F8FA';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: 'Good Morning', icon: 'sunny', color: '#F59E0B' };
  if (hour < 17) return { text: 'Good Afternoon', icon: 'partly-sunny', color: '#F97316' };
  if (hour < 21) return { text: 'Good Evening', icon: 'moon', color: '#8B5CF6' };
  return { text: 'Good Night', icon: 'moon', color: '#6366F1' };
};

const getFirstName = (name) => {
  if (!name) return 'there';
  return name.trim().split(' ')[0];
};

const HomeScreen = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const mapRef = useRef(null);
  const panelAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  // Staggered animations for bottom sheet items
  const item1Anim = useRef(new Animated.Value(0)).current;
  const item2Anim = useRef(new Animated.Value(0)).current;
  const item3Anim = useRef(new Animated.Value(0)).current;
  const item4Anim = useRef(new Animated.Value(0)).current;
  const greeting = getGreeting();

  const [currentLocation, setCurrentLocation] = useState({
    latitude: 24.8607,
    longitude: 67.0011,
  });
  const [routeCoords, setRouteCoords] = useState([]);
  const [routeInfo, setRouteInfo] = useState(null);

  const pickup = route?.params?.pickup;
  const dropoff = route?.params?.dropoff;
  const hasRoute = pickup && dropoff;

  const getInitials = () => {
    if (!user?.name) return 'U';
    const words = user.name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

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
    // Staggered entrance animations
    Animated.parallel([
      Animated.spring(panelAnim, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      Animated.stagger(100, [
        Animated.spring(item1Anim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
        Animated.spring(item2Anim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
        Animated.spring(item3Anim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
        Animated.spring(item4Anim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
      ]).start();
    });
  }, []);

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
        const distKm = (r.distance / 1000).toFixed(0);
        const durMin = Math.round(r.duration / 60);
        setRouteInfo({ distance: distKm, duration: durMin });
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 100, right: 60, bottom: hasRoute ? 420 : 200, left: 60 },
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

  const nearbyCars = [
    { latitude: currentLocation.latitude + 0.003, longitude: currentLocation.longitude + 0.002 },
    { latitude: currentLocation.latitude - 0.002, longitude: currentLocation.longitude + 0.004 },
    { latitude: currentLocation.latitude + 0.001, longitude: currentLocation.longitude - 0.003 },
    { latitude: currentLocation.latitude - 0.004, longitude: currentLocation.longitude - 0.001 },
  ];

  const progressRatio = routeInfo ? 0.45 : 0;

  const savedPlaces = [
    { id: 'home', icon: 'home', label: 'Home', color: '#3B82F6', bg: '#EFF6FF' },
    { id: 'work', icon: 'briefcase', label: 'Work', color: '#8B5CF6', bg: '#F5F3FF' },
    { id: 'gym', icon: 'fitness', label: 'Gym', color: '#10B981', bg: '#ECFDF5' },
    { id: 'add', icon: 'add', label: 'Add New', color: '#6B7280', bg: '#F3F4F6' },
  ];

  const promoCards = [
    { id: '1', title: 'First Ride Free', subtitle: 'Use code SHAREIDE', bg: '#1A1A2E', textColor: '#FFF', accent: PRIMARY },
    { id: '2', title: 'Invite & Earn', subtitle: 'Get Rs. 100 per friend', bg: PRIMARY, textColor: '#000', accent: '#1A1A2E' },
  ];

  const staggerStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }),
    }],
  });

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
          <Marker coordinate={pickup || currentLocation} anchor={{ x: 0.5, y: 0.5 }}>
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
            <Marker coordinate={dropoff} anchor={{ x: 0.5, y: 1 }}>
              <View style={styles.dropoffMarkerWrap}>
                <View style={styles.dropoffPin}>
                  <Ionicons name="location" size={20} color="#FFF" />
                </View>
                <View style={styles.dropoffPinTail} />
              </View>
            </Marker>
          )}

          {/* Route Polyline */}
          {routeCoords.length > 0 && (
            <>
              <Polyline
                coordinates={routeCoords}
                strokeColor="rgba(0,0,0,0.08)"
                strokeWidth={8}
                lineCap="round"
                lineJoin="round"
              />
              <Polyline
                coordinates={routeCoords}
                strokeColor={PRIMARY}
                strokeWidth={5}
                lineCap="round"
                lineJoin="round"
              />
            </>
          )}

          {/* Nearby Cars */}
          {!hasRoute && nearbyCars.map((car, i) => (
            <Marker key={`car-${i}`} coordinate={car} anchor={{ x: 0.5, y: 0.5 }}>
              <View style={styles.carMarker}>
                <Ionicons name="car" size={14} color={DARK} />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Top Header */}
        <Animated.View style={[styles.headerBar, { top: insets.top + 8, opacity: fadeAnim }]}>
          {/* Left: Avatar + Greeting */}
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Profile');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.avatarCircle}>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{getInitials()}</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Center: Logo */}
          <View style={styles.headerCenter}>
            <Image
              source={require('../../../assets/black-01.png')}
              style={styles.headerLogo}
              resizeMode="contain"
            />
          </View>

          {/* Right: Notification */}
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('Notifications');
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={20} color={DARK} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </Animated.View>

        {/* Floating Route Info Badge */}
        {hasRoute && routeInfo && (
          <Animated.View style={[styles.routeBadgeFloat, { opacity: fadeAnim }]}>
            <View style={styles.routeBadgeItem}>
              <Ionicons name="time-outline" size={14} color={PRIMARY} />
              <Text style={styles.routeBadgeText}>{routeInfo.duration} min</Text>
            </View>
            <View style={styles.routeBadgeDivider} />
            <View style={styles.routeBadgeItem}>
              <Ionicons name="navigate-outline" size={14} color={PRIMARY} />
              <Text style={styles.routeBadgeText}>{routeInfo.distance} km</Text>
            </View>
          </Animated.View>
        )}

        {/* Center / My Location Button */}
        <TouchableOpacity
          style={[styles.locateBtn, { bottom: hasRoute ? 440 : 200 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            getCurrentLocation();
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="navigate" size={20} color={PRIMARY} />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <Animated.View style={[
        styles.bottomSheet,
        { paddingBottom: insets.bottom + 8 },
        {
          transform: [{
            translateY: panelAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }),
          }],
        },
      ]}>
        <View style={styles.sheetHandle} />

        {hasRoute ? (
          /* ===== ROUTE INFO STATE ===== */
          <View style={styles.routeContent}>
            {/* Route Header */}
            <View style={styles.routeHeader}>
              <View style={styles.routeHeaderLeft}>
                <Text style={styles.routeTitle}>
                  {routeInfo ? `${routeInfo.duration} min` : '...'}
                </Text>
                <Text style={styles.routeDistance}>
                  {routeInfo ? `${routeInfo.distance} km` : ''}
                </Text>
              </View>
              <View style={styles.routeHeaderBadge}>
                <Ionicons name="flash" size={12} color={PRIMARY} />
                <Text style={styles.routeHeaderBadgeText}>Fastest</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressWrap}>
              <View style={styles.progressTrack}>
                <Animated.View style={[styles.progressFill, { width: `${progressRatio * 100}%` }]} />
                <View style={[styles.progressCar, { left: `${Math.max(0, progressRatio * 100 - 3)}%` }]}>
                  <Ionicons name="car" size={14} color={DARK} />
                </View>
              </View>
            </View>

            {/* Pickup / Dropoff Timeline */}
            <View style={styles.timeline}>
              <View style={styles.timelineRow}>
                <View style={styles.timelineDotWrap}>
                  <View style={[styles.timelineDotOuter, { borderColor: '#22c55e' }]}>
                    <View style={[styles.timelineDotInner, { backgroundColor: '#22c55e' }]} />
                  </View>
                  <View style={styles.timelineLineVert} />
                </View>
                <TouchableOpacity
                  style={styles.timelineCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('LocationSearch', { type: 'pickup', pickup, dropoff });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timelineLabel}>Pickup</Text>
                  <Text style={styles.timelineText} numberOfLines={1}>
                    {pickup?.name || 'Current Location'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.timelineRow}>
                <View style={styles.timelineDotWrap}>
                  <View style={[styles.timelineDotOuter, { borderColor: '#EF4444' }]}>
                    <View style={[styles.timelineDotInner, { backgroundColor: '#EF4444' }]} />
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.timelineCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('LocationSearch', { type: 'dropoff', pickup, dropoff });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.timelineLabel}>Drop-off</Text>
                  <Text style={styles.timelineText} numberOfLines={1}>
                    {dropoff?.name || 'Select destination'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          /* ===== INITIAL STATE ===== */
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            style={styles.initialScroll}
          >
            {/* Greeting Banner */}
            <Animated.View style={[styles.greetingBanner, staggerStyle(item1Anim)]}>
              <View style={[styles.greetingIconBg, { backgroundColor: greeting.color + '18' }]}>
                <Ionicons name={greeting.icon} size={22} color={greeting.color} />
              </View>
              <View style={styles.greetingInfo}>
                <Text style={styles.greetingSubtext}>{greeting.text}</Text>
                <Text style={styles.greetingName}>{getFirstName(user?.name)}</Text>
              </View>
              <View style={styles.greetingRight}>
                <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
              </View>
            </Animated.View>

            {/* Where to? - Single Tap */}
            <Animated.View style={[styles.whereToSection, staggerStyle(item2Anim)]}>
              <Text style={styles.whereToLabel}>Where are you going?</Text>
              <TouchableOpacity
                style={styles.searchBarMain}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('LocationSearch', { type: 'dropoff', pickup, dropoff });
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <Text style={styles.searchBarMainText}>
                  {dropoff?.name || 'Search destination'}
                </Text>
              </TouchableOpacity>

              {/* Pickup Row - subtle, below search */}
              <TouchableOpacity
                style={styles.pickupRow}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('LocationSearch', { type: 'pickup', pickup, dropoff });
                }}
                activeOpacity={0.7}
              >
                <View style={styles.pickupDot} />
                <Text style={styles.pickupRowText} numberOfLines={1}>
                  {pickup?.name || 'Current location'}
                </Text>
                <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
              </TouchableOpacity>
            </Animated.View>

            {/* Saved Places */}
            <Animated.View style={[styles.savedSection, staggerStyle(item3Anim)]}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Quick Access</Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('SavedPlaces');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.savedRow}>
                {savedPlaces.map((place) => (
                  <TouchableOpacity
                    key={place.id}
                    style={styles.savedItem}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      if (place.id === 'add') {
                        navigation.navigate('SavedPlaces');
                      } else {
                        navigation.navigate('LocationSearch', { type: 'dropoff', pickup, dropoff });
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.savedIcon, { backgroundColor: place.bg }]}>
                      <Ionicons name={place.icon} size={18} color={place.color} />
                    </View>
                    <Text style={styles.savedLabel}>{place.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Services / Quick Actions */}
            <Animated.View style={[styles.servicesSection, staggerStyle(item4Anim)]}>
              <Text style={styles.sectionTitle}>Services</Text>
              <View style={styles.servicesRow}>
                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('LocationSearch', { type: 'dropoff', pickup, dropoff });
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.serviceIconBg, { backgroundColor: '#FEF9E7' }]}>
                    <Ionicons name="car" size={22} color={PRIMARY} />
                  </View>
                  <Text style={styles.serviceLabel}>Ride</Text>
                  <Text style={styles.serviceDesc}>Book now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('SharedRides');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.serviceIconBg, { backgroundColor: '#EDE9FE' }]}>
                    <Ionicons name="people" size={22} color="#7C3AED" />
                  </View>
                  <Text style={styles.serviceLabel}>Carpool</Text>
                  <Text style={styles.serviceDesc}>Share & save</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('ScheduledRides');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.serviceIconBg, { backgroundColor: '#FEF3C7' }]}>
                    <Ionicons name="calendar" size={22} color="#D97706" />
                  </View>
                  <Text style={styles.serviceLabel}>Schedule</Text>
                  <Text style={styles.serviceDesc}>Plan ahead</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.serviceCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate('AvailableRides');
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.serviceIconBg, { backgroundColor: '#D1FAE5' }]}>
                    <Ionicons name="compass" size={22} color="#059669" />
                  </View>
                  <Text style={styles.serviceLabel}>Explore</Text>
                  <Text style={styles.serviceDesc}>Nearby rides</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Promo Banner */}
            <Animated.View style={staggerStyle(item4Anim)}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                pagingEnabled
                snapToInterval={SCREEN_WIDTH - 48 + 12}
                decelerationRate="fast"
                contentContainerStyle={styles.promoScroll}
              >
                {promoCards.map((promo) => (
                  <TouchableOpacity
                    key={promo.id}
                    style={[styles.promoCard, { backgroundColor: promo.bg }]}
                    activeOpacity={0.9}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      navigation.navigate('PromoCodes');
                    }}
                  >
                    <View style={styles.promoContent}>
                      <Text style={[styles.promoTitle, { color: promo.textColor }]}>
                        {promo.title}
                      </Text>
                      <Text style={[styles.promoSubtitle, { color: promo.textColor, opacity: 0.7 }]}>
                        {promo.subtitle}
                      </Text>
                      <View style={[styles.promoBtn, { backgroundColor: promo.accent }]}>
                        <Text style={[styles.promoBtnText, { color: promo.bg === PRIMARY ? '#FFF' : '#000' }]}>
                          Apply
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.promoIconCircle, { backgroundColor: promo.accent + '20' }]}>
                      <Ionicons
                        name={promo.id === '1' ? 'gift' : 'people'}
                        size={32}
                        color={promo.accent}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Animated.View>

            <View style={{ height: 16 }} />
          </ScrollView>
        )}

        {/* Find a Ride Button */}
        <TouchableOpacity
          style={styles.findRideBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (hasRoute) {
              navigation.navigate('RideOptions', { pickup, dropoff });
            } else {
              navigation.navigate('LocationSearch', { type: 'dropoff', pickup, dropoff });
            }
          }}
          activeOpacity={0.85}
        >
          <Ionicons name={hasRoute ? 'car-sport' : 'search'} size={20} color={DARK} />
          <Text style={styles.findRideBtnText}>Find a Ride</Text>
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
    alignItems: 'center',
  },
  dropoffPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  dropoffPinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#EF4444',
    marginTop: -1,
  },
  carMarker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },

  /* ===== Header Bar ===== */
  headerBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    zIndex: 10,
  },
  headerLeft: {
    padding: 2,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '800',
    color: DARK,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerLogo: {
    width: 100,
    height: 28,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LIGHT_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },

  /* ===== Floating Route Badge ===== */
  routeBadgeFloat: {
    position: 'absolute',
    top: '15%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  routeBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  routeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK,
  },
  routeBadgeDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
  },

  /* ===== Locate Button ===== */
  locateBtn: {
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

  /* ===== Bottom Sheet ===== */
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 14,
    maxHeight: '55%',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 12,
  },

  /* ===== Initial State ===== */
  initialScroll: {
    marginBottom: 8,
  },

  // Greeting Banner
  greetingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIGHT_BG,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  greetingIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  greetingSubtext: {
    fontSize: 12,
    color: GRAY,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
    marginTop: 1,
  },
  greetingRight: {
    paddingLeft: 8,
  },

  // Where to section
  whereToSection: {
    marginBottom: 18,
  },
  whereToLabel: {
    fontSize: 18,
    fontWeight: '800',
    color: DARK,
    marginBottom: 12,
  },
  searchBarMain: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    backgroundColor: LIGHT_BG,
    borderRadius: 25,
    paddingHorizontal: 18,
    gap: 10,
    marginBottom: 10,
  },
  searchBarMainText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 6,
    gap: 8,
  },
  pickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  pickupRowText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: GRAY,
  },

  // Saved Places
  savedSection: {
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DARK,
  },
  seeAllText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },
  savedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  savedItem: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 72) / 4,
  },
  savedIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  savedLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: DARK,
  },

  // Services
  servicesSection: {
    marginBottom: 16,
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  serviceCard: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 72) / 4,
  },
  serviceIconBg: {
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: DARK,
  },
  serviceDesc: {
    fontSize: 10,
    fontWeight: '500',
    color: GRAY,
    marginTop: 1,
  },

  // Promo Cards
  promoScroll: {
    gap: 12,
  },
  promoCard: {
    width: SCREEN_WIDTH - 48,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  promoSubtitle: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
    marginBottom: 12,
  },
  promoBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
  },
  promoBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  promoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },

  /* ===== Route Info State ===== */
  routeContent: {
    marginBottom: 16,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  routeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  routeTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: DARK,
  },
  routeDistance: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY,
  },
  routeHeaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY + '18',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  routeHeaderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: PRIMARY,
  },

  /* ===== Progress Bar ===== */
  progressWrap: {
    marginBottom: 20,
    marginTop: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    height: 6,
    backgroundColor: PRIMARY,
    borderRadius: 3,
  },
  progressCar: {
    position: 'absolute',
    top: -11,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },

  /* ===== Timeline ===== */
  timeline: {
    gap: 2,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineDotWrap: {
    width: 32,
    alignItems: 'center',
  },
  timelineDotOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  timelineLineVert: {
    width: 2,
    height: 16,
    backgroundColor: '#D1D5DB',
    marginTop: 3,
    borderRadius: 1,
  },
  timelineCard: {
    flex: 1,
    height: 52,
    backgroundColor: LIGHT_BG,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginLeft: 8,
  },
  timelineLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: GRAY,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  timelineText: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK,
    marginTop: 1,
  },

  /* ===== Find a Ride Button ===== */
  findRideBtn: {
    backgroundColor: PRIMARY,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  findRideBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK,
  },
});

export default HomeScreen;
