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
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';
import apiClient from '../../api/client';
import { maleAvatars, femaleAvatars } from '../../utils/avatars';

const PRIMARY_COLOR = '#FCC014';
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_SIZE = (SCREEN_WIDTH - 80) / 5;

const ProfileSetupScreen = ({ route, navigation }) => {
  const auth = useAuth();
  const login = auth?.login;
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const { phone, gender, verificationToken, token, user, isNewUser } = params;

  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(null);
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const avatars = gender === 'male' ? maleAvatars : gender === 'female' ? femaleAvatars : maleAvatars;

  const selectAvatar = (index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedAvatarIndex(index);
    setProfileImage(null);
    setShowAvatarModal(false);
  };

  const getProfileDisplay = () => {
    if (profileImage) return { uri: profileImage.uri };
    if (selectedAvatarIndex !== null && avatars[selectedAvatarIndex]) return avatars[selectedAvatarIndex];
    return null;
  };

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
      setSelectedAvatarIndex(null);
    }
  };

  const takePhoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera permissions.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setProfileImage(result.assets[0]);
      setSelectedAvatarIndex(null);
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

      if (token && !isNewUser) {
        await login(user, token);
        await apiClient.put('/profile', { name: name.trim(), gender });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Navigator auto-switches to MainTabs via conditional rendering
      } else {
        if (!verificationToken) {
          Alert.alert('Error', 'Please go back and verify OTP again.');
          return;
        }

        const response = await authAPI.completeRegistration({
          verification_token: verificationToken,
          name: name.trim(),
          gender,
        });

        if (response.success) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await login(response.user, response.token);
          // Navigator auto-switches to MainTabs via conditional rendering
        }
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error.response?.data?.message || 'Failed to complete. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const isValid = name.trim().length > 2;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#000" />
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.title}>Add a Profile Picture</Text>
          <Text style={styles.subtitle}>
            Help drivers or riders identify you more easily, this increases trust.
          </Text>

          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.9}>
              <View style={styles.avatarContainer}>
                {getProfileDisplay() ? (
                  <Image source={getProfileDisplay()} style={styles.avatar} />
                ) : (
                  <Ionicons name="person" size={48} color="#9CA3AF" />
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Name Input */}
          <View style={styles.inputSection}>
            <Text style={styles.label}>Your Name</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                editable={!loading}
              />
            </View>
          </View>
        </ScrollView>

        {/* Bottom Buttons */}
        <View style={[styles.bottomSection, { paddingBottom: insets.bottom + 24 }]}>
          {/* Take Selfie Button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: PRIMARY_COLOR }]}
            onPress={takePhoto}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Take a selfie</Text>
          </TouchableOpacity>

          {/* Choose from Library Button */}
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={pickImage}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryButtonText}>Choose from library</Text>
          </TouchableOpacity>

          {/* Choose Avatar Button */}
          <TouchableOpacity
            style={[styles.secondaryButton, { backgroundColor: '#E0E7FF', marginTop: 0 }]}
            onPress={() => setShowAvatarModal(true)}
            activeOpacity={0.8}
          >
            <Text style={[styles.secondaryButtonText, { color: '#4F46E5' }]}>Choose Shareide Avatar</Text>
          </TouchableOpacity>

          {/* Complete Button */}
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: isValid ? PRIMARY_COLOR : '#F3F4F6', marginTop: 24 },
            ]}
            onPress={handleComplete}
            disabled={!isValid || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={[styles.primaryButtonText, { color: isValid ? '#000' : '#9CA3AF' }]}>
                Complete Registration
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Avatar Selection Modal */}
      <Modal visible={showAvatarModal} transparent animationType="slide" onRequestClose={() => setShowAvatarModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowAvatarModal(false)} />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Choose Your Avatar</Text>
            <Text style={styles.modalSubtitle}>
              {gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : ''} Avatars
            </Text>
            <FlatList
              data={avatars}
              numColumns={5}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={styles.avatarGrid}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[
                    styles.avatarGridItem,
                    selectedAvatarIndex === index && { borderColor: PRIMARY_COLOR, borderWidth: 3 },
                  ]}
                  onPress={() => selectAvatar(index)}
                  activeOpacity={0.7}
                >
                  <Image source={item} style={styles.avatarGridImage} />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
    marginBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  inputBox: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 16,
    color: '#000',
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
  secondaryButton: {
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    color: '#000',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#6B7280',
    marginBottom: 16,
  },
  avatarGrid: {
    paddingHorizontal: 8,
  },
  avatarGridItem: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    margin: 4,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarGridImage: {
    width: '100%',
    height: '100%',
    borderRadius: AVATAR_SIZE / 2,
  },
});

export default ProfileSetupScreen;
