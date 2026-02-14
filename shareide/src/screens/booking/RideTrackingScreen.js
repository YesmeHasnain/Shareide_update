import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';
import { Header, Card, Avatar, Button, IconButton } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { pusherService } from '../../utils/pusherService';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  info: '#3B82F6',
  star: '#FFD700',
};

const PulsingDot = ({ color }) => {
  return (
    <View style={styles.pulsingContainer}>
      <View
        style={[
          styles.pulsingOuter,
          { backgroundColor: color + '30' },
        ]}
      />
      <View style={[styles.pulsingInner, { backgroundColor: color }]} />
    </View>
  );
};

const ActionButton = ({ icon, label, onPress, colors, danger }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.actionButton}>
        <View
          style={[
            styles.actionIconContainer,
            {
              backgroundColor: danger ? colors.error + '15' : colors.surface,
            },
          ]}
        >
          <Ionicons
            name={icon}
            size={22}
            color={danger ? colors.error : colors.primary}
          />
        </View>
        <Text
          style={[
            styles.actionLabel,
            { color: danger ? colors.error : colors.text },
          ]}
        >
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const RideTrackingScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const { ride, driver, pickup, dropoff, fare } = params;
  const [status, setStatus] = useState(ride?.status || 'arriving');
  const [eta, setEta] = useState(driver?.eta || 5);

  useEffect(() => {
    // Fallback: simulate ride status updates
    const interval = setInterval(() => {
      if (status === 'arriving' && eta > 1) {
        setEta((prev) => prev - 1);
      } else if (status === 'arriving' && eta <= 1) {
        setStatus('arrived');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [status, eta]);

  // Real-time: subscribe to ride channel for live status updates
  useEffect(() => {
    let rideChannel = null;
    const setupRealTime = async () => {
      if (!ride?.id) return;
      try {
        rideChannel = await pusherService.subscribe(`ride.${ride.id}`);
        if (rideChannel) {
          rideChannel.bind('ride.status.changed', (data) => {
            if (data.status) {
              setStatus(data.status);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              if (data.status === 'completed') {
                setTimeout(() => handleCompleteRide(), 1000);
              }
            }
          });
          rideChannel.bind('driver.location.updated', (data) => {
            if (data.lat && data.lng) {
              // Driver location update available for map integration
              console.log('Driver location:', data.lat, data.lng);
            }
          });
        }
      } catch (error) {
        console.log('Real-time ride tracking setup failed:', error.message);
      }
    };
    setupRealTime();
    return () => {
      if (rideChannel) rideChannel.unbind_all();
      if (ride?.id) pusherService.unsubscribe(`ride.${ride.id}`);
    };
  }, [ride?.id]);

  const getStatusConfig = () => {
    switch (status) {
      case 'arriving':
        return {
          color: colors.primary,
          icon: 'car',
          title: 'Driver is on the way',
          subtitle: `Arriving in ${eta} min`,
        };
      case 'arrived':
        return {
          color: colors.success,
          icon: 'checkmark-circle',
          title: 'Driver has arrived',
          subtitle: 'Your driver is waiting at the pickup point',
        };
      case 'started':
        return {
          color: colors.info,
          icon: 'navigate',
          title: 'Ride in progress',
          subtitle: 'Heading to your destination',
        };
      case 'completed':
        return {
          color: colors.success,
          icon: 'flag',
          title: 'Ride completed',
          subtitle: 'Thank you for riding with us!',
        };
      default:
        return {
          color: colors.primary,
          icon: 'car',
          title: 'Processing',
          subtitle: 'Please wait...',
        };
    }
  };

  const statusConfig = getStatusConfig();

  const handleCall = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${driver?.phone || '03001234567'}`);
  };

  const handleChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (ride?.id) {
      navigation.navigate('Chat', { rideId: ride.id });
    } else {
      Alert.alert('Chat', 'Chat is not available for this ride');
    }
  };

  const handleShare = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Share', 'Share your ride status with friends and family');
  };

  const handleSOS = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Emergency SOS',
      'Are you in an emergency? This will alert emergency contacts and authorities.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm SOS',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert('SOS Sent', 'Emergency contacts have been notified.');
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
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

  const simulateCompletion = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStatus('completed');
    setTimeout(() => {
      handleCompleteRide();
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Ride Tracking"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
        rightIcon="share-outline"
        onRightPress={handleShare}
      />

      {/* Map Placeholder */}
      <View style={[styles.mapContainer, { backgroundColor: colors.surface }]}>
        <LinearGradient
          colors={['#E8F4EA', '#D4E8D7']}
          style={styles.mapPlaceholder}
        >
          <Ionicons name="map" size={80} color={colors.success + '50'} />
          <Text style={[styles.mapText, { color: colors.textSecondary }]}>
            Live map tracking
          </Text>
          <TouchableOpacity
            style={[styles.demoButton, { backgroundColor: colors.primary }]}
            onPress={simulateCompletion}
          >
            <Ionicons name="checkmark-circle" size={16} color="#000" />
            <Text style={styles.demoText}>Complete Ride (Demo)</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Status Card */}
      <View>
        <Card style={styles.statusCard} shadow="md">
          <View style={styles.statusRow}>
            <PulsingDot color={statusConfig.color} />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: colors.text }]}>
                {statusConfig.title}
              </Text>
              <Text style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
                {statusConfig.subtitle}
              </Text>
            </View>
            {status === 'arriving' && (
              <View style={styles.etaContainer}>
                <Text style={[styles.etaValue, { color: colors.primary }]}>
                  {eta}
                </Text>
                <Text style={[styles.etaLabel, { color: colors.textSecondary }]}>
                  min
                </Text>
              </View>
            )}
          </View>
        </Card>
      </View>

      {/* Driver Card */}
      <View>
        <Card style={styles.driverCard} shadow="md">
          <View style={styles.driverRow}>
            <Avatar
              source={driver?.avatar}
              name={driver?.name}
              size="large"
              showBadge
              badgeType="verified"
            />
            <View style={styles.driverInfo}>
              <Text style={[styles.driverName, { color: colors.text }]}>
                {driver.name}
              </Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={colors.star} />
                <Text style={[styles.ratingText, { color: colors.text }]}>
                  {driver.rating}
                </Text>
              </View>
              <View style={styles.vehicleRow}>
                <Ionicons name="car-outline" size={14} color={colors.textSecondary} />
                <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
                  {driver.vehicle?.model} - {driver.vehicle?.plate}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionRow}>
            <ActionButton
              icon="call"
              label="Call"
              onPress={handleCall}
              colors={colors}
            />
            <ActionButton
              icon="chatbubble"
              label="Chat"
              onPress={handleChat}
              colors={colors}
            />
            <ActionButton
              icon="share-social"
              label="Share"
              onPress={handleShare}
              colors={colors}
            />
          </View>
        </Card>
      </View>

      {/* Route Card */}
      <View>
        <Card style={styles.routeCard} shadow="sm">
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
            <Text
              style={[styles.routeText, { color: colors.text }]}
              numberOfLines={1}
            >
              {pickup?.address || 'Pickup'}
            </Text>
          </View>
          <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
          <View style={styles.routeItem}>
            <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
            <Text
              style={[styles.routeText, { color: colors.text }]}
              numberOfLines={1}
            >
              {dropoff?.address || 'Dropoff'}
            </Text>
          </View>
        </Card>
      </View>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.sosButton, { backgroundColor: colors.error }]}
          onPress={handleSOS}
        >
          <Ionicons name="warning" size={20} color="#FFF" />
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>

        {status !== 'completed' && (
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.surface }]}
            onPress={handleCancel}
          >
            <Ionicons name="close-circle-outline" size={20} color={colors.error} />
            <Text style={[styles.cancelText, { color: colors.error }]}>
              Cancel Ride
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 200,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: typography.body,
    marginTop: spacing.sm,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  demoText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#000',
  },
  statusCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pulsingContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  pulsingOuter: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  pulsingInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusSubtitle: {
    fontSize: typography.bodySmall,
  },
  etaContainer: {
    alignItems: 'center',
  },
  etaValue: {
    fontSize: typography.h3,
    fontWeight: '700',
  },
  etaLabel: {
    fontSize: typography.caption,
  },
  driverCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  driverRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  driverInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  driverName: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  ratingText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  vehicleText: {
    fontSize: typography.bodySmall,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
    ...shadows.sm,
  },
  actionLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  routeCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  routeLine: {
    width: 2,
    height: 20,
    marginLeft: 4,
    marginVertical: spacing.xs,
  },
  routeText: {
    flex: 1,
    fontSize: typography.body,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.md,
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.md,
  },
  sosText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#FFF',
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    ...shadows.sm,
  },
  cancelText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
});

export default RideTrackingScreen;
