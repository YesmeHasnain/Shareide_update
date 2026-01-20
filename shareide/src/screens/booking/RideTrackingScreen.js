import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';

const RideTrackingScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { ride, driver, pickup, dropoff, fare } = route.params;
  const [status, setStatus] = useState(ride?.status || 'arriving');
  const [eta, setEta] = useState(driver?.eta || 5);

  useEffect(() => {
    // Simulate ride status updates
    const interval = setInterval(() => {
      if (status === 'arriving' && eta > 1) {
        setEta(prev => prev - 1);
      } else if (status === 'arriving' && eta <= 1) {
        setStatus('arrived');
      }
    }, 30000); // Update every 30 seconds for demo

    return () => clearInterval(interval);
  }, [status, eta]);

  const statusMessages = {
    arriving: 'Driver is on the way',
    arrived: 'Driver has arrived',
    started: 'Ride in progress',
    completed: 'Ride completed',
  };

  const handleCall = () => {
    Linking.openURL(`tel:03001234567`);
  };

  const handleChat = () => {
    Alert.alert('Chat', 'Chat feature coming soon!');
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share your ride status with friends and family');
  };

  const handleSOS = () => {
    Alert.alert(
      'Emergency SOS',
      'Are you in an emergency? This will alert emergency contacts and authorities.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm SOS',
          style: 'destructive',
          onPress: () => Alert.alert('SOS Sent', 'Emergency contacts have been notified.'),
        },
      ]
    );
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride? A cancellation fee may apply.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await ridesAPI.cancelRide(ride.id, 'User cancelled');
            } catch (error) {
              // Continue anyway for demo
            }
            navigation.reset({
              index: 0,
              routes: [{ name: 'Drawer' }],
            });
          },
        },
      ]
    );
  };

  const handleCompleteRide = () => {
    navigation.navigate('RateRide', {
      ride,
      driver,
      fare,
    });
  };

  // Simulate completion for demo
  const simulateCompletion = () => {
    setStatus('completed');
    setTimeout(() => {
      handleCompleteRide();
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Tracking</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapEmoji}>🗺️</Text>
        <Text style={[styles.mapText, { color: colors.textSecondary }]}>
          Live map tracking
        </Text>
        <TouchableOpacity
          style={[styles.demoButton, { backgroundColor: colors.primary }]}
          onPress={simulateCompletion}
        >
          <Text style={styles.demoText}>Complete Ride (Demo)</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.statusIndicator, { backgroundColor: status === 'completed' ? '#22c55e' : colors.primary }]} />
        <View style={styles.statusInfo}>
          <Text style={[styles.statusText, { color: colors.text }]}>
            {statusMessages[status]}
          </Text>
          {status === 'arriving' && (
            <Text style={[styles.etaText, { color: colors.textSecondary }]}>
              ETA: {eta} min
            </Text>
          )}
        </View>
      </View>

      <View style={[styles.driverCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.driverAvatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.driverInitial}>{driver.name?.charAt(0) || '?'}</Text>
        </View>
        <View style={styles.driverInfo}>
          <Text style={[styles.driverName, { color: colors.text }]}>{driver.name}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingStar}>⭐</Text>
            <Text style={[styles.ratingText, { color: colors.text }]}>{driver.rating}</Text>
          </View>
          <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
            {driver.vehicle?.model} • {driver.vehicle?.plate}
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.background }]}
            onPress={handleCall}
          >
            <Text style={styles.actionIcon}>📞</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.background }]}
            onPress={handleChat}
          >
            <Text style={styles.actionIcon}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.routeCard, { backgroundColor: colors.surface }]}>
        <View style={styles.routeRow}>
          <Text style={styles.dotGreen}>●</Text>
          <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
            {pickup?.address || 'Pickup'}
          </Text>
        </View>
        <View style={styles.routeLine} />
        <View style={styles.routeRow}>
          <Text style={styles.dotRed}>●</Text>
          <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
            {dropoff?.address || 'Dropoff'}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.sosButton, { backgroundColor: '#ef4444' }]}
          onPress={handleSOS}
        >
          <Text style={styles.sosIcon}>🚨</Text>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>

        {status !== 'completed' && (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.surface }]}
            onPress={handleCancel}
          >
            <Text style={[styles.cancelText, { color: colors.text }]}>Cancel Ride</Text>
          </TouchableOpacity>
        )}
      </View>
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
  shareIcon: { fontSize: 24 },
  mapPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
  },
  mapEmoji: { fontSize: 60, marginBottom: 8 },
  mapText: { fontSize: 14 },
  demoButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  demoText: { fontSize: 12, fontWeight: '600', color: '#000' },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusInfo: { flex: 1 },
  statusText: { fontSize: 16, fontWeight: 'bold' },
  etaText: { fontSize: 14, marginTop: 2 },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverInitial: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  driverInfo: { flex: 1, marginLeft: 12 },
  driverName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  ratingStar: { fontSize: 14 },
  ratingText: { fontSize: 14, fontWeight: '600', marginLeft: 4 },
  vehicleText: { fontSize: 14 },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: { fontSize: 20 },
  routeCard: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotGreen: { fontSize: 12, color: '#22c55e', marginRight: 12 },
  dotRed: { fontSize: 12, color: '#ef4444', marginRight: 12 },
  routeText: { flex: 1, fontSize: 14 },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#ddd',
    marginLeft: 4,
    marginVertical: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sosIcon: { fontSize: 18 },
  sosText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  cancelButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  cancelText: { fontSize: 16, fontWeight: '600' },
});

export default RideTrackingScreen;
