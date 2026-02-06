import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { typography, borderRadius, spacing } from '../theme/colors';

const Input = React.forwardRef(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      keyboardType = 'default',
      secureTextEntry = false,
      error,
      maxLength,
      multiline = false,
      leftIcon,
      rightIcon,
      onRightIconPress,
      editable = true,
      style,
      inputStyle,
      ...rest
    },
    ref
  ) => {
    const { colors } = useTheme();

    return (
      <View style={[styles.container, style]}>
        {label && (
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {label}
          </Text>
        )}
        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.inputBackground,
              borderColor: error ? colors.error : 'transparent',
              borderWidth: error ? 1 : 0,
            },
            multiline && styles.multilineContainer,
          ]}
        >
          {leftIcon && (
            <Ionicons
              name={leftIcon}
              size={20}
              color={colors.textSecondary}
              style={styles.leftIcon}
            />
          )}
          <TextInput
            style={[
              styles.input,
              { color: colors.text },
              multiline && styles.multilineInput,
              inputStyle,
            ]}
            ref={ref}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            maxLength={maxLength}
            multiline={multiline}
            numberOfLines={multiline ? 4 : 1}
            editable={editable}
            {...rest}
          />
          {rightIcon && (
            <Ionicons
              name={rightIcon}
              size={20}
              color={colors.textSecondary}
              style={styles.rightIcon}
              onPress={onRightIconPress}
            />
          )}
        </View>
        {error && (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
  },
  multilineContainer: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.body,
    fontWeight: '500',
  },
  multilineInput: {
    height: '100%',
    textAlignVertical: 'top',
  },
  leftIcon: {
    marginRight: spacing.md,
  },
  rightIcon: {
    marginLeft: spacing.md,
  },
  error: {
    fontSize: typography.caption,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default Input;
