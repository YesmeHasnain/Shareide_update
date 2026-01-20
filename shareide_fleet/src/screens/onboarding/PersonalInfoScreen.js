import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { onboardingAPI } from '../../api/onboarding';

const PersonalInfoScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { updateUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
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

  const validate = () => {
    const newErrors = {};

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
    try {
      const response = await onboardingAPI.submitPersonalInfo(formData);

      if (response.success) {
        // Update user context
        await updateUser({
          ...formData,
          driver: response.data.driver,
        });

        Alert.alert('Success', 'Personal information saved!', [
          { text: 'Continue', onPress: () => navigation.navigate('VehicleInfo') },
        ]);
      }
    } catch (error) {
      console.error('Personal info error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to save information'
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
  form: {
    marginBottom: 24,
  },
  button: {
    marginBottom: 24,
  },
});

export default PersonalInfoScreen;