import React, { useState, useRef } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius, spacing, shadows } from '../../theme/colors';

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  autoCorrect = true,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  editable = true,
  error,
  helper,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  inputStyle,
  onFocus,
  onBlur,
  returnKeyType,
  onSubmitEditing,
  variant = 'outlined', // outlined, filled, underlined
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputRef = useRef(null);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getContainerStyle = () => {
    const borderColor = error
      ? colors.error
      : isFocused ? colors.primary : colors.border;

    return {
      borderColor,
      borderWidth: variant === 'underlined' ? 0 : (isFocused ? 2 : 1.5),
      borderBottomWidth: variant === 'underlined' ? (isFocused ? 2 : 1.5) : undefined,
    };
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
        };
      case 'underlined':
        return {
          backgroundColor: 'transparent',
          borderRadius: 0,
          paddingHorizontal: 0,
        };
      default:
        return {
          backgroundColor: colors.background,
          borderRadius: borderRadius.lg,
        };
    }
  };

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: error ? colors.error : colors.text }]}>
          {label}
        </Text>
      )}

      <View
        style={[
          styles.inputContainer,
          getVariantStyles(),
          getContainerStyle(),
          isFocused && variant !== 'underlined' && shadows.sm,
          !editable && styles.disabled,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={isFocused ? colors.primary : colors.textSecondary}
            style={styles.leftIcon}
          />
        )}

        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          editable={editable}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          style={[
            styles.input,
            {
              color: colors.text,
              minHeight: multiline ? numberOfLines * 24 : undefined,
            },
            inputStyle,
          ]}
        />

        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            style={styles.rightIcon}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            <Ionicons
              name={rightIcon}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {(error || helper) && (
        <Text
          style={[
            styles.helperText,
            { color: error ? colors.error : colors.textSecondary },
          ]}
        >
          {error || helper}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    minHeight: 52,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: spacing.md,
  },
  leftIcon: {
    marginRight: spacing.md,
  },
  rightIcon: {
    marginLeft: spacing.md,
    padding: spacing.xs,
  },
  helperText: {
    fontSize: 12,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  disabled: {
    opacity: 0.6,
  },
});

export default Input;
