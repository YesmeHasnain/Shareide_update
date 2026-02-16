import React, { useEffect, useRef } from 'react';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#FCC014';
const DARK = '#1A1A2E';
const GRAY = '#6B7280';
const LIGHT_BG = '#F7F8FA';
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

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const greeting = getGreeting();

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
    { id: 'add', icon: 'add', label: 'Add New', color: '#6B7280', bg: '#F3F4F6' },
  ];

  const promoCards = [
    { id: '1', title: 'First Ride Free', subtitle: 'Use code SHAREIDE', bg: '#1A1A2E', textColor: '#FFF', accent: PRIMARY },
    { id: '2', title: 'Invite & Earn', subtitle: 'Get Rs. 100 per friend', bg: PRIMARY, textColor: '#000', accent: '#1A1A2E' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          style={styles.headerLeft}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('EditProfile');
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

        <View style={styles.headerCenter}>
          <Image
            source={require('../../../assets/black-01.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
        </View>

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
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Greeting Banner */}
        <Animated.View style={[styles.greetingBanner, staggerStyle(item1Anim)]}>
          <View style={[styles.greetingIconBg, { backgroundColor: greeting.color + '18' }]}>
            <Ionicons name={greeting.icon} size={24} color={greeting.color} />
          </View>
          <View style={styles.greetingInfo}>
            <Text style={styles.greetingSubtext}>{greeting.text}</Text>
            <Text style={styles.greetingName}>{getFirstName(user?.name)}</Text>
          </View>
        </Animated.View>

        {/* Where to? */}
        <Animated.View style={[styles.whereToSection, staggerStyle(item2Anim)]}>
          <Text style={styles.whereToLabel}>Where are you going?</Text>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('LocationSearch', { type: 'dropoff' });
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="search" size={18} color="#9CA3AF" />
            <Text style={styles.searchBarText}>Search destination</Text>
            <View style={styles.searchBarDivider} />
            <Ionicons name="time-outline" size={18} color={GRAY} />
          </TouchableOpacity>
        </Animated.View>

        {/* Quick Access */}
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
                    navigation.navigate('LocationSearch', { type: 'dropoff' });
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

        {/* Services */}
        <Animated.View style={[styles.servicesSection, staggerStyle(item4Anim)]}>
          <Text style={styles.sectionTitle}>Services</Text>
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
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity
          style={styles.findRideBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('LocationSearch', { type: 'dropoff' });
          }}
          activeOpacity={0.85}
        >
          <Ionicons name="car-sport" size={20} color={DARK} />
          <Text style={styles.findRideBtnText}>Find a Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  /* Header */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: LIGHT_BG,
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
    color: GRAY,
    fontWeight: '500',
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '800',
    color: DARK,
    marginTop: 2,
  },

  /* Where To */
  whereToSection: {
    marginBottom: 24,
  },
  whereToLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: DARK,
    marginBottom: 14,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    backgroundColor: LIGHT_BG,
    borderRadius: 16,
    paddingHorizontal: 18,
    gap: 12,
  },
  searchBarText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
  },
  searchBarDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
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
    color: DARK,
  },
  seeAllText: {
    fontSize: 13,
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
    color: DARK,
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
    color: DARK,
  },
  serviceDesc: {
    fontSize: 10,
    fontWeight: '500',
    color: GRAY,
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  findRideBtn: {
    backgroundColor: PRIMARY,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
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
