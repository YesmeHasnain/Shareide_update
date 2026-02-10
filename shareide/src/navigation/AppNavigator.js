import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform, Text } from 'react-native';
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
import ProfilePictureScreen from '../screens/auth/ProfilePictureScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import NameEntryScreen from '../screens/auth/NameEntryScreen';

// Main screens
import HomeScreen from '../screens/main/HomeScreen';
import BookingsScreen from '../screens/main/BookingsScreen';
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
import WalletScreen from '../screens/main/WalletScreen';
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
  CreateSharedRideScreen,
  MySharedRidesScreen,
  SharedRideRequestsScreen,
} from '../screens/sharedrides';

// Loyalty screens
import { LoyaltyScreen, PointsHistoryScreen } from '../screens/loyalty';

// Map screens
import { MapScreen } from '../screens/map';

// Available Rides & Chat
import AvailableRidesScreen from '../screens/rides/AvailableRidesScreen';
import PostRideRequestScreen from '../screens/rides/PostRideRequestScreen';
import RideChatScreen from '../screens/chat/RideChatScreen';

// Calendar & Other Passengers
import CalendarScreen from '../screens/booking/CalendarScreen';
import OtherPassengersScreen from '../screens/profile/OtherPassengersScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Icon - Figma 3-tab design
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

// Figma-matching 3-tab navigator: Home, Trips, Account
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
});

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const theme = useTheme();
  const colors = theme?.colors || {
    primary: '#FCC014',
    background: '#FFFFFF',
  };

  const BYPASS_AUTH = false;

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
            <Stack.Screen name="ProfilePicture" component={ProfilePictureScreen} />
            <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
            <Stack.Screen name="NameEntry" component={NameEntryScreen} />
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
            <Stack.Screen name="Calendar" component={CalendarScreen} />

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
            <Stack.Screen name="OtherPassengers" component={OtherPassengersScreen} />

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
            <Stack.Screen name="CreateSharedRide" component={CreateSharedRideScreen} />
            <Stack.Screen name="MySharedRides" component={MySharedRidesScreen} />
            <Stack.Screen name="SharedRideRequests" component={SharedRideRequestsScreen} />

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
