import React from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Loading from '../components/Loading';

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

// Profile Screens
import RideHistoryScreen from '../screens/profile/RideHistoryScreen';
import EarningsScreen from '../screens/profile/EarningsScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import VehicleDetailsScreen from '../screens/profile/VehicleDetailsScreen';
import RatingsScreen from '../screens/profile/RatingsScreen';
import NotificationsSettingsScreen from '../screens/profile/NotificationsSettingsScreen';
import SupportScreen from '../screens/profile/SupportScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ name, color }) => {
  const icons = {
    home: '🏠',
    calendar: '📅',
    wallet: '💰',
    person: '👤',
  };
  return <Text style={{ fontSize: 24, color }}>{icons[name]}</Text>;
};

const MainTabs = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} />,
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon name="wallet" color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color }) => <TabIcon name="person" color={color} />,
        }}
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
        }}
      >
        <Stack.Screen name="Phone" component={PhoneScreen} />
        <Stack.Screen name="OTP" component={OTPScreen} />
        <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
        <Stack.Screen name="VehicleInfo" component={VehicleInfoScreen} />
        <Stack.Screen name="Documents" component={DocumentsScreen} />
        <Stack.Screen name="Selfie" component={SelfieScreen} />
        <Stack.Screen name="Pending" component={PendingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="RideRequest" component={RideRequestScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />

        {/* Profile Screens */}
        <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
        <Stack.Screen name="Earnings" component={EarningsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
        <Stack.Screen name="Ratings" component={RatingsScreen} />
        <Stack.Screen name="NotificationsSettings" component={NotificationsSettingsScreen} />
        <Stack.Screen name="Support" component={SupportScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;