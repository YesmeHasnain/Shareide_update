import React from 'react';
import { View, TouchableOpacity, Platform, StyleSheet, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Loading from '../components/Loading';
import { spacing, hitSlop } from '../theme/colors';

// Navigation guard for unapproved drivers
const withApprovalGuard = (ScreenComponent, screenName) => {
  return (props) => {
    const { user } = useAuth();
    const { colors } = useTheme();
    const isApproved = user?.driver?.status === 'approved';

    if (!isApproved) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background, padding: 24 }}>
          <Ionicons name="lock-closed" size={64} color={colors.primary} />
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text, marginTop: 16, textAlign: 'center' }}>
            Account Not Approved
          </Text>
          <Text style={{ fontSize: 14, color: colors.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 }}>
            Your account must be approved before you can access {screenName}. Please wait for admin review.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 27, marginTop: 24 }}
            onPress={() => props.navigation.goBack()}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#000' }}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return <ScreenComponent {...props} />;
  };
};

// Auth Screens
import PhoneScreen from '../screens/auth/PhoneScreen';
import OTPScreen from '../screens/auth/OTPScreen';

// Onboarding Screens
import PersonalInfoScreen from '../screens/onboarding/PersonalInfoScreen';
import VehicleInfoScreen from '../screens/onboarding/VehicleInfoScreen';
import DocumentsScreen from '../screens/onboarding/DocumentsScreen';
import SelfieScreen from '../screens/onboarding/SelfieScreen';
import DocumentCaptureScreen from '../screens/onboarding/DocumentCaptureScreen';
import PendingScreen from '../screens/onboarding/PendingScreen';

// Main Screens
import DashboardScreen from '../screens/main/DashboardScreen';
import ScheduleScreen from '../screens/main/ScheduleScreen';
import WalletScreen from '../screens/main/WalletScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import RideRequestScreen from '../screens/main/RideRequestScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import SharedRideChatScreen from '../screens/chat/SharedRideChatScreen';

// Profile Screens
import RideHistoryScreen from '../screens/profile/RideHistoryScreen';
import EarningsScreen from '../screens/profile/EarningsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import VehicleDetailsScreen from '../screens/profile/VehicleDetailsScreen';
import RatingsScreen from '../screens/profile/RatingsScreen';
import NotificationsSettingsScreen from '../screens/profile/NotificationsSettingsScreen';
import SupportScreen from '../screens/profile/SupportScreen';

// Shared Rides / Carpooling Screens
import {
  MySharedRidesScreen,
  CreateSharedRideScreen,
  SharedRideRequestsScreen,
  ManageSharedRideScreen,
} from '../screens/sharedrides';

// Loyalty Screens
import { LoyaltyScreen } from '../screens/loyalty';

// Location Search
import LocationSearchScreen from '../screens/location/LocationSearchScreen';

// Notifications
import NotificationsScreen from '../screens/notifications/NotificationsScreen';

// Live Map
import LiveMapScreen from '../screens/map/LiveMapScreen';

// Rides
import PostRideScreen from '../screens/rides/PostRideScreen';
import RideRequestsScreen from '../screens/rides/RideRequestsScreen';
import RateRiderScreen from '../screens/rides/RateRiderScreen';
import AvailableRequestsScreen from '../screens/rides/AvailableRequestsScreen';

// Wallet Screens
import TopUpScreen from '../screens/wallet/TopUpScreen';
import WithdrawScreen from '../screens/wallet/WithdrawScreen';
import PaymentWebViewScreen from '../screens/wallet/PaymentWebViewScreen';
import TransactionHistoryScreen from '../screens/wallet/TransactionHistoryScreen';

