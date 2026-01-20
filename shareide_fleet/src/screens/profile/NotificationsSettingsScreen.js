import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';

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
        { key: 'push', label: 'Push Notifications', icon: '🔔', desc: 'Receive push notifications' },
        { key: 'sound', label: 'Sound', icon: '🔊', desc: 'Play sound for notifications' },
        { key: 'vibration', label: 'Vibration', icon: '📳', desc: 'Vibrate for notifications' },
      ],
    },
    {
      title: 'Ride Notifications',
      items: [
        { key: 'rideRequests', label: 'Ride Requests', icon: '🚗', desc: 'New ride request alerts' },
        { key: 'rideUpdates', label: 'Ride Updates', icon: '📍', desc: 'Status changes during rides' },
      ],
    },
    {
      title: 'Other',
      items: [
        { key: 'earnings', label: 'Earnings', icon: '💰', desc: 'Payment and earnings updates' },
        { key: 'promotions', label: 'Promotions', icon: '🎁', desc: 'Special offers and bonuses' },
        { key: 'news', label: 'News & Updates', icon: '📰', desc: 'App updates and news' },
      ],
    },
    {
      title: 'Quiet Hours',
      items: [
        { key: 'quietHours', label: 'Enable Quiet Hours', icon: '🌙', desc: 'Mute notifications during sleep' },
      ],
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {settingSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              {section.title}
            </Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
              {section.items.map((item, index) => (
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
                    <Text style={styles.settingIcon}>{item.icon}</Text>
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
              ))}
            </View>
          </View>
        ))}

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Important ride request notifications will always be sent regardless of these settings.
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backIcon: {
    fontSize: 28,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 14,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 12,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default NotificationsSettingsScreen;
