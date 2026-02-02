import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const NotificationsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    push: true,
    email: false,
    sms: true,
    promotions: true,
    rideUpdates: true,
    payments: true,
  });

  useEffect(() => {
    // Notifications will be fetched from API
    // Empty by default - real data only
    setNotifications([]);
  }, []);

  const toggleSetting = (key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const markAsRead = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Clear All', 'Are you sure you want to clear all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setNotifications([]);
        },
      },
    ]);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ride':
        return { name: 'car', color: colors.primary };
      case 'payment':
        return { name: 'wallet', color: colors.success };
      case 'promo':
        return { name: 'gift', color: colors.warning };
      default:
        return { name: 'notifications', color: colors.primary };
    }
  };

  const settingsItems = [
    { key: 'push', label: 'Push Notifications', icon: 'notifications' },
    { key: 'email', label: 'Email Notifications', icon: 'mail' },
    { key: 'sms', label: 'SMS Notifications', icon: 'chatbubble' },
    { key: 'rideUpdates', label: 'Ride Updates', icon: 'car' },
    { key: 'payments', label: 'Payment Alerts', icon: 'card' },
    { key: 'promotions', label: 'Promotions & Offers', icon: 'gift' },
  ];

  const renderNotification = ({ item, index }) => {
    const iconInfo = getIcon(item.type);

    return (
      <View >
        <TouchableOpacity
          style={[
            styles.notificationCard,
            { backgroundColor: item.read ? colors.surface : colors.primary + '15' },
            shadows.sm,
          ]}
          onPress={() => markAsRead(item.id)}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: iconInfo.color + '20' },
            ]}
          >
            <Ionicons name={iconInfo.name} size={22} color={iconInfo.color} />
          </View>
          <View style={styles.notificationContent}>
            <View style={styles.notificationHeader}>
              <Text
                style={[
                  styles.notificationTitle,
                  { color: colors.text },
                  !item.read && { fontWeight: '700' },
                ]}
              >
                {item.title}
              </Text>
              {!item.read && (
                <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
              )}
            </View>
            <Text
              style={[styles.notificationMessage, { color: colors.textSecondary }]}
              numberOfLines={2}
            >
              {item.message}
            </Text>
            <Text style={[styles.notificationTime, { color: colors.textTertiary }]}>
              {item.time}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>
    );
  };

  const ListHeader = () => (
    <View
            style={[styles.settingsSection, { backgroundColor: colors.surface }, shadows.sm]}
    >
      <View style={styles.settingsHeader}>
        <View style={[styles.settingsIconContainer, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons name="settings" size={18} color={colors.primary} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Notification Settings
        </Text>
      </View>
      {settingsItems.map((item, index) => (
        <View
          key={item.key}
          style={[
            styles.settingItem,
            index !== settingsItems.length - 1 && {
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.settingIconContainer, { backgroundColor: colors.primary + '10' }]}>
              <Ionicons name={item.icon} size={16} color={colors.primary} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {item.label}
            </Text>
          </View>
          <Switch
            value={settings[item.key]}
            onValueChange={() => toggleSetting(item.key)}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
            ios_backgroundColor={colors.border}
          />
        </View>
      ))}
    </View>
  );

  const ListEmpty = () => (
    <View
            style={styles.emptyState}
    >
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}>
        <Ionicons name="notifications-off" size={48} color={colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        No Notifications
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        When you get notifications, they'll appear here
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearAll}
          disabled={notifications.length === 0}
        >
          <Text
            style={[
              styles.clearText,
              notifications.length === 0 && { opacity: 0.5 },
            ]}
          >
            Clear
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <ListHeader />
            {notifications.length > 0 && (
              <View
                                style={styles.notificationsHeader}
              >
                <View style={[styles.settingsIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="mail" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                  RECENT NOTIFICATIONS
                </Text>
                <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>
                    {notifications.filter((n) => !n.read).length}
                  </Text>
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={<ListEmpty />}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#000',
  },
  clearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  clearText: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#000',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  settingsSection: {
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  settingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingsIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  settingIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '500',
  },
  notificationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  sectionLabel: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
    flex: 1,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: '700',
    color: '#000',
  },
  notificationCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: spacing.sm,
  },
  notificationMessage: {
    fontSize: typography.caption,
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: typography.caption,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
