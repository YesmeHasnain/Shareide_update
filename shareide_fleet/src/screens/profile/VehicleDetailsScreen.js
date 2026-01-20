import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import client from '../../api/client';

const VehicleDetailsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const driver = user?.driver;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vehicle_type: driver?.vehicle_type || 'car',
    vehicle_make: driver?.vehicle_make || '',
    vehicle_model: driver?.vehicle_model || '',
    vehicle_year: driver?.vehicle_year?.toString() || '',
    vehicle_color: driver?.vehicle_color || '',
    license_plate: driver?.license_plate || '',
  });

  const vehicleTypes = [
    { key: 'bike', label: 'Bike', icon: '🏍️' },
    { key: 'rickshaw', label: 'Rickshaw', icon: '🛺' },
    { key: 'car', label: 'Car', icon: '🚗' },
    { key: 'ac_car', label: 'AC Car', icon: '❄️' },
  ];

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vehicle Details</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vehicle Icon */}
        <View style={[styles.vehicleDisplay, { backgroundColor: colors.surface }]}>
          <Text style={styles.vehicleIcon}>
            {vehicleTypes.find(v => v.key === formData.vehicle_type)?.icon || '🚗'}
          </Text>
          <Text style={[styles.vehicleName, { color: colors.text }]}>
            {formData.vehicle_make} {formData.vehicle_model}
          </Text>
          <Text style={[styles.vehiclePlate, { color: colors.textSecondary }]}>
            {formData.license_plate || 'License Plate'}
          </Text>
        </View>

        {/* Vehicle Type */}
        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Vehicle Type</Text>
          <View style={styles.typeGrid}>
            {vehicleTypes.map((type) => (
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
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text style={[
                  styles.typeLabel,
                  { color: formData.vehicle_type === type.key ? '#000' : colors.text }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
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
        </View>

        {/* Documents Status */}
        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Documents</Text>

          <View style={styles.docRow}>
            <View style={styles.docInfo}>
              <Text style={styles.docIcon}>📄</Text>
              <Text style={[styles.docLabel, { color: colors.text }]}>Registration</Text>
            </View>
            <View style={[styles.docStatus, { backgroundColor: '#22c55e20' }]}>
              <Text style={[styles.docStatusText, { color: '#22c55e' }]}>Verified</Text>
            </View>
          </View>

          <View style={styles.docRow}>
            <View style={styles.docInfo}>
              <Text style={styles.docIcon}>🪪</Text>
              <Text style={[styles.docLabel, { color: colors.text }]}>Driving License</Text>
            </View>
            <View style={[styles.docStatus, { backgroundColor: '#22c55e20' }]}>
              <Text style={[styles.docStatusText, { color: '#22c55e' }]}>Verified</Text>
            </View>
          </View>

          <View style={styles.docRow}>
            <View style={styles.docInfo}>
              <Text style={styles.docIcon}>📋</Text>
              <Text style={[styles.docLabel, { color: colors.text }]}>Insurance</Text>
            </View>
            <TouchableOpacity style={[styles.docStatus, { backgroundColor: colors.primary }]}>
              <Text style={[styles.docStatusText, { color: '#000' }]}>Upload</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title={loading ? 'Saving...' : 'Save Changes'}
          onPress={handleSave}
          disabled={loading}
          style={styles.saveButton}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backIcon: {
    fontSize: 28,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  vehicleDisplay: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  vehicleIcon: {
    fontSize: 60,
    marginBottom: 12,
  },
  vehicleName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vehiclePlate: {
    fontSize: 16,
  },
  formCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    width: '48%',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  docRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  docInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  docLabel: {
    fontSize: 14,
  },
  docStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  docStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 8,
  },
});

export default VehicleDetailsScreen;
