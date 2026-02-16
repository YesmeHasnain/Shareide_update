import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { rideAPI } from '../../api/ride';
import { spacing, typography, borderRadius, shadows } from '../../theme/colors';

const ICON_TINTS = {
  pickup: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10B981' },
  dropoff: { bg: 'rgba(239, 68, 68, 0.12)', color: '#EF4444' },
  chat: { bg: 'rgba(59, 130, 246, 0.12)', color: '#3B82F6' },
  earnings: { bg: 'rgba(252, 192, 20, 0.12)', color: '#FCC014' },
};

const RideRequestScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { rideId } = route.params;

  const [loading, setLoading] = useState(false);
  const [ride, setRide] = useState(null);

  // Stagger animations
  const cardAnims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    fetchRideDetails();
  }, []);

  useEffect(() => {
    if (ride) {
      cardAnims.forEach((anim) => anim.setValue(0));
      Animated.stagger(
        80,
        cardAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          })
        )
      ).start();
    }
  }, [ride]);

  const fetchRideDetails = async () => {
    try {
      const response = await rideAPI.getRideDetails(rideId);
      if (response.success) {
        setRide(response.data.ride);
      }
    } catch (error) {
      console.error('Fetch ride error:', error);
      Alert.alert('Error', 'Failed to load ride details');
      navigation.goBack();
    }
  };

  const handleUpdateStatus = async (status) => {
    setLoading(true);
    try {
      const response = await rideAPI.updateRideStatus(rideId, status);
      if (response.success) {
        Alert.alert('Success', `Ride ${status}!`);
        fetchRideDetails();

        if (status === 'completed') {
          navigation.navigate('Dashboard');
        }
      }
    } catch (error) {
      console.error('Update status error:', error);
      Alert.alert('Error', 'Failed to update ride status');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Start Ride',
      'Are you sure you want to start this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => handleUpdateStatus('started') },
      ]
    );
  };

  const handleCompleteRide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Complete Ride',
      'Are you sure you want to complete this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => handleUpdateStatus('completed') },
      ]
    );
  };

  const handleCancelRide = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => handleUpdateStatus('cancelled') },
      ]
    );
  };

  const handleOpenChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('Chat', { rideId });
  };

  const handleNavigate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Navigate to pickup when accepted, dropoff when ride started
    const isStarted = ride?.status === 'started';
    const lat = isStarted ? ride?.dropoff_lat : ride?.pickup_lat;
    const lng = isStarted ? ride?.dropoff_lng : ride?.pickup_lng;
    const label = isStarted ? 'Dropoff' : 'Pickup';

    if (!lat || !lng) {
      Alert.alert('Error', 'Location coordinates not available');
      return;
    }

    const googleMapsUrl = Platform.select({
      ios: `comgooglemaps://?daddr=${lat},${lng}&directionsmode=driving`,
      android: `google.navigation:q=${lat},${lng}&mode=d`,
    });
    const appleMapsUrl = `maps://app?daddr=${lat},${lng}&dirflg=d`;
    const wazeMapsUrl = `waze://?ll=${lat},${lng}&navigate=yes`;
    const webMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

    Alert.alert('Open Navigation', `Navigate to ${label} location`, [
      {
        text: 'Google Maps',
        onPress: () => Linking.openURL(googleMapsUrl).catch(() => Linking.openURL(webMapsUrl)),
      },
      {
        text: 'Waze',
        onPress: () => Linking.openURL(wazeMapsUrl).catch(() => Linking.openURL(webMapsUrl)),
      },
      ...(Platform.OS === 'ios' ? [{
        text: 'Apple Maps',
        onPress: () => Linking.openURL(appleMapsUrl).catch(() => Linking.openURL(webMapsUrl)),
      }] : []),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const getStatusConfig = () => {
    switch (ride?.status) {
      case 'matched':
        return { color: colors.info, icon: 'information-circle', label: 'MATCHED' };
      case 'accepted':
        return { color: colors.warning, icon: 'time', label: 'ACCEPTED' };
      case 'started':
        return { color: colors.success, icon: 'navigate', label: 'IN PROGRESS' };
      case 'completed':
        return { color: colors.success, icon: 'checkmark-circle', label: 'COMPLETED' };
      case 'cancelled':
        return { color: colors.error, icon: 'close-circle', label: 'CANCELLED' };
      default:
        return { color: colors.textSecondary, icon: 'ellipse', label: ride?.status?.toUpperCase() || '' };
    }
  };

  if (!ride) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="Ride Details" onLeftPress={() => navigation.goBack()} />
        <Loading />
      </View>
    );
  }

  const statusConfig = getStatusConfig();

  const animatedStyle = (index) => ({
    opacity: cardAnims[index],
    transform: [
      {
        translateY: cardAnims[index].interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Ride Details" onLeftPress={() => navigation.goBack()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status Badge */}
        <Animated.View style={[styles.statusContainer, animatedStyle(0)]}>
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '18' }]}>
            <Ionicons name={statusConfig.icon} size={18} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </Animated.View>

        {/* Rider Info Card */}
        <Animated.View style={animatedStyle(1)}>
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Rider Information</Text>
            <View style={styles.riderInfo}>
              <View style={[styles.riderAvatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.riderAvatarText}>
                  {ride.user?.name?.charAt(0) || 'R'}
                </Text>
              </View>
              <View style={styles.riderDetails}>
                <Text style={[styles.riderName, { color: colors.text }]}>
                  {ride.user?.name || 'Rider'}
                </Text>
                {ride.user?.rating && (
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={14} color={colors.star || colors.primary} />
                    <Text style={[styles.riderRating, { color: colors.textSecondary }]}>
                      {' '}{ride.user.rating.toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
              <TouchableOpacity
                style={[styles.chatButton, { backgroundColor: ICON_TINTS.chat.bg }]}
                onPress={handleOpenChat}
                activeOpacity={0.7}
              >
                <Ionicons name="chatbubble" size={20} color={ICON_TINTS.chat.color} />
              </TouchableOpacity>
            </View>
          </Card>
        </Animated.View>

        {/* Route Info Card */}
        <Animated.View style={animatedStyle(2)}>
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Route Details</Text>

            {/* Route Timeline */}
            <View style={styles.routeTimeline}>
              {/* Pickup */}
              <View style={styles.routeItem}>
                <View style={styles.routeIconCol}>
                  <View style={[styles.routeDot, { backgroundColor: colors.pickupDot || '#10B981' }]} />
                  <View style={[styles.routeConnector, { borderColor: colors.routeConnector || colors.border }]} />
                </View>
                <View style={styles.routeDetails}>
                  <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>Pickup</Text>
                  <Text style={[styles.routeText, { color: colors.text }]}>
                    {ride.pickup_location}
                  </Text>
                </View>
              </View>

              {/* Dropoff */}
              <View style={styles.routeItem}>
                <View style={styles.routeIconCol}>
                  <View style={[styles.routeDot, { backgroundColor: colors.dropoffDot || '#EF4444' }]} />
                </View>
                <View style={styles.routeDetails}>
                  <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>Dropoff</Text>
                  <Text style={[styles.routeText, { color: colors.text }]}>
                    {ride.dropoff_location}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.routeStats, { borderTopColor: colors.border }]}>
              <View style={styles.routeStat}>
                <Text style={[styles.routeStatValue, { color: colors.text }]}>
                  {ride.distance_km} km
                </Text>
                <Text style={[styles.routeStatLabel, { color: colors.textSecondary }]}>
                  Distance
                </Text>
              </View>
              <View style={[styles.routeStatDivider, { backgroundColor: colors.border }]} />
              <View style={styles.routeStat}>
                <Text style={[styles.routeStatValue, { color: colors.text }]}>
                  {ride.duration_minutes} min
                </Text>
                <Text style={[styles.routeStatLabel, { color: colors.textSecondary }]}>
                  Duration
                </Text>
              </View>
            </View>
          </Card>
        </Animated.View>

        {/* Fare Info Card */}
        <Animated.View style={animatedStyle(3)}>
          <Card style={styles.card}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Fare Details</Text>

            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Total Fare</Text>
              <Text style={[styles.fareValue, { color: colors.text }]}>
                Rs. {ride.fare}
              </Text>
            </View>

            <View style={styles.fareRow}>
              <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Commission (20%)</Text>
              <Text style={[styles.fareValue, { color: colors.error }]}>
                - Rs. {ride.commission_amount}
              </Text>
            </View>

            <View style={[styles.fareDivider, { backgroundColor: colors.border }]} />

            <View style={styles.fareRow}>
              <View style={styles.earningLabelRow}>
                <View style={[styles.earningIconBg, { backgroundColor: ICON_TINTS.earnings.bg }]}>
                  <Ionicons name="cash" size={16} color={ICON_TINTS.earnings.color} />
                </View>
                <Text style={[styles.fareLabelBold, { color: colors.text }]}>Your Earning</Text>
              </View>
              <Text style={[styles.fareValueBold, { color: colors.primary }]}>
                Rs. {ride.driver_earning}
              </Text>
            </View>
          </Card>
        </Animated.View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {ride.status === 'accepted' && (
            <>
              <TouchableOpacity
                style={[styles.navigateButton, { backgroundColor: '#1A73E8' }]}
                onPress={handleNavigate}
                activeOpacity={0.8}
              >
                <Ionicons name="navigate" size={20} color="#FFF" />
                <Text style={styles.navigateButtonText}>Navigate to Pickup</Text>
              </TouchableOpacity>
              <Button
                title="Start Ride"
                onPress={handleStartRide}
                loading={loading}
                style={styles.actionButton}
              />
              <Button
                title="Cancel Ride"
                onPress={handleCancelRide}
                variant="outline"
                style={styles.actionButton}
              />
            </>
          )}

          {ride.status === 'started' && (
            <>
              <TouchableOpacity
                style={[styles.navigateButton, { backgroundColor: '#1A73E8' }]}
                onPress={handleNavigate}
                activeOpacity={0.8}
              >
                <Ionicons name="navigate" size={20} color="#FFF" />
                <Text style={styles.navigateButtonText}>Navigate to Dropoff</Text>
              </TouchableOpacity>
              <Button
                title="Complete Ride"
                onPress={handleCompleteRide}
                loading={loading}
                style={styles.actionButton}
              />
              <Button
                title="Contact Rider"
                onPress={handleOpenChat}
                variant="outline"
                style={styles.actionButton}
              />
            </>
          )}

          {ride.status === 'completed' && (
            <Button
              title="Back to Dashboard"
              onPress={() => navigation.navigate('Dashboard')}
              style={styles.actionButton}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.huge,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    gap: spacing.sm,
  },
  statusText: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    fontSize: typography.h6,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  riderAvatarText: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#000',
  },
  riderDetails: {
    flex: 1,
  },
  riderName: {
    fontSize: typography.h6,
    fontWeight: '600',
    marginBottom: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderRating: {
    fontSize: typography.bodySmall,
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeTimeline: {
    marginBottom: spacing.lg,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeIconCol: {
    alignItems: 'center',
    width: 24,
    marginRight: spacing.md,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeConnector: {
    width: 0,
    height: 28,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    marginVertical: 2,
  },
  routeDetails: {
    flex: 1,
    paddingBottom: spacing.sm,
  },
  routeLabel: {
    fontSize: typography.caption,
    fontWeight: '500',
    marginBottom: 2,
  },
  routeText: {
    fontSize: typography.body,
    fontWeight: '500',
  },
  routeStats: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },
  routeStat: {
    flex: 1,
    alignItems: 'center',
  },
  routeStatDivider: {
    width: 1,
    height: '100%',
  },
  routeStatValue: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  routeStatLabel: {
    fontSize: typography.caption,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  fareLabel: {
    fontSize: typography.bodySmall,
  },
  fareValue: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  fareDivider: {
    height: 1,
    marginVertical: spacing.md,
  },
  earningLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  earningIconBg: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fareLabelBold: {
    fontSize: typography.h6,
    fontWeight: '700',
  },
  fareValueBold: {
    fontSize: typography.h5,
    fontWeight: '800',
  },
  actionsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: borderRadius.md || 12,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  navigateButtonText: {
    color: '#FFF',
    fontSize: typography.body || 15,
    fontWeight: '700',
  },
  actionButton: {
    marginBottom: spacing.md,
  },
});

export default RideRequestScreen;
