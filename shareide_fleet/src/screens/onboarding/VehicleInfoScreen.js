import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [errors, setErrors] = useState({});

  const vehicleTypes = [
    { id: 'bike', name: 'Bike', icon: '🏍️' },
    { id: 'car', name: 'Car', icon: '🚗' },
    { id: 'rickshaw', name: 'Rickshaw', icon: '🛺' },
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await onboardingAPI.submitVehicleInfo(formData);

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
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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