import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const PRIMARY_COLOR = '#FCC014';

const ProfileScreen = ({ navigation }) => {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            if (logout) await logout();
          },
        },
      ]
    );
  };

  const MenuItem = ({ icon, label, screen, iconColor }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate(screen);
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.menuIcon, { backgroundColor: (iconColor || PRIMARY_COLOR) + '15' }]}>
        <Ionicons name={icon} size={20} color={iconColor || PRIMARY_COLOR} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );

  const VerifiedItem = ({ label }) => (
    <View style={styles.verifiedRow}>
      <View style={styles.verifiedIcon}>
        <Ionicons name="checkmark-circle" size={20} color={PRIMARY_COLOR} />
      </View>
      <Text style={styles.verifiedText}>{label}</Text>
    </View>
  );

  const getInitials = () => {
    if (!user?.name) return 'U';
    const words = user.name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16 },
        ]}
      >
        {/* Header */}
        <Text style={styles.headerTitle}>PROFILE</Text>

        {/* Profile Avatar Section */}
        <TouchableOpacity
          style={styles.avatarSection}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.8}
        >
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={14} color="#FFF" />
            </View>
          </View>
          <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={styles.statValue}>
              <Text style={styles.statNumber}>{user?.rating?.toFixed(1) || '4.9'}</Text>
              <Ionicons name="star" size={16} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{user?.total_rides || 0}</Text>
            <Text style={styles.statLabel}>Rides</Text>
          </View>
        </View>

        {/* Profile Details Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Profile Details</Text>
          <VerifiedItem label="Verified passenger" />
          <VerifiedItem label="Verified phone number" />
          <VerifiedItem label="Verified Identity" />
          <VerifiedItem label="Member since 2025" />
        </View>

        {/* Account Section */}
        <View style={styles.menuCard}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <MenuItem icon="wallet-outline" label="Wallet" screen="Wallet" />
          <MenuItem icon="card-outline" label="Payment Methods" screen="PaymentMethods" />
          <MenuItem icon="star-outline" label="Loyalty Rewards" screen="Loyalty" />
          <MenuItem icon="pricetag-outline" label="Promo Codes" screen="PromoCodes" />
          <MenuItem icon="bookmark-outline" label="Saved Places" screen="SavedPlaces" />
        </View>

        {/* Settings Section */}
        <View style={styles.menuCard}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          <MenuItem icon="notifications-outline" label="Notifications" screen="Notifications" />
          <MenuItem icon="shield-checkmark-outline" label="Emergency Contacts" screen="Emergency" iconColor="#10B981" />
          <MenuItem icon="settings-outline" label="App Settings" screen="Settings" />
        </View>

        {/* Support Section */}
        <View style={styles.menuCard}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <MenuItem icon="help-circle-outline" label="Help Center" screen="Support" />
          <MenuItem icon="chatbubble-outline" label="Contact Us" screen="Support" />
        </View>

        {/* Report Issue */}
        <TouchableOpacity style={styles.reportButton} activeOpacity={0.8}>
          <Text style={styles.reportText}>Report an issue</Text>
        </TouchableOpacity>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.versionText}>SHAREIDE v1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#6B7280',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  verifiedIcon: {
    marginRight: 12,
  },
  verifiedText: {
    fontSize: 14,
    color: '#374151',
  },
  menuCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  reportButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 27,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  reportText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  versionText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ProfileScreen;
