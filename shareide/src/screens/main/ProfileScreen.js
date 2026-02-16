import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

const PRIMARY = '#FCC014';
const DARK = '#1A1A2E';

const ProfileScreen = ({ navigation }) => {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const refreshUser = auth?.refreshUser;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (refreshUser) refreshUser();
  }, [refreshUser]);

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

  const getInitials = () => {
    if (!user?.name) return 'U';
    const words = user.name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const MenuItem = ({ icon, label, screen, iconBg, iconColor, badge }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate(screen);
      }}
      activeOpacity={0.6}
    >
      <View style={[styles.menuIconBox, { backgroundColor: iconBg || '#FEF3C7' }]}>
        <Ionicons name={icon} size={18} color={iconColor || PRIMARY} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : (
        <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
      >
        {/* Profile Header */}
        <TouchableOpacity
          style={styles.profileHeader}
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.8}
        >
          <View style={styles.avatarLarge}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarLargeText}>{getInitials()}</Text>
            )}
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={10} color="#FFF" />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Guest User'}</Text>
            <Text style={styles.profilePhone}>{user?.phone || '+92 xxx xxxxxxx'}</Text>
            <View style={styles.verifiedTag}>
              <Ionicons name="shield-checkmark" size={12} color="#10B981" />
              <Text style={styles.verifiedTagText}>Verified</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />
        </TouchableOpacity>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user?.rating?.toFixed(1) || '5.0'}</Text>
            <View style={styles.statStars}>
              <Ionicons name="star" size={12} color={PRIMARY} />
            </View>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user?.total_rides || 0}</Text>
            <Text style={styles.statLabel}>Rides</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{user?.loyalty_points || 0}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        {/* Payments Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENTS</Text>
          <View style={styles.sectionCard}>
            <MenuItem icon="wallet" label="Wallet" screen="Wallet" iconBg="#FEF3C7" iconColor={PRIMARY} />
            <View style={styles.separator} />
            <MenuItem icon="card" label="Payment Methods" screen="PaymentMethods" iconBg="#EFF6FF" iconColor="#3B82F6" />
            <View style={styles.separator} />
            <MenuItem icon="pricetag" label="Promo Codes" screen="PromoCodes" iconBg="#F0FDF4" iconColor="#10B981" />
          </View>
        </View>

        {/* Activity Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACTIVITY</Text>
          <View style={styles.sectionCard}>
            <MenuItem icon="star" label="Loyalty Rewards" screen="Loyalty" iconBg="#FFFBEB" iconColor={PRIMARY} />
            <View style={styles.separator} />
            <MenuItem icon="bookmark" label="Saved Places" screen="SavedPlaces" iconBg="#FEF3C7" iconColor="#F59E0B" />
            <View style={styles.separator} />
            <MenuItem icon="time" label="Scheduled Rides" screen="ScheduledRides" iconBg="#F0FDF4" iconColor="#10B981" />
            <View style={styles.separator} />
            <MenuItem icon="gift" label="Refer & Earn" screen="Referral" iconBg="#FDF2F8" iconColor="#EC4899" />
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          <View style={styles.sectionCard}>
            <MenuItem icon="notifications" label="Notifications" screen="Notifications" iconBg="#FEF2F2" iconColor="#EF4444" badge="3" />
            <View style={styles.separator} />
            <MenuItem icon="shield-checkmark" label="Emergency Contacts" screen="Emergency" iconBg="#F0FDF4" iconColor="#10B981" />
            <View style={styles.separator} />
            <MenuItem icon="settings" label="App Settings" screen="Settings" iconBg="#F3F4F6" iconColor="#6B7280" />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.sectionCard}>
            <MenuItem icon="help-circle" label="Help Center" screen="Support" iconBg="#EFF6FF" iconColor="#3B82F6" />
            <View style={styles.separator} />
            <MenuItem icon="book" label="FAQ" screen="FAQ" iconBg="#FEF3C7" iconColor="#F59E0B" />
            <View style={styles.separator} />
            <MenuItem icon="chatbubble" label="Contact Us" screen="Support" iconBg="#F5F3FF" iconColor="#8B5CF6" />
          </View>
        </View>

        {/* Become a Driver */}
        <TouchableOpacity
          style={styles.driverBanner}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const url = Platform.select({
              android: 'https://play.google.com/store/apps/details?id=com.shareide.fleet',
              ios: 'https://apps.apple.com/app/shareide-fleet/id000000000',
            });
            Linking.openURL(url);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.driverBannerIcon}>
            <Ionicons name="car-sport" size={24} color="#FFF" />
          </View>
          <View style={styles.driverBannerText}>
            <Text style={styles.driverBannerTitle}>Become a Driver</Text>
            <Text style={styles.driverBannerSub}>Earn money with ShareIDE Fleet</Text>
          </View>
          <Ionicons name="arrow-forward-circle" size={28} color="#FFF" />
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>ShareIDE v1.0.0</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // Profile Header
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarLarge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarLargeText: {
    fontSize: 22,
    fontWeight: '800',
    color: DARK,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 20,
  },
  editBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: DARK,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK,
  },
  profilePhone: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 22,
    fontWeight: '800',
    color: DARK,
  },
  statStars: {
    marginTop: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#F3F4F6',
  },

  // Sections
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: DARK,
  },
  badge: {
    backgroundColor: '#EF4444',
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  separator: {
    height: 1,
    backgroundColor: '#F9FAFB',
    marginLeft: 62,
  },

  // Driver Banner
  driverBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DARK,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  driverBannerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  driverBannerText: {
    flex: 1,
  },
  driverBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  driverBannerSub: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    gap: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  version: {
    fontSize: 11,
    color: '#D1D5DB',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default ProfileScreen;
