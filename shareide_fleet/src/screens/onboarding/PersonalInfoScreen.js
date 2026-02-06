import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { onboardingAPI } from '../../api/onboarding';
import { authAPI } from '../../api/auth';

const PersonalInfoScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { updateUser, login } = useAuth();
  const { verificationToken, isNewUser, phone } = route.params || {};
  
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
          gender: 'male', // Default for drivers
          email: formData.email || null,
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
      const savedToken = await AsyncStorage.getItem('userToken');
      console.log('Token in AsyncStorage:', savedToken ? 'exists (' + savedToken.substring(0, 20) + '...)' : 'MISSING!');

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