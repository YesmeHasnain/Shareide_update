import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const DrawerContent = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => {
        await logout();
        navigation.reset({ index: 0, routes: [{ name: 'Splash' }] });
      }},
    ]);
  };

  const menuItems = [
    { icon: '', label: 'Home', screen: 'HomeTab' },
    { icon: '', label: 'My Bookings', screen: 'BookingsTab' },
    { icon: '', label: 'My Wallet', screen: 'WalletTab' },
    { icon: '', label: 'Saved Places', screen: 'SavedPlaces' },
    { icon: '', label: 'Promo Codes', screen: 'PromoCodes' },
    { icon: '', label: 'Emergency', screen: 'Emergency' },
    { icon: '', label: 'Notifications', screen: 'Notifications' },
    { icon: '', label: 'Settings', screen: 'Settings' },
    { icon: '', label: 'Help & Support', screen: 'Support' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView>
        <View style={[styles.profileSection, { backgroundColor: colors.primary }]}>
          <TouchableOpacity style={styles.closeButton} onPress={() => navigation.closeDrawer()}>
            <Text style={styles.closeIcon}></Text>
          </TouchableOpacity>
          <View style={styles.profileContent}>
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'U'}</Text>
            </View>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
            <Text style={styles.userPhone}>+92 {user?.phone}</Text>
            <TouchableOpacity onPress={() => { navigation.closeDrawer(); navigation.navigate('ProfileTab'); }}>
              <Text style={styles.viewProfileText}>View Profile </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={() => { navigation.closeDrawer(); navigation.navigate(item.screen); }}
            >
              <View style={styles.menuLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              </View>
              <Text style={[styles.menuArrow, { color: colors.textSecondary }]}></Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.surface }]} onPress={handleLogout}>
          <Text style={styles.logoutIcon}></Text>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textSecondary }]}>Shareide v1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileSection: { paddingTop: 50, paddingBottom: 30, paddingHorizontal: 20 },
  closeButton: { alignSelf: 'flex-end', width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  closeIcon: { fontSize: 24, color: '#000' },
  profileContent: { alignItems: 'center' },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFD700' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  userPhone: { fontSize: 14, color: '#000', marginBottom: 16 },
  viewProfileText: { fontSize: 14, fontWeight: '600', color: '#000' },
  menuContainer: { paddingTop: 8 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 0.5 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { fontSize: 24, marginRight: 16, width: 32 },
  menuLabel: { fontSize: 16, fontWeight: '500' },
  menuArrow: { fontSize: 18 },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 20, marginTop: 20, marginBottom: 16, paddingVertical: 14, borderRadius: 12 },
  logoutIcon: { fontSize: 20, marginRight: 8 },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#F44336' },
  version: { fontSize: 12, textAlign: 'center', marginBottom: 20 },
});

export default DrawerContent;
