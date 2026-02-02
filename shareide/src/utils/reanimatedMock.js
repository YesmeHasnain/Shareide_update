// Mock for react-native-reanimated using built-in Animated API
import { Animated, Easing } from 'react-native';
import React, { useRef, useEffect, useCallback } from 'react';

// Mock useSharedValue - returns an object with .value property
export const useSharedValue = (initialValue) => {
  const ref = useRef({ value: initialValue, _anim: new Animated.Value(initialValue) });
  return ref.current;
};

// Mock useAnimatedStyle - returns regular style
export const useAnimatedStyle = (styleCallback) => {
  return styleCallback();
};

// Mock withSpring
export const withSpring = (toValue, config = {}) => {
  return toValue;
};

// Mock withTiming
export const withTiming = (toValue, config = {}) => {
  return toValue;
};

// Mock withDelay
export const withDelay = (delay, animation) => {
  return animation;
};

// Mock withSequence
export const withSequence = (...animations) => {
  return animations[animations.length - 1];
};

// Mock withRepeat
export const withRepeat = (animation, numberOfReps = 2, reverse = false) => {
  return animation;
};

// Mock interpolate
export const interpolate = (value, inputRange, outputRange) => {
  if (typeof value === 'number') {
    const inputMin = inputRange[0];
    const inputMax = inputRange[inputRange.length - 1];
    const outputMin = outputRange[0];
    const outputMax = outputRange[outputRange.length - 1];

    const ratio = (value - inputMin) / (inputMax - inputMin);
    return outputMin + ratio * (outputMax - outputMin);
  }
  return value;
};

// Mock Extrapolation
export const Extrapolation = {
  CLAMP: 'clamp',
  EXTEND: 'extend',
  IDENTITY: 'identity',
};

// Mock Easing
export const ReanimatedEasing = {
  linear: Easing.linear,
  ease: Easing.ease,
  quad: Easing.quad,
  cubic: Easing.cubic,
  poly: Easing.poly,
  sin: Easing.sin,
  circle: Easing.circle,
  exp: Easing.exp,
  elastic: Easing.elastic,
  back: Easing.back,
  bounce: Easing.bounce,
  bezier: Easing.bezier,
  in: Easing.in,
  out: Easing.out,
  inOut: Easing.inOut,
};

// Mock runOnJS
export const runOnJS = (fn) => fn;

// Mock runOnUI
export const runOnUI = (fn) => fn;

// Mock useDerivedValue
export const useDerivedValue = (callback) => {
  const ref = useRef({ value: callback() });
  return ref.current;
};

// Mock useAnimatedGestureHandler
export const useAnimatedGestureHandler = (handlers) => handlers;

// Mock useAnimatedScrollHandler
export const useAnimatedScrollHandler = (handlers) => handlers;

// Mock useAnimatedRef
export const useAnimatedRef = () => useRef(null);

// Mock measure
export const measure = (ref) => null;

// Mock scrollTo
export const scrollTo = (ref, x, y, animated) => {};

// Mock Layout animations
export const Layout = {
  springify: () => Layout,
  damping: () => Layout,
  stiffness: () => Layout,
  duration: () => Layout,
};

export const FadeIn = {
  duration: () => FadeIn,
  delay: () => FadeIn,
  springify: () => FadeIn,
};

export const FadeOut = {
  duration: () => FadeOut,
  delay: () => FadeOut,
};

export const FadeInUp = FadeIn;
export const FadeInDown = FadeIn;
export const FadeOutUp = FadeOut;
export const FadeOutDown = FadeOut;
export const SlideInRight = FadeIn;
export const SlideInLeft = FadeIn;
export const SlideOutRight = FadeOut;
export const SlideOutLeft = FadeOut;
export const ZoomIn = FadeIn;
export const ZoomOut = FadeOut;

// Export Animated as default
export default Animated;
