import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const SettingsScreen = ({ navigation }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const [settings, setSettings] = useState({
    locationServices: true,
    faceId: false,
    autoTopup: false,
    rideSharing: true,
    soundEffects: true,
    vibration: true,
  });

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deleted', 'Your account has been scheduled for deletion.', [
              { text: 'OK', onPress: logout }
            ]);
          },
        },
      ]
    );
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        { icon: '🔑', label: 'Change Password', type: 'link' },
        { icon: '🔐', label: 'Two-Factor Auth', type: 'link' },
        { icon: '📱', label: 'Face ID / Fingerprint', key: 'faceId', type: 'toggle' },
      ],
    },
    {
      title: 'Privacy',
      items: [
        { icon: '📍', label: 'Location Services', key: 'locationServices', type: 'toggle' },
        { icon: '👥', label: 'Ride Sharing', key: 'rideSharing', type: 'toggle', desc: 'Share rides with others' },
        { icon: '📊', label: 'Analytics', type: 'link' },
      ],
    },
    {
      title: 'Payments',
      items: [
        { icon: '💳', label: 'Payment Methods', type: 'link', screen: 'PaymentMethods' },
        { icon: '🔄', label: 'Auto Top-up', key: 'autoTopup', type: 'toggle' },
        { icon: '🧾', label: 'Receipts', type: 'link' },
      ],
    },
    {
      title: 'Appearance',
      items: [
        { icon: isDark ? '☀️' : '🌙', label: isDark ? 'Light Mode' : 'Dark Mode', type: 'toggle', value: isDark, action: toggleTheme },
        { icon: '🌐', label: 'Language', type: 'value', value: 'English' },
        { icon: '💱', label: 'Currency', type: 'value', value: 'PKR' },
      ],
    },
    {
      title: 'Sounds',
      items: [
        { icon: '🔊', label: 'Sound Effects', key: 'soundEffects', type: 'toggle' },
        { icon: '📳', label: 'Vibration', key: 'vibration', type: 'toggle' },
      ],
    },
  ];

  const renderItem = (item) => {
    if (item.type === 'toggle') {
      const value = item.value !== undefined ? item.value : settings[item.key];
      const onToggle = item.action || (() => toggleSetting(item.key));

      return (
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>{item.icon}</Text>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
              {item.desc && <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>{item.desc}</Text>}
            </View>
          </View>
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      );
    }

    if (item.type === 'value') {
      return (
        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>{item.icon}</Text>
            <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{item.value}</Text>
            <Text style={[styles.settingArrow, { color: colors.textSecondary }]}>›</Text>
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={styles.settingItem}
        onPress={() => item.screen && navigation.navigate(item.screen)}
      >
        <View style={styles.settingLeft}>
          <Text style={styles.settingIcon}>{item.icon}</Text>
          <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
        </View>
        <Text style={[styles.settingArrow, { color: colors.textSecondary }]}>›</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>{section.title}</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
              {section.items.map((item, itemIndex) => (
                <View
                  key={itemIndex}
                  style={[
                    itemIndex !== section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                  ]}
                >
                  {renderItem(item)}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Danger Zone</Text>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
              <Text style={styles.dangerIcon}>⚠️</Text>
              <Text style={styles.dangerLabel}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            Shareide v1.0.0 (Build 100)
          </Text>
          <Text style={[styles.copyrightText, { color: colors.textSecondary }]}>
            © 2026 Shareide. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backIcon: { fontSize: 28, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1,
  },
  sectionCard: { borderRadius: 16, overflow: 'hidden' },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingIcon: { fontSize: 20, marginRight: 14, width: 28 },
  settingLabel: { fontSize: 15 },
  settingDesc: { fontSize: 12, marginTop: 2 },
  settingRight: { flexDirection: 'row', alignItems: 'center' },
  settingValue: { fontSize: 14, marginRight: 8 },
  settingArrow: { fontSize: 22 },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  dangerIcon: { fontSize: 20, marginRight: 14 },
  dangerLabel: { fontSize: 15, color: '#ef4444', fontWeight: '500' },
  footer: { alignItems: 'center', paddingVertical: 32, paddingBottom: 48 },
  versionText: { fontSize: 14, marginBottom: 4 },
  copyrightText: { fontSize: 12 },
});

export default SettingsScreen;
