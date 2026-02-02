// Safe animation fallbacks for testing
// When react-native-reanimated doesn't work properly, use these fallbacks

import { View } from 'react-native';

// Try to import reanimated, fallback to simple View if not available
let Animated, FadeIn, FadeInDown, FadeInUp, FadeInLeft, FadeInRight;
let useSharedValue, useAnimatedStyle, withSpring, withTiming, withRepeat, withSequence;

try {
  const Reanimated = require('react-native-reanimated');
  Animated = Reanimated.default;
  FadeIn = Reanimated.FadeIn;
  FadeInDown = Reanimated.FadeInDown;
  FadeInUp = Reanimated.FadeInUp;
  FadeInLeft = Reanimated.FadeInLeft;
  FadeInRight = Reanimated.FadeInRight;
  useSharedValue = Reanimated.useSharedValue;
  useAnimatedStyle = Reanimated.useAnimatedStyle;
  withSpring = Reanimated.withSpring;
  withTiming = Reanimated.withTiming;
  withRepeat = Reanimated.withRepeat;
  withSequence = Reanimated.withSequence;
} catch (e) {
  console.log('Reanimated not available, using fallbacks');
}

// Create safe animation objects that won't crash if undefined
const createSafeAnimation = (animation) => {
  if (animation && typeof animation.delay === 'function') {
    return animation;
  }
  // Return a dummy object that has delay/springify methods
  return {
    delay: () => ({
      springify: () => undefined,
    }),
    springify: () => undefined,
  };
};

// Export safe versions
export const SafeFadeIn = createSafeAnimation(FadeIn);
export const SafeFadeInDown = createSafeAnimation(FadeInDown);
export const SafeFadeInUp = createSafeAnimation(FadeInUp);
export const SafeFadeInLeft = createSafeAnimation(FadeInLeft);
export const SafeFadeInRight = createSafeAnimation(FadeInRight);

// Export Animated or fallback to View
export const SafeAnimated = Animated || { View, createAnimatedComponent: (c) => c };

// Export hooks with fallbacks
export const safeUseSharedValue = useSharedValue || ((val) => ({ value: val }));
export const safeUseAnimatedStyle = useAnimatedStyle || (() => ({}));
export const safeWithSpring = withSpring || ((val) => val);
export const safeWithTiming = withTiming || ((val) => val);
export const safeWithRepeat = withRepeat || ((val) => val);
export const safeWithSequence = withSequence || ((val) => val);

export {
  Animated,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
};
