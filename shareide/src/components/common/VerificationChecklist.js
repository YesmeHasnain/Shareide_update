import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';

const VerificationChecklist = ({ items = [], style }) => {
  const { colors } = useTheme();

  const defaultItems = [
    { key: 'phone', label: 'Phone number verified', verified: true },
    { key: 'email', label: 'Email verified', verified: false },
    { key: 'cnic', label: 'CNIC verified', verified: false },
    { key: 'selfie', label: 'Selfie verified', verified: false },
  ];

  const checklist = items.length > 0 ? items : defaultItems;

  return (
    <View style={[styles.container, style]}>
      {checklist.map((item) => (
        <View key={item.key} style={styles.row}>
          <View
            style={[
              styles.checkCircle,
              {
                backgroundColor: item.verified
                  ? colors.primary
                  : colors.borderLight,
              },
            ]}
          >
            <Ionicons
              name={item.verified ? 'checkmark' : 'close'}
              size={14}
              color={item.verified ? '#000000' : colors.textTertiary}
            />
          </View>
          <Text
            style={[
              styles.label,
              {
                color: item.verified ? colors.text : colors.textTertiary,
              },
            ]}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

export default VerificationChecklist;
