import React, { useEffect, useRef, useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getGreeting = () => {
  // Use Pakistan Standard Time (UTC+5)
  const pkTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
  const hour = pkTime.getHours();
  if (hour < 12) return { text: 'Good Morning', icon: 'sunny', color: '#F59E0B' };
  if (hour < 17) return { text: 'Good Afternoon', icon: 'partly-sunny', color: '#F97316' };
  if (hour < 21) return { text: 'Good Evening', icon: 'moon', color: '#8B5CF6' };
  return { text: 'Good Night', icon: 'moon', color: '#6366F1' };
};

const getFirstName = (name) => {
  if (!name) return 'there';
  return name.trim().split(' ')[0];
};

const serviceTypes = [
  { key: 'city', label: 'City', icon: 'car' },
  { key: 'intercity', label: 'Intercity', icon: 'bus' },
  { key: 'delivery', label: 'Delivery', icon: 'cube' },
];

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const greeting = getGreeting();
  const [activeService, setActiveService] = useState('city');
  const [userLocation, setUserLocation] = useState(null);

  // Get user location for map
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setUserLocation(loc.coords);
        }
      } catch (e) { /* silent */ }
    })();
  }, []);

  // Staggered entrance animations
  const item1Anim = useRef(new Animated.Value(0)).current;
  const item2Anim = useRef(new Animated.Value(0)).current;
  const item3Anim = useRef(new Animated.Value(0)).current;
  const item4Anim = useRef(new Animated.Value(0)).current;
  const item5Anim = useRef(new Animated.Value(0)).current;

  const getInitials = () => {
    if (!user?.name) return 'U';
    const words = user.name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  useEffect(() => {
    Animated.stagger(80, [
      Animated.spring(item1Anim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
      Animated.spring(item2Anim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
      Animated.spring(item3Anim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
      Animated.spring(item4Anim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
      Animated.spring(item5Anim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  const staggerStyle = (anim) => ({
    opacity: anim,
    transform: [{
      translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }),
    }],
  });

  const savedPlaces = [
    { id: 'home', icon: 'home', label: 'Home', color: '#3B82F6', bg: '#EFF6FF' },
    { id: 'work', icon: 'briefcase', label: 'Work', color: '#8B5CF6', bg: '#F5F3FF' },
    { id: 'gym', icon: 'fitness', label: 'Gym', color: '#10B981', bg: '#ECFDF5' },
    { id: 'add', icon: 'add', label: 'Add New', color: colors.textSecondary, bg: colors.inputBackground },
  ];

  const promoCards = [
    { id: '1', title: 'First Ride Free', subtitle: 'Use code SHAREIDE', bg: colors.text, textColor: colors.background, accent: colors.primary },
    { id: '2', title: 'Invite & Earn', subtitle: 'Get Rs. 100 per friend', bg: colors.primary, textColor: '#000', accent: colors.text },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('EditProfile');
          }}
          activeOpacity={0.8}
        >
          <View style={[styles.avatarCircle, { backgroundColor: colors.warningLight }]}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: colors.text }]}>{getInitials()}</Text>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Image
            source={isDark ? require('../../../assets/white-01.png') : require('../../../assets/black-01.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

        <TouchableOpacity
          style={[styles.notifBtn, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Notifications');
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.text} />
          <View style={[styles.notifDot, { borderColor: colors.background }]} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Greeting Banner */}
        <Animated.View style={[styles.greetingBanner, { backgroundColor: colors.backgroundSecondary }, staggerStyle(item1Anim)]}>
          <View style={[styles.greetingIconBg, { backgroundColor: greeting.color + '18' }]}>
            <Ionicons name={greeting.icon} size={24} color={greeting.color} />
          </View>
          <View style={styles.greetingInfo}>
            <Text style={[styles.greetingSubtext, { color: colors.textSecondary }]}>{greeting.text}</Text>
            <Text style={[styles.greetingName, { color: colors.text }]}>{getFirstName(user?.name)}</Text>
          </View>
        </Animated.View>

        {/* Where to? */}
        <Animated.View style={[styles.whereToSection, staggerStyle(item2Anim)]}>
          <Text style={[styles.whereToLabel, { color: colors.text }]}>Where are you going?</Text>
          <TouchableOpacity
            style={[styles.searchBar, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('LocationSearch', { type: 'dropoff' });
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={18} color={colors.textTertiary} />
            <Text style={[styles.searchBarText, { color: colors.textTertiary }]}>Search destination</Text>
            <View style={[styles.searchBarDivider, { backgroundColor: colors.border }]} />
            <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Access */}
        <Animated.View style={[styles.savedSection, staggerStyle(item3Anim)]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Access</Text>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('SavedPlaces');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
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
                    navigation.navigate('LocationSearch', { type: 'dropoff' });
                  }
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.savedIcon, { backgroundColor: place.bg }]}>
                  <Ionicons name={place.icon} size={18} color={place.color} />
                </View>
                <Text style={[styles.savedLabel, { color: colors.text }]}>{place.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Service Type Tabs */}
        <Animated.View style={[styles.serviceTypeTabs, staggerStyle(item4Anim)]}>
          {serviceTypes.map((svc) => (
            <TouchableOpacity
              key={svc.key}
              style={[
                styles.serviceTypeTab,
                { borderColor: colors.border },
                activeService === svc.key && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveService(svc.key);
                if (svc.key === 'intercity') {
                  navigation.navigate('IntercitySearch');
                }
              }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={svc.icon}
                size={18}
                color={activeService === svc.key ? '#000' : colors.textSecondary}
              />
              <Text style={[
                styles.serviceTypeLabel,
                { color: activeService === svc.key ? '#000' : colors.textSecondary },
              ]}>
                {svc.label}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Mini Map */}
        {userLocation && (
          <Animated.View style={[styles.miniMapContainer, staggerStyle(item4Anim)]}>
            <WebView
              source={{ html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><style>*{margin:0;padding:0}html,body,#map{width:100%;height:100%;border-radius:16px}</style></head><body><div id="map"></div><script>var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([${userLocation.latitude},${userLocation.longitude}],15);L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:19}).addTo(map);L.circleMarker([${userLocation.latitude},${userLocation.longitude}],{radius:8,fillColor:'#FCC014',color:'#fff',weight:3,fillOpacity:1}).addTo(map);</script></body></html>` }}
              style={styles.miniMap}
              scrollEnabled={false}
              javaScriptEnabled
              domStorageEnabled
              originWhitelist={['*']}
            />
            <TouchableOpacity
              style={styles.miniMapOverlay}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('LocationSearch', { type: 'dropoff' });
              }}
              activeOpacity={0.9}
            >
              <View style={[styles.miniMapBadge, { backgroundColor: colors.background }]}>
                <Ionicons name="location" size={16} color={colors.primary} />
                <Text style={[styles.miniMapBadgeText, { color: colors.text }]}>Tap to set destination</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Services */}
        <Animated.View style={[styles.servicesSection, staggerStyle(item4Anim)]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Services</Text>
          <View style={styles.servicesRow}>
            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('LocationSearch', { type: 'dropoff' });
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.serviceIconBg, { backgroundColor: '#FEF9E7' }]}>
                <Ionicons name="car" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.serviceLabel, { color: colors.text }]}>Ride</Text>
              <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>Book now</Text>
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
              <Text style={[styles.serviceLabel, { color: colors.text }]}>Carpool</Text>
              <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>Share & save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.serviceCard}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('IntercitySearch');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.serviceIconBg, { backgroundColor: '#DBEAFE' }]}>
                <Ionicons name="bus" size={22} color="#2563EB" />
              </View>
              <Text style={[styles.serviceLabel, { color: colors.text }]}>Intercity</Text>
              <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>City to city</Text>
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
              <Text style={[styles.serviceLabel, { color: colors.text }]}>Schedule</Text>
              <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>Plan ahead</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Promo Cards */}
        <Animated.View style={staggerStyle(item5Anim)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            snapToInterval={SCREEN_WIDTH - 32}
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
                    <Text style={[styles.promoBtnText, { color: promo.bg === colors.primary ? '#FFF' : '#000' }]}>
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

        {/* Safety Feature */}
        <Animated.View style={[styles.safetyCard, staggerStyle(item5Anim)]}>
          <View style={styles.safetyIconBg}>
            <Ionicons name="shield-checkmark" size={22} color="#059669" />
          </View>
          <View style={styles.safetyInfo}>
            <Text style={styles.safetyTitle}>Safe rides, always</Text>
            <Text style={styles.safetyDesc}>Real-time tracking, verified drivers, SOS button</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8, backgroundColor: colors.background, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity
          style={[styles.findRideBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('LocationSearch', { type: 'dropoff' });
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="car-sport" size={20} color="#000" />
          <Text style={styles.findRideBtnText}>Find a Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerLeft: {
    padding: 2,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
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
  },

  /* Scroll */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },

  /* Greeting */
  greetingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  greetingIconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greetingInfo: {
    flex: 1,
    marginLeft: 14,
  },
  greetingSubtext: {
    fontSize: 13,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 2,
  },

  /* Where To */
  whereToSection: {
    marginBottom: 24,
  },
  whereToLabel: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 16,
    paddingHorizontal: 18,
    gap: 12,
  },
  searchBarText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  searchBarDivider: {
    width: 1,
    height: 24,
  },

  /* Saved Places */
  savedSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
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
    width: 52,
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  savedLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  /* Service Type Tabs */
  serviceTypeTabs: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  serviceTypeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  serviceTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },

  /* Mini Map */
  miniMapContainer: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    position: 'relative',
  },
  miniMap: {
    flex: 1,
    borderRadius: 16,
  },
  miniMapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
  },
  miniMapBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  miniMapBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* Services */
  servicesSection: {
    marginBottom: 24,
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  serviceCard: {
    alignItems: 'center',
    width: (SCREEN_WIDTH - 72) / 4,
  },
  serviceIconBg: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  serviceDesc: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },

  /* Promo */
  promoScroll: {
    gap: 12,
    paddingRight: 4,
  },
  promoCard: {
    width: SCREEN_WIDTH - 52,
    borderRadius: 20,
    padding: 20,
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
    marginTop: 4,
    marginBottom: 14,
  },
  promoBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
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

  /* Safety */
  safetyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  safetyIconBg: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  safetyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  safetyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#065F46',
  },
  safetyDesc: {
    fontSize: 11,
    fontWeight: '500',
    color: '#059669',
    marginTop: 2,
  },

  /* Bottom Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
  },
  findRideBtn: {
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#FCC014',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  findRideBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

export default HomeScreen;
