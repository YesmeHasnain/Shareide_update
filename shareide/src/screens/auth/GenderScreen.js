import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { defaultMaleAvatar, defaultFemaleAvatar } from '../../utils/avatars';

const GenderScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { phone, verificationToken, token, user, isNewUser } = route.params;
  const [gender, setGender] = useState(user?.gender || null);

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

  const GenderCard = ({ type, avatarImage, label, isSelected }) => (
    <TouchableOpacity
      onPress={() => handleSelect(type)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={
          isSelected
            ? colors.gradients?.premium || ['#FFD700', '#FFA500']
            : [colors.surface, colors.surface]
        }
        style={[
          styles.genderCard,
          isSelected && shadows.goldLg,
          !isSelected && { borderWidth: 2, borderColor: colors.border },
        ]}
      >
        <View
          style={[
            styles.avatarContainer,
            {
              backgroundColor: isSelected ? 'rgba(0,0,0,0.1)' : colors.background,
              borderWidth: isSelected ? 3 : 0,
              borderColor: '#000',
            },
          ]}
        >
          <Image
            source={avatarImage}
            style={styles.avatarImage}
            resizeMode="cover"
          />
        </View>

        <Text
          style={[
            styles.genderLabel,
            { color: isSelected ? '#000' : colors.text },
          ]}
        >
          {label}
        </Text>

        {isSelected && (
          <View style={styles.checkContainer}>
            <Ionicons name="checkmark-circle" size={28} color="#000" />
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingTop: insets.top + spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      <View>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Header Section */}
      <View style={styles.header}>
        <LinearGradient
          colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
          style={[styles.iconContainer, shadows.goldLg]}
        >
          <Ionicons name="people" size={48} color="#000" />
        </LinearGradient>

        <Text style={[styles.title, { color: colors.text }]}>
          Select Your Gender
        </Text>

        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          This helps us personalize your ride experience
        </Text>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: colors.primary, width: '33%' },
            ]}
          />
        </View>
        <Text style={[styles.progressText, { color: colors.textSecondary }]}>
          Step 1 of 3
        </Text>
      </View>

      {/* Gender Selection */}
      <View style={styles.genderSection}>
        <View style={styles.genderRow}>
          <GenderCard
            type="male"
            avatarImage={defaultMaleAvatar}
            label="Male"
            isSelected={gender === 'male'}
          />
          <GenderCard
            type="female"
            avatarImage={defaultFemaleAvatar}
            label="Female"
            isSelected={gender === 'female'}
          />
        </View>
      </View>

      {/* Info Box */}
      <View style={[styles.infoBox, { backgroundColor: colors.primary + '15' }]}>
        <View
          style={[styles.infoIconContainer, { backgroundColor: colors.primary + '20' }]}
        >
          <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
        </View>
        <Text style={[styles.infoText, { color: colors.text }]}>
          Female riders can choose female-only drivers for added comfort and safety
        </Text>
      </View>

      {/* Button Section */}
      <View style={styles.buttonSection}>
        <Button
          title="Continue"
          onPress={handleContinue}
          variant="primary"
          size="large"
          disabled={!gender}
          icon="arrow-forward"
          fullWidth
        />
      </View>

      {/* Features */}
      <View style={styles.featuresSection}>
        <View style={styles.featureRow}>
          <FeatureItem
            icon="heart"
            label="Personalized"
            colors={colors}
          />
          <FeatureItem
            icon="lock-closed"
            label="Private"
            colors={colors}
          />
          <FeatureItem
            icon="star"
            label="Premium"
            colors={colors}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const FeatureItem = ({ icon, label, colors }) => (
  <View style={styles.featureItem}>
    <View
      style={[styles.featureIconContainer, { backgroundColor: colors.primary + '15' }]}
    >
      <Ionicons name={icon} size={18} color={colors.primary} />
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
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
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
  progressContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  progressBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  genderSection: {
    marginBottom: spacing.xl,
  },
  genderRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  genderCard: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  genderLabel: {
    fontSize: typography.h4,
    fontWeight: '700',
  },
  checkContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  buttonSection: {
    marginBottom: spacing.xl,
  },
  featuresSection: {
    marginTop: 'auto',
  },
  featureRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  featureItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
});

export default GenderScreen;
