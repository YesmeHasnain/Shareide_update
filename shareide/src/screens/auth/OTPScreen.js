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
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { authAPI } from '../../api/auth';

const OTP_LENGTH = 6;
const DEV_MODE = false; // Disable dev mode - use real API
const FAKE_OTP = '123456';

const OTPScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const { phone, isExistingUser } = route.params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

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
    Haptics.selectionAsync();

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

  const handleVerify = async (otpCode = otp.join('')) => {
    if (otpCode.length !== OTP_LENGTH) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      return;
    }

    // DEV MODE: Accept fake OTP
    if (DEV_MODE && otpCode === FAKE_OTP) {
      setLoading(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Navigate to Gender selection for new user flow
      navigation.navigate('Gender', {
        phone,
        verificationToken: 'dev_token_123',
        isNewUser: true,
      });
      setLoading(false);
      return;
    }

    // Real API verification (disabled in dev mode)
    if (!DEV_MODE) {
      try {
        setLoading(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const response = await authAPI.verifyCode(phone, otpCode);

        if (response.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          if (!response.is_new_user && !response.needs_profile_setup) {
            await login(response.user, response.token);
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
            return;
          }

          if (!response.is_new_user && response.needs_profile_setup) {
            navigation.navigate('Gender', {
              phone,
              token: response.token,
              user: response.user,
              isNewUser: false,
            });
            return;
          }

          if (response.is_new_user) {
            navigation.navigate('Gender', {
              phone,
              verificationToken: response.verification_token,
              isNewUser: true,
            });
            return;
          }
        }
      } catch (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        triggerShake();
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        const message = error.response?.data?.message || 'Invalid OTP. Please try again.';
        Alert.alert('Error', message);
      } finally {
        setLoading(false);
      }
    } else {
      // Wrong OTP in dev mode
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      triggerShake();
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert('Dev Mode', 'Use OTP: 123456');
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (DEV_MODE) {
      Alert.alert('Dev Mode', 'OTP is: 123456');
      setCountdown(30);
      setCanResend(false);
      return;
    }

    try {
      setResending(true);
      await authAPI.sendCode(phone);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'New OTP sent via WhatsApp!');
      setCountdown(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error.response?.data?.message || 'Failed to resend OTP.';
      Alert.alert('Error', message);
    } finally {
      setResending(false);
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + spacing.xl },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={[styles.backButton, { backgroundColor: colors.surface }]}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          </Animated.View>

          {/* Header Section */}
          <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
            <LinearGradient
              colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
              style={[styles.iconContainer, shadows.goldLg]}
            >
              <Ionicons name="chatbubble-ellipses" size={48} color="#000" />
            </LinearGradient>

            <Text style={[styles.title, { color: colors.text }]}>
              Verify Your Number
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter the 6-digit code sent via WhatsApp to
            </Text>

            <View style={[styles.phoneContainer, { backgroundColor: colors.surface }]}>
              <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              <Text style={[styles.phoneText, { color: colors.primary }]}>
                +92 {phone}
              </Text>
            </View>

            {DEV_MODE && (
              <View style={[styles.devBadge, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.devText, { color: colors.warning }]}>
                  Dev Mode: Use OTP 123456
                </Text>
              </View>
            )}
          </Animated.View>

          {/* OTP Input Section */}
          <Animated.View style={[styles.otpSection, { transform: [{ translateX: shakeAnim }] }]}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              VERIFICATION CODE
            </Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <View
                  key={index}
                  style={[
                    styles.otpInputWrapper,
                    { backgroundColor: colors.surface },
                    digit && { borderColor: colors.primary, borderWidth: 2 },
                    shadows.sm,
                  ]}
                >
                  <TextInput
                    ref={(ref) => (inputRefs.current[index] = ref)}
                    style={[styles.otpInput, { color: colors.text }]}
                    value={digit}
                    onChangeText={(value) => handleOtpChange(value, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
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

          {/* Timer & Resend Section */}
          <Animated.View style={[styles.resendSection, { opacity: fadeAnim }]}>
            {!canResend ? (
              <View style={styles.timerContainer}>
                <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.timerText, { color: colors.textSecondary }]}>
                  Resend code in {countdown}s
                </Text>
              </View>
            ) : (
              <TouchableOpacity
                style={[styles.resendButton, { backgroundColor: colors.primary + '15' }]}
                onPress={handleResendOTP}
                disabled={resending}
              >
                {resending ? (
                  <Text style={[styles.resendText, { color: colors.primary }]}>
                    Sending...
                  </Text>
                ) : (
                  <>
                    <Ionicons name="refresh" size={20} color={colors.primary} />
                    <Text style={[styles.resendText, { color: colors.primary }]}>
                      Resend via WhatsApp
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </Animated.View>

          {/* Button Section */}
          <Animated.View style={[styles.buttonSection, { opacity: fadeAnim }]}>
            <Button
              title="Verify"
              onPress={() => handleVerify()}
              variant="primary"
              size="large"
              loading={loading}
              disabled={!isComplete}
              icon="checkmark-circle"
              fullWidth
            />

            <View style={[styles.helpBox, { backgroundColor: colors.surface }]}>
              <Ionicons name="help-circle-outline" size={24} color={colors.textSecondary} />
              <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                Didn't receive the code? Check your WhatsApp messages or request a new code.
              </Text>
            </View>
          </Animated.View>

          {/* Security Note */}
          <Animated.View style={[styles.securitySection, { opacity: fadeAnim }]}>
            <View style={[styles.securityBox, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="shield-checkmark" size={20} color={colors.success} />
              <Text style={[styles.securityText, { color: colors.text }]}>
                Your verification is encrypted and secure
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.h2,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  phoneText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  devBadge: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  devText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  otpSection: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
    letterSpacing: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  otpInputWrapper: {
    width: 50,
    height: 60,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpInput: {
    fontSize: typography.h3,
    fontWeight: '700',
    textAlign: 'center',
    width: '100%',
    height: '100%',
  },
  resendSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timerText: {
    fontSize: typography.body,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
  },
  resendText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  buttonSection: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  helpText: {
    flex: 1,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  securitySection: {
    marginTop: 'auto',
  },
  securityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  securityText: {
    fontSize: typography.bodySmall,
    fontWeight: '500',
  },
});

export default OTPScreen;
