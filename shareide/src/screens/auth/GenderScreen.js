import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const GenderScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { phone, verificationToken, token, user, isNewUser } = route.params;
  const [gender, setGender] = useState(user?.gender || null);

  const handleContinue = () => {
    if (gender) {
      navigation.navigate('ProfileSetup', {
        phone,
        gender,
        verificationToken,
        token,
        user,
        isNewUser,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.emoji}>👥</Text>
      <Text style={[styles.title, { color: colors.text }]}>Select Gender</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        This helps us personalize your experience
      </Text>

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
          <Text style={[styles.genderText, { color: gender === 'male' ? '#000' : colors.text }]}>Male</Text>
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
          <Text style={[styles.genderText, { color: gender === 'female' ? '#000' : colors.text }]}>Female</Text>
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
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 48 },
  genderRow: { flexDirection: 'row', gap: 16, marginBottom: 300 },
  genderCard: { flex: 1, aspectRatio: 1, borderRadius: 20, borderWidth: 3, justifyContent: 'center', alignItems: 'center' },
  genderEmoji: { fontSize: 80, marginBottom: 16 },
  genderText: { fontSize: 20, fontWeight: 'bold' },
  button: { height: 56, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});

export default GenderScreen;
