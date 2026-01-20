import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { authAPI } from '../../api/auth';

const OTPScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    try {
      setLoading(true);
      const response = await authAPI.verifyOTP(phone, otp);

      // Navigate to Gender screen with verification data
      navigation.navigate('Gender', {
        phone,
        code: otp,
        token: response.token,
        isNewUser: response.is_new_user !== false
      });
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
      await authAPI.sendOTP(phone);
      Alert.alert('Success', 'OTP sent successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP.';
      Alert.alert('Error', message);
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.emoji}>📱</Text>
      <Text style={[styles.title, { color: colors.text }]}>Enter OTP</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sent to +92 {phone}</Text>
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
          <Text style={[styles.resendText, { color: colors.primary }]}>Resend OTP</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  emoji: { fontSize: 80, textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 40 },
  input: { height: 60, borderRadius: 12, paddingHorizontal: 16, fontSize: 24, textAlign: 'center', marginBottom: 24 },
  button: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  resendButton: { marginTop: 24, alignItems: 'center', padding: 12 },
  resendText: { fontSize: 16, fontWeight: '600' },
});

export default OTPScreen;
