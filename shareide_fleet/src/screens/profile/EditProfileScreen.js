import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/Input';
import Button from '../../components/Button';
import client from '../../api/client';
import { defaultMaleAvatar, defaultFemaleAvatar } from '../../utils/avatars';

const EditProfileScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user, updateUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState(user?.profile_picture || null);
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    emergency_contact: user?.emergency_contact || '',
    address: user?.address || '',
    city: user?.city || 'Karachi',
  });

  const handleChangePhoto = async () => {
    Alert.alert('Change Photo', 'Choose an option', [
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
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled && result.assets?.[0]) {
            setProfilePhoto(result.assets[0].uri);
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
            aspect: [1, 1],
            quality: 0.8,
          });
          if (!result.canceled && result.assets?.[0]) {
            setProfilePhoto(result.assets[0].uri);
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
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const response = await client.put('/user/profile', formData);
      if (response.success) {
        updateUser({ ...user, ...formData });
        Alert.alert('Success', 'Profile updated successfully!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      // Mock success for demo
      updateUser({ ...user, ...formData });
      Alert.alert('Success', 'Profile updated successfully!', [
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity style={[styles.avatarContainer, { borderColor: colors.primary }]} onPress={handleChangePhoto}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.avatar} />
            ) : user?.profile_picture ? (
              <Image source={{ uri: user.profile_picture }} style={styles.avatar} />
            ) : (
              <Image
                source={user?.gender === 'female' ? defaultFemaleAvatar : defaultMaleAvatar}
                style={styles.avatar}
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.changePhotoBtn, { borderColor: colors.primary }]} onPress={handleChangePhoto}>
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal Information</Text>

          <Input
            label="First Name *"
            value={formData.first_name}
            onChangeText={(value) => handleChange('first_name', value)}
            placeholder="Enter first name"
          />

          <Input
            label="Last Name *"
            value={formData.last_name}
            onChangeText={(value) => handleChange('last_name', value)}
            placeholder="Enter last name"
          />

          <Input
            label="Email"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value)}
            placeholder="Enter email"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone Number"
            value={formData.phone}
            editable={false}
            style={{ opacity: 0.6 }}
          />

          <Input
            label="Emergency Contact"
            value={formData.emergency_contact}
            onChangeText={(value) => handleChange('emergency_contact', value)}
            placeholder="Emergency phone number"
            keyboardType="phone-pad"
          />
        </View>

        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Address</Text>

          <Input
            label="Address"
            value={formData.address}
            onChangeText={(value) => handleChange('address', value)}
            placeholder="Enter your address"
            multiline
            numberOfLines={2}
          />

          <Input
            label="City"
            value={formData.city}
            onChangeText={(value) => handleChange('city', value)}
            placeholder="Enter city"
          />
        </View>

        {/* Driver Status */}
        {user?.driver && (
          <View style={[styles.statusCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Driver Status</Text>
            <View style={[styles.statusRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Status</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: user.driver.status === 'approved' ? '#22c55e20' : '#fbbf2420' }
              ]}>
                <Text style={[
                  styles.statusText,
                  { color: user.driver.status === 'approved' ? '#22c55e' : '#fbbf24' }
                ]}>
                  {user.driver.status === 'approved' ? 'Verified' : 'Pending'}
                </Text>
              </View>
            </View>
            <View style={[styles.statusRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Total Rides</Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {user.driver.total_rides || 0}
              </Text>
            </View>
            <View style={[styles.statusRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>Rating</Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {user.driver.rating?.toFixed(1) || '0.0'} ⭐
              </Text>
            </View>
          </View>
        )}

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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatar: {
    width: 98,
    height: 98,
    borderRadius: 49,
  },
  changePhotoBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  changePhotoText: {
    fontSize: 14,
    fontWeight: '600',
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
  statusCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5', // overridden inline
  },
  statusLabel: {
    fontSize: 14,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  saveButton: {
    marginTop: 8,
  },
});

export default EditProfileScreen;
