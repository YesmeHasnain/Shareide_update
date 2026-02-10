import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const LoadingModal = ({
  visible = false,
  message = 'Please wait',
  submessage = '',
  icon = 'car-sport',
}) => {
  const { colors } = useTheme();
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      rotation.value = withRepeat(
        withTiming(360, { duration: 2000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [visible]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Animated.View style={[styles.iconContainer, iconAnimStyle]}>
            <View style={[styles.iconBg, { backgroundColor: colors.primary }]}>
              <Ionicons name={icon} size={32} color="#000000" />
            </View>
          </Animated.View>

          <Animated.View style={[styles.spinner, spinnerStyle]}>
            <View style={[styles.spinnerArc, { borderTopColor: colors.primary }]} />
          </Animated.View>

          <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
          {submessage ? (
            <Text style={[styles.submessage, { color: colors.textSecondary }]}>
              {submessage}
            </Text>
          ) : null}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    minWidth: 200,
  },
  iconContainer: {
    marginBottom: 8,
    zIndex: 2,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    position: 'absolute',
    top: 28,
    width: 84,
    height: 84,
  },
  spinnerArc: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  message: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 16,
  },
  submessage: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});

export default LoadingModal;
