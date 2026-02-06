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

const PRIMARY_COLOR = '#FCC014';

const OnboardingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Content */}
      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={styles.logoBox}>
            <View style={styles.arrowContainer}>
              <View style={styles.arrowLeft} />
              <View style={styles.arrowRight} />
            </View>
          </View>
          <Text style={styles.brandName}>
            SH<Text style={styles.brandArrow}>A</Text>REIDE
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
        <Text style={styles.title}>How will you use Shareide?</Text>
        <Text style={styles.subtitle}>
          Let us know how you intend to use Shareide, this helps us personalise your experience.
        </Text>
      </View>

      {/* Bottom Buttons */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.replace('Phone')}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Passenger</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.replace('Phone')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryButtonText}>Driver</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By continuing, you agree to our{' '}
          <Text style={styles.linkText}>Terms</Text> &{' '}
          <Text style={styles.linkText}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: PRIMARY_COLOR,
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
    color: '#1A1A2E',
    letterSpacing: 2,
  },
  brandArrow: {
    color: PRIMARY_COLOR,
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
    color: '#000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
  },
  bottomSection: {
    paddingHorizontal: 24,
  },
  primaryButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  secondaryButton: {
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  termsText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: PRIMARY_COLOR,
  },
});

export default OnboardingScreen;
