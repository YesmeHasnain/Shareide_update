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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { authAPI } from '../../api/auth';

const PhoneScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Normalize phone: accept 03303733184 or 3303733184, send as +923303733184
  const normalizePhone = (num) => {
    let cleaned = num.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1); // 03303733184 -> 3303733184
    }
    if (cleaned.startsWith('92') && cleaned.length === 12) {
      return '+' + cleaned;
    }
    return '+92' + cleaned; // -> +923303733184
  };

  const handleContinue = async () => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    // Accept: 03xxxxxxxxx (11 digits) or 3xxxxxxxxx (10 digits)
    if (cleaned.length < 10 || cleaned.length > 11) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Number', 'Please enter a valid phone number (e.g. 03303733184)');
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const formattedPhone = normalizePhone(cleaned);
      const response = await authAPI.sendCode(formattedPhone);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('OTP', {
        phone: formattedPhone,
        isExistingUser: response.is_existing_user || false,
      });

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

  const cleanedPhone = phone.replace(/[^0-9]/g, '');
  const isValidPhone = cleanedPhone.length >= 10 && cleanedPhone.length <= 11;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header with Back Button */}
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.borderLight }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>Enter Your Contact Details</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your phone number with valid country code so others can reach you
          </Text>

          {/* Phone Input */}
          <View style={styles.inputRow}>
            {/* Country Code */}
            <TouchableOpacity style={[styles.countryBox, { borderColor: colors.border }]}>
              <Text style={styles.flag}>🇵🇰</Text>
              <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Phone Input */}
            <View style={[styles.phoneInputBox, { backgroundColor: colors.inputBackground }]}>
              <TextInput
                style={[styles.phoneInput, { color: colors.text }]}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 11))}
                placeholder="Phone number"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
                editable={!loading}
                maxLength={11}
              />
            </View>
          </View>
        </View>

        {/* Bottom Button */}
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              { backgroundColor: isValidPhone ? colors.primary : colors.borderLight },
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
                { color: isValidPhone ? '#000' : colors.textTertiary }
              ]}>
                Send verification code
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
    borderWidth: 1,
    gap: 6,
  },
  flag: {
    fontSize: 20,
  },
  phoneInputBox: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  phoneInput: {
    fontSize: 16,
  },
  bottomSection: {
    paddingHorizontal: 24,
  },
  continueButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PhoneScreen;

