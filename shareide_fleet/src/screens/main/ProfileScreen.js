import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      section: 'Account',
      items: [
        { icon: '👤', title: 'Personal Information', screen: 'EditProfile' },
        { icon: '🚗', title: 'Vehicle Details', screen: 'VehicleDetails' },
        { icon: '📊', title: 'Earnings', screen: 'Earnings' },
        { icon: '🕐', title: 'Ride History', screen: 'RideHistory' },
        { icon: '⭐', title: 'Ratings & Reviews', screen: 'Ratings' },
      ],
    },
    {
      section: 'App Settings',
      items: [
        { icon: '🔔', title: 'Notifications', screen: 'NotificationsSettings' },
        { icon: '🌓', title: 'Dark Mode', toggle: true, value: isDark },
        { icon: '🌐', title: 'Language', screen: null },
      ],
    },
    {
      section: 'Support',
      items: [
        { icon: '❓', title: 'Help & Support', screen: 'Support' },
        { icon: '📋', title: 'Terms & Conditions', screen: 'Support' },
        { icon: '🔒', title: 'Privacy Policy', screen: 'Support' },
        { icon: 'ℹ️', title: 'About Us', screen: 'Support' },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const handleMenuPress = (item) => {
    if (item.toggle) {
      toggleTheme();
    } else if (item.screen) {
      navigation.navigate(item.screen);
    } else {
      Alert.alert('Coming Soon', `${item.title} feature will be available soon!`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.first_name?.charAt(0) || 'D'}
              </Text>
            </View>
          </View>
          <Text style={styles.headerName}>
            {user?.first_name} {user?.last_name}
          </Text>
          <Text style={styles.headerPhone}>{user?.phone}</Text>
          
          {user?.driver && (
            <View style={styles.driverBadge}>
              <Text style={styles.driverBadgeText}>
                {user.driver.status === 'approved' ? '✓ Verified Driver' : '⏳ Pending Approval'}
              </Text>
            </View>
          )}
        </View>

        {/* Stats */}
        {user?.driver && (
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {user.driver.total_rides || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Total Rides
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {user.driver.rating?.toFixed(1) || '0.0'}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Rating
              </Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.statValue, { color: colors.text }]}>
                {user.driver.years_of_experience || 0}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                Years Exp.
              </Text>
            </View>
          </View>
        )}

        {/* Menu Sections */}
        {menuItems.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.section}
            </Text>
            <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.menuItem,
                    itemIndex !== section.items.length - 1 && {
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                    },
                  ]}
                  onPress={() => handleMenuPress(item)}
                >
                  <View style={styles.menuItemLeft}>
                    <Text style={styles.menuIcon}>{item.icon}</Text>
                    <Text style={[styles.menuTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                  </View>
                  {item.toggle ? (
                    <Text style={[styles.menuValue, { color: colors.textSecondary }]}>
                      {item.value ? 'On' : 'Off'}
                    </Text>
                  ) : (
                    <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Shareide Fleet v1.0.0
          </Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.surface }]}
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: colors.error }]}>
            🚪 Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  headerPhone: {
    fontSize: 16,
    color: '#000',
    marginBottom: 12,
  },
  driverBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#000',
    borderRadius: 20,
  },
  driverBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  menuSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    letterSpacing: 1,
  },
  menuCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
  },
  menuValue: {
    fontSize: 14,
  },
  menuArrow: {
    fontSize: 24,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 12,
  },
  logoutButton: {
    marginHorizontal: 24,
    marginBottom: 40,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;