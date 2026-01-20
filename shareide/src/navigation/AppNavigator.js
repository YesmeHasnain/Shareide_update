import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Text, View, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import DrawerContent from '../components/DrawerContent';

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

// Profile screens
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SavedPlacesScreen from '../screens/profile/SavedPlacesScreen';
import PromoCodesScreen from '../screens/profile/PromoCodesScreen';
import NotificationsScreen from '../screens/profile/NotificationsScreen';
import EmergencyScreen from '../screens/profile/EmergencyScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import SupportScreen from '../screens/profile/SupportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const TabIcon = ({ name }) => {
  const icons = { home: '🏠', bookings: '📋', wallet: '👛', profile: '👤' };
  return <Text style={{ fontSize: 24 }}>{icons[name]}</Text>;
};

const MainTabs = () => {
  const { colors } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: 60, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
      }}
    >
      <Tab.Screen name='HomeTab' component={HomeScreen} options={{ tabBarLabel: 'Home', tabBarIcon: () => <TabIcon name='home' /> }} />
      <Tab.Screen name='BookingsTab' component={BookingsScreen} options={{ tabBarLabel: 'Bookings', tabBarIcon: () => <TabIcon name='bookings' /> }} />
      <Tab.Screen name='WalletTab' component={WalletScreen} options={{ tabBarLabel: 'Wallet', tabBarIcon: () => <TabIcon name='wallet' /> }} />
      <Tab.Screen name='ProfileTab' component={ProfileScreen} options={{ tabBarLabel: 'Profile', tabBarIcon: () => <TabIcon name='profile' /> }} />
    </Tab.Navigator>
  );
};

const DrawerNavigator = () => {
  const { colors } = useTheme();
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{ headerShown: false, drawerType: 'slide', drawerStyle: { backgroundColor: colors.background, width: 300 } }}
    >
      <Drawer.Screen name='MainTabs' component={MainTabs} />
    </Drawer.Navigator>
  );
};

const PlaceholderScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ backgroundColor: colors.primary, paddingTop: 50, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 28, color: '#000' }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000', marginLeft: 16 }}>{route.name}</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 60 }}>🚧</Text>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginTop: 20 }}>Coming Soon!</Text>
        <TouchableOpacity style={{ backgroundColor: colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 30 }} onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#000' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAuth();
  const { colors } = useTheme();

  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name='Splash' component={SplashScreen} />
            <Stack.Screen name='Onboarding' component={OnboardingScreen} />
            <Stack.Screen name='Phone' component={PhoneScreen} />
            <Stack.Screen name='OTP' component={OTPScreen} />
            <Stack.Screen name='Gender' component={GenderScreen} />
            <Stack.Screen name='ProfileSetup' component={ProfileSetupScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name='Drawer' component={DrawerNavigator} />

            {/* Booking Flow */}
            <Stack.Screen name='LocationSearch' component={LocationSearchScreen} />
            <Stack.Screen name='SearchResults' component={SearchResultsScreen} />
            <Stack.Screen name='DriverProfile' component={DriverProfileScreen} />
            <Stack.Screen name='BookingConfirm' component={BookingConfirmScreen} />
            <Stack.Screen name='RideTracking' component={RideTrackingScreen} />
            <Stack.Screen name='RateRide' component={RateRideScreen} />
            <Stack.Screen name='BookingDetails' component={BookingDetailsScreen} />

            {/* Wallet */}
            <Stack.Screen name='TopUp' component={TopUpScreen} />
            <Stack.Screen name='TransactionHistory' component={TransactionHistoryScreen} />
            <Stack.Screen name='PaymentMethods' component={PaymentMethodsScreen} />

            {/* Profile & Settings */}
            <Stack.Screen name='EditProfile' component={EditProfileScreen} />
            <Stack.Screen name='SavedPlaces' component={SavedPlacesScreen} />
            <Stack.Screen name='PromoCodes' component={PromoCodesScreen} />
            <Stack.Screen name='Emergency' component={EmergencyScreen} />
            <Stack.Screen name='Notifications' component={NotificationsScreen} />
            <Stack.Screen name='Settings' component={SettingsScreen} />
            <Stack.Screen name='Support' component={SupportScreen} />
            <Stack.Screen name='Schedule' component={PlaceholderScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
