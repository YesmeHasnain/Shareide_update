import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';

const OTPScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { login } = useAuth();
  const { phone, isExistingUser } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    try {
      setLoading(true);
      const response = await authAPI.verifyCode(phone, otp);

      if (response.success) {
        // Case 1: Existing user with complete profile - go directly to home
        if (!response.is_new_user && !response.needs_profile_setup) {
          await login(response.user, response.token);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Drawer' }],
          });
          return;
        }

        // Case 2: Existing user but needs profile setup
        if (!response.is_new_user && response.needs_profile_setup) {
          // User exists but profile incomplete - go to Gender screen with token
          navigation.navigate('Gender', {
            phone,
            token: response.token,
            user: response.user,
            isNewUser: false,
          });
          return;
        }

        // Case 3: New user - needs to complete registration
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
      const message = error.response?.data?.message || 'Invalid OTP. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setResending(true);
      await authAPI.sendCode(phone);
      Alert.alert('Success', 'OTP sent via WhatsApp!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP.';
      Alert.alert('Error', message);
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.emoji}>💬</Text>
      <Text style={[styles.title, { color: colors.text }]}>Enter OTP</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        We sent a code via WhatsApp to
      </Text>
      <Text style={[styles.phoneText, { color: colors.primary }]}>+92 {phone}</Text>

      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
        value={otp}
        onChangeText={(t) => setOtp(t.replace(/[^0-9]/g, '').slice(0, 6))}
        placeholder='000000'
        placeholderTextColor={colors.textSecondary}
        keyboardType='number-pad'
        maxLength={6}
        autoFocus
        editable={!loading}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: otp.length === 6 && !loading ? colors.primary : colors.border }]}
        onPress={handleVerify}
        disabled={otp.length !== 6 || loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Verify</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.resendButton}
        onPress={handleResendOTP}
        disabled={resending}
      >
        {resending ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <Text style={[styles.resendText, { color: colors.primary }]}>Resend via WhatsApp</Text>
        )}
      </TouchableOpacity>

      <Text style={[styles.hint, { color: colors.textSecondary }]}>
        Check your WhatsApp for the verification code
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  emoji: { fontSize: 80, textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center' },
  phoneText: { fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 40 },
  input: { height: 60, borderRadius: 12, paddingHorizontal: 16, fontSize: 24, textAlign: 'center', marginBottom: 24 },
  button: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  resendButton: { marginTop: 24, alignItems: 'center', padding: 12 },
  resendText: { fontSize: 16, fontWeight: '600' },
  hint: { fontSize: 14, textAlign: 'center', marginTop: 16 },
});

export default OTPScreen;
