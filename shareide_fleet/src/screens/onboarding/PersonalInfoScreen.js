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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
const PRIMARY = '#FCC014';

const STEPS = [
  { label: 'Personal', active: true },
  { label: 'Vehicle', active: false },
  { label: 'Documents', active: false },
  { label: 'Selfie', active: false },
];

const PersonalInfoScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
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
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length <= 5) return cleaned;
    if (cleaned.length <= 12) return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 12)}-${cleaned.slice(12, 13)}`;
  };

  const handleChange = (field, value) => {
    if (field === 'cnic') value = formatCNIC(value);
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
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
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0]);
      setSelectedAvatarIndex(null);
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
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0]);
      setSelectedAvatarIndex(null);
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
    if (!gender) newErrors.gender = 'Please select your gender';
    if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.cnic || formData.cnic.length !== 15) newErrors.cnic = 'Valid CNIC required (XXXXX-XXXXXXX-X)';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      if (isNewUser && verificationToken) {
        const fullName = `${formData.first_name} ${formData.last_name}`;
        const regResponse = await authAPI.completeRegistration({
          verification_token: verificationToken,
          name: fullName,
          gender: gender,
          email: formData.email || null,
          avatar_index: selectedAvatarIndex,
        });

        if (!regResponse.success) throw new Error(regResponse.message || 'Registration failed');
        await login(regResponse.user, regResponse.token);
      }

      let savedToken = await AsyncStorage.getItem('userToken');
      if (!savedToken && contextToken) {
        await AsyncStorage.setItem('userToken', contextToken);
        savedToken = contextToken;
      }
      if (!savedToken) throw new Error('Authentication token not found. Please log in again.');

      const response = await onboardingAPI.submitPersonalInfo(formData);

      if (response.success) {
        await updateUser({ ...formData, driver: response.data?.driver });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.navigate('VehicleInfo');
      } else {
        throw new Error(response.message || 'Failed to save information');
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || error.message || 'Failed to save information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A14' : '#F5F5F5' }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Step Indicator */}
            <View style={styles.stepRow}>
              {STEPS.map((step, i) => (
                <View key={i} style={styles.stepItem}>
                  <View style={[
                    styles.stepDot,
                    i === 0 ? { backgroundColor: PRIMARY } : { backgroundColor: isDark ? '#333' : '#E5E7EB' },
                  ]}>
                    {i === 0 && <Ionicons name="checkmark" size={12} color="#000" />}
                  </View>
                  <Text style={[
                    styles.stepLabel,
                    { color: i === 0 ? PRIMARY : (isDark ? 'rgba(255,255,255,0.3)' : '#9CA3AF') },
                  ]}>{step.label}</Text>
                  {i < STEPS.length - 1 && (
                    <View style={[styles.stepLine, { backgroundColor: isDark ? '#333' : '#E5E7EB' }]} />
                  )}
                </View>
              ))}
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: isDark ? '#FFF' : '#1A1A2E' }]}>Personal Information</Text>
            <Text style={[styles.subtitle, { color: isDark ? 'rgba(255,255,255,0.5)' : '#9CA3AF' }]}>
              Tell us about yourself to get started
            </Text>

            {/* Gender */}
            <Text style={[styles.label, { color: isDark ? '#FFF' : '#1A1A2E' }]}>Gender *</Text>
            <View style={styles.genderRow}>
              {[{ id: 'male', icon: 'male', color: '#3B82F6' }, { id: 'female', icon: 'female', color: '#EC4899' }].map(g => (
                <TouchableOpacity
                  key={g.id}
                  style={[
                    styles.genderCard,
                    { backgroundColor: isDark ? '#14142B' : '#FFF' },
                    gender === g.id && { borderColor: g.color, borderWidth: 2 },
                  ]}
                  onPress={() => { setGender(g.id); setSelectedAvatarIndex(null); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.genderIconBg, { backgroundColor: g.color + '15' }]}>
                    <Ionicons name={g.icon} size={24} color={gender === g.id ? g.color : (isDark ? '#666' : '#9CA3AF')} />
                  </View>
                  <Text style={[styles.genderText, { color: gender === g.id ? g.color : (isDark ? '#FFF' : '#1A1A2E') }]}>
                    {g.id.charAt(0).toUpperCase() + g.id.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

            {/* Profile Picture */}
            <Text style={[styles.label, { color: isDark ? '#FFF' : '#1A1A2E', marginTop: 20 }]}>Profile Picture</Text>
            <View style={styles.profileSection}>
              <View style={[styles.avatarContainer, { backgroundColor: isDark ? '#14142B' : '#FFF' }]}>
                {getProfileDisplay() ? (
                  <Image source={getProfileDisplay()} style={styles.avatarImage} />
                ) : (
                  <Ionicons name="person" size={36} color={isDark ? '#333' : '#D1D5DB'} />
                )}
              </View>
              <View style={styles.photoButtons}>
                <TouchableOpacity style={[styles.photoBtn, { backgroundColor: PRIMARY }]} onPress={takePhoto} activeOpacity={0.8}>
                  <Ionicons name="camera" size={16} color="#000" />
                  <Text style={styles.photoBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.photoBtn, { backgroundColor: isDark ? '#1E1E3A' : '#F3F4F6' }]} onPress={pickFromGallery} activeOpacity={0.8}>
                  <Ionicons name="images" size={16} color={isDark ? '#FFF' : '#374151'} />
                  <Text style={[styles.photoBtnText, { color: isDark ? '#FFF' : '#374151' }]}>Gallery</Text>
                </TouchableOpacity>
                {gender && (
                  <TouchableOpacity style={[styles.photoBtn, { backgroundColor: isDark ? '#1E1E3A' : '#EEF2FF' }]} onPress={() => setShowAvatarModal(true)} activeOpacity={0.8}>
                    <Ionicons name="happy" size={16} color="#6366F1" />
                    <Text style={[styles.photoBtnText, { color: '#6366F1' }]}>Avatar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Form */}
            <View style={styles.formCard}>
              <View style={styles.nameRow}>
                <View style={{ flex: 1 }}>
                  <Input label="First Name *" value={formData.first_name} onChangeText={(v) => handleChange('first_name', v)} placeholder="Ali" error={errors.first_name} />
                </View>
                <View style={{ flex: 1 }}>
                  <Input label="Last Name *" value={formData.last_name} onChangeText={(v) => handleChange('last_name', v)} placeholder="Ahmed" error={errors.last_name} />
                </View>
              </View>
              <Input label="Email (Optional)" value={formData.email} onChangeText={(v) => handleChange('email', v)} placeholder="ali@example.com" keyboardType="email-address" error={errors.email} />
              <Input label="CNIC *" value={formData.cnic} onChangeText={(v) => handleChange('cnic', v)} placeholder="42101-1234567-1" keyboardType="number-pad" maxLength={15} error={errors.cnic} />
              <Input label="Address *" value={formData.address} onChangeText={(v) => handleChange('address', v)} placeholder="House 123, Street 5, Block A" multiline error={errors.address} />
              <Input label="City *" value={formData.city} onChangeText={(v) => handleChange('city', v)} placeholder="Lahore" error={errors.city} />
            </View>

            {/* Submit */}
            <Button title="Continue" onPress={handleSubmit} loading={loading} style={styles.submitBtn} />
            <View style={{ height: 30 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Avatar Modal */}
      <Modal visible={showAvatarModal} transparent animationType="slide" onRequestClose={() => setShowAvatarModal(false)}>
        <View style={styles.modalOverlay}>
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setShowAvatarModal(false)} />
          <View style={[styles.modalSheet, { backgroundColor: isDark ? '#14142B' : '#FFF' }]}>
            <View style={[styles.modalHandle, { backgroundColor: isDark ? '#333' : '#D1D5DB' }]} />
            <Text style={[styles.modalTitle, { color: isDark ? '#FFF' : '#1A1A2E' }]}>Choose Avatar</Text>
            <FlatList
              data={avatars}
              numColumns={5}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={styles.avatarGrid}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  style={[styles.avatarGridItem, selectedAvatarIndex === index && { borderColor: PRIMARY, borderWidth: 3 }]}
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
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20 },

  // Steps
  stepRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, marginBottom: 28, gap: 4 },
  stepItem: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  stepLabel: { fontSize: 11, fontWeight: '600', marginLeft: 4 },
  stepLine: { width: 24, height: 2, marginHorizontal: 4, borderRadius: 1 },

  // Title
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 24 },

  // Gender
  label: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  genderCard: {
    flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16,
    borderRadius: 16, borderWidth: 1, borderColor: 'transparent', gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  genderIconBg: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  genderText: { fontSize: 15, fontWeight: '700' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginBottom: 8 },

  // Profile
  profileSection: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
  avatarContainer: {
    width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  avatarImage: { width: 80, height: 80, borderRadius: 40 },
  photoButtons: { flex: 1, gap: 8 },
  photoBtn: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 12, gap: 6,
  },
  photoBtnText: { fontSize: 13, fontWeight: '600', color: '#000' },

  // Form
  formCard: { marginBottom: 20 },
  nameRow: { flexDirection: 'row', gap: 12 },

  // Button
  submitBtn: { marginBottom: 0 },

  // Modal
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 16, paddingBottom: 40, maxHeight: '65%' },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 16 },
  avatarGrid: { paddingHorizontal: 8 },
  avatarGridItem: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    margin: 4, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent',
  },
  avatarGridImage: { width: '100%', height: '100%', borderRadius: AVATAR_SIZE / 2 },
});

export default PersonalInfoScreen;
