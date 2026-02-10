import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableWithoutFeedback, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, shadows } from '../../theme/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SPRING_CONFIG = {
  damping: 50,
  stiffness: 300,
  mass: 0.5,
  overshootClamping: true,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
};

const BottomSheet = ({
  children,
  visible = true,
  snapPoints = [0.3, 0.6, 0.9],
  initialSnap = 0,
  onClose,
  onSnap,
  showOverlay = true,
  showHandle = true,
  style,
  handleStyle,
  contentStyle,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const context = useSharedValue({ y: 0 });
  const activeSnapIndex = useSharedValue(initialSnap);

  const snapPointsPixels = snapPoints.map(
    (point) => SCREEN_HEIGHT * (1 - point)
  );

  const maxTranslateY = snapPointsPixels[snapPointsPixels.length - 1];
  const minTranslateY = SCREEN_HEIGHT;

  const snapTo = useCallback(
    (index) => {
      'worklet';
      const destination = snapPointsPixels[index];
      translateY.value = withSpring(destination, SPRING_CONFIG);
      activeSnapIndex.value = index;
      if (onSnap) {
        runOnJS(onSnap)(index);
      }
    },
    [snapPointsPixels]
  );

  const close = useCallback(() => {
    'worklet';
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    if (onClose) {
      runOnJS(onClose)();
    }
  }, []);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(
        snapPointsPixels[initialSnap],
        SPRING_CONFIG
      );
      activeSnapIndex.value = initialSnap;
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 });
    }
  }, [visible, initialSnap]);

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const newY = context.value.y + event.translationY;
      translateY.value = Math.max(maxTranslateY, Math.min(newY, minTranslateY));
    })
    .onEnd((event) => {
      const currentY = translateY.value;
      const velocity = event.velocityY;

      // Find closest snap point
      let closestIndex = 0;
      let closestDistance = Math.abs(currentY - snapPointsPixels[0]);

      for (let i = 1; i < snapPointsPixels.length; i++) {
        const distance = Math.abs(currentY - snapPointsPixels[i]);
        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      // Factor in velocity
      if (Math.abs(velocity) > 500) {
        if (velocity > 0) {
          // Swiping down
          closestIndex = Math.max(0, closestIndex - 1);
          if (closestIndex === 0 && velocity > 1500 && onClose) {
            close();
            return;
          }
        } else {
          // Swiping up
          closestIndex = Math.min(
            snapPointsPixels.length - 1,
            closestIndex + 1
          );
        }
      }

      snapTo(closestIndex);
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [SCREEN_HEIGHT, snapPointsPixels[0]],
      [0, 0.5],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      pointerEvents: opacity > 0 ? 'auto' : 'none',
    };
  });

  return (
    <>
      {showOverlay && (
        <Animated.View style={[styles.overlay, overlayStyle]}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>
        </Animated.View>
      )}
      <GestureDetector gesture={gesture}>
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.surface,
              paddingBottom: insets.bottom,
            },
            shadows.xl,
            sheetStyle,
            style,
          ]}
        >
          {showHandle && (
            <View style={styles.handleContainer}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: colors.border },
                  handleStyle,
                ]}
              />
            </View>
          )}
          <View style={[styles.content, contentStyle]}>{children}</View>
        </Animated.View>
      </GestureDetector>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 100,
  },
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: SCREEN_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 101,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
});

export default BottomSheet;
