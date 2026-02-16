import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const OnboardingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
            <View style={styles.arrowContainer}>
              <View style={styles.arrowLeft} />
              <View style={styles.arrowRight} />
            </View>
          </View>
          <Text style={[styles.brandName, { color: colors.text }]}>
            SH<Text style={[styles.brandArrow, { color: colors.primary }]}>A</Text>REIDE
          </Text>
        </View>

        {/* Illustration */}
        <View style={styles.illustrationSection}>
          <View style={styles.carIllustration}>
            <View style={styles.carBody}>
              <View style={styles.carRoof} />
              <View style={styles.carWindows}>
                <View style={styles.carWindow} />
                <View style={styles.carWindow} />
              </View>
            </View>
            <View style={styles.wheelsContainer}>
              <View style={styles.wheel} />
              <View style={styles.wheel} />
            </View>
          </View>
          <View style={styles.personIcon}>
            <Ionicons name="person" size={32} color="#FFF" />
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>Your ride, your way</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Book affordable rides across Pakistan. Safe, reliable, and always at your fingertips.
        </Text>
      </View>

      {/* Bottom Buttons */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.replace('Phone')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>

        <Text style={[styles.termsText, { color: colors.textTertiary }]}>
          By continuing, you agree to our{' '}
          <Text style={[styles.linkText, { color: colors.primary }]}>Terms</Text> &{' '}
          <Text style={[styles.linkText, { color: colors.primary }]}>Privacy Policy</Text>
        </Text>
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
    paddingHorizontal: 24,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  arrowLeft: {
    width: 0,
    height: 0,
    borderTopWidth: 14,
    borderBottomWidth: 14,
    borderRightWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#FFFFFF',
    marginRight: -3,
  },
  arrowRight: {
    width: 0,
    height: 0,
    borderTopWidth: 14,
    borderBottomWidth: 14,
    borderLeftWidth: 18,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
    marginLeft: -3,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 2,
  },
  brandArrow: {
  },
  illustrationSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 200,
  },
  carIllustration: {
    alignItems: 'center',
  },
  carBody: {
    width: 140,
    height: 60,
    backgroundColor: '#86EFAC',
    borderRadius: 30,
    position: 'relative',
  },
  carRoof: {
    position: 'absolute',
    top: -20,
    left: 30,
    width: 80,
    height: 30,
    backgroundColor: '#86EFAC',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  carWindows: {
    position: 'absolute',
    top: -15,
    left: 35,
    flexDirection: 'row',
    gap: 4,
  },
  carWindow: {
    width: 32,
    height: 20,
    backgroundColor: '#BFDBFE',
    borderRadius: 4,
  },
  wheelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 110,
    marginTop: -12,
  },
  wheel: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#374151',
  },
  personIcon: {
    position: 'absolute',
    right: 60,
    bottom: 40,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#86EFAC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  bottomSection: {
    paddingHorizontal: 24,
  },
  primaryButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  termsText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
  },
});

export default OnboardingScreen;
