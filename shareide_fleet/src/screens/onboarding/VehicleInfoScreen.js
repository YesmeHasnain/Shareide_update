import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { onboardingAPI } from '../../api/onboarding';
import { spacing, typography, borderRadius } from '../../theme/colors';

const VEHICLE_TYPE_ICONS = {
  bike: { name: 'bicycle', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  car: { name: 'car', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  rickshaw: { name: 'bus', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
};

const VehicleInfoScreen = ({ navigation, route }) => {
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
    { id: 'bike', name: 'Bike' },
    { id: 'car', name: 'Car' },
    { id: 'rickshaw', name: 'Rickshaw' },
  ];

  const imageTypes = [
    { key: 'vehicle_front', label: 'Front View', icon: 'car-outline', required: true },
    { key: 'vehicle_back', label: 'Back View', icon: 'car-outline', required: false },
    { key: 'vehicle_interior', label: 'Interior', icon: 'albums-outline', required: false },
    { key: 'vehicle_with_plate', label: 'Number Plate', icon: 'document-outline', required: true },
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

  // Handle captured image returned from DocumentCaptureScreen
  React.useEffect(() => {
    if (route?.params?.capturedImage && route?.params?.docType) {
      setVehicleImages(prev => ({
        ...prev,
        [route.params.docType]: route.params.capturedImage,
      }));
      if (errors.images) {
        setErrors(prev => ({ ...prev, images: null }));
      }
      navigation.setParams({ capturedImage: undefined, docType: undefined });
    }
  }, [route?.params?.capturedImage, route?.params?.docType]);

  const openDocumentCapture = (key) => {
    navigation.navigate('DocumentCapture', {
      docType: key,
      returnScreen: 'VehicleInfo',
    });
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
      const submitData = new FormData();
      submitData.append('type', formData.type);
      submitData.append('registration_number', formData.registration_number);
      submitData.append('make', formData.make);
      submitData.append('model', formData.model);
      submitData.append('year', formData.year);
      submitData.append('color', formData.color);

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
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
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
            {vehicleTypes.map((type) => {
              const iconConfig = VEHICLE_TYPE_ICONS[type.id];
              return (
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
                  <View style={[styles.typeIconBg, { backgroundColor: selectedType === type.id ? colors.primary + '20' : iconConfig.bg }]}>
                    <Ionicons name={iconConfig.name} size={32} color={selectedType === type.id ? colors.primary : iconConfig.color} />
                  </View>
                  <Text style={[styles.typeName, { color: colors.text }]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
                onPress={() => openDocumentCapture(imgType.key)}
                activeOpacity={0.7}
              >
                {vehicleImages[imgType.key] ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image
                      source={{ uri: vehicleImages[imgType.key].uri }}
                      style={styles.imagePreview}
                      resizeMode="cover"
                    />
                    <View style={[styles.imageCheckBadge, { backgroundColor: colors.primary }]}>
                      <Ionicons name="checkmark" size={14} color="#000" />
                    </View>
                    <View style={styles.imageLabelOverlay}>
                      <Text style={styles.imageLabelOverlayText}>{imgType.label}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.imageRetapOverlay}
                      onPress={() => openDocumentCapture(imgType.key)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="camera" size={16} color="#FFF" />
                    </TouchableOpacity>
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
                      {imgType.required ? 'Required *' : 'Optional'}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {errors.images && (
            <Text style={[styles.error, { color: colors.error, marginTop: spacing.sm }]}>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
  },
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xxl,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepText: {
    fontSize: typography.bodySmall,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.h6,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionTitle: {
    fontSize: typography.h6,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.bodySmall - 1,
    marginBottom: spacing.md,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  typeCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  typeIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  typeName: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  error: {
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  form: {
    marginBottom: spacing.xxl,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  imageCard: {
    width: '48%',
    height: 140,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: spacing.md,
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
    top: spacing.sm,
    right: spacing.sm,
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
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  imageLabelOverlayText: {
    color: '#fff',
    fontSize: typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  imageRetapOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sm,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  imageLabel: {
    fontSize: typography.bodySmall - 1,
    fontWeight: '600',
    textAlign: 'center',
  },
  imageTap: {
    fontSize: typography.tiny + 1,
    marginTop: 2,
  },
  tipsCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xxl,
  },
  tipsTitle: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  tipsText: {
    fontSize: typography.bodySmall - 1,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: spacing.xxl,
  },
  backButton: {
    flex: 1,
    marginRight: spacing.sm,
  },
  continueButton: {
    flex: 1,
    marginLeft: spacing.sm,
  },
});

export default VehicleInfoScreen;
