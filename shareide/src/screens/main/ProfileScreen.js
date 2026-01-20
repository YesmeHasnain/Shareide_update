import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await logout();
      }},
    ]);
  };

  const menuItems = [
    { section: 'Account', items: [
      { icon: '👤', label: 'Edit Profile', screen: 'EditProfile' },
      { icon: '📍', label: 'Saved Places', screen: 'SavedPlaces' },
      { icon: '💳', label: 'Payment Methods', screen: 'PaymentMethods' },
      { icon: '🎟️', label: 'Promo Codes', screen: 'PromoCodes' },
    ]},
    { section: 'Preferences', items: [
      { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
      { icon: '⚙️', label: 'Settings', screen: 'Settings' },
      { icon: isDark ? '☀️' : '🌙', label: isDark ? 'Light Mode' : 'Dark Mode', action: toggleTheme },
    ]},
    { section: 'Safety', items: [
      { icon: '🚨', label: 'Emergency Contacts', screen: 'Emergency' },
      { icon: '🛡️', label: 'Safety Center', screen: 'Support' },
    ]},
    { section: 'Support', items: [
      { icon: '❓', label: 'Help & Support', screen: 'Support' },
      { icon: '📋', label: 'Terms & Conditions', screen: 'Support' },
      { icon: '🔒', label: 'Privacy Policy', screen: 'Support' },
    ]},
  ];

  const handleMenuPress = (item) => {
    if (item.action) {
      item.action();
    } else if (item.screen) {
      navigation.navigate(item.screen);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
          </View>
          <Text style={[styles.userName, { color: colors.text }]}>{user?.name || 'Guest'}</Text>
          <Text style={[styles.userPhone, { color: colors.textSecondary }]}>+92 {user?.phone}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>12</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rides</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>4.8</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.text }]}>2</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Years</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {menuItems.map((section) => (
          <View key={section.section} style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.section}</Text>
            <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.menuItem,
                    i !== section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                  ]}
                  onPress={() => handleMenuPress(item)}
                >
                  <View style={styles.menuLeft}>
                    <Text style={styles.menuIcon2}>{item.icon}</Text>
                    <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
                  </View>
                  <Text style={[styles.menuArrow, { color: colors.textSecondary }]}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Text style={[styles.version, { color: colors.textSecondary }]}>Shareide v1.0.0</Text>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.surface }]}
            onPress={handleLogout}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16
  },
  menuIcon: { fontSize: 24, color: '#000' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  profileCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  avatarText: { fontSize: 40, fontWeight: 'bold', color: '#000' },
  userName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  userPhone: { fontSize: 16, marginBottom: 20 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  statItem: { alignItems: 'center', paddingHorizontal: 24 },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, height: 30 },
  editButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12
  },
  editButtonText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  menuSection: { marginBottom: 20, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  menuCard: { borderRadius: 16, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuIcon2: { fontSize: 22, marginRight: 14, width: 28 },
  menuLabel: { fontSize: 16 },
  menuArrow: { fontSize: 24 },
  footer: { alignItems: 'center', paddingVertical: 24, paddingBottom: 40 },
  version: { fontSize: 14, marginBottom: 16 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  logoutIcon: { fontSize: 20, marginRight: 8 },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#ef4444' },
});

export default ProfileScreen;
