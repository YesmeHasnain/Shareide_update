import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authAPI } from '../../api/auth';

const PRIMARY_COLOR = '#FCC014';

const PhoneScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const normalizePhone = (input) => {
    const cleaned = input.replace(/[^0-9]/g, '');
    // Convert to +92 format (required by production API)
    if (cleaned.startsWith('0') && cleaned.length === 11) {
      return '+92' + cleaned.substring(1);
    }
    if (cleaned.startsWith('3') && cleaned.length === 10) {
      return '+92' + cleaned;
    }
    if (cleaned.startsWith('92') && cleaned.length === 12) {
      return '+' + cleaned;
    }
    return '+92' + cleaned;
  };

  const handleContinue = async () => {
    if (phone.length < 10) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Number', 'Please enter a valid phone number');
      return;
    }

    const normalizedPhone = normalizePhone(phone);

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response = await authAPI.sendOTP(normalizedPhone);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('OTP', { phone: normalizedPhone });

      if (response.debug_code) {
        Alert.alert('Dev Mode', `OTP: ${response.debug_code}`);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error.response?.data?.message || 'Failed to send OTP';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const isValidPhone = phone.length >= 10;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Dark Top Section */}
        <View style={[styles.darkSection, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.logoSection}>
            <Image
              source={require('../../../assets/logodarkmode.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>Drive. Earn. Grow.</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Enter Your Phone Number</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to get started as a driver partner
          </Text>

          {/* Phone Input */}
          <View style={styles.inputRow}>
            {/* Country Code */}
            <TouchableOpacity style={[
              styles.countryBox,
              isFocused && styles.countryBoxFocused,
            ]}>
              <Text style={styles.flag}>🇵🇰</Text>
              <Ionicons name="chevron-down" size={16} color="#666" />
            </TouchableOpacity>

            {/* Phone Input */}
            <View style={[
              styles.phoneInputBox,
              isFocused && styles.phoneInputBoxFocused,
            ]}>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 11))}
                placeholder="Phone number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                editable={!loading}
                maxLength={11}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </View>
          </View>
        </View>

        {/* Bottom Button */}
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              {
                backgroundColor: isValidPhone ? PRIMARY_COLOR : '#F3F4F6',
                shadowOpacity: isValidPhone ? 0.15 : 0,
              },
            ]}
            onPress={handleContinue}
            disabled={!isValidPhone || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[
                styles.continueText,
                { color: isValidPhone ? '#000' : '#9CA3AF' }
              ]}>
                Send verification code
              </Text>
            )}
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms</Text> &{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  // Dark top section
  darkSection: {
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoSection: {
    alignItems: 'center',
  },
  logo: {
    width: 220,
    height: 70,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginBottom: 32,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  countryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  countryBoxFocused: {
    borderColor: PRIMARY_COLOR,
  },
  flag: {
    fontSize: 20,
  },
  phoneInputBox: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  phoneInputBoxFocused: {
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#FFFFFF',
  },
  phoneInput: {
    fontSize: 16,
    color: '#000',
  },
  bottomSection: {
    paddingHorizontal: 24,
  },
  continueButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  linkText: {
    color: PRIMARY_COLOR,
  },
});

export default PhoneScreen;
