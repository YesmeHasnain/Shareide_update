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
import { useTheme } from '../../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const getGreeting = () => {
  const pkTime = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Karachi' }));
  const hour = pkTime.getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
};

const getFirstName = (name) => {
  if (!name) return 'there';
  return name.trim().split(' ')[0];
};

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { colors, isDark } = useTheme();

  // Simple entrance animations
  const item1Anim = useRef(new Animated.Value(0)).current;
  const item2Anim = useRef(new Animated.Value(0)).current;
  const item3Anim = useRef(new Animated.Value(0)).current;

  const getInitials = () => {
    if (!user?.name) return 'U';
    const words = user.name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  useEffect(() => {
    Animated.stagger(100, [
      Animated.spring(item1Anim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
      Animated.spring(item2Anim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
      Animated.spring(item3Anim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
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

  const promo = { title: 'First Ride Free', subtitle: 'Use code SHAREIDE', bg: colors.text, textColor: colors.background, accent: colors.primary };

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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Greeting line */}
        <Text style={[styles.greetingLine, { color: colors.textSecondary }]}>
          {getGreeting()}, {getFirstName(user?.name)}
        </Text>

        {/* Where to? */}
        <Animated.View style={[styles.whereToSection, staggerStyle(item1Anim)]}>
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
        <Animated.View style={[styles.savedSection, staggerStyle(item1Anim)]}>
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

        {/* Services - simplified to 3 cards */}
        <Animated.View style={[styles.servicesSection, staggerStyle(item2Anim)]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Services</Text>
          <View style={styles.servicesRow}>
            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('LocationSearch', { type: 'dropoff' });
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.serviceIconBg, { backgroundColor: '#FEF9E7' }]}>
                <Ionicons name="car" size={24} color={colors.primary} />
              </View>
              <Text style={[styles.serviceLabel, { color: colors.text }]}>Ride</Text>
              <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>Book now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('SharedRides');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.serviceIconBg, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="people" size={24} color="#7C3AED" />
              </View>
              <Text style={[styles.serviceLabel, { color: colors.text }]}>Carpool</Text>
              <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>Share & save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.serviceCard, { backgroundColor: colors.backgroundSecondary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate('ScheduledRides');
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.serviceIconBg, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="calendar" size={24} color="#D97706" />
              </View>
              <Text style={[styles.serviceLabel, { color: colors.text }]}>Schedule</Text>
              <Text style={[styles.serviceDesc, { color: colors.textSecondary }]}>Plan ahead</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Single Promo Card */}
        <Animated.View style={staggerStyle(item3Anim)}>
          <TouchableOpacity
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
                <Text style={styles.promoBtnText}>Apply</Text>
              </View>
            </View>
            <View style={[styles.promoIconCircle, { backgroundColor: promo.accent + '20' }]}>
              <Ionicons name="gift" size={32} color={promo.accent} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
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
  greetingLine: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },

  /* Where To */
  whereToSection: {
    marginBottom: 24,
  },
  whereToLabel: {
    fontSize: 22,
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
    marginBottom: 28,
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

  /* Services */
  servicesSection: {
    marginBottom: 28,
  },
  servicesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 20,
  },
  serviceIconBg: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  serviceLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  serviceDesc: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },

  /* Promo */
  promoCard: {
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
    color: '#000',
  },
  promoIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
});

export default HomeScreen;
