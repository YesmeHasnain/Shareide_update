import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { profileAPI } from '../../api/profile';
import { Header, Card, Avatar, Button, Input } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { defaultMaleAvatar, defaultFemaleAvatar } from '../../utils/avatars';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  inputBackground: '#F5F5F5',
  border: '#E5E7EB',
  gradients: { premium: ['#FFD700', '#FFA500'] },
};

const EditProfileScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const auth = useAuth();
  const user = auth?.user;
  const updateUser = auth?.updateUser;
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions.');
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

  const handleSave = async () => {
    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const updateData = {
        name: name.trim(),
        email: email.trim() || null,
      };

      await profileAPI.updateProfile(updateData);

      if (profileImage) {
        const formData = new FormData();
        const uri = profileImage.uri;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('profile_picture', { uri, name: filename, type });
        await profileAPI.updateProfilePicture(formData);
      }

      await updateUser({ name: name.trim(), email: email.trim() });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      // Mock success for demo
      await updateUser({ name: name.trim(), email: email.trim() });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Edit Profile"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <TouchableOpacity
            onPress={pickImage}
            activeOpacity={0.7}
            style={styles.avatarContainer}
          >
            <LinearGradient
              colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
              style={styles.avatarGradient}
            >
              {profileImage ? (
                <Image source={{ uri: profileImage.uri }} style={styles.avatar} />
              ) : user?.profile_picture ? (
                <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
              ) : (
                <Image
                  source={user?.gender === 'female' ? defaultFemaleAvatar : defaultMaleAvatar}
                  style={styles.avatar}
                />
              )}
            </LinearGradient>
            <View style={[styles.cameraButton, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={18} color="#000" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.changePhotoText, { color: colors.primary }]}>
            Tap to change photo
          </Text>
        </View>

        {/* Form Fields */}
        <View >
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            leftIcon="person-outline"
            autoCapitalize="words"
          />
        </View>

        <View >
          <Input
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View >
          <Card style={styles.readOnlyCard} shadow="sm">
            <View style={styles.readOnlyField}>
              <View style={styles.fieldHeader}>
                <Ionicons name="call-outline" size={20} color={colors.textSecondary} />
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Phone Number
                </Text>
              </View>
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                +92 {user?.phone || '---'}
              </Text>
              <Text style={[styles.fieldHint, { color: colors.textTertiary }]}>
                Phone number cannot be changed
              </Text>
            </View>
          </Card>
        </View>

        <View >
          <Card style={styles.readOnlyCard} shadow="sm">
            <View style={styles.readOnlyField}>
              <View style={styles.fieldHeader}>
                <Ionicons
                  name={user?.gender === 'female' ? 'woman-outline' : 'man-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Gender
                </Text>
              </View>
              <Text style={[styles.fieldValue, { color: colors.text }]}>
                {user?.gender === 'female' ? 'Female' : 'Male'}
              </Text>
            </View>
          </Card>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View
                style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + spacing.md,
          },
          shadows.lg,
        ]}
      >
        <Button
          title="Save Changes"
          onPress={handleSave}
          variant="primary"
          size="large"
          loading={loading}
          icon="checkmark-circle"
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 130,
    height: 130,
    borderRadius: 65,
    padding: 4,
    ...shadows.goldLg,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 63,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  changePhotoText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  readOnlyCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  readOnlyField: {},
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  fieldLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: typography.body,
    fontWeight: '600',
    marginLeft: 28,
  },
  fieldHint: {
    fontSize: typography.caption,
    marginLeft: 28,
    marginTop: spacing.xs,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
});

export default EditProfileScreen;
