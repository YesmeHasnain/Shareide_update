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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { defaultMaleAvatar, defaultFemaleAvatar } from '../../utils/avatars';
import { typography, spacing, borderRadius, shadows } from '../../theme/colors';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// Icon color map for colored backgrounds
const ICON_TINTS = {
  'person': { bg: '#3B82F615', color: '#3B82F6' },
  'car': { bg: '#8B5CF615', color: '#8B5CF6' },
  'wallet': { bg: '#10B98115', color: '#10B981' },
  'time': { bg: '#F59E0B15', color: '#F59E0B' },
  'star': { bg: '#FCC01415', color: '#FCC014' },
  'gift': { bg: '#EC489915', color: '#EC4899' },
  'notifications': { bg: '#EF444415', color: '#EF4444' },
  'moon': { bg: '#6366F115', color: '#6366F1' },
  'globe': { bg: '#14B8A615', color: '#14B8A6' },
  'help-circle': { bg: '#3B82F615', color: '#3B82F6' },
  'document-text': { bg: '#6B728015', color: '#6B7280' },
  'shield-checkmark': { bg: '#10B98115', color: '#10B981' },
};

const MenuItem = ({ icon, title, value, onPress, showArrow = true, colors, index }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const tint = ICON_TINTS[icon] || { bg: colors.inputBackground, color: colors.textSecondary };

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 6,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  if (typeof value === 'boolean') {
    return (
      <Animated.View
        style={[
          styles.menuItem,
          {
            opacity: slideAnim,
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.menuItemLeft}>
          <View style={[styles.menuIconContainer, { backgroundColor: tint.bg }]}>
            <Ionicons name={icon} size={20} color={tint.color} />
          </View>
          <Text style={[styles.menuItemTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <Switch
          value={value}
          onValueChange={onPress}
          trackColor={{ false: colors.border, true: colors.primary + '50' }}
          thumbColor={value ? colors.primary : colors.textTertiary}
        />
      </Animated.View>
    );
  }

  return (
    <AnimatedTouchable
      style={[
        styles.menuItem,
        {
          opacity: slideAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: tint.bg }]}>
          <Ionicons name={icon} size={20} color={tint.color} />
        </View>
        <Text style={[styles.menuItemTitle, { color: colors.text }]}>{title}</Text>
      </View>
      {value !== undefined ? (
        <Text style={[styles.menuItemValue, { color: colors.textSecondary }]}>{value}</Text>
      ) : showArrow ? (
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      ) : null}
    </AnimatedTouchable>
  );
};

const VerifiedItem = ({ label, colors, index }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 6,
      delay: index * 80,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.verifiedItem,
        {
          opacity: slideAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={[styles.verifiedIcon, { backgroundColor: '#10B98118' }]}>
        <Ionicons name="checkmark" size={14} color="#10B981" />
      </View>
      <Text style={[styles.verifiedLabel, { color: colors.text }]}>{label}</Text>
    </Animated.View>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const logoutAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.stagger(
        80,
        cardAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          })
        )
      ),
      Animated.spring(logoutAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
    if (screen) {
      navigation.navigate(screen);
    }
  };

  const handleLanguagePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Select Language', 'Choose your preferred language', [
      { text: 'English', onPress: () => Alert.alert('Language', 'Language set to English') },
      { text: 'اردو (Urdu)', onPress: () => Alert.alert('زبان', 'زبان اردو میں تبدیل ہو گئی') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'light-content'} backgroundColor={colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Dark Gradient Header */}
        <Animated.View
          style={[
            styles.profileHeader,
            { paddingTop: insets.top + 20 },
            {
              opacity: headerAnim,
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.profileHeaderTitle}>PROFILE</Text>

          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {user?.profile_picture ? (
                <Image source={{ uri: user.profile_picture }} style={styles.avatarImage} />
              ) : (
                <Image
                  source={user?.gender === 'female' ? defaultFemaleAvatar : defaultMaleAvatar}
                  style={styles.avatarImage}
                />
              )}
            </View>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={14} color="#000" />
            </View>
          </View>

          <Text style={styles.profileName}>
            {user?.first_name} {user?.last_name}
          </Text>

          {/* Stats Row */}
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <View style={styles.profileStatValueRow}>
                <Text style={styles.profileStatNumber}>
                  {user?.driver?.rating?.toFixed(1) || '5.0'}
                </Text>
                <Ionicons name="star" size={16} color="#FCC014" />
              </View>
              <Text style={styles.profileStatLabel}>Rating</Text>
            </View>

            <View style={styles.profileStatDivider} />

            <View style={styles.profileStat}>
              <Text style={styles.profileStatNumber}>
                {user?.driver?.total_rides || 0}
              </Text>
              <Text style={styles.profileStatLabel}>Rides</Text>
            </View>
          </View>
        </Animated.View>

        {/* Profile Details Card */}
        <AnimatedCard animValue={cardAnims[0]} colors={colors}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Verified Details</Text>
          <View style={styles.verifiedList}>
            <VerifiedItem label="Verified driver" colors={colors} index={0} />
            <VerifiedItem label="Verified phone number" colors={colors} index={1} />
            <VerifiedItem label="Verified Driver's Licence" colors={colors} index={2} />
            <VerifiedItem label="Member since 2024" colors={colors} index={3} />
          </View>
        </AnimatedCard>

        {/* Vehicle Details Card */}
        {user?.driver && (
          <AnimatedCard animValue={cardAnims[1]} colors={colors}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Vehicle Details</Text>
            <View style={styles.vehicleInfo}>
              <View style={[styles.vehiclePlaceholder, { backgroundColor: colors.inputBackground }]}>
                <Ionicons name="car" size={32} color={colors.textTertiary} />
              </View>
              <View style={styles.vehicleDetails}>
                <Text style={[styles.vehicleModel, { color: colors.text }]}>
                  {user.driver.vehicle_model || 'Add Vehicle'}
                </Text>
                <Text style={[styles.vehiclePlate, { color: colors.textSecondary }]}>
                  {user.driver.plate_number || 'No plate'}
                </Text>
                <Text style={[styles.vehicleMeta, { color: colors.textTertiary }]}>
                  {user.driver.vehicle_type || 'Car'} • {user.driver.seats || 4} seats
                </Text>
              </View>
            </View>
          </AnimatedCard>
        )}

        {/* Account Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>ACCOUNT</Text>
        </View>
        <AnimatedCard animValue={cardAnims[2]} colors={colors}>
          <MenuItem
            icon="person"
            title="Personal Information"
            onPress={() => handleMenuPress('EditProfile')}
            colors={colors}
            index={0}
          />
          <MenuItem
            icon="car"
            title="Vehicle Details"
            onPress={() => handleMenuPress('VehicleDetails')}
            colors={colors}
            index={1}
          />
          <MenuItem
            icon="wallet"
            title="Earnings"
            onPress={() => handleMenuPress('Earnings')}
            colors={colors}
            index={2}
          />
          <MenuItem
            icon="time"
            title="Ride History"
            onPress={() => handleMenuPress('RideHistory')}
            colors={colors}
            index={3}
          />
          <MenuItem
            icon="star"
            title="Ratings & Reviews"
            onPress={() => handleMenuPress('Ratings')}
            colors={colors}
            index={4}
          />
          <MenuItem
            icon="gift"
            title="Loyalty Rewards"
            onPress={() => handleMenuPress('Loyalty')}
            colors={colors}
            index={5}
          />
        </AnimatedCard>

        {/* Settings Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>SETTINGS</Text>
        </View>
        <AnimatedCard animValue={cardAnims[3]} colors={colors}>
          <MenuItem
            icon="notifications"
            title="Notifications"
            onPress={() => handleMenuPress('NotificationsSettings')}
            colors={colors}
            index={0}
          />
          <MenuItem
            icon="moon"
            title="Dark Mode"
            value={isDark}
            onPress={toggleTheme}
            colors={colors}
            index={1}
          />
          <MenuItem
            icon="globe"
            title="Language"
            value="English"
            onPress={handleLanguagePress}
            colors={colors}
            index={2}
          />
        </AnimatedCard>

        {/* Support Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>SUPPORT</Text>
        </View>
        <AnimatedCard animValue={cardAnims[4]} colors={colors}>
          <MenuItem
            icon="help-circle"
            title="Help & Support"
            onPress={() => handleMenuPress('Support')}
            colors={colors}
            index={0}
          />
          <MenuItem
            icon="book"
            title="FAQ"
            onPress={() => handleMenuPress('DriverFAQ')}
            colors={colors}
            index={1}
          />
          <MenuItem
            icon="document-text"
            title="Terms & Conditions"
            onPress={() => handleMenuPress('Support')}
            colors={colors}
            index={2}
          />
          <MenuItem
            icon="shield-checkmark"
            title="Privacy Policy"
            onPress={() => handleMenuPress('Support')}
            colors={colors}
            index={3}
          />
        </AnimatedCard>

        {/* Logout Button */}
        <LogoutButton
          colors={colors}
          animValue={logoutAnim}
          onPress={handleLogout}
        />

        {/* Version */}
        <Animated.Text
          style={[
            styles.versionText,
            { color: colors.textTertiary },
            { opacity: logoutAnim },
          ]}
        >
          Shareide Fleet v1.0.0
        </Animated.Text>
      </ScrollView>
    </View>
  );
};

// Animated Card Component
const AnimatedCard = ({ children, animValue, colors }) => (
  <Animated.View
    style={[
      styles.card,
      { backgroundColor: colors.card },
      shadows.sm,
      {
        opacity: animValue,
        transform: [
          {
            translateY: animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0],
            }),
          },
        ],
      },
    ]}
  >
    {children}
  </Animated.View>
);

