import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';

const ProgressBar = ({
  progress = 0, // 0 to 100
  showLabels = true,
  showPercentage = true,
  pickupLabel = 'PICK UP',
  dropoffLabel = 'DROP OFF',
  height = 6,
  style,
}) => {
  const { colors } = useTheme();

  const clampedProgress = Math.min(100, Math.max(0, progress));

  const fillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${clampedProgress}%`, {
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
  }));

  const bubbleStyle = useAnimatedStyle(() => ({
    left: withTiming(`${clampedProgress}%`, {
      duration: 600,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
  }));

  return (
    <View style={[styles.container, style]}>
      {/* Labels */}
      {showLabels && (
        <View style={styles.labelsRow}>
          <Text style={[styles.label, { color: colors.textTertiary }]}>{pickupLabel}</Text>
          <Text style={[styles.label, { color: colors.textTertiary }]}>{dropoffLabel}</Text>
        </View>
      )}

      {/* Bar */}
      <View style={styles.barContainer}>
        <View
          style={[
            styles.track,
            { backgroundColor: colors.progressTrack, height },
          ]}
        >
          <Animated.View
            style={[
              styles.fill,
              { backgroundColor: colors.progressFill, height },
              fillStyle,
            ]}
          />
        </View>

        {/* Percentage Bubble */}
        {showPercentage && clampedProgress > 0 && (
          <Animated.View
            style={[
              styles.bubbleContainer,
              bubbleStyle,
            ]}
          >
            <View style={[styles.bubble, { backgroundColor: colors.primary }]}>
              <Text style={styles.bubbleText}>{Math.round(clampedProgress)}%</Text>
            </View>
            <View style={[styles.bubbleArrow, { borderTopColor: colors.primary }]} />
          </Animated.View>
        )}
      </View>

      {/* Dots at ends */}
      <View style={styles.dotsRow}>
        <View style={[styles.endDot, { backgroundColor: colors.pickupDot }]} />
        <View style={[styles.endDot, { backgroundColor: colors.dropoffDot }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  barContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  track: {
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 3,
  },
  bubbleContainer: {
    position: 'absolute',
    top: -32,
    marginLeft: -18,
    alignItems: 'center',
  },
  bubble: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  bubbleText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  bubbleArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  endDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default ProgressBar;
