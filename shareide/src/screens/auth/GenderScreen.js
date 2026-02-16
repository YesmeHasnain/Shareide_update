import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

const GenderScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const params = route?.params || {};
  const { phone, verificationToken, token, user, isNewUser } = params;
  const [gender, setGender] = useState(user?.gender || null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (selected) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setGender(selected);
  };

  const handleContinue = () => {
    if (gender) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      navigation.navigate('ProfileSetup', {
        phone,
        gender,
        verificationToken,
        token,
        user,
        isNewUser,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
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
        <Text style={[styles.title, { color: colors.text }]}>Select your Gender</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Please select your gender</Text>

        {/* Gender Cards */}
        <View style={styles.genderRow}>
          {/* Female Card */}
          <TouchableOpacity
            style={[
              styles.genderCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              gender === 'female' && { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.warningLight },
            ]}
            onPress={() => handleSelect('female')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.genderFemaleLight }]}>
              <Ionicons name="female" size={32} color={colors.genderFemale} />
            </View>
            <Text style={[styles.genderLabel, { color: colors.text }]}>Female</Text>
          </TouchableOpacity>

          {/* Male Card */}
          <TouchableOpacity
            style={[
              styles.genderCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              gender === 'male' && { borderWidth: 2, borderColor: colors.primary, backgroundColor: colors.warningLight },
            ]}
            onPress={() => handleSelect('male')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: colors.genderMaleLight }]}>
              <Ionicons name="male" size={32} color={colors.genderMale} />
            </View>
            <Text style={[styles.genderLabel, { color: colors.text }]}>Male</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: gender ? colors.primary : colors.borderLight },
          ]}
          onPress={handleContinue}
          disabled={!gender || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={[
              styles.continueText,
              { color: gender ? '#000' : colors.textTertiary }
            ]}>
              Continue
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 48,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 16,
  },
  genderCard: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: '600',
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

export default GenderScreen;
