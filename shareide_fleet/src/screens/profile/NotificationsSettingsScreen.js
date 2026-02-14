import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/Header';
import { spacing, typography, borderRadius } from '../../theme/colors';

const SETTING_ICONS = {
  push: { name: 'notifications', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.12)' },
  sound: { name: 'volume-high', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  vibration: { name: 'phone-portrait', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  rideRequests: { name: 'car', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  rideUpdates: { name: 'location', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  earnings: { name: 'cash', color: '#FCC014', bg: 'rgba(252, 192, 20, 0.12)' },
  promotions: { name: 'gift', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)' },
  news: { name: 'newspaper', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)' },
  quietHours: { name: 'moon', color: '#6366F1', bg: 'rgba(99, 102, 241, 0.12)' },
};

const NotificationsSettingsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [settings, setSettings] = useState({
    push: true,
    sound: true,
    vibration: true,
    rideRequests: true,
    rideUpdates: true,
    earnings: true,
    promotions: true,
    news: false,
    quietHours: false,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const settingSections = [
    {
      title: 'General',
      items: [
        { key: 'push', label: 'Push Notifications', desc: 'Receive push notifications' },
        { key: 'sound', label: 'Sound', desc: 'Play sound for notifications' },
        { key: 'vibration', label: 'Vibration', desc: 'Vibrate for notifications' },
      ],
    },
    {
      title: 'Ride Notifications',
      items: [
        { key: 'rideRequests', label: 'Ride Requests', desc: 'New ride request alerts' },
        { key: 'rideUpdates', label: 'Ride Updates', desc: 'Status changes during rides' },
      ],
    },
    {
      title: 'Other',
      items: [
        { key: 'earnings', label: 'Earnings', desc: 'Payment and earnings updates' },
        { key: 'promotions', label: 'Promotions', desc: 'Special offers and bonuses' },
        { key: 'news', label: 'News & Updates', desc: 'App updates and news' },
      ],
    },
    {
      title: 'Quiet Hours',
      items: [
        { key: 'quietHours', label: 'Enable Quiet Hours', desc: 'Mute notifications during sleep' },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Notifications" onLeftPress={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.card || colors.surface }]}>
              {section.items.map((item, index) => {
                const iconConfig = SETTING_ICONS[item.key];
                return (
                  <View
                    key={item.key}
                    style={[
                      styles.settingRow,
                      index !== section.items.length - 1 && {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.settingLeft}>
                      <View style={[styles.settingIconBg, { backgroundColor: iconConfig.bg }]}>
                        <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
                      </View>
                      <View style={styles.settingInfo}>
                        <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
                        <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                          {item.desc}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={settings[item.key]}
                      onValueChange={() => toggleSetting(item.key)}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor="#fff"
                    />
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.card || colors.surface }]}>
          <View style={[styles.infoIconBg, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
          </View>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Important ride request notifications will always be sent regardless of these settings.
          </Text>
        </View>

        <View style={{ height: spacing.xxxl + spacing.sm }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  sectionCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIconBg: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: typography.bodySmall + 1,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: typography.caption,
  },
  infoCard: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  infoIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: typography.bodySmall - 1,
    lineHeight: 18,
  },
});

export default NotificationsSettingsScreen;
