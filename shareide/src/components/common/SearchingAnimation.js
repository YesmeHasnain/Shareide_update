import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const PulseRing = ({ delay, size }) => {
  const { colors } = useTheme();
  const scale = useSharedValue(0.3);
  const opacity = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: 2000, easing: Easing.out(Easing.ease) }),
        -1,
        false
      )
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.ring,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor: colors.primary,
        },
        ringStyle,
      ]}
    />
  );
};

const SearchingAnimation = ({
  message = 'Looking for rides near you',
  submessage = 'This may take a moment...',
  icon = 'car-sport',
  style,
}) => {
  const { colors } = useTheme();
  const dotScale = useSharedValue(1);

  useEffect(() => {
    dotScale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
  }));

  return (
    <View style={[styles.container, style]}>
      <View style={styles.animationContainer}>
        <PulseRing delay={0} size={140} />
        <PulseRing delay={700} size={140} />
        <PulseRing delay={1400} size={140} />

        <Animated.View style={[styles.centerDot, dotStyle]}>
          <View style={[styles.dotInner, { backgroundColor: colors.primary }]}>
            <Ionicons name={icon} size={28} color="#000000" />
          </View>
        </Animated.View>
      </View>

      <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      {submessage && (
        <Text style={[styles.submessage, { color: colors.textSecondary }]}>
          {submessage}
        </Text>
      )}

      {/* Animated dots */}
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <AnimatedDot key={i} delay={i * 300} colors={colors} />
        ))}
      </View>
    </View>
  );
};

const AnimatedDot = ({ delay, colors }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400 }),
          withTiming(0.3, { duration: 400 })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.loadingDot,
        { backgroundColor: colors.primary },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  animationContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
  },
  centerDot: {
    position: 'absolute',
    zIndex: 10,
  },
  dotInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  submessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default SearchingAnimation;