// Logout Button Component
const LogoutButton = ({ colors, animValue, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <AnimatedTouchable
      style={[
        styles.logoutButton,
        { borderColor: colors.error },
        {
          opacity: animValue,
          transform: [
            { scale: scaleAnim },
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Ionicons name="log-out" size={20} color={colors.error} />
      <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Dark gradient profile header
  profileHeader: {
    backgroundColor: '#1A1A2E', // kept dark for branded header
    paddingBottom: 28,
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  profileHeaderTitle: {
    fontSize: typography.h5,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FCC014',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1A1A2E', // matches dark header bg
  },
  profileName: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxl,
  },
  profileStat: {
    alignItems: 'center',
  },
  profileStatValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  profileStatNumber: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileStatLabel: {
    fontSize: typography.caption,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  profileStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  // Section headers
  sectionHeader: {
    paddingHorizontal: spacing.lg + spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sectionHeaderText: {
    fontSize: typography.caption,
    fontWeight: '600',
    letterSpacing: 1,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  cardTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  verifiedList: {
    gap: spacing.md,
  },
  verifiedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  verifiedIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedLabel: {
    fontSize: typography.body,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  vehiclePlaceholder: {
    width: 80,
    height: 60,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleDetails: {
    flex: 1,
  },
  vehicleModel: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  vehiclePlate: {
    fontSize: typography.bodySmall,
    marginTop: 2,
  },
  vehicleMeta: {
    fontSize: typography.caption,
    marginTop: 2,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemTitle: {
    fontSize: typography.body,
  },
  menuItemValue: {
    fontSize: typography.bodySmall,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  versionText: {
    fontSize: typography.caption,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default ProfileScreen;
