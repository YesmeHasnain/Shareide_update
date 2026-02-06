import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  Dimensions,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { lightColors as colors } from '../../theme/colors';

const { width } = Dimensions.get('window');
const SLIDER_WIDTH = width - 80;
const THUMB_SIZE = 60;
const THRESHOLD = SLIDER_WIDTH - THUMB_SIZE - 20;

const SwipeToAccept = ({
  onAccept,
  onReject,
  acceptText = 'Slide to Accept',
  rejectText = 'Slide to Reject',
  disabled = false,
}) => {
  const pan = useRef(new Animated.Value(0)).current;
  const [swiping, setSwiping] = useState(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: () => {
        pan.setOffset(pan._value);
        pan.setValue(0);
      },
      onPanResponderMove: (_, gesture) => {
        const newValue = Math.max(-THRESHOLD, Math.min(THRESHOLD, gesture.dx));
        pan.setValue(newValue);

        if (newValue > 50 && swiping !== 'accept') {
          setSwiping('accept');
          Vibration.vibrate(10);
        } else if (newValue < -50 && swiping !== 'reject') {
          setSwiping('reject');
          Vibration.vibrate(10);
        } else if (newValue > -50 && newValue < 50 && swiping !== null) {
          setSwiping(null);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();

        if (gesture.dx > THRESHOLD * 0.8) {
          // Swiped right - Accept
          Animated.spring(pan, {
            toValue: THRESHOLD,
            useNativeDriver: true,
            friction: 5,
          }).start(() => {
            Vibration.vibrate(50);
            onAccept && onAccept();
            // Reset after action
            setTimeout(() => {
              Animated.spring(pan, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
              setSwiping(null);
            }, 500);
          });
        } else if (gesture.dx < -THRESHOLD * 0.8) {
          // Swiped left - Reject
          Animated.spring(pan, {
            toValue: -THRESHOLD,
            useNativeDriver: true,
            friction: 5,
          }).start(() => {
            Vibration.vibrate(50);
            onReject && onReject();
            // Reset after action
            setTimeout(() => {
              Animated.spring(pan, {
                toValue: 0,
                useNativeDriver: true,
              }).start();
              setSwiping(null);
            }, 500);
          });
        } else {
          // Return to center
          Animated.spring(pan, {
            toValue: 0,
            useNativeDriver: true,
            friction: 5,
          }).start();
          setSwiping(null);
        }
      },
    })
  ).current;

  const thumbTranslate = pan;

  const acceptOpacity = pan.interpolate({
    inputRange: [0, THRESHOLD * 0.5, THRESHOLD],
    outputRange: [0.3, 0.7, 1],
    extrapolate: 'clamp',
  });

  const rejectOpacity = pan.interpolate({
    inputRange: [-THRESHOLD, -THRESHOLD * 0.5, 0],
    outputRange: [1, 0.7, 0.3],
    extrapolate: 'clamp',
  });

  const thumbScale = pan.interpolate({
    inputRange: [-THRESHOLD * 0.5, 0, THRESHOLD * 0.5],
    outputRange: [1.1, 1, 1.1],
    extrapolate: 'clamp',
  });

  const acceptIconScale = pan.interpolate({
    inputRange: [0, THRESHOLD],
    outputRange: [0.8, 1.2],
    extrapolate: 'clamp',
  });

  const rejectIconScale = pan.interpolate({
    inputRange: [-THRESHOLD, 0],
    outputRange: [1.2, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {/* Accept side (right) */}
      <Animated.View style={[styles.actionSide, styles.acceptSide, { opacity: acceptOpacity }]}>
        <Animated.View style={{ transform: [{ scale: acceptIconScale }] }}>
          <Ionicons name="checkmark-circle" size={30} color={colors.success} />
        </Animated.View>
        <Text style={styles.acceptText}>{acceptText}</Text>
      </Animated.View>

      {/* Reject side (left) */}
      <Animated.View style={[styles.actionSide, styles.rejectSide, { opacity: rejectOpacity }]}>
        <Text style={styles.rejectText}>{rejectText}</Text>
        <Animated.View style={{ transform: [{ scale: rejectIconScale }] }}>
          <Ionicons name="close-circle" size={30} color={colors.error} />
        </Animated.View>
      </Animated.View>

      {/* Slider Track */}
      <View style={styles.sliderTrack}>
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.trackGradient}
        >
          {/* Chevron arrows */}
          <View style={styles.chevronsContainer}>
            <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.3)" />
            <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.2)" style={{ marginLeft: -10 }} />
            <View style={{ flex: 1 }} />
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.2)" style={{ marginRight: -10 }} />
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.3)" />
          </View>

          {/* Thumb */}
          <Animated.View
            {...panResponder.panHandlers}
            style={[
              styles.thumb,
              {
                transform: [
                  { translateX: thumbTranslate },
                  { scale: thumbScale },
                ],
              },
              swiping === 'accept' && styles.thumbAccept,
              swiping === 'reject' && styles.thumbReject,
            ]}
          >
            <LinearGradient
              colors={
                swiping === 'accept'
                  ? [colors.success, '#10B981']
                  : swiping === 'reject'
                  ? [colors.error, '#EF4444']
                  : [colors.primary, colors.secondary]
              }
              style={styles.thumbGradient}
            >
              <Ionicons
                name={
                  swiping === 'accept'
                    ? 'checkmark'
                    : swiping === 'reject'
                    ? 'close'
                    : 'swap-horizontal'
                }
                size={28}
                color="#fff"
              />
            </LinearGradient>
          </Animated.View>
        </LinearGradient>
      </View>

      {/* Instruction text */}
      <Text style={styles.instructionText}>
        {swiping === 'accept'
          ? 'Release to Accept'
          : swiping === 'reject'
          ? 'Release to Reject'
          : 'Swipe to respond'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  actionSide: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 25,
  },
  acceptSide: {
    right: 50,
  },
  rejectSide: {
    left: 50,
  },
  acceptText: {
    color: colors.success,
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 13,
  },
  rejectText: {
    color: colors.error,
    marginRight: 8,
    fontWeight: '600',
    fontSize: 13,
  },
  sliderTrack: {
    width: SLIDER_WIDTH,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.3)',
    marginTop: 30,
  },
  trackGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 35,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  chevronsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    width: '100%',
    paddingHorizontal: 20,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    position: 'absolute',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  thumbGradient: {
    width: '100%',
    height: '100%',
    borderRadius: THUMB_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbAccept: {
    shadowColor: colors.success,
    shadowOpacity: 0.5,
  },
  thumbReject: {
    shadowColor: colors.error,
    shadowOpacity: 0.5,
  },
  instructionText: {
    color: 'rgba(255,255,255,0.5)',
    marginTop: 10,
    fontSize: 12,
  },
});

export default SwipeToAccept;
