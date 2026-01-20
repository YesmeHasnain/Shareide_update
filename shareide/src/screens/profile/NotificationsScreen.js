import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Switch, Alert } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const NotificationsScreen = ({ navigation }) => {
  const { colors } = useTheme();
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
    // Mock notifications
    setNotifications([
      { id: 1, title: 'Ride Completed', message: 'Your ride to Clifton has been completed. Total fare: Rs. 350', time: '2 hours ago', read: false, type: 'ride' },
      { id: 2, title: 'Payment Received', message: 'Rs. 1000 has been added to your wallet', time: '1 day ago', read: true, type: 'payment' },
      { id: 3, title: 'Special Offer', message: 'Get 20% off on your next 3 rides! Use code RIDE20', time: '2 days ago', read: true, type: 'promo' },
      { id: 4, title: 'Rate Your Ride', message: 'How was your ride with Ahmed Khan?', time: '3 days ago', read: true, type: 'ride' },
    ]);
  }, []);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const clearAll = () => {
    Alert.alert('Clear All', 'Are you sure you want to clear all notifications?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => setNotifications([]) },
    ]);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'ride': return '🚗';
      case 'payment': return '💰';
      case 'promo': return '🎉';
      default: return '🔔';
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        { backgroundColor: item.read ? colors.surface : colors.primary + '20' }
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.surface }]}>
        <Text style={styles.icon}>{getIcon(item.type)}</Text>
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={[styles.notificationTitle, { color: colors.text }]}>{item.title}</Text>
          {!item.read && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>
        <Text style={[styles.notificationMessage, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={[styles.notificationTime, { color: colors.textSecondary }]}>{item.time}</Text>
      </View>
    </TouchableOpacity>
  );

  const settingsItems = [
    { key: 'push', label: 'Push Notifications', icon: '📱' },
    { key: 'email', label: 'Email Notifications', icon: '📧' },
    { key: 'sms', label: 'SMS Notifications', icon: '💬' },
    { key: 'rideUpdates', label: 'Ride Updates', icon: '🚗' },
    { key: 'payments', label: 'Payment Alerts', icon: '💳' },
    { key: 'promotions', label: 'Promotions & Offers', icon: '🎁' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id.toString()}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={[styles.settingsSection, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Settings</Text>
            {settingsItems.map((item) => (
              <View key={item.key} style={[styles.settingItem, { borderBottomColor: colors.border }]}>
                <View style={styles.settingLeft}>
                  <Text style={styles.settingIcon}>{item.icon}</Text>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>{item.label}</Text>
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
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔔</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No notifications yet</Text>
          </View>
        }
      />
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
  clearText: { fontSize: 14, fontWeight: '600', color: '#000' },
  listContent: { padding: 16 },
  settingsSection: { borderRadius: 16, padding: 16, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  settingLeft: { flexDirection: 'row', alignItems: 'center' },
  settingIcon: { fontSize: 20, marginRight: 12 },
  settingLabel: { fontSize: 14 },
  notificationCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: { fontSize: 24 },
  notificationContent: { flex: 1 },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: { fontSize: 14, fontWeight: 'bold', flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  notificationMessage: { fontSize: 13, marginBottom: 4 },
  notificationTime: { fontSize: 11 },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 12 },
  emptyText: { fontSize: 16 },
});

export default NotificationsScreen;