// New Feature Screens
import HeatMapScreen from '../screens/map/HeatMapScreen';
import DriverFAQScreen from '../screens/support/DriverFAQScreen';
import SupportChatScreen from '../screens/support/SupportChatScreen';
import IntercityOffersScreen from '../screens/intercity/IntercityOffersScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Icon - InDrive/Yango style
const TabIcon = ({ focused, icon, iconFocused, color, label, colors }) => {
  return (
    <View style={styles.tabIconContainer}>
      <View style={[
        styles.tabIconWrapper,
        focused && { backgroundColor: (colors.primary || '#FCC014') + '15' },
      ]}>
        <Ionicons
          name={focused ? iconFocused : icon}
          size={22}
          color={focused ? (colors.primary || '#FCC014') : color}
        />
      </View>
      <Text style={[
        styles.tabLabel,
        { color: focused ? (colors.primary || '#FCC014') : color },
        focused && styles.tabLabelActive,
      ]}>{label}</Text>
    </View>
  );
};

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
        tabBarActiveTintColor: colors.tabBarActive || colors.primary,
        tabBarInactiveTintColor: colors.tabBarInactive || colors.textSecondary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.tabBarBackground || colors.card,
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          height: Platform.OS === 'ios' ? 85 : 68,
          paddingBottom: Platform.OS === 'ios' ? 26 : 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 15,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              icon="home-outline"
              iconFocused="home"
              color={color}
              label="Home"
              colors={colors}
            />
          ),
        }}
        listeners={tabBarListeners}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              icon="calendar-outline"
              iconFocused="calendar"
              color={color}
              label="Schedule"
              colors={colors}
            />
          ),
        }}
        listeners={tabBarListeners}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              icon="wallet-outline"
              iconFocused="wallet"
              color={color}
              label="Wallet"
              colors={colors}
            />
          ),
        }}
        listeners={tabBarListeners}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              focused={focused}
              icon="person-outline"
              iconFocused="person"
              color={color}
              label="Account"
              colors={colors}
            />
          ),
        }}
        listeners={tabBarListeners}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const { colors } = useTheme();

  if (loading) {
    return <Loading />;
  }

  const getInitialRoute = () => {
    if (!isAuthenticated) return 'Phone';
    if (!user?.driver) return 'PersonalInfo';

    const driver = user.driver;
    if (driver.status === 'incomplete') return 'PersonalInfo';
    if (driver.status === 'pending' || driver.status === 'rejected') return 'Pending';
    if (driver.status === 'approved') return 'MainTabs';

    return 'PersonalInfo';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
          animationDuration: 250,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Phone" component={PhoneScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />

        {/* Onboarding Screens */}
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="VehicleInfo" component={VehicleInfoScreen} />
        <Stack.Screen name="Documents" component={DocumentsScreen} />
        <Stack.Screen name="Selfie" component={SelfieScreen} />
        <Stack.Screen name="DocumentCapture" component={DocumentCaptureScreen} options={{ animation: 'fade' }} />
        <Stack.Screen name="Pending" component={PendingScreen} />

        {/* Main Screens */}
        <Stack.Screen name="MainTabs" component={MainTabs} options={{ animation: 'fade' }} />
        <Stack.Screen name="RideRequest" component={RideRequestScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ animation: 'fade_from_bottom' }} />
        <Stack.Screen name="SharedRideChat" component={SharedRideChatScreen} options={{ animation: 'fade_from_bottom' }} />

        {/* Profile Screens */}
        <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
        <Stack.Screen name="Earnings" component={EarningsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
        <Stack.Screen name="Ratings" component={RatingsScreen} />
        <Stack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />

        {/* Shared Rides / Carpooling - Guarded */}
        <Stack.Screen name="MySharedRides" component={withApprovalGuard(MySharedRidesScreen, 'My Shared Rides')} />
        <Stack.Screen name="CreateSharedRide" component={withApprovalGuard(CreateSharedRideScreen, 'Create Shared Ride')} />
        <Stack.Screen name="SharedRideRequests" component={withApprovalGuard(SharedRideRequestsScreen, 'Ride Requests')} />
        <Stack.Screen name="ManageSharedRide" component={withApprovalGuard(ManageSharedRideScreen, 'Manage Ride')} />

        {/* Loyalty & Rewards */}
        <Stack.Screen name="Loyalty" component={LoyaltyScreen} />

        {/* Location Search */}
        <Stack.Screen name="LocationSearch" component={LocationSearchScreen} />

        {/* Notifications */}
        <Stack.Screen name="Notifications" component={NotificationsScreen} />

        {/* Live Map */}
        <Stack.Screen name="LiveMap" component={LiveMapScreen} />

        {/* Rides - Guarded */}
        <Stack.Screen name="PostRide" component={withApprovalGuard(PostRideScreen, 'Post Ride')} />
        <Stack.Screen name="RideRequests" component={withApprovalGuard(RideRequestsScreen, 'Ride Requests')} />
        <Stack.Screen name="RateRider" component={RateRiderScreen} />

        {/* Wallet Screens */}
        <Stack.Screen name="TopUp" component={TopUpScreen} />
        <Stack.Screen name="Withdraw" component={WithdrawScreen} />
        <Stack.Screen name="PaymentWebView" component={PaymentWebViewScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />

        {/* New Feature Screens */}
        <Stack.Screen name="AvailableRequests" component={withApprovalGuard(AvailableRequestsScreen, 'Available Requests')} />
        <Stack.Screen name="HeatMap" component={HeatMapScreen} />
        <Stack.Screen name="DriverFAQ" component={DriverFAQScreen} />
        <Stack.Screen name="SupportChat" component={SupportChatScreen} />
        <Stack.Screen name="IntercityOffers" component={withApprovalGuard(IntercityOffersScreen, 'Intercity Offers')} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  tabIconWrapper: {
    width: 40,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 3,
  },
  tabLabelActive: {
    fontWeight: '700',
  },
});

export default AppNavigator;
