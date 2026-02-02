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
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { authAPI } from '../../api/auth';

const DEV_MODE = false; // Disable dev mode - use real API

const PhoneScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleContinue = async () => {
    if (phone.length !== 10 && phone.length !== 11) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Enter valid phone number (03XXXXXXXXX)');
      return;
    }

    // DEV MODE: Skip API call
    if (DEV_MODE) {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      setLoading(false);
      navigation.navigate('OTP', {
        phone,
        isExistingUser: false,
      });
      return;
    }

    // Real API call (disabled in dev mode)
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response = await authAPI.sendCode(phone);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('OTP', {
        phone,
        isExistingUser: response.is_existing_user || false,
      });

      if (response.debug_code) {
        Alert.alert('Dev Mode', `OTP: ${response.debug_code}`);
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const isValidPhone = phone.length >= 10;

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
          {/* Header Section */}
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
              style={[styles.logoContainer, shadows.goldLg]}
            >
              <Text style={styles.logoText}>S</Text>
            </LinearGradient>

            <Text style={[styles.title, { color: colors.text }]}>
              Welcome to SHAREIDE
            </Text>

            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Pakistan's smartest ride-sharing platform
            </Text>
          </Animated.View>

          {/* Input Section */}
          <Animated.View
            style={[
              styles.inputSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              PHONE NUMBER
            </Text>

            <View
              style={[
                styles.inputRow,
                { backgroundColor: colors.surface },
                shadows.md,
              ]}
            >
              <View style={styles.prefixContainer}>
                <View style={[styles.flagIcon, { backgroundColor: '#006600' }]}>
                  <Text style={styles.flagText}>🇵🇰</Text>
                </View>
                <Text style={[styles.prefixText, { color: colors.text }]}>
                  +92
                </Text>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={phone}
                onChangeText={(t) => {
                  setPhone(t.replace(/[^0-9]/g, '').slice(0, 11));
                  Haptics.selectionAsync();
                }}
                placeholder="3XX XXXXXXX"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
                editable={!loading}
                maxLength={11}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />

              {isValidPhone && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.success}
                />
              )}
            </View>

            {/* Info Box */}
            <View style={[styles.infoBox, { backgroundColor: colors.primary + '15' }]}>
              <View
                style={[
                  styles.infoIconContainer,
                  { backgroundColor: colors.primary + '20' },
                ]}
              >
                <Ionicons name="logo-whatsapp" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.infoText, { color: colors.text }]}>
                We'll send a verification code via WhatsApp
              </Text>
            </View>

            {DEV_MODE && (
              <View style={[styles.devBadge, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.devText, { color: colors.warning }]}>
                  Dev Mode: OTP will be 123456
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Button Section */}
          <Animated.View
            style={[
              styles.buttonSection,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <Button
              title="Continue"
              onPress={handleContinue}
              variant="primary"
              size="large"
              loading={loading}
              disabled={!isValidPhone}
              icon="arrow-forward"
              fullWidth
            />

            <Text style={[styles.hint, { color: colors.textTertiary }]}>
              By continuing, you agree to our{' '}
              <Text style={{ color: colors.primary }}>Terms of Service</Text>
              {' & '}
              <Text style={{ color: colors.primary }}>Privacy Policy</Text>
            </Text>
          </Animated.View>

          {/* Features Section */}
          <Animated.View
            style={[
              styles.featuresSection,
              {
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.featureRow}>
              <FeatureItem
                icon="shield-checkmark"
                label="Safe Rides"
                colors={colors}
              />
              <FeatureItem
                icon="cash"
                label="Best Fares"
                colors={colors}
              />
              <FeatureItem
                icon="flash"
                label="Quick Booking"
                colors={colors}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const FeatureItem = ({ icon, label, colors }) => (
  <View style={styles.featureItem}>
    <View
      style={[
        styles.featureIconContainer,
        { backgroundColor: colors.primary + '15' },
      ]}
    >
      <Ionicons name={icon} size={20} color={colors.primary} />
    </View>
    <Text style={[styles.featureLabel, { color: colors.textSecondary }]}>
      {label}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#000',
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
  },
  inputSection: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '700',
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 64,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  prefixContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flagIcon: {
    width: 28,
    height: 20,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagText: {
    fontSize: 16,
  },
  prefixText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    height: 28,
    marginHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.h5,
    fontWeight: '600',
    letterSpacing: 1,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  devBadge: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  devText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  buttonSection: {
    gap: spacing.lg,
  },
  hint: {
    fontSize: typography.caption,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
  },
  featuresSection: {
    marginTop: spacing.xxl,
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  featureItem: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
});

export default PhoneScreen;
