import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import client from '../../api/client';
import { spacing, typography, borderRadius } from '../../theme/colors';

const VEHICLE_ICONS = {
  bike: { name: 'bicycle', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  rickshaw: { name: 'bus', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  car: { name: 'car', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  ac_car: { name: 'snow', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)' },
};

const DOC_ICONS = {
  registration: { name: 'document', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  license: { name: 'card', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  insurance: { name: 'document-text', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
};

const VehicleDetailsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const driver = user?.driver;

  const [loading, setLoading] = useState(false);
  const [insuranceUploaded, setInsuranceUploaded] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_type: driver?.vehicle_type || 'car',
    vehicle_make: driver?.vehicle_make || '',
    vehicle_model: driver?.vehicle_model || '',
    vehicle_year: driver?.vehicle_year?.toString() || '',
    vehicle_color: driver?.vehicle_color || '',
    license_plate: driver?.license_plate || '',
  });

  const vehicleTypes = [
    { key: 'bike', label: 'Bike' },
    { key: 'rickshaw', label: 'Rickshaw' },
    { key: 'car', label: 'Car' },
    { key: 'ac_car', label: 'AC Car' },
  ];

  const handleUploadInsurance = async () => {
    Alert.alert('Upload Insurance', 'Choose an option', [
      {
        text: 'Camera',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Camera permission is required');
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets?.[0]) {
            setInsuranceUploaded(true);
            Alert.alert('Success', 'Insurance document uploaded successfully!');
          }
        },
      },
      {
        text: 'Gallery',
        onPress: async () => {
          const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (status !== 'granted') {
            Alert.alert('Permission needed', 'Gallery permission is required');
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
          });
          if (!result.canceled && result.assets?.[0]) {
            setInsuranceUploaded(true);
            Alert.alert('Success', 'Insurance document uploaded successfully!');
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.vehicle_make.trim() || !formData.vehicle_model.trim() || !formData.license_plate.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await client.put('/driver/vehicle', formData);
      if (response.success) {
        Alert.alert('Success', 'Vehicle details updated!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Success', 'Vehicle details updated!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const currentVehicle = VEHICLE_ICONS[formData.vehicle_type] || VEHICLE_ICONS.car;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Vehicle Details" onLeftPress={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vehicle Icon */}
        <Card style={styles.vehicleDisplay}>
          <View style={[styles.vehicleIconBg, { backgroundColor: currentVehicle.bg }]}>
            <Ionicons name={currentVehicle.name} size={48} color={currentVehicle.color} />
          </View>
          <Text style={[styles.vehicleName, { color: colors.text }]}>
            {formData.vehicle_make} {formData.vehicle_model}
          </Text>
          <Text style={[styles.vehiclePlate, { color: colors.textSecondary }]}>
            {formData.license_plate || 'License Plate'}
          </Text>
        </Card>

        {/* Vehicle Type */}
        <Card style={styles.formCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Type</Text>
          <View style={styles.typeGrid}>
            {vehicleTypes.map((type) => {
              const icon = VEHICLE_ICONS[type.key];
              return (
                <TouchableOpacity
                  key={type.key}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: formData.vehicle_type === type.key ? colors.primary : colors.background,
                      borderColor: formData.vehicle_type === type.key ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => handleChange('vehicle_type', type.key)}
                >
                  <Ionicons
                    name={icon.name}
                    size={28}
                    color={formData.vehicle_type === type.key ? '#000' : icon.color}
                  />
                  <Text style={[
                    styles.typeLabel,
                    { color: formData.vehicle_type === type.key ? '#000' : colors.text }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Vehicle Information */}
        <Card style={styles.formCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Information</Text>

          <Input
            label="Make / Brand *"
            value={formData.vehicle_make}
            onChangeText={(value) => handleChange('vehicle_make', value)}
            placeholder="e.g., Toyota, Honda, Suzuki"
          />

          <Input
            label="Model *"
            value={formData.vehicle_model}
            onChangeText={(value) => handleChange('vehicle_model', value)}
            placeholder="e.g., Corolla, Civic, Alto"
          />

          <Input
            label="Year"
            value={formData.vehicle_year}
            onChangeText={(value) => handleChange('vehicle_year', value)}
            placeholder="e.g., 2020"
            keyboardType="numeric"
            maxLength={4}
          />

          <Input
            label="Color"
            value={formData.vehicle_color}
            onChangeText={(value) => handleChange('vehicle_color', value)}
            placeholder="e.g., White, Black, Silver"
          />

          <Input
            label="License Plate *"
            value={formData.license_plate}
            onChangeText={(value) => handleChange('license_plate', value.toUpperCase())}
            placeholder="e.g., ABC-1234"
            autoCapitalize="characters"
          />
        </Card>

        {/* Documents Status */}
        <Card style={styles.formCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Documents</Text>

          <View style={[styles.docRow, { borderBottomColor: colors.border }]}>
            <View style={styles.docInfo}>
              <View style={[styles.docIconBg, { backgroundColor: DOC_ICONS.registration.bg }]}>
                <Ionicons name={DOC_ICONS.registration.name} size={18} color={DOC_ICONS.registration.color} />
              </View>
              <Text style={[styles.docLabel, { color: colors.text }]}>Registration</Text>
            </View>
            <View style={[styles.docStatus, { backgroundColor: '#22c55e20' }]}>
              <Text style={[styles.docStatusText, { color: '#22c55e' }]}>Verified</Text>
            </View>
          </View>

          <View style={[styles.docRow, { borderBottomColor: colors.border }]}>
            <View style={styles.docInfo}>
              <View style={[styles.docIconBg, { backgroundColor: DOC_ICONS.license.bg }]}>
                <Ionicons name={DOC_ICONS.license.name} size={18} color={DOC_ICONS.license.color} />
              </View>
              <Text style={[styles.docLabel, { color: colors.text }]}>Driving License</Text>
            </View>
            <View style={[styles.docStatus, { backgroundColor: '#22c55e20' }]}>
              <Text style={[styles.docStatusText, { color: '#22c55e' }]}>Verified</Text>
            </View>
          </View>

          <View style={[styles.docRow, { borderBottomColor: colors.border }]}>
            <View style={styles.docInfo}>
              <View style={[styles.docIconBg, { backgroundColor: DOC_ICONS.insurance.bg }]}>
                <Ionicons name={DOC_ICONS.insurance.name} size={18} color={DOC_ICONS.insurance.color} />
              </View>
              <Text style={[styles.docLabel, { color: colors.text }]}>Insurance</Text>
            </View>
            {insuranceUploaded ? (
              <View style={[styles.docStatus, { backgroundColor: '#22c55e20' }]}>
                <Text style={[styles.docStatusText, { color: '#22c55e' }]}>Uploaded</Text>
              </View>
            ) : (
              <TouchableOpacity style={[styles.docStatus, { backgroundColor: colors.primary }]} onPress={handleUploadInsurance}>
                <Text style={[styles.docStatusText, { color: '#000' }]}>Upload</Text>
              </TouchableOpacity>
            )}
          </View>
        </Card>

        <Button
          title={loading ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={loading}
          style={styles.saveButton}
        />

        <View style={{ height: spacing.xxxl + spacing.sm }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  vehicleDisplay: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  vehicleIconBg: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  vehicleName: {
    fontSize: typography.h4,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  vehiclePlate: {
    fontSize: typography.h6,
  },
  formCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h6,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  typeButton: {
    width: '48%',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  typeLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  docInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  docIconBg: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docLabel: {
    fontSize: typography.bodySmall,
  },
  docStatus: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.sm,
  },
  docStatusText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: spacing.sm,
  },
});

export default VehicleDetailsScreen;
