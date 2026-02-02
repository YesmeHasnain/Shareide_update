import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import { Button } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { defaultMaleAvatar, defaultFemaleAvatar, maleAvatars, femaleAvatars } from '../../utils/avatars';

const ProfileSetupScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const { phone, gender, verificationToken, token, user, isNewUser } = route.params;

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarPress = () => {
    pickImage();
  };

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to upload a profile picture.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setProfileImage(result.assets[0]);
    }
  };

  const handleComplete = async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const registrationData = {
        verification_token: verificationToken,
        name: name.trim(),
        gender: gender,
      };

      if (email.trim()) {
        registrationData.email = email.trim();
      }

      const response = await authAPI.completeRegistration(registrationData);

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await login(response.user, response.token);

        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }],
        });
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message =
        error.response?.data?.message ||
        'Failed to complete registration. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
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

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.primary, width: '100%' },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.textSecondary }]}>
            Step 3 of 3 - Almost done!
          </Text>
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View>
            <TouchableOpacity onPress={handleAvatarPress} activeOpacity={0.9}>
              <LinearGradient
                colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
                style={[styles.avatarContainer, shadows.goldLg]}
              >
                {profileImage ? (
                  <Image
                    source={{ uri: profileImage.uri }}
                    style={styles.avatar}
                  />
                ) : (
                  <Image
                    source={gender === 'male' ? defaultMaleAvatar : defaultFemaleAvatar}
                    style={styles.avatarPlaceholder}
                  />
                )}
                <View style={[styles.cameraButton, { backgroundColor: colors.background }]}>
                  <Ionicons name="camera" size={18} color={colors.primary} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
            Tap to add your photo
          </Text>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.text }]}>
            Complete Your Profile
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Tell us a bit about yourself
          </Text>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          {/* Name Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              FULL NAME *
            </Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.surface },
                shadows.sm,
              ]}
            >
              <Ionicons name="person" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="words"
                editable={!loading}
              />
              {name.length > 2 && (
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              )}
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              EMAIL (OPTIONAL)
            </Text>
            <View
              style={[
                styles.inputContainer,
                { backgroundColor: colors.surface },
                shadows.sm,
              ]}
            >
              <Ionicons name="mail" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
              {email.includes('@') && email.includes('.') && (
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              )}
            </View>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          <View style={[styles.infoRow, { gap: spacing.md }]}>
            <View
              style={[styles.infoCard, { backgroundColor: colors.surface }, shadows.sm]}
            >
              <Ionicons name="call" size={20} color={colors.primary} />
              <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>
                Phone
              </Text>
              <Text style={[styles.infoCardValue, { color: colors.text }]}>
                +92 {phone}
              </Text>
            </View>

            <View
              style={[styles.infoCard, { backgroundColor: colors.surface }, shadows.sm]}
            >
              <Ionicons
                name={gender === 'male' ? 'man' : 'woman'}
                size={20}
                color={colors.primary}
              />
              <Text style={[styles.infoCardLabel, { color: colors.textSecondary }]}>
                Gender
              </Text>
              <Text
                style={[
                  styles.infoCardValue,
                  { color: colors.text, textTransform: 'capitalize' },
                ]}
              >
                {gender}
              </Text>
            </View>
          </View>
        </View>

        {/* Benefits Box */}
        <View style={[styles.benefitsBox, { backgroundColor: colors.success + '15' }]}>
          <View
            style={[
              styles.benefitsIcon,
              { backgroundColor: colors.success + '20' },
            ]}
          >
            <Ionicons name="gift" size={24} color={colors.success} />
          </View>
          <View style={styles.benefitsContent}>
            <Text style={[styles.benefitsTitle, { color: colors.text }]}>
              Welcome Gift!
            </Text>
            <Text style={[styles.benefitsText, { color: colors.textSecondary }]}>
              Get Rs. 100 in your wallet on first ride
            </Text>
          </View>
        </View>

        {/* Button Section */}
        <View style={styles.buttonSection}>
          <Button
            title="Complete Registration"
            onPress={handleComplete}
            variant="primary"
            size="large"
            loading={loading}
            disabled={!name.trim()}
            icon="checkmark-done"
            fullWidth
          />

          <Text style={[styles.termsText, { color: colors.textTertiary }]}>
            By completing registration, you agree to our{' '}
            <Text style={{ color: colors.primary }}>Terms of Service</Text> and{' '}
            <Text style={{ color: colors.primary }}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

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
    marginBottom: spacing.md,
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  avatarPlaceholder: {
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
  },
  avatarHint: {
    fontSize: typography.caption,
    marginTop: spacing.sm,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.body,
  },
  formSection: {
    gap: spacing.lg,
    marginBottom: spacing.xl,
  },
  inputGroup: {
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '700',
    marginLeft: spacing.xs,
    letterSpacing: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  infoCardLabel: {
    fontSize: typography.caption,
  },
  infoCardValue: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  benefitsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  benefitsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitsContent: {
    flex: 1,
  },
  benefitsTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: 2,
  },
  benefitsText: {
    fontSize: typography.bodySmall,
  },
  buttonSection: {
    gap: spacing.md,
    marginTop: 'auto',
  },
  termsText: {
    fontSize: typography.caption,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default ProfileSetupScreen;
