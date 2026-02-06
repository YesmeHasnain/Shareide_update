import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { walletAPI } from '../../api/wallet';
import { Header, Card, Button } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
};

const OTPVerificationScreen = ({ navigation, route }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();

  const { orderId, amount, method, otpLength = 8, message } = route.params || {};

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRef = useRef(null);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Auto-focus input
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 500);
  }, []);

  const handleVerify = async () => {
    if (otp.length < otpLength) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid OTP', `Please enter the ${otpLength}-digit OTP sent to your phone`);
      return;
    }

    try {
      setLoading(true);
      Keyboard.dismiss();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const response = await walletAPI.verifyOTP(orderId, otp);

      console.log('OTP Verification Response:', JSON.stringify(response, null, 2));

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Payment Successful!',
          `Rs. ${amount?.toLocaleString()} has been added to your wallet.\n\nNew Balance: Rs. ${response.data?.balance?.toLocaleString()}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Go back to wallet screen
                navigation.navigate('Wallet');
              },
            },
          ]
        );
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Verification Failed', response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error.response?.data?.message || 'Failed to verify OTP. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Note: Resend would require a new API endpoint
      // For now, just restart the timer
      setResendTimer(60);
      setOtp('');
      Alert.alert('OTP Resent', 'A new OTP has been sent to your phone.');
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    }
  };

  const formatOTPDisplay = () => {
    const display = [];
    for (let i = 0; i < otpLength; i++) {
      display.push(otp[i] || '');
    }
    return display;
  };

  const methodName = method === 'alfa_wallet' ? 'Alfa Wallet' : 'Bank Account';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Verify OTP"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Info Card */}
        <Card style={styles.infoCard} shadow="md">
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="shield-checkmark" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Enter OTP
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {message || `A ${otpLength}-digit OTP has been sent to your registered mobile number for ${methodName} payment.`}
          </Text>
        </Card>

        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
            Amount
          </Text>
          <Text style={[styles.amountValue, { color: colors.text }]}>
            Rs. {amount?.toLocaleString()}
          </Text>
        </View>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          <View style={styles.otpBoxes}>
            {formatOTPDisplay().map((digit, index) => (
              <View
                key={index}
                style={[
                  styles.otpBox,
                  {
                    borderColor: digit ? colors.primary : colors.border,
                    backgroundColor: digit ? colors.primary + '10' : colors.surface,
                  },
                ]}
              >
                <Text style={[styles.otpDigit, { color: colors.text }]}>
                  {digit}
                </Text>
              </View>
            ))}
          </View>

          {/* Hidden input for keyboard */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={otp}
            onChangeText={(text) => {
              const cleaned = text.replace(/[^0-9]/g, '').slice(0, otpLength);
              setOtp(cleaned);
              Haptics.selectionAsync();
            }}
            keyboardType="number-pad"
            maxLength={otpLength}
            autoFocus
          />
        </View>

        {/* Resend Timer */}
        <TouchableOpacity
          style={styles.resendContainer}
          onPress={handleResend}
          disabled={resendTimer > 0}
        >
          {resendTimer > 0 ? (
            <Text style={[styles.resendText, { color: colors.textTertiary }]}>
              Resend OTP in {resendTimer}s
            </Text>
          ) : (
            <Text style={[styles.resendText, { color: colors.primary }]}>
              Resend OTP
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + spacing.md,
          },
          shadows.lg,
        ]}
      >
        <Button
          title={otp.length === otpLength ? 'Verify & Pay' : `Enter ${otpLength}-digit OTP`}
          onPress={handleVerify}
          variant="primary"
          size="large"
          loading={loading}
          disabled={otp.length < otpLength}
          icon="checkmark-circle"
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  infoCard: {
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.h4,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  amountLabel: {
    fontSize: typography.bodySmall,
    marginBottom: spacing.xs,
  },
  amountValue: {
    fontSize: typography.h3,
    fontWeight: '700',
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  otpBoxes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  otpBox: {
    width: 44,
    height: 56,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpDigit: {
    fontSize: typography.h4,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  resendContainer: {
    alignItems: 'center',
    padding: spacing.md,
  },
  resendText: {
    fontSize: typography.body,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
});

export default OTPVerificationScreen;
