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
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import { onboardingAPI } from '../../api/onboarding';

const SelfieScreen = ({ navigation }) => {
  const { colors } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [selfies, setSelfies] = useState({
    selfie_with_nic: null,
    live_selfie: null,
  });

  const selfieTypes = [
    {
      key: 'selfie_with_nic',
      title: 'Selfie with NIC',
      subtitle: 'Hold your NIC next to your face',
      icon: '🪪',
      instructions: [
        'Hold your NIC card next to your face',
        'Make sure your face is clearly visible',
        'NIC details should be readable',
        'Use good lighting',
      ],
    },
    {
      key: 'live_selfie',
      title: 'Live Selfie',
      subtitle: 'Take a clear photo of your face',
      icon: '🤳',
      instructions: [
        'Look directly at the camera',
        'Face should be clearly visible',
        'No sunglasses or hats',
        'Good lighting required',
      ],
    },
  ];

  const takeSelfie = async (key) => {
    try {
      // Request camera permission
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow camera access');
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        cameraType: ImagePicker.CameraType.front,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled) {
        setSelfies({
          ...selfies,
          [key]: result.assets[0],
        });
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const validate = () => {
    if (!selfies.selfie_with_nic || !selfies.live_selfie) {
      Alert.alert('Missing Photos', 'Please take both required selfies');
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

      Object.keys(selfies).forEach((key) => {
        const selfie = selfies[key];
        if (selfie) {
          formData.append(key, {
            uri: selfie.uri,
            type: 'image/jpeg',
            name: `${key}.jpg`,
          });
        }
      });

      const response = await onboardingAPI.uploadSelfies(formData);

      if (response.success) {
        // Submit for approval
        await onboardingAPI.submitForApproval();

        Alert.alert(
          'Success! 🎉',
          'Your application has been submitted for review. We will notify you within 24-48 hours.',
          [{ text: 'OK', onPress: () => navigation.navigate('Pending') }]
        );
      }
    } catch (error) {
      console.error('Selfies upload error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to upload selfies'
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
            <View style={[styles.progressFill, { backgroundColor: colors.primary, width: '80%' }]} />
          </View>
          <Text style={[styles.stepText, { color: colors.textSecondary }]}>
            Step 4 of 5
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Selfie Verification 🤳
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Help us verify your identity
          </Text>
        </View>

        {/* Selfies */}
        {selfieTypes.map((selfie) => (
          <View key={selfie.key} style={styles.selfieCard}>
            <View style={styles.selfieHeader}>
              <Text style={styles.selfieIcon}>{selfie.icon}</Text>
              <View style={styles.selfieHeaderText}>
                <Text style={[styles.selfieTitle, { color: colors.text }]}>
                  {selfie.title}
                </Text>
                <Text style={[styles.selfieSubtitle, { color: colors.textSecondary }]}>
                  {selfie.subtitle}
                </Text>
              </View>
            </View>

            {/* Preview or Upload */}
            {selfies[selfie.key] ? (
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: selfies[selfie.key].uri }}
                  style={styles.preview}
                />
                <TouchableOpacity
                  style={[styles.retakeButton, { backgroundColor: colors.primary }]}
                  onPress={() => takeSelfie(selfie.key)}
                >
                  <Text style={styles.retakeButtonText}>Retake</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Instructions */}
                <View style={[styles.instructionsCard, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.instructionsTitle, { color: colors.text }]}>
                    Instructions:
                  </Text>
                  {selfie.instructions.map((instruction, index) => (
                    <Text
                      key={index}
                      style={[styles.instructionText, { color: colors.textSecondary }]}
                    >
                      • {instruction}
                    </Text>
                  ))}
                </View>

                {/* Camera Button */}
                <Button
                  title={`Take ${selfie.title}`}
                  onPress={() => takeSelfie(selfie.key)}
                  style={styles.cameraButton}
                />
              </>
            )}
          </View>
        ))}

        {/* Security Note */}
        <View style={[styles.securityCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={[styles.securityText, { color: colors.textSecondary }]}>
            Your photos are encrypted and securely stored. They will only be used for
            verification purposes.
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
            title="Submit Application"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
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
  selfieCard: {
    marginBottom: 24,
  },
  selfieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  selfieIcon: {
    fontSize: 40,
    marginRight: 12,
  },
  selfieHeaderText: {
    flex: 1,
  },
  selfieTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  selfieSubtitle: {
    fontSize: 14,
  },
  instructionsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
  cameraButton: {
    marginBottom: 8,
  },
  previewContainer: {
    position: 'relative',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  preview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  retakeButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retakeButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  securityCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  securityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  buttons: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 2,
    marginLeft: 8,
  },
});

export default SelfieScreen;