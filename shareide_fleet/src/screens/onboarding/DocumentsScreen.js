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
import { onboardingAPI } from '../../api/onboarding';
import { spacing, typography, borderRadius } from '../../theme/colors';

const DOC_ICONS = {
  nic_front: { name: 'card', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  nic_back: { name: 'card', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  license_front: { name: 'document', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  license_back: { name: 'document', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  vehicle_registration: { name: 'document-text', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
};

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
    { key: 'nic_front', label: 'NIC Front' },
    { key: 'nic_back', label: 'NIC Back' },
    { key: 'license_front', label: 'License Front' },
    { key: 'license_back', label: 'License Back' },
    { key: 'vehicle_registration', label: 'Vehicle Registration' },
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
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '60%' }]} />
          </View>
          <Text style={[styles.stepText, { color: colors.textSecondary }]}>
            Step 3 of 5
          </Text>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: colors.text }]}>Upload Documents</Text>
            <View style={[styles.titleIconBg, { backgroundColor: 'rgba(139, 92, 246, 0.12)' }]}>
              <Ionicons name="document-text" size={20} color="#8B5CF6" />
            </View>
          </View>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Please upload clear photos of your documents
          </Text>
        </View>

        {/* Documents */}
        <View style={styles.documentsContainer}>
          {documentTypes.map((doc) => {
            const iconConfig = DOC_ICONS[doc.key];
            return (
              <View key={doc.key} style={styles.documentCard}>
                <View style={styles.documentHeader}>
                  <View style={[styles.documentIconBg, { backgroundColor: iconConfig.bg }]}>
                    <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
                  </View>
                  <Text style={[styles.documentLabel, { color: colors.text }]}>
                    {doc.label}
                  </Text>
                  {documents[doc.key] && (
                    <View style={[styles.checkBadge, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                      <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                    </View>
                  )}
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
                        <Ionicons name="camera" size={16} color="#000" style={{ marginRight: 4 }} />
                        <Text style={styles.overlayButtonText}>Change</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.uploadButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                    onPress={() => showImageOptions(doc.key)}
                  >
                    <View style={[styles.uploadIconBg, { backgroundColor: 'rgba(107, 114, 128, 0.08)' }]}>
                      <Ionicons name="camera" size={28} color={colors.textSecondary} />
                    </View>
                    <Text style={[styles.uploadText, { color: colors.text }]}>
                      Upload {doc.label}
                    </Text>
                    <Text style={[styles.uploadHint, { color: colors.textSecondary }]}>
                      Tap to take photo or choose from gallery
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {/* Important Notes */}
        <View style={[styles.notesCard, { backgroundColor: colors.surface }]}>
          <View style={styles.notesHeader}>
            <View style={[styles.notesIconBg, { backgroundColor: 'rgba(245, 158, 11, 0.12)' }]}>
              <Ionicons name="alert-circle" size={20} color="#F59E0B" />
            </View>
            <Text style={[styles.notesTitle, { color: colors.text }]}>
              Important Notes
            </Text>
          </View>
          <Text style={[styles.notesText, { color: colors.textSecondary }]}>
            {'\u2022'} Make sure all documents are clearly visible{'\n'}
            {'\u2022'} Photos should be well-lit and not blurry{'\n'}
            {'\u2022'} All text should be readable{'\n'}
            {'\u2022'} Documents must be valid and not expired
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
    paddingHorizontal: spacing.xl,
  },
  header: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  progressBar: {
    height: 4,
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    marginRight: spacing.sm,
  },
  titleIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: typography.body,
  },
  documentsContainer: {
    marginBottom: spacing.xl,
  },
  documentCard: {
    marginBottom: spacing.lg,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  documentIconBg: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  documentLabel: {
    fontSize: typography.body,
    fontWeight: '600',
    flex: 1,
  },
  checkBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    height: 150,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  uploadIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  uploadText: {
    fontSize: typography.bodySmall,
    fontWeight: '500',
  },
  uploadHint: {
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  imageContainer: {
    height: 150,
    borderRadius: borderRadius.lg,
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
    padding: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  overlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  overlayButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: typography.bodySmall,
  },
  notesCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  notesIconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  notesTitle: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  notesText: {
    fontSize: typography.bodySmall,
    lineHeight: 22,
    marginLeft: spacing.xs,
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
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

export default DocumentsScreen;
