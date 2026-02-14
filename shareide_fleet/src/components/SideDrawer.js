import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.78;

const menuItems = [
  { id: 'home', icon: 'home-outline', label: 'Home', screen: null },
  { id: 'rides', icon: 'car-outline', label: 'My Rides', screen: 'RideHistory' },
  { id: 'earnings', icon: 'wallet-outline', label: 'Earnings', screen: 'Earnings' },
  { id: 'shared', icon: 'people-outline', label: 'Shared Rides', screen: 'MySharedRides' },
  { id: 'loyalty', icon: 'gift-outline', label: 'Rewards', screen: 'Loyalty' },
  { id: 'ratings', icon: 'star-outline', label: 'Ratings', screen: 'Ratings' },
  { id: 'divider1', divider: true },
  { id: 'vehicle', icon: 'car-sport-outline', label: 'Vehicle Details', screen: 'VehicleDetails' },
  { id: 'notifications', icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications' },
  { id: 'support', icon: 'help-circle-outline', label: 'Help & Support', screen: 'Support' },
  { id: 'divider2', divider: true },
  { id: 'logout', icon: 'log-out-outline', label: 'Logout', screen: 'logout', danger: true },
];

const SideDrawer = ({ visible, onClose, navigation }) => {
  const { user, logout } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(menuItems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 9,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      itemAnims.forEach((anim) => anim.setValue(0));
      Animated.stagger(
        40,
        itemAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            useNativeDriver: true,
          })
        )
      ).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handlePress = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (item.screen === 'logout') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onClose();
      logout();
      return;
    }

    if (item.screen === null) {
      onClose();
      return;
    }

    onClose();
    setTimeout(() => {
      navigation.navigate(item.screen);
    }, 300);
  };

  const getUserName = () => {
    if (user?.name) return user.name;
    if (user?.first_name) return `${user.first_name} ${user.last_name || ''}`.trim();
    return 'Captain';
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <StatusBar barStyle="light-content" />

      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          { opacity: overlayAnim },
        ]}
      >
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: DRAWER_WIDTH,
            backgroundColor: colors.drawerBackground || '#1A1A2E',
            paddingTop: insets.top,
            paddingBottom: insets.bottom + 16,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Profile Header */}
        <TouchableOpacity
          style={[styles.profileSection, { borderBottomColor: colors.drawerBorder || 'rgba(255,255,255,0.08)' }]}
          onPress={() => {
            onClose();
            setTimeout(() => navigation.navigate('Profile'), 300);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.avatarRow}>
            <Avatar
              source={user?.profile_picture}
              gender={user?.gender}
              name={getUserName()}
              size="medium"
              showBadge={true}
              badgeType="online"
              style={{ borderWidth: 2, borderColor: colors.primary, borderRadius: 28 }}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.drawerText || '#FFFFFF' }]} numberOfLines={1}>
                {getUserName()}
              </Text>
              <Text style={[styles.profilePhone, { color: colors.drawerTextMuted || 'rgba(255,255,255,0.5)' }]}>
                {user?.phone || ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.drawerTextMuted || 'rgba(255,255,255,0.4)'} />
          </View>

          {/* Earnings Widget - Yango Pro style */}
          <View style={[styles.earningsWidget, { backgroundColor: colors.drawerSurface || 'rgba(255,255,255,0.06)' }]}>
            <View style={styles.earningsMain}>
              <Text style={[styles.earningsLabel, { color: colors.drawerTextMuted || 'rgba(255,255,255,0.4)' }]}>
                Today's Earnings
              </Text>
              <Text style={[styles.earningsValue, { color: colors.primary }]}>
                Rs {user?.driver?.today_earnings || '0'}
              </Text>
            </View>
            <View style={[styles.earningsDivider, { backgroundColor: colors.drawerBorder || 'rgba(255,255,255,0.08)' }]} />
            <View style={styles.earningsStats}>
              <View style={styles.earningsStat}>
                <Text style={[styles.earningsStatValue, { color: colors.drawerText || '#FFFFFF' }]}>
                  {user?.driver?.rating?.toFixed(1) || '5.0'}
                </Text>
                <Ionicons name="star" size={10} color={colors.primary} style={{ marginLeft: 2 }} />
              </View>
              <Text style={[styles.earningsStatLabel, { color: colors.drawerTextMuted || 'rgba(255,255,255,0.4)' }]}>
                Rating
              </Text>
            </View>
            <View style={[styles.earningsDivider, { backgroundColor: colors.drawerBorder || 'rgba(255,255,255,0.08)' }]} />
            <View style={styles.earningsStats}>
              <Text style={[styles.earningsStatValue, { color: colors.drawerText || '#FFFFFF' }]}>
                {user?.driver?.total_rides || 0}
              </Text>
              <Text style={[styles.earningsStatLabel, { color: colors.drawerTextMuted || 'rgba(255,255,255,0.4)' }]}>
                Rides
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Menu Items - Scrollable */}
        <ScrollView
          style={styles.menuList}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {menuItems.map((item, index) => {
            if (item.divider) {
              return (
                <View
                  key={item.id}
                  style={[styles.divider, { backgroundColor: colors.drawerBorder || 'rgba(255,255,255,0.06)' }]}
                />
              );
            }

            return (
              <Animated.View
                key={item.id}
                style={{
                  opacity: itemAnims[index],
                  transform: [{
                    translateX: itemAnims[index].interpolate({
                      inputRange: [0, 1],
                      outputRange: [-30, 0],
                    }),
                  }],
                }}
              >
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handlePress(item)}
                  activeOpacity={0.6}
                >
                  <View style={[
                    styles.menuIconBg,
                    { backgroundColor: item.danger ? 'rgba(239,68,68,0.15)' : (colors.primaryMuted || 'rgba(252,192,20,0.12)') },
                  ]}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={item.danger ? colors.error || '#EF4444' : colors.primary}
                    />
                  </View>
                  <Text style={[
                    styles.menuLabel,
                    { color: item.danger ? (colors.error || '#EF4444') : (colors.drawerText || 'rgba(255,255,255,0.85)') },
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Dark Mode Toggle at bottom */}
        <View style={[styles.bottomSection, { borderTopColor: colors.drawerBorder || 'rgba(255,255,255,0.08)' }]}>
          <TouchableOpacity
            style={styles.darkModeRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleTheme();
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDark ? 'moon' : 'sunny-outline'}
              size={18}
              color={colors.primary}
            />
            <Text style={[styles.darkModeText, { color: colors.drawerText || 'rgba(255,255,255,0.7)' }]}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </Text>
            <View style={[
              styles.toggleTrack,
              { backgroundColor: colors.drawerSurface || 'rgba(255,255,255,0.15)' },
              isDark && { backgroundColor: (colors.primary || '#FCC014') + '40' },
            ]}>
              <View style={[
                styles.toggleThumb,
                isDark && { alignSelf: 'flex-end', backgroundColor: colors.primary },
              ]} />
            </View>
          </TouchableOpacity>

          <Text style={[styles.version, { color: colors.drawerTextMuted || 'rgba(255,255,255,0.25)' }]}>
            Shareide Fleet v1.0.0
          </Text>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.55)',
    zIndex: 100,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 101,
    shadowColor: '#000',
    shadowOffset: { width: 8, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 25,
  },

  // Profile
  profileSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 14,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
  },
  profilePhone: {
    fontSize: 13,
    marginTop: 2,
  },

  // Earnings Widget - Yango Pro inspired
  earningsWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  earningsMain: {
    flex: 1.2,
  },
  earningsLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  earningsValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  earningsDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 10,
  },
  earningsStats: {
    alignItems: 'center',
    flex: 0.6,
  },
  earningsStat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  earningsStatValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  earningsStatLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Menu
  menuList: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  menuIconBg: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 8,
    marginHorizontal: 8,
  },

  // Bottom
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  darkModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  darkModeText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  toggleTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  version: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default SideDrawer;
