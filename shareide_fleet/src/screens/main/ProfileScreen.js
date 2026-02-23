import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  StatusBar,
  Switch,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { defaultMaleAvatar, defaultFemaleAvatar } from '../../utils/avatars';

const PRIMARY = '#FCC014';

const MenuItem = ({ icon, title, subtitle, value, onPress, showArrow = true, colors, isDark, isSwitch, danger }) => {
  const iconColor = danger ? '#EF4444' : PRIMARY;
  const bgColor = danger ? '#EF444412' : `${PRIMARY}12`;

  if (isSwitch) {
    return (
      <View style={[styles.menuItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}>
        <View style={styles.menuLeft}>
          <View style={[styles.menuIconBg, { backgroundColor: bgColor }]}>
            <Ionicons name={icon} size={18} color={iconColor} />
          </View>
          <View>
            <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
            {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: isDark ? '#333' : '#E5E7EB', true: PRIMARY + '60' }}
          thumbColor={value ? PRIMARY : isDark ? '#666' : '#D1D5DB'}
          style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] } : {}}
        />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }]}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.menuIconBg, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={18} color={iconColor} />
        </View>
        <View>
          <Text style={[styles.menuTitle, { color: danger ? '#EF4444' : colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.menuSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      {value !== undefined ? (
        <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{value}</Text>
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={18} color={isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB'} />
      ) : null}
    </TouchableOpacity>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const scrollY = useRef(new Animated.Value(0)).current;

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            logout();
          },
        },
      ]
    );
  };

  const handleMenuPress = (screen) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (screen) navigation.navigate(screen);
  };

  const handleLanguagePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Select Language', 'Choose your preferred language', [
      { text: 'English', onPress: () => Alert.alert('Language', 'Language set to English') },
      { text: 'Urdu', onPress: () => Alert.alert('Language', 'Language set to Urdu') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A14' : '#F5F5F5' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Profile Header */}
        <LinearGradient
          colors={isDark ? ['#1A1A2E', '#0A0A14'] : ['#1A1A2E', '#2D2D4E']}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarOuter}>
              {user?.profile_picture ? (
                <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
              ) : (
                <Image
                  source={user?.gender === 'female' ? defaultFemaleAvatar : defaultMaleAvatar}
                  style={styles.avatar}
                />
              )}
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#000" />
              </View>
            </View>

            <View style={styles.nameSection}>
              <Text style={styles.userName}>
                {user?.first_name} {user?.last_name}
              </Text>
              <Text style={styles.userPhone}>{user?.phone || 'Driver'}</Text>
            </View>

            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => handleMenuPress('EditProfile')}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={18} color={PRIMARY} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.driver?.rating?.toFixed(1) || '5.0'}</Text>
              <View style={styles.statLabelRow}>
                <Ionicons name="star" size={12} color={PRIMARY} />
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.driver?.total_rides || 0}</Text>
              <View style={styles.statLabelRow}>
                <Ionicons name="car" size={12} color="#3B82F6" />
                <Text style={styles.statLabel}>Rides</Text>
              </View>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{user?.driver?.years_exp || '1'}y</Text>
              <View style={styles.statLabelRow}>
                <Ionicons name="time" size={12} color="#10B981" />
                <Text style={styles.statLabel}>Experience</Text>
              </View>
            </View>
          </View>

          {/* Vehicle Card */}
          {user?.driver && (
            <TouchableOpacity
              style={styles.vehicleCard}
              onPress={() => handleMenuPress('VehicleDetails')}
              activeOpacity={0.7}
            >
              <View style={styles.vehicleIconBg}>
                <Ionicons name="car-sport" size={24} color={PRIMARY} />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleModel}>
                  {user.driver.vehicle_model || 'Add Vehicle'}
                </Text>
                <Text style={styles.vehiclePlate}>
                  {user.driver.plate_number || 'No plate'} {user.driver.vehicle_color ? `- ${user.driver.vehicle_color}` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>
          )}
        </LinearGradient>

        {/* Menu Sections */}
        <View style={styles.menuSections}>
          {/* Account */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF' }]}>ACCOUNT</Text>
          </View>
          <View style={[styles.menuCard, { backgroundColor: isDark ? '#14142B' : '#FFF' }]}>
            <MenuItem icon="person" title="Personal Info" onPress={() => handleMenuPress('EditProfile')} colors={colors} isDark={isDark} />
            <MenuItem icon="wallet" title="Earnings" subtitle="Track your income" onPress={() => handleMenuPress('Earnings')} colors={colors} isDark={isDark} />
            <MenuItem icon="time" title="Ride History" onPress={() => handleMenuPress('RideHistory')} colors={colors} isDark={isDark} />
            <MenuItem icon="star" title="Ratings & Reviews" onPress={() => handleMenuPress('Ratings')} colors={colors} isDark={isDark} />
            <MenuItem icon="gift" title="Loyalty Rewards" onPress={() => handleMenuPress('Loyalty')} colors={colors} isDark={isDark} />
          </View>

          {/* Settings */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF' }]}>SETTINGS</Text>
          </View>
          <View style={[styles.menuCard, { backgroundColor: isDark ? '#14142B' : '#FFF' }]}>
            <MenuItem icon="notifications" title="Notifications" onPress={() => handleMenuPress('NotificationsSettings')} colors={colors} isDark={isDark} />
            <MenuItem icon="moon" title="Dark Mode" isSwitch value={isDark} onPress={toggleTheme} colors={colors} isDark={isDark} />
            <MenuItem icon="globe" title="Language" value="English" onPress={handleLanguagePress} colors={colors} isDark={isDark} />
          </View>

          {/* Support */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF' }]}>SUPPORT</Text>
          </View>
          <View style={[styles.menuCard, { backgroundColor: isDark ? '#14142B' : '#FFF' }]}>
            <MenuItem icon="help-circle" title="Help & Support" onPress={() => handleMenuPress('Support')} colors={colors} isDark={isDark} />
            <MenuItem icon="book" title="FAQ" onPress={() => handleMenuPress('DriverFAQ')} colors={colors} isDark={isDark} />
            <MenuItem icon="document-text" title="Terms & Conditions" onPress={() => handleMenuPress('Support')} colors={colors} isDark={isDark} />
            <MenuItem icon="shield-checkmark" title="Privacy Policy" onPress={() => handleMenuPress('Support')} colors={colors} isDark={isDark} />
          </View>

          {/* Logout */}
          <TouchableOpacity
            style={[styles.logoutBtn, { borderColor: isDark ? '#EF444430' : '#EF444420' }]}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          {/* Version */}
          <Text style={[styles.version, { color: isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB' }]}>
            Shareide Fleet v1.0.0
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarOuter: {
    position: 'relative',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A1A2E',
  },
  nameSection: {
    flex: 1,
    marginLeft: 14,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  userPhone: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(252,192,20,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },
  statLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  // Vehicle Card
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    padding: 14,
  },
  vehicleIconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(252,192,20,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleModel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
  vehiclePlate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },

  // Menu Sections
  menuSections: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    paddingHorizontal: 4,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  // Menu Item
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    marginTop: 1,
  },
  menuValue: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },

  // Version
  version: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default ProfileScreen;
