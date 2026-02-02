import React, { useRef, useEffect } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { shadows } from '../theme/colors';

// Auth screens
import SplashScreen from '../screens/splash/SplashScreen';
import OnboardingScreen from '../screens/onboarding/OnboardingScreen';
import PhoneScreen from '../screens/auth/PhoneScreen';
import OTPScreen from '../screens/auth/OTPScreen';
import GenderScreen from '../screens/auth/GenderScreen';
import ProfileSetupScreen from '../screens/auth/ProfileSetupScreen';

// Main screens
import HomeScreen from '../screens/main/HomeScreen';
import BookingsScreen from '../screens/main/BookingsScreen';
import WalletScreen from '../screens/main/WalletScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Booking screens
import LocationSearchScreen from '../screens/booking/LocationSearchScreen';
import RideOptionsScreen from '../screens/booking/RideOptionsScreen';
import SearchResultsScreen from '../screens/booking/SearchResultsScreen';
import DriverProfileScreen from '../screens/booking/DriverProfileScreen';
import BookingConfirmScreen from '../screens/booking/BookingConfirmScreen';
import RideTrackingScreen from '../screens/booking/RideTrackingScreen';
import RateRideScreen from '../screens/booking/RateRideScreen';
import BookingDetailsScreen from '../screens/booking/BookingDetailsScreen';

// Wallet screens
import TopUpScreen from '../screens/wallet/TopUpScreen';
import PaymentMethodsScreen from '../screens/wallet/PaymentMethodsScreen';
import TransactionHistoryScreen from '../screens/wallet/TransactionHistoryScreen';
import PaymentWebViewScreen from '../screens/wallet/PaymentWebViewScreen';

// Profile screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SavedPlacesScreen from '../screens/profile/SavedPlacesScreen';
import PromoCodesScreen from '../screens/profile/PromoCodesScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import EmergencyScreen from '../screens/profile/EmergencyScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import SupportScreen from '../screens/profile/SupportScreen';

// Scheduled Rides screens
import ScheduledRidesScreen from '../screens/scheduled/ScheduledRidesScreen';
import ScheduleRideScreen from '../screens/scheduled/ScheduleRideScreen';

// Shared Rides / Carpooling screens
import {
  SharedRidesScreen,
  SharedRideDetailsScreen,
  MySharedBookingsScreen,
  CreateSharedRideScreen,
  MySharedRidesScreen,
  SharedRideRequestsScreen,
} from '../screens/sharedrides';

// Loyalty screens
import { LoyaltyScreen } from '../screens/loyalty';

// Map screens
import { MapScreen } from '../screens/map';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabBarIcon = ({ name, focused, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.15 : 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [focused]);

  return (
    <Animated.View style={[styles.tabIconContainer, { transform: [{ scale: scaleAnim }] }]}>
      {focused ? (
        <LinearGradient
          colors={colors.gradients?.primary || ['#FFD700', '#FFA500']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.tabIconBackground}
        >
          <Ionicons name={name} size={22} color="#000" />
        </LinearGradient>
      ) : (
        <Ionicons name={name} size={22} color={colors.textSecondary} />
      )}
    </Animated.View>
  );
};

