import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const GenderScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { phone, code, token, isNewUser } = route.params;
  const [gender, setGender] = useState(null);

  const handleContinue = () => {
    if (gender) {
      navigation.navigate('ProfileSetup', { phone, code, gender, token, isNewUser });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.emoji}>👥</Text>
      <Text style={[styles.title, { color: colors.text }]}>Select Gender</Text>
      <View style={styles.genderRow}>
        <TouchableOpacity
          style={[
            styles.genderCard,
            {
              backgroundColor: gender === 'male' ? colors.primary : colors.surface,
              borderColor: gender === 'male' ? colors.primary : colors.border
            }
          ]}
          onPress={() => setGender('male')}
        >
          <Text style={styles.genderEmoji}>👨</Text>
          <Text style={[styles.genderText, { color: colors.text }]}>Male</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.genderCard,
            {
              backgroundColor: gender === 'female' ? colors.primary : colors.surface,
              borderColor: gender === 'female' ? colors.primary : colors.border
            }
          ]}
          onPress={() => setGender('female')}
        >
          <Text style={styles.genderEmoji}>👩</Text>
          <Text style={[styles.genderText, { color: colors.text }]}>Female</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: gender ? colors.primary : colors.border }]}
        onPress={handleContinue}
        disabled={!gender}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  emoji: { fontSize: 80, textAlign: 'center', marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 48 },
  genderRow: { flexDirection: 'row', gap: 16, marginBottom: 300 },
  genderCard: { flex: 1, aspectRatio: 1, borderRadius: 20, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  genderEmoji: { fontSize: 80, marginBottom: 16 },
  genderText: { fontSize: 20, fontWeight: 'bold' },
  button: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});

export default GenderScreen;
