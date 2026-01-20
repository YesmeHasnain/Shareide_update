import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api/auth';

const ProfileSetupScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { login } = useAuth();
  const { phone, gender, token } = route.params;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to upload a profile picture.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0]);
    }
  };

  const handleComplete = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', phone);
      formData.append('gender', gender);

      if (email.trim()) {
        formData.append('email', email.trim());
      }

      if (profileImage) {
        const uri = profileImage.uri;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('profile_picture', {
          uri,
          name: filename,
          type,
        });
      }

      const response = await authAPI.completeRegistration(formData);

      // Store user data and token
      await login(response.user, response.token || token);

      // Navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'Drawer' }],
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to complete registration. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
        {profileImage ? (
          <Image source={{ uri: profileImage.uri }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface }]}>
            <Text style={styles.avatarEmoji}>{gender === 'male' ? '👨' : '👩'}</Text>
          </View>
        )}
        <View style={[styles.cameraIcon, { backgroundColor: colors.primary }]}>
          <Text style={styles.cameraEmoji}>📷</Text>
        </View>
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.text }]}>Complete Profile</Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name *</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={name}
          onChangeText={setName}
          placeholder='Enter your name'
          placeholderTextColor={colors.textSecondary}
          autoCapitalize='words'
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>Email (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={email}
          onChangeText={setEmail}
          placeholder='Enter your email'
          placeholderTextColor={colors.textSecondary}
          keyboardType='email-address'
          autoCapitalize='none'
          editable={!loading}
        />
      </View>

      <View style={styles.infoRow}>
        <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
          <Text style={styles.infoEmoji}>📱</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>+92 {phone}</Text>
        </View>
        <View style={[styles.infoBox, { backgroundColor: colors.surface }]}>
          <Text style={styles.infoEmoji}>{gender === 'male' ? '👨' : '👩'}</Text>
          <Text style={[styles.infoText, { color: colors.text }]}>{gender}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: name.trim() && !loading ? colors.primary : colors.border }]}
        onPress={handleComplete}
        disabled={!name.trim() || loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Complete Registration</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 24, paddingVertical: 40, minHeight: '100%' },
  avatarContainer: { alignSelf: 'center', marginBottom: 24 },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  avatarPlaceholder: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center' },
  avatarEmoji: { fontSize: 60 },
  cameraIcon: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cameraEmoji: { fontSize: 18 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 32 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: '500' },
  input: { height: 56, borderRadius: 12, paddingHorizontal: 16, fontSize: 16 },
  infoRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  infoBox: { flex: 1, flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, gap: 8 },
  infoEmoji: { fontSize: 20 },
  infoText: { fontSize: 14, fontWeight: '500', textTransform: 'capitalize' },
  button: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 'auto' },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});

export default ProfileSetupScreen;
