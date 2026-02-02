import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Avatar, Divider } from './common';
import { shadows, spacing, borderRadius, typography } from '../theme/colors';

const DrawerItem = ({ icon, label, onPress, badge, isActive, colors, index }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[
          styles.drawerItem,
          isActive && { backgroundColor: colors.primary + '15' },
        ]}
      >
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: isActive ? colors.primary + '20' : colors.surface },
          ]}
        >
          <Ionicons
            name={icon}
            size={20}
            color={isActive ? colors.primary : colors.textSecondary}
          />
        </View>
        <Text
          style={[
            styles.drawerItemText,
            { color: isActive ? colors.primary : colors.text },
          ]}
        >
          {label}
        </Text>
        {badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );
};

const DrawerContent = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleNavigation = (screen) => {
    navigation.closeDrawer();
    navigation.navigate(screen);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
        },
      },
    ]);
  };

  const menuItems = [
    { icon: 'home-outline', label: 'Home', screen: 'HomeTab' },
    { icon: 'car-outline', label: 'My Rides', screen: 'BookingsTab' },
    { icon: 'people-outline', label: 'Carpool', screen: 'SharedRides' },
    { icon: 'ticket-outline', label: 'My Carpool Bookings', screen: 'MySharedBookings' },
    { icon: 'wallet-outline', label: 'Wallet', screen: 'WalletTab' },
    { icon: 'calendar-outline', label: 'Scheduled Rides', screen: 'ScheduledRides' },
    { icon: 'bookmark-outline', label: 'Saved Places', screen: 'SavedPlaces' },
    { icon: 'gift-outline', label: 'Promo Codes', screen: 'PromoCodes' },
  ];

  const settingsItems = [
    { icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications' },
    { icon: 'shield-outline', label: 'Emergency Contacts', screen: 'Emergency' },
    { icon: 'settings-outline', label: 'Settings', screen: 'Settings' },
    { icon: 'help-circle-outline', label: 'Help & Support', screen: 'Support' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + spacing.lg }]}
      >
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => navigation.closeDrawer()}
        >
          <Ionicons name="close" size={28} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => handleNavigation('ProfileTab')}
        >
          <Avatar
            source={user?.avatar}
            name={user?.name}
            size="large"
            gradient
            showBadge
            badgeType="verified"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
            <Text style={styles.userPhone}>{user?.phone || '+92 XXX XXXXXXX'}</Text>
            <View style={styles.viewProfileRow}>
              <Text style={styles.viewProfileText}>View Profile</Text>
              <Ionicons name="arrow-forward" size={14} color="#000" />
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.rating?.toFixed(1) || '0.0'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: '#00000020' }]} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.total_rides || 0}</Text>
            <Text style={styles.statLabel}>Rides</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: '#00000020' }]} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>Rs. {user?.total_saved ? (user.total_saved >= 1000 ? (user.total_saved / 1000).toFixed(1) + 'k' : user.total_saved) : '0'}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Menu */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          MENU
        </Text>
        {menuItems.map((item, index) => (
          <DrawerItem
            key={item.screen}
            icon={item.icon}
            label={item.label}
            onPress={() => handleNavigation(item.screen)}
            colors={colors}
            index={index}
          />
        ))}

        <Divider spacing="large" />

        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          SETTINGS
        </Text>
        {settingsItems.map((item, index) => (
          <DrawerItem
            key={item.screen}
            icon={item.icon}
            label={item.label}
            onPress={() => handleNavigation(item.screen)}
            colors={colors}
            index={index + menuItems.length}
          />
        ))}

        {/* Theme Toggle */}
        <View style={[styles.themeToggle, { backgroundColor: colors.surface }]}>
          <View style={styles.themeToggleLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons
                name={isDark ? 'moon' : 'sunny'}
                size={20}
                color={colors.primary}
              />
            </View>
            <Text style={[styles.themeText, { color: colors.text }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleTheme();
            }}
            trackColor={{ false: colors.border, true: colors.primary + '50' }}
            thumbColor={isDark ? colors.primary : colors.textSecondary}
          />
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.errorLight }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error }]}>
            Logout
          </Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={[styles.versionText, { color: colors.textTertiary }]}>
          Version 1.0.0
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  userName: {
    fontSize: typography.h5,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: typography.bodySmall,
    color: '#00000080',
    marginBottom: spacing.sm,
  },
  viewProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewProfileText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#000',
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#00000015',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.h5,
    fontWeight: '700',
    color: '#000',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: typography.caption,
    color: '#00000080',
  },
  statDivider: {
    width: 1,
    marginVertical: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginLeft: spacing.sm,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  drawerItemText: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginRight: spacing.sm,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.lg,
  },
  themeToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: typography.caption,
    marginTop: spacing.xl,
  },
});

export default DrawerContent;
