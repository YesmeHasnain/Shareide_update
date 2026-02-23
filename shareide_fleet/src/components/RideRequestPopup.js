import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TIMER_DURATION = 30;

const RideRequestPopup = ({ requests = [], onAccept, onDecline, visible }) => {
  const { colors, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);

  const slideY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const cardX = useRef(new Animated.Value(0)).current;
  const scrimOpacity = useRef(new Animated.Value(0)).current;
  const timerWidth = useRef(new Animated.Value(1)).current;
  const timerRef = useRef(null);
  const isAnimating = useRef(false);

  const currentRequest = requests[currentIndex];
  const hasRequests = visible && requests.length > 0 && currentIndex < requests.length;

  // Show/hide popup
  useEffect(() => {
    if (hasRequests) {
      showPopup();
    } else {
      hidePopup();
    }
  }, [hasRequests]);

  // Reset index when requests change from empty to populated
  useEffect(() => {
    if (requests.length > 0 && currentIndex >= requests.length) {
      setCurrentIndex(0);
    }
  }, [requests]);

  // Timer countdown
  useEffect(() => {
    if (!hasRequests) {
      clearInterval(timerRef.current);
      return;
    }

    setTimeLeft(TIMER_DURATION);
    startTimerAnimation();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, hasRequests]);

  const startTimerAnimation = () => {
    timerWidth.setValue(1);
    Animated.timing(timerWidth, {
      toValue: 0,
      duration: TIMER_DURATION * 1000,
      useNativeDriver: false,
    }).start();
  };

  const showPopup = () => {
    cardX.setValue(0);
    Animated.parallel([
      Animated.spring(slideY, {
        toValue: 0,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(scrimOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hidePopup = () => {
    Animated.parallel([
      Animated.timing(slideY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scrimOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleAccept = useCallback(() => {
    if (isAnimating.current || !currentRequest) return;
    isAnimating.current = true;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    clearInterval(timerRef.current);

    hidePopup();
    setTimeout(() => {
      onAccept?.(currentRequest);
      isAnimating.current = false;
    }, 250);
  }, [currentRequest, onAccept]);

  const handleDecline = useCallback(() => {
    if (isAnimating.current || !currentRequest) return;
    isAnimating.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    clearInterval(timerRef.current);

    onDecline?.(currentRequest);

    const nextIndex = currentIndex + 1;

    // Slide current card out to the left
    Animated.timing(cardX, {
      toValue: -SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      if (nextIndex < requests.length) {
        // Slide next card in from the right
        cardX.setValue(SCREEN_WIDTH);
        setCurrentIndex(nextIndex);
        Animated.spring(cardX, {
          toValue: 0,
          friction: 7,
          tension: 40,
          useNativeDriver: true,
        }).start(() => {
          isAnimating.current = false;
        });
      } else {
        // No more requests
        setCurrentIndex(nextIndex);
        hidePopup();
        isAnimating.current = false;
      }
    });
  }, [currentRequest, currentIndex, requests.length, onDecline]);

  if (!hasRequests) return null;

  const timerColor = timeLeft > 20 ? '#10B981' : timeLeft > 10 ? '#F59E0B' : '#EF4444';
  const timerGradient =
    timeLeft > 20
      ? ['#10B981', '#34D399']
      : timeLeft > 10
      ? ['#F59E0B', '#FBBF24']
      : ['#EF4444', '#F87171'];

  const formatTime = (s) => `0:${s.toString().padStart(2, '0')}`;

  const riderName = currentRequest?.rider?.name || currentRequest?.rider_name || 'Rider';
  const riderRating = currentRequest?.rider?.rating || currentRequest?.rider_rating || '5.0';
  const pickup = currentRequest?.pickup_location || currentRequest?.pickup_address || 'Pickup';
  const dropoff = currentRequest?.dropoff_location || currentRequest?.dropoff_address || 'Dropoff';
  const fare = currentRequest?.offered_price || currentRequest?.fare || currentRequest?.estimated_fare || 0;
  const distance = currentRequest?.distance || currentRequest?.estimated_distance || '—';
  const seats = currentRequest?.seats || currentRequest?.passengers || 1;
  const riderAvatar = currentRequest?.rider?.avatar || currentRequest?.rider_avatar || null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={hasRequests ? 'auto' : 'none'}>
      {/* Scrim */}
      <Animated.View
        style={[
          styles.scrim,
          { opacity: scrimOpacity.interpolate({ inputRange: [0, 1], outputRange: [0, 0.3] }) },
        ]}
      />

      {/* Card */}
      <Animated.View
        style={[
          styles.cardWrapper,
          { transform: [{ translateY: slideY }] },
        ]}
      >
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: colors.card || '#FFFFFF',
              transform: [{ translateX: cardX }],
            },
          ]}
        >
          {/* Drag Handle */}
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: isDark ? '#444' : '#D1D5DB' }]} />
          </View>

          {/* Timer Bar */}
          <View style={styles.timerBarContainer}>
            <Animated.View
              style={[
                styles.timerBarTrack,
                { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' },
              ]}
            >
              <Animated.View
                style={{
                  width: timerWidth.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  height: '100%',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  colors={timerGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1, borderRadius: 2 }}
                />
              </Animated.View>
            </Animated.View>
          </View>

          {/* Rider Info Row */}
          <View style={styles.riderRow}>
            <View style={styles.riderLeft}>
              <Avatar
                source={riderAvatar}
                name={riderName}
                size="small"
                useDefaultAvatar={!riderAvatar}
              />
              <View style={styles.riderInfo}>
                <Text style={[styles.riderName, { color: colors.text }]} numberOfLines={1}>
                  {riderName}
                </Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                    {parseFloat(riderRating).toFixed(1)}
                  </Text>
                </View>
              </View>
            </View>
            <View style={[styles.timerBadge, { backgroundColor: timerColor + '18' }]}>
              <Ionicons name="time-outline" size={14} color={timerColor} />
              <Text style={[styles.timerText, { color: timerColor }]}>{formatTime(timeLeft)}</Text>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' }]} />

          {/* Route */}
          <View style={styles.routeContainer}>
            {/* Pickup */}
            <View style={styles.routeRow}>
              <View style={styles.routeDotCol}>
                <View style={[styles.dot, styles.dotGreen]} />
                <View style={[styles.routeLine, { borderColor: isDark ? '#444' : '#D1D5DB' }]} />
              </View>
              <View style={styles.routeTextCol}>
                <Text style={[styles.routeLabel, { color: colors.textTertiary }]}>PICKUP</Text>
                <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={2}>
                  {pickup}
                </Text>
              </View>
            </View>

            {/* Dropoff */}
            <View style={styles.routeRow}>
              <View style={styles.routeDotCol}>
                <View style={[styles.dot, styles.dotRed]} />
              </View>
              <View style={styles.routeTextCol}>
                <Text style={[styles.routeLabel, { color: colors.textTertiary }]}>DROP-OFF</Text>
                <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={2}>
                  {dropoff}
                </Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: isDark ? '#2A2A2A' : '#F3F4F6' }]} />

          {/* Trip Details Row */}
          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Ionicons name="cash-outline" size={18} color="#10B981" />
              <Text style={[styles.detailValue, { color: colors.text }]}>Rs. {fare}</Text>
            </View>
            <View style={[styles.detailDivider, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]} />
            <View style={styles.detailItem}>
              <Ionicons name="navigate-outline" size={18} color="#6366F1" />
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {typeof distance === 'number' ? `${distance} km` : distance}
              </Text>
            </View>
            <View style={[styles.detailDivider, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]} />
            <View style={styles.detailItem}>
              <Ionicons name="people-outline" size={18} color="#F59E0B" />
              <Text style={[styles.detailValue, { color: colors.text }]}>{seats} seat{seats > 1 ? 's' : ''}</Text>
            </View>
          </View>

          {/* Queue indicator */}
          {requests.length > 1 && (
            <Text style={[styles.queueText, { color: colors.textTertiary }]}>
              Request {currentIndex + 1} of {requests.length}
            </Text>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.declineBtn}
              onPress={handleDecline}
              activeOpacity={0.7}
            >
              <Ionicons name="close-circle" size={20} color="#EF4444" />
              <Text style={styles.declineBtnText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptBtn}
              onPress={handleAccept}
              activeOpacity={0.7}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.acceptGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                <Text style={styles.acceptBtnText}>Accept</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  cardWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  card: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },

  // Handle
  handleRow: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },

  // Timer bar
  timerBarContainer: {
    paddingHorizontal: 0,
    paddingTop: 8,
    paddingBottom: 12,
  },
  timerBarTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },

  // Rider
  riderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  riderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  riderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // Divider
  divider: {
    height: 1,
    marginVertical: 2,
  },

  // Route
  routeContainer: {
    paddingVertical: 12,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDotCol: {
    width: 24,
    alignItems: 'center',
    paddingTop: 3,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotGreen: {
    backgroundColor: '#10B981',
  },
  dotRed: {
    backgroundColor: '#EF4444',
  },
  routeLine: {
    width: 0,
    height: 20,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    marginVertical: 2,
  },
  routeTextCol: {
    flex: 1,
    marginLeft: 8,
    paddingBottom: 6,
  },
  routeLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 19,
  },

  // Details
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  detailDivider: {
    width: 1,
    height: 24,
  },

  // Queue
  queueText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
  },

  // Buttons
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  declineBtn: {
    flex: 1,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#EF4444',
  },
  declineBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  acceptBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    overflow: 'hidden',
  },
  acceptGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 16,
  },
  acceptBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default RideRequestPopup;
