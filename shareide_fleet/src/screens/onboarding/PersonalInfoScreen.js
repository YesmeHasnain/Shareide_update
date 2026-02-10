import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { onboardingAPI } from '../../api/onboarding';
import { authAPI } from '../../api/auth';
import { maleAvatars, femaleAvatars } from '../../utils/avatars';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const AVATAR_SIZE = (SCREEN_WIDTH - 80) / 5;
const PRIMARY_COLOR = '#FCC014';

const PersonalInfoScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { updateUser, login, token: contextToken } = useAuth();
  const { verificationToken, isNewUser, phone } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [gender, setGender] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [selectedAvatarIndex, setSelectedAvatarIndex] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    cnic: '',
    address: '',
    city: '',
  });
  const [errors, setErrors] = useState({});

  const formatCNIC = (text) => {
    // Remove all non-digits
    const cleaned = text.replace(/\D/g, '');
    
    // Format: XXXXX-XXXXXXX-X
    if (cleaned.length <= 5) {
      return cleaned;
    } else if (cleaned.length <= 12) {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    } else {
      return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
    }
  };

  const handleChange = (field, value) => {
    if (field === 'cnic') {
      value = formatCNIC(value);
    }
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const avatars = gender === 'male' ? maleAvatars : gender === 'female' ? femaleAvatars : [];

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
      setProfileImage(result.assets[0]);
      setSelectedAvatarIndex(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const pickFromGallery = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant gallery permissions.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0]);
      setSelectedAvatarIndex(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

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

  const validate = () => {
    const newErrors = {};

    if (!gender) {
      newErrors.gender = 'Please select your gender';
    }
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.cnic || formData.cnic.length !== 15) {
      newErrors.cnic = 'Valid CNIC is required (XXXXX-XXXXXXX-X)';
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    console.log('=== PersonalInfo Submit ===');
    console.log('isNewUser:', isNewUser);
    console.log('verificationToken:', verificationToken ? 'exists' : 'missing');
    console.log('phone:', phone);

    try {
      // For new users, first complete registration to create user account
      if (isNewUser && verificationToken) {
        console.log('New user flow - calling completeRegistration');
        const fullName = `${formData.first_name} ${formData.last_name}`;
        const regResponse = await authAPI.completeRegistration({
          verification_token: verificationToken,
          name: fullName,
          gender: gender,
          email: formData.email || null,
          avatar_index: selectedAvatarIndex,
        });

        console.log('completeRegistration response:', JSON.stringify(regResponse, null, 2));

        if (!regResponse.success) {
          throw new Error(regResponse.message || 'Registration failed');
        }

        // Login with the new token
        console.log('Saving token to AsyncStorage...');
        await login(regResponse.user, regResponse.token);
        console.log('Token saved successfully');
      } else {
        console.log('Existing user flow - token should already be saved');
      }

      // Verify token exists before making authenticated request
      let savedToken = await AsyncStorage.getItem('userToken');
      console.log('Token in AsyncStorage:', savedToken ? 'exists' : 'MISSING!');

      // Fallback: if AsyncStorage was cleared by interceptor, restore from context
      if (!savedToken && contextToken) {
        console.log('Restoring token from AuthContext');
        await AsyncStorage.setItem('userToken', contextToken);
        savedToken = contextToken;
      }

      if (!savedToken) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Now submit personal info for driver onboarding
      console.log('Calling submitPersonalInfo...');
      const response = await onboardingAPI.submitPersonalInfo(formData);
      console.log('submitPersonalInfo response:', JSON.stringify(response, null, 2));

      if (response.success) {
        // Update user context
        await updateUser({
          ...formData,
          driver: response.data?.driver,
        });

        Alert.alert('Success', 'Personal information saved!', [
          { text: 'Continue', onPress: () => navigation.navigate('VehicleInfo') },
        ]);
      } else {
        throw new Error(response.message || 'Failed to save information');
      }
    } catch (error) {
      console.error('Personal info error:', error);
      console.error('Error response data:', error.response?.data);
      Alert.alert(
        'Error',
        error.response?.data?.message || error.message || 'Failed to save information'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '20%' }]} />
            </View>
            <Text style={[styles.stepText, { color: colors.textSecondary }]}>
              Step 1 of 5
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Personal Information
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Let's get to know you better
            </Text>
          </View>

          {/* Gender Selection */}
          <Text style={[styles.sectionLabel, { color: colors.text }]}>Gender *</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[
                styles.genderCard,
                { backgroundColor: colors.surface || '#F3F4F6' },
                gender === 'male' && { backgroundColor: PRIMARY_COLOR + '20', borderColor: PRIMARY_COLOR, borderWidth: 2 },
              ]}
              onPress={() => { setGender('male'); setSelectedAvatarIndex(null); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              activeOpacity={0.7}
            >
              <Ionicons name="male" size={28} color={gender === 'male' ? PRIMARY_COLOR : colors.textSecondary} />
              <Text style={[styles.genderText, { color: gender === 'male' ? PRIMARY_COLOR : colors.text }]}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.genderCard,
                { backgroundColor: colors.surface || '#F3F4F6' },
                gender === 'female' && { backgroundColor: '#EC489920', borderColor: '#EC4899', borderWidth: 2 },
              ]}
              onPress={() => { setGender('female'); setSelectedAvatarIndex(null); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              activeOpacity={0.7}
            >
              <Ionicons name="female" size={28} color={gender === 'female' ? '#EC4899' : colors.textSecondary} />
              <Text style={[styles.genderText, { color: gender === 'female' ? '#EC4899' : colors.text }]}>Female</Text>
            </TouchableOpacity>
          </View>
          {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

          {/* Profile Picture */}
          <Text style={[styles.sectionLabel, { color: colors.text, marginTop: 16 }]}>Profile Picture</Text>
          <View style={styles.profilePicSection}>
            <View style={styles.avatarPreview}>
              {getProfileDisplay() ? (
                <Image source={getProfileDisplay()} style={styles.avatarImage} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface || '#F3F4F6' }]}>
                  <Ionicons name="person" size={40} color={colors.textSecondary} />
                </View>
              )}
            </View>
            <View style={styles.picBtnRow}>
              <TouchableOpacity style={[styles.picBtn, { backgroundColor: PRIMARY_COLOR }]} onPress={takePhoto}>
                <Ionicons name="camera" size={18} color="#000" />
                <Text style={styles.picBtnText}>Selfie</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.picBtn, { backgroundColor: '#FEF3C7' }]} onPress={pickFromGallery}>
                <Ionicons name="images" size={18} color="#000" />
                <Text style={styles.picBtnText}>Gallery</Text>
              </TouchableOpacity>
              {gender && (
                <TouchableOpacity style={[styles.picBtn, { backgroundColor: '#E0E7FF' }]} onPress={() => setShowAvatarModal(true)}>
                  <Ionicons name="happy" size={18} color="#4F46E5" />
                  <Text style={[styles.picBtnText, { color: '#4F46E5' }]}>Avatar</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="First Name *"
              value={formData.first_name}
              onChangeText={(value) => handleChange('first_name', value)}
              placeholder="Ali"
              error={errors.first_name}
            />

            <Input
              label="Last Name *"
              value={formData.last_name}
              onChangeText={(value) => handleChange('last_name', value)}
              placeholder="Ahmed"
              error={errors.last_name}
            />

            <Input
              label="Email (Optional)"
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholder="ali@example.com"
              keyboardType="email-address"
              error={errors.email}
            />

            <Input
              label="CNIC *"
              value={formData.cnic}
              onChangeText={(value) => handleChange('cnic', value)}
              placeholder="42101-1234567-1"
              keyboardType="number-pad"
              maxLength={15}
              error={errors.cnic}
            />

            <Input
              label="Complete Address *"
              value={formData.address}
              onChangeText={(value) => handleChange('address', value)}
              placeholder="House 123, Street 5, Block A"
              multiline
              error={errors.address}
            />

            <Input
              label="City *"
              value={formData.city}
              onChangeText={(value) => handleChange('city', value)}
              placeholder="Karachi"
              error={errors.city}
            />
          </View>

          {/* Submit Button */}
          <Button
            title="Continue"
            onPress={handleSubmit}
            loading={loading}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Avatar Selection Modal */}
      <Modal visible={showAvatarModal} transparent animationType="slide" onRequestClose={() => setShowAvatarModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowAvatarModal(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.card || '#FFF' }]}>
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: colors.text }]}>Choose Your Avatar</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              {gender === 'male' ? 'Male' : 'Female'} Avatars
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
    </SafeAreaView>
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
  header: {
    marginTop: 20,
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepText: {
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  genderCard: {
    flex: 1,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  profilePicSection: {
    alignItems: 'center',
    marginBottom: 8,
  },
  avatarPreview: {
    marginBottom: 12,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  picBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  picBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 6,
  },
  picBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  form: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 24,
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
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
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

export default PersonalInfoScreen;