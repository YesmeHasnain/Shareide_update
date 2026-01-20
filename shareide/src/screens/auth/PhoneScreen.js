import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { authAPI } from '../../api/auth';

const PhoneScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (phone.length !== 11) {
      Alert.alert('Error', 'Enter valid 11-digit phone number');
      return;
    }

    try {
      setLoading(true);
      await authAPI.sendOTP(phone);
      navigation.navigate('OTP', { phone });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.emoji}>🇵🇰</Text>
      <Text style={[styles.title, { color: colors.text }]}>Enter Phone Number</Text>
      <View style={styles.inputRow}>
        <View style={[styles.prefix, { backgroundColor: colors.surface }]}>
          <Text style={[styles.prefixText, { color: colors.text }]}>+92</Text>
        </View>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, color: colors.text }]}
          value={phone}
          onChangeText={(t) => setPhone(t.replace(/[^0-9]/g, '').slice(0, 11))}
          placeholder='3XXXXXXXXXX'
          placeholderTextColor={colors.textSecondary}
          keyboardType='phone-pad'
          editable={!loading}
        />
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: phone.length === 11 && !loading ? colors.primary : colors.border }]}
        onPress={handleContinue}
        disabled={phone.length !== 11 || loading}
      >
        {loading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  emoji: { fontSize: 80, textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  inputRow: { flexDirection: 'row', gap: 12, marginBottom: 300 },
  prefix: { width: 70, height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  prefixText: { fontSize: 18, fontWeight: '600' },
  input: { flex: 1, height: 56, borderRadius: 12, paddingHorizontal: 16, fontSize: 18 },
  button: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});

export default PhoneScreen;
