import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';

const OTP_LENGTH = 6;

const OTPScreen = ({ route, navigation }) => {
  const { colors, isDark } = useTheme();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const phone = route?.params?.phone || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const inputRefs = useRef([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/[^0-9]/g, '');
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === OTP_LENGTH) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode) => {
    if (!otpCode || otpCode.length !== OTP_LENGTH) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response = await authAPI.verifyOTP(phone, otpCode);

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (response.is_new_user) {
          navigation.reset({
            index: 0,
            routes: [{
              name: 'PersonalInfo',
              params: {
                phone,
                verificationToken: response.verification_token,
                isNewUser: true
              }
            }],
          });
          return;
        }

        const { user, token } = response;
        await login(user, token);

        // Determine where to navigate
        let targetScreen = 'PersonalInfo';
        let screenParams = { phone, isNewUser: false };

        if (user?.driver && user.driver.status === 'approved') {
          targetScreen = 'MainTabs';
          screenParams = undefined;
        } else if (user?.driver && (user.driver.status === 'pending' || user.driver.status === 'rejected')) {
          targetScreen = 'Pending';
          screenParams = undefined;
        }

        // Small delay to let AuthContext state settle before navigating
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: targetScreen, params: screenParams }],
          });
        }, 200);
      }
    } catch (error) {
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      const message = error.response?.data?.message || 'Invalid OTP';
      Alert.alert('Error', message);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      setResending(true);
      await authAPI.sendOTP(phone);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sent!', 'New code sent via WhatsApp');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to resend code');
    } finally {
      setResending(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}s`;
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.inputBackground }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>We sent you a WhatsApp</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Please enter the code we just{'\n'}sent to {phone}
          </Text>

          {/* OTP Inputs - Larger */}
          <Animated.View style={[styles.otpSection, { transform: [{ translateX: shakeAnim }] }]}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <View
                  key={index}
                  style={[
                    styles.otpBox,
                    { backgroundColor: colors.inputBackground },
                    digit && { backgroundColor: colors.background, borderWidth: 2, borderColor: colors.primary },
                    focusedIndex === index && !digit && { borderWidth: 2, borderColor: colors.text, backgroundColor: colors.background },
                  ]}
                >
                  <TextInput
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[styles.otpInput, { color: colors.text }]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                    editable={!loading}
                    autoFocus={index === 0}
                  />
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Timer / Resend */}
          <View style={styles.resendSection}>
            {!canResend ? (
              <Text style={styles.timerText}>
                Resend code in {formatTime(countdown)}
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP} disabled={resending}>
                <Text style={[styles.resendText, { color: colors.primary }]}>
                  {resending ? 'Sending...' : 'Resend code'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Bottom Button */}
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              {
                backgroundColor: isComplete ? colors.primary : colors.inputBackground,
                shadowOpacity: isComplete ? 0.15 : 0,
              },
            ]}
            onPress={() => handleVerify(otp.join(''))}
            disabled={!isComplete || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[
                styles.verifyText,
                { color: isComplete ? '#000' : colors.textTertiary }
              ]}>
                Verify code
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 40,
  },
  otpSection: {
    marginBottom: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  // Larger OTP boxes
  otpBox: {
    flex: 1,
    height: 60,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  resendSection: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },
  resendText: {
    fontSize: 15,
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 24,
  },
  verifyButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  verifyText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default OTPScreen;
