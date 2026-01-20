import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import { onboardingAPI } from '../../api/onboarding';

const DocumentsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState({
    nic_front: null,
    nic_back: null,
    license_front: null,
    license_back: null,
    vehicle_registration: null,
  });

  const documentTypes = [
    { key: 'nic_front', label: 'NIC Front', icon: '🪪' },
    { key: 'nic_back', label: 'NIC Back', icon: '🪪' },
    { key: 'license_front', label: 'License Front', icon: '📄' },
    { key: 'license_back', label: 'License Back', icon: '📄' },
    { key: 'vehicle_registration', label: 'Vehicle Registration', icon: '📋' },
  ];

  const pickImage = async (key) => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow access to photos');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setDocuments({
          ...documents,
          [key]: result.assets[0],
        });
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async (key) => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow camera access');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        setDocuments({
          ...documents,
          [key]: result.assets[0],
        });
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
    const requiredDocs = Object.keys(documents);
    const missing = requiredDocs.filter((key) => !documents[key]);

    if (missing.length > 0) {
      Alert.alert('Missing Documents', 'Please upload all required documents');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Create FormData
      const formData = new FormData();

      Object.keys(documents).forEach((key) => {
        const doc = documents[key];
        if (doc) {
          formData.append(key, {
            uri: doc.uri,
            type: 'image/jpeg',
            name: `${key}.jpg`,
          });
        }
      });

      const response = await onboardingAPI.uploadDocuments(formData);

      if (response.success) {
        Alert.alert('Success', 'Documents uploaded successfully!', [
          { text: 'Continue', onPress: () => navigation.navigate('Selfie') },
        ]);
      }
    } catch (error) {
      console.error('Documents upload error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to upload documents'
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
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '60%' }]} />
          </View>
          <Text style={[styles.stepText, { color: colors.textSecondary }]}>
            Step 3 of 5
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Upload Documents 📄
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Please upload clear photos of your documents
          </Text>
        </View>

        {/* Documents */}
        <View style={styles.documentsContainer}>
          {documentTypes.map((doc) => (
            <View key={doc.key} style={styles.documentCard}>
              <View style={styles.documentHeader}>
                <Text style={styles.documentIcon}>{doc.icon}</Text>
                <Text style={[styles.documentLabel, { color: colors.text }]}>
                  {doc.label}
                </Text>
              </View>

              {documents[doc.key] ? (
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: documents[doc.key].uri }}
                    style={styles.image}
                  />
                  <View style={styles.imageOverlay}>
                    <TouchableOpacity
                      style={[styles.overlayButton, { backgroundColor: colors.primary }]}
                      onPress={() => showImageOptions(doc.key)}
                    >
                      <Text style={styles.overlayButtonText}>Change</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.uploadButton, { backgroundColor: colors.surface }]}
                  onPress={() => showImageOptions(doc.key)}
                >
                  <Text style={styles.uploadIcon}>📸</Text>
                  <Text style={[styles.uploadText, { color: colors.text }]}>
                    Upload {doc.label}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Important Notes */}
        <View style={[styles.notesCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.notesTitle, { color: colors.text }]}>
            📌 Important Notes
          </Text>
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>
            • Make sure all documents are clearly visible{'\n'}
            • Photos should be well-lit and not blurry{'\n'}
            • All text should be readable{'\n'}
            • Documents must be valid and not expired
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
  documentsContainer: {
    marginBottom: 24,
  },
  documentCard: {
    marginBottom: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  documentIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  documentLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E0E0E0',
  },
  uploadIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  uploadText: {
    fontSize: 14,
  },
  imageContainer: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  overlayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  overlayButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  notesCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  notesText: {
    fontSize: 14,
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

export default DocumentsScreen;