// Center Location Button Component - Instagram-style floating button
const CenterTabButton = ({ colors, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Subtle pulsing glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.6],
  });

  return (
    <View style={styles.centerButtonWrapper}>
      {/* Outer glow effect */}
      <Animated.View
        style={[
          styles.centerButtonGlow,
          {
            opacity: glowOpacity,
            backgroundColor: colors.primary || '#FFD700',
          },
        ]}
      />
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.centerButtonOuter, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient
            colors={colors.gradients?.premium || ['#FFD700', '#F7931E', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.centerButtonGradient}
          >
            <View style={styles.centerButtonInner}>
              <Ionicons name="location" size={28} color="#000" />
            </View>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

// Placeholder component for the center tab
const PlaceholderScreen = () => null;

const MainTabs = () => {
  const theme = useTheme();
  const navigation = useNavigation();
  const colors = theme?.colors || {
    primary: '#FFD700',
    textSecondary: '#6B7280',
    card: '#FFFFFF',
    border: '#E5E7EB',
    background: '#FFFFFF',
  };

  const tabBarListeners = ({ navigation, route }) => ({
    tabPress: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const handleCenterButtonPress = () => {
    navigation.navigate('MapScreen');
  };

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          ...shadows.lg,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} focused={focused} colors={colors} />
          ),
        }}
        listeners={tabBarListeners}
      />
      <Tab.Screen
        name="BookingsTab"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'car' : 'car-outline'} focused={focused} colors={colors} />
          ),
        }}
        listeners={tabBarListeners}
      />
      <Tab.Screen
        name="RideTab"
        component={PlaceholderScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <CenterTabButton colors={colors} onPress={handleCenterButtonPress} />
          ),
          tabBarButton: (props) => (
            <View style={styles.centerTabButtonContainer}>
              <CenterTabButton colors={colors} onPress={handleCenterButtonPress} />
            </View>
          ),
        }}
        listeners={{
          tabPress: (e) => {
            // Prevent default tab behavior
            e.preventDefault();
            handleCenterButtonPress();
          },
        }}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletScreen}
        options={{
          tabBarLabel: 'Wallet',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'wallet' : 'wallet-outline'} focused={focused} colors={colors} />
          ),
        }}
        listeners={tabBarListeners}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon name={focused ? 'person' : 'person-outline'} focused={focused} colors={colors} />
          ),
        }}
        listeners={tabBarListeners}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const theme = useTheme();
  const colors = theme?.colors || {
    primary: '#FFD700',
    background: '#FFFFFF',
  };

  // TODO: TESTING MODE - Remove this bypass after testing
  const BYPASS_AUTH = true; // Set to false to restore normal auth flow

  // Always show splash while loading, even in bypass mode
  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
          animationDuration: 300,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        {!isAuthenticated && !BYPASS_AUTH ? (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} />
            <Stack.Screen
              name="Onboarding"
              component={OnboardingScreen}
              options={{ animation: 'fade' }}
            />
            <Stack.Screen name="Phone" component={PhoneScreen} />
            <Stack.Screen name="OTP" component={OTPScreen} />
            <Stack.Screen name="Gender" component={GenderScreen} />
            <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ animation: 'fade' }}
            />

            {/* Map Screen */}
            <Stack.Screen name="MapScreen" component={MapScreen} />

            {/* Booking Flow */}
            <Stack.Screen name="LocationSearch" component={LocationSearchScreen} />
            <Stack.Screen name="RideOptions" component={RideOptionsScreen} />
            <Stack.Screen name="SearchResults" component={SearchResultsScreen} />
            <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
            <Stack.Screen name="BookingConfirm" component={BookingConfirmScreen} />
            <Stack.Screen
              name="RideTracking"
              component={RideTrackingScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="RateRide" component={RateRideScreen} />
            <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />

            {/* Wallet */}
            <Stack.Screen name="TopUp" component={TopUpScreen} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen
              name="PaymentWebView"
              component={PaymentWebViewScreen}
              options={{ gestureEnabled: false }}
            />

            {/* Profile & Settings */}
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="SavedPlaces" component={SavedPlacesScreen} />
            <Stack.Screen name="PromoCodes" component={PromoCodesScreen} />
            <Stack.Screen name="Emergency" component={EmergencyScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="Support" component={SupportScreen} />

            {/* Scheduled Rides */}
            <Stack.Screen name="ScheduledRides" component={ScheduledRidesScreen} />
            <Stack.Screen name="ScheduleRide" component={ScheduleRideScreen} />

            {/* Shared Rides / Carpooling */}
            <Stack.Screen name="SharedRides" component={SharedRidesScreen} />
            <Stack.Screen name="SharedRideDetails" component={SharedRideDetailsScreen} />
            <Stack.Screen name="MySharedBookings" component={MySharedBookingsScreen} />
            <Stack.Screen name="CreateSharedRide" component={CreateSharedRideScreen} />
            <Stack.Screen name="MySharedRides" component={MySharedRidesScreen} />
            <Stack.Screen name="SharedRideRequests" component={SharedRideRequestsScreen} />

            {/* Loyalty & Rewards */}
            <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 32,
  },
  tabIconBackground: {
    width: 44,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Center button styles
  centerTabButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    top: -20,
  },
  centerButtonGlow: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    transform: [{ scale: 1.2 }],
  },
  centerButtonOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    ...shadows.goldLg,
  },
  centerButtonGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButtonInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
