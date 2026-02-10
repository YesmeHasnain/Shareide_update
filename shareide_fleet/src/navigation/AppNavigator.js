import React from 'react';
import { View, TouchableOpacity, Platform, StyleSheet, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Loading from '../components/Loading';
import { spacing } from '../theme/colors';

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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICON_SIZE = 26;

const tabConfig = [
  { name: 'Dashboard', label: 'Home', iconBase: 'home' },
  { name: 'Schedule', label: 'Schedule', iconBase: 'calendar' },
  { name: 'Wallet', label: 'Wallet', iconBase: 'wallet' },
  { name: 'Profile', label: 'Profile', iconBase: 'person' },
];

const CustomTabBar = ({ state, descriptors, navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === 'ios' ? Math.max(insets.bottom - 8, 8) : 12;

  return (
    <View style={[
      tabBarStyles.container,
      {
        bottom: Platform.OS === 'ios' ? insets.bottom > 0 ? 20 : 12 : 12,
        backgroundColor: colors.card,
        shadowColor: '#000',
      },
    ]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const config = tabConfig[index];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const iconName = isFocused ? config.iconBase : `${config.iconBase}-outline`;

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={tabBarStyles.tabItem}
          >
            <View style={[
              tabBarStyles.iconWrapper,
              isFocused && { backgroundColor: colors.primary + '20' },
            ]}>
              <Ionicons
                name={iconName}
                size={TAB_ICON_SIZE}
                color={isFocused ? colors.primary : colors.textTertiary}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const tabBarStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginHorizontal: 16,
    flexDirection: 'row',
    borderRadius: 28,
    paddingVertical: 8,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 52,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const MainTabs = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} />
      <Tab.Screen name="Wallet" component={WalletScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
