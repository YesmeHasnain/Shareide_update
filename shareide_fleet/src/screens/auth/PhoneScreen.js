import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { authAPI } from '../../api/auth';

const PhoneScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePhone = () => {
    const phoneRegex = /^03[0-9]{9}$/;
    return phoneRegex.test(phone);
  };

  const handleSendOTP = async () => {
    if (!validatePhone()) {
      Alert.alert('Error', 'Please enter a valid phone number (03XXXXXXXXX)');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.sendOTP(phone);
      
      if (response.success) {
        Alert.alert('Success', 'OTP sent successfully!');
        navigation.navigate('OTP', { phone });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to send OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>🚗</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>
            Shareide Fleet
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Drive. Earn. Grow.
          </Text>
        </View>

        {/* Phone Input */}
        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome Driver! 👋
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your phone number to get started
          </Text>

          <View style={styles.phoneInputContainer}>
            <View style={[styles.countryCode, { backgroundColor: colors.surface }]}>
              <Text style={[styles.countryCodeText, { color: colors.text }]}>
                🇵🇰 +92
              </Text>
            </View>
            <Input
              value={phone}
              onChangeText={setPhone}
              placeholder="3001234567"
              keyboardType="phone-pad"
              maxLength={11}
              style={styles.phoneInput}
            />
          </View>

          <Button
            title="Send OTP"
            onPress={handleSendOTP}
            loading={loading}
            style={styles.button}
          />

          <Text style={[styles.disclaimer, { color: colors.textSecondary }]}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 50,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  countryCode: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    marginRight: 12,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
    marginBottom: 0,
  },
  button: {
    marginTop: 8,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 18,
  },
});

export default PhoneScreen;