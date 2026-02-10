import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { onboardingAPI } from '../../api/onboarding';

const VehicleInfoScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [formData, setFormData] = useState({
    type: '',
    registration_number: '',
    make: '',
    model: '',
    year: '',
    color: '',
  });
  const [vehicleImages, setVehicleImages] = useState({
    vehicle_front: null,
    vehicle_back: null,
    vehicle_interior: null,
    vehicle_with_plate: null,
  });
  const [errors, setErrors] = useState({});

  const vehicleTypes = [
    { id: 'bike', name: 'Bike', icon: '🏍️' },
    { id: 'car', name: 'Car', icon: '🚗' },
    { id: 'rickshaw', name: 'Rickshaw', icon: '🛺' },
  ];

  const imageTypes = [
    { key: 'vehicle_front', label: 'Front View', icon: 'car-outline' },
    { key: 'vehicle_back', label: 'Back View', icon: 'car-outline' },
    { key: 'vehicle_interior', label: 'Interior', icon: 'albums-outline' },
    { key: 'vehicle_with_plate', label: 'Number Plate', icon: 'document-outline' },
  ];

  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setFormData({ ...formData, type });
    if (errors.type) {
      setErrors({ ...errors, type: null });
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const pickImage = async (key) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow access to photos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setVehicleImages({ ...vehicleImages, [key]: result.assets[0] });
        if (errors.images) {
          setErrors({ ...errors, images: null });
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async (key) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow camera access');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setVehicleImages({ ...vehicleImages, [key]: result.assets[0] });
        if (errors.images) {
          setErrors({ ...errors, images: null });
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = (key) => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: () => takePhoto(key) },
        { text: 'Choose from Gallery', onPress: () => pickImage(key) },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.type) {
      newErrors.type = 'Please select vehicle type';
    }
    if (!formData.registration_number.trim()) {
      newErrors.registration_number = 'Registration number is required';
    }
    if (!formData.make.trim()) {
      newErrors.make = 'Vehicle make is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Vehicle model is required';
    }
    const currentYear = new Date().getFullYear();
    const year = parseInt(formData.year);
    if (!year || year < 1990 || year > currentYear + 1) {
      newErrors.year = `Year must be between 1990 and ${currentYear + 1}`;
    }
    if (!formData.color.trim()) {
      newErrors.color = 'Vehicle color is required';
    }

    // Check at least front photo is provided
    if (!vehicleImages.vehicle_front) {
      newErrors.images = 'At least front view photo is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Build FormData with text fields + images
      const submitData = new FormData();
      submitData.append('type', formData.type);
      submitData.append('registration_number', formData.registration_number);
      submitData.append('make', formData.make);
      submitData.append('model', formData.model);
      submitData.append('year', formData.year);
      submitData.append('color', formData.color);

      // Append vehicle images
      Object.keys(vehicleImages).forEach((key) => {
        const img = vehicleImages[key];
        if (img) {
          submitData.append(key, {
            uri: img.uri,
            type: 'image/jpeg',
            name: `${key}.jpg`,
          });
        }
      });

      const response = await onboardingAPI.submitVehicleInfo(submitData);

      if (response.success) {
        Alert.alert('Success', 'Vehicle information saved!', [
          { text: 'Continue', onPress: () => navigation.navigate('Documents') },
        ]);
      }
    } catch (error) {
      console.error('Vehicle info error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save vehicle information'
      );
    } finally {
      setLoading(false);
    }
  };

  const uploadedCount = Object.values(vehicleImages).filter(Boolean).length;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '40%' }]} />
          </View>
          <Text style={[styles.stepText, { color: colors.textSecondary }]}>
            Step 2 of 5
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Vehicle Information
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Tell us about your vehicle
          </Text>
        </View>

        {/* Vehicle Type Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Select Vehicle Type *
          </Text>
          <View style={styles.typeContainer}>
            {vehicleTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: selectedType === type.id ? colors.primary : colors.border,
                    borderWidth: 2,
                  },
                ]}
                onPress={() => handleTypeSelect(type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[styles.typeName, { color: colors.text }]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.type && (
            <Text style={[styles.error, { color: colors.error }]}>{errors.type}</Text>
          )}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Registration Number *"
            value={formData.registration_number}
            onChangeText={(value) => handleChange('registration_number', value.toUpperCase())}
            placeholder="KHI-1234"
            error={errors.registration_number}
          />

          <Input
            label="Make *"
            value={formData.make}
            onChangeText={(value) => handleChange('make', value)}
            placeholder="Toyota"
            error={errors.make}
          />

          <Input
            label="Model *"
            value={formData.model}
            onChangeText={(value) => handleChange('model', value)}
            placeholder="Corolla"
            error={errors.model}
          />

          <Input
            label="Year *"
            value={formData.year}
            onChangeText={(value) => handleChange('year', value)}
            placeholder="2020"
            keyboardType="number-pad"
            maxLength={4}
            error={errors.year}
          />

          <Input
            label="Color *"
            value={formData.color}
            onChangeText={(value) => handleChange('color', value)}
            placeholder="White"
            error={errors.color}
          />
        </View>

        {/* Vehicle Photos Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Vehicle Photos *
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
            Upload clear photos of your vehicle ({uploadedCount}/4)
          </Text>

          <View style={styles.imagesGrid}>
            {imageTypes.map((imgType) => (
              <TouchableOpacity
                key={imgType.key}
                style={[
                  styles.imageCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: vehicleImages[imgType.key] ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => showImageOptions(imgType.key)}
                activeOpacity={0.7}
              >
                {vehicleImages[imgType.key] ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: vehicleImages[imgType.key].uri }}
                      style={styles.imagePreview}
                    />
                    <View style={[styles.imageCheckBadge, { backgroundColor: colors.primary }]}>
                      <Ionicons name="checkmark" size={14} color="#000" />
                    </View>
                    <View style={styles.imageLabelOverlay}>
                      <Text style={styles.imageLabelOverlayText}>{imgType.label}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.background }]}>
                      <Ionicons name={imgType.icon} size={24} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.imageLabel, { color: colors.text }]}>
                      {imgType.label}
                    </Text>
                    <Text style={[styles.imageTap, { color: colors.textSecondary }]}>
                      Tap to upload
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {errors.images && (
            <Text style={[styles.error, { color: colors.error, marginTop: 8 }]}>
              {errors.images}
            </Text>
          )}
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.tipsTitle, { color: colors.text }]}>
            Photo Tips
          </Text>
          <Text style={[styles.tipsText, { color: colors.textSecondary }]}>
            {'\u2022'} Take photos in good lighting{'\n'}
            {'\u2022'} Make sure vehicle is clean{'\n'}
            {'\u2022'} Number plate should be clearly visible{'\n'}
            {'\u2022'} Front view photo is required
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <Button
            title="Back"
            onPress={() => navigation.goBack()}
            variant="outline"
            style={styles.backButton}
          />
          <Button
            title="Continue"
            onPress={handleSubmit}
            loading={loading}
            style={styles.continueButton}
          />
        </View>
      </ScrollView>
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  typeCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  typeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    fontSize: 12,
    marginTop: 4,
  },
  form: {
    marginBottom: 24,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageCard: {
    width: '48%',
    height: 140,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: 12,
    overflow: 'hidden',
  },
  imagePreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageCheckBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageLabelOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  imageLabelOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  imageLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  imageTap: {
    fontSize: 11,
    marginTop: 2,
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 13,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  continueButton: {
    flex: 1,
    marginLeft: 8,
  },
});

export default VehicleInfoScreen;
