import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Header, Avatar, Card, Badge, Rating, Button } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const MenuItem = ({ icon, label, onPress, colors, rightComponent, danger, index }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.menuItem}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: danger ? colors.errorLight : colors.primary + '15' }]}>
        <Ionicons name={icon} size={20} color={danger ? colors.error : colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: danger ? colors.error : colors.text }]}>
        {label}
      </Text>
      {rightComponent || (
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      )}
    </TouchableOpacity>
  );
};

const ProfileScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

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
            await logout();
          },
        },
      ]
    );
  };

  const menuSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline', label: 'Edit Profile', screen: 'EditProfile' },
        { icon: 'bookmark-outline', label: 'Saved Places', screen: 'SavedPlaces' },
        { icon: 'card-outline', label: 'Payment Methods', screen: 'PaymentMethods' },
        { icon: 'gift-outline', label: 'Promo Codes', screen: 'PromoCodes' },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'notifications-outline', label: 'Notifications', screen: 'Notifications' },
        { icon: 'settings-outline', label: 'Settings', screen: 'Settings' },
        {
          icon: isDark ? 'sunny-outline' : 'moon-outline',
          label: isDark ? 'Light Mode' : 'Dark Mode',
          action: toggleTheme,
          rightComponent: (
            <Switch
              value={isDark}
              onValueChange={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                toggleTheme();
              }}
              trackColor={{ false: colors.border, true: colors.primary + '50' }}
              thumbColor={isDark ? colors.primary : colors.textSecondary}
            />
          ),
        },
      ],
    },
    {
      title: 'Safety',
      items: [
        { icon: 'shield-checkmark-outline', label: 'Emergency Contacts', screen: 'Emergency' },
        { icon: 'alert-circle-outline', label: 'Safety Center', screen: 'Support' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline', label: 'Help & Support', screen: 'Support' },
        { icon: 'document-text-outline', label: 'Terms & Conditions', screen: 'Support' },
        { icon: 'lock-closed-outline', label: 'Privacy Policy', screen: 'Support' },
      ],
    },
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
      <Header
        title="Profile"
        leftIcon="menu"
        onLeftPress={() => {}}
        rightIcon="qr-code-outline"
        onRightPress={() => {}}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View>
          <LinearGradient
            colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.profileCard, shadows.goldLg]}
          >
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="create-outline" size={20} color="#000" />
            </TouchableOpacity>

            <Avatar
              source={user?.avatar}
              name={user?.name}
              size="xlarge"
              showBadge
              badgeType="verified"
            />

            <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
            <Text style={styles.userPhone}>{user?.phone || '+92 XXX XXXXXXX'}</Text>

            <View style={styles.ratingContainer}>
              <Rating value={user?.rating || 0} size={16} showValue />
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.total_rides || 0}</Text>
                <Text style={styles.statLabel}>Rides</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.rating?.toFixed(1) || '0.0'}</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user?.member_since || 'New'}</Text>
                <Text style={styles.statLabel}>Member</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editProfileButton}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Ionicons name="create-outline" size={18} color="#FFD700" />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Menu Sections */}
        {menuSections.map((section, sectionIndex) => (
          <View
            key={section.title}
            style={styles.menuSection}
          >
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title.toUpperCase()}
            </Text>
            <Card style={styles.menuCard} padding="none" shadow="md">
              {section.items.map((item, index) => (
                <View key={index}>
                  <MenuItem
                    icon={item.icon}
                    label={item.label}
                    onPress={() => handleMenuPress(item)}
                    colors={colors}
                    rightComponent={item.rightComponent}
                    index={index}
                  />
                  {index !== section.items.length - 1 && (
                    <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
                  )}
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: colors.errorLight }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={22} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Logout</Text>
          </TouchableOpacity>

          <Text style={[styles.versionText, { color: colors.textTertiary }]}>
            Version 1.0.0
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  profileCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  editIcon: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: typography.h3,
    fontWeight: '700',
    color: '#000',
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  userPhone: {
    fontSize: typography.body,
    color: '#00000080',
    marginBottom: spacing.md,
  },
  ratingContainer: {
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    width: '100%',
    marginBottom: spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#000',
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.caption,
    color: '#00000080',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#00000020',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  editProfileText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#FFD700',
  },
  menuSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  menuCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    marginLeft: spacing.lg + 40 + spacing.md,
  },
  logoutSection: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    width: '100%',
  },
  logoutText: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  versionText: {
    fontSize: typography.caption,
    marginTop: spacing.xl,
  },
});

export default ProfileScreen;
