import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

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
import OTPVerificationScreen from '../screens/wallet/OTPVerificationScreen';

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
} from '../screens/sharedrides';

// Loyalty screens
import { LoyaltyScreen, PointsHistoryScreen } from '../screens/loyalty';

// Map screens
import { MapScreen } from '../screens/map';

// Available Rides & Chat
import AvailableRidesScreen from '../screens/rides/AvailableRidesScreen';
import PostRideRequestScreen from '../screens/rides/PostRideRequestScreen';
import RideChatScreen from '../screens/chat/RideChatScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Icon
const TabIcon = ({ focused, icon, iconFocused, color, label }) => {
  return (
    <View style={styles.tabIconContainer}>
      <Ionicons
        name={focused ? iconFocused : icon}
        size={24}
        color={color}
      />
      <Text style={[styles.tabLabel, { color }]}>{label}</Text>
    </View>
  );
};

// Center Location Button Component
const CenterLocationButton = ({ onPress }) => {
  return (
    <TouchableOpacity
      style={styles.centerButton}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.centerButtonInner}>
        <Ionicons name="location" size={28} color="#000" />
      </View>
    </TouchableOpacity>
  );
};

// Dummy screen for center button (won't actually show)
const DummyScreen = () => null;

// Modern 5-tab navigator with center location button
const MainTabs = () => {
  const theme = useTheme();
  const colors = theme?.colors || {
    primary: '#FCC014',
    textSecondary: '#6B7280',
    card: '#FFFFFF',
    background: '#FFFFFF',
  };

  const tabBarListeners = () => ({
    tabPress: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          paddingTop: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
          elevation: 15,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              icon="home-outline"
              iconFocused="home"
              color={color}
              label="Home"
            />
          ),
        }}
        listeners={tabBarListeners}
      />
      <Tab.Screen
        name="TripsTab"
        component={BookingsScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              icon="car-outline"
              iconFocused="car"
              color={color}
              label="Trips"
            />
          ),
        }}
        listeners={tabBarListeners}
      />
      <Tab.Screen
        name="LocationTab"
        component={DummyScreen}
        options={({ navigation }) => ({
          tabBarIcon: () => (
            <CenterLocationButton
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('LocationSearch', { type: 'dropoff' });
              }}
            />
          ),
        })}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            navigation.navigate('LocationSearch', { type: 'dropoff' });
          },
        })}
      />
      <Tab.Screen
        name="WalletTab"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              icon="wallet-outline"
              iconFocused="wallet"
              color={color}
              label="Wallet"
            />
          ),
        }}
        listeners={tabBarListeners}
      />
      <Tab.Screen
        name="AccountTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              icon="person-outline"
              iconFocused="person"
              color={color}
              label="Account"
            />
          ),
        }}
        listeners={tabBarListeners}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
  },
  centerButton: {
    position: 'absolute',
    top: -25,
    alignSelf: 'center',
    zIndex: 10,
  },
  centerButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FCC014',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FCC014',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const theme = useTheme();
  const colors = theme?.colors || {
    primary: '#FCC014',
    background: '#FFFFFF',
  };

  // TODO: TESTING MODE - Remove this bypass after testing
  const BYPASS_AUTH = false; // Real login with Twilio OTP

  // Always show splash while loading, even in bypass mode
  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
          animationDuration: 250,
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
            <Stack.Screen name="Wallet" component={WalletScreen} />
            <Stack.Screen name="TopUp" component={TopUpScreen} />
            <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen
              name="PaymentWebView"
              component={PaymentWebViewScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen
              name="OTPVerification"
              component={OTPVerificationScreen}
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
            <Stack.Screen
              name="SharedRideDetails"
              component={SharedRideDetailsScreen}
              options={{ animation: 'fade_from_bottom', animationDuration: 300 }}
            />
            <Stack.Screen name="MySharedBookings" component={MySharedBookingsScreen} />

            {/* Loyalty & Rewards */}
            <Stack.Screen name="Loyalty" component={LoyaltyScreen} />
            <Stack.Screen name="PointsHistory" component={PointsHistoryScreen} />

            {/* Available Rides & Chat */}
            <Stack.Screen name="AvailableRides" component={AvailableRidesScreen} />
            <Stack.Screen name="PostRideRequest" component={PostRideRequestScreen} />
            <Stack.Screen name="RideChat" component={RideChatScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
