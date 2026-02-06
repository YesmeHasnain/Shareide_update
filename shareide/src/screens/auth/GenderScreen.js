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

const PRIMARY_COLOR = '#FCC014';

const GenderScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Select your Gender</Text>
        <Text style={styles.subtitle}>Please select your gender</Text>

        {/* Gender Cards */}
        <View style={styles.genderRow}>
          {/* Female Card */}
          <TouchableOpacity
            style={[
              styles.genderCard,
              gender === 'female' && styles.genderCardSelected,
            ]}
            onPress={() => handleSelect('female')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FFE4E6' }]}>
              <Ionicons name="female" size={32} color="#FB7185" />
            </View>
            <Text style={styles.genderLabel}>Female</Text>
          </TouchableOpacity>

          {/* Male Card */}
          <TouchableOpacity
            style={[
              styles.genderCard,
              gender === 'male' && styles.genderCardSelected,
            ]}
            onPress={() => handleSelect('male')}
            activeOpacity={0.8}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="male" size={32} color="#60A5FA" />
            </View>
            <Text style={styles.genderLabel}>Male</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            { backgroundColor: gender ? PRIMARY_COLOR : '#F3F4F6' },
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
              { color: gender ? '#000' : '#9CA3AF' }
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
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
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 48,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 16,
  },
  genderCard: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  genderCardSelected: {
    borderWidth: 2,
    borderColor: PRIMARY_COLOR,
    backgroundColor: '#FFFBEB',
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
  },
  continueText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GenderScreen;
