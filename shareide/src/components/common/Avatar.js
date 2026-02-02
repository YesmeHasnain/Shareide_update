import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { shadows } from '../../theme/colors';
import { defaultMaleAvatar, defaultFemaleAvatar } from '../../utils/avatars';

const Avatar = ({
  source,
  name,
  gender, // male, female - uses user's gender if not provided
  size = 'medium', // tiny, small, medium, large, xlarge
  variant = 'circle', // circle, rounded, square
  showBadge = false,
  badgeType = 'online', // online, verified, edit
  onPress,
  style,
  gradient = false,
  useDefaultAvatar = true, // whether to show default avatar image or initials
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  // Use provided gender or fall back to user's gender
  const avatarGender = gender || user?.gender || 'male';

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'tiny':
        return { size: 32, fontSize: 12, badgeSize: 10, iconSize: 6 };
      case 'small':
        return { size: 40, fontSize: 14, badgeSize: 12, iconSize: 8 };
      case 'medium':
        return { size: 56, fontSize: 20, badgeSize: 16, iconSize: 10 };
      case 'large':
        return { size: 80, fontSize: 28, badgeSize: 20, iconSize: 12 };
      case 'xlarge':
        return { size: 120, fontSize: 40, badgeSize: 28, iconSize: 16 };
      default:
        return { size: 56, fontSize: 20, badgeSize: 16, iconSize: 10 };
    }
  };

  const getBorderRadius = (avatarSize) => {
    switch (variant) {
      case 'rounded':
        return avatarSize / 4;
      case 'square':
        return 8;
      default:
        return avatarSize / 2;
    }
  };

  const getBadgeContent = () => {
    switch (badgeType) {
      case 'verified':
        return (
          <Ionicons
            name="checkmark"
            size={sizeStyles.iconSize}
            color="#FFFFFF"
          />
        );
      case 'edit':
        return (
          <Ionicons
            name="camera"
            size={sizeStyles.iconSize}
            color="#FFFFFF"
          />
        );
      default:
        return null;
    }
  };

  const getBadgeColor = () => {
    switch (badgeType) {
      case 'online':
        return colors.success;
      case 'verified':
        return colors.info;
      case 'edit':
        return colors.primary;
      default:
        return colors.success;
    }
  };

  const getInitials = () => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const sizeStyles = getSizeStyles();
  const borderRadius = getBorderRadius(sizeStyles.size);

  // Get the default avatar based on gender
  const defaultAvatar = avatarGender === 'female' ? defaultFemaleAvatar : defaultMaleAvatar;

  const avatarContent = source ? (
    <Image
      source={typeof source === 'string' ? { uri: source } : source}
      style={[
        styles.image,
        {
          width: sizeStyles.size,
          height: sizeStyles.size,
          borderRadius,
        },
      ]}
    />
  ) : useDefaultAvatar ? (
    <Image
      source={defaultAvatar}
      style={[
        styles.image,
        {
          width: sizeStyles.size,
          height: sizeStyles.size,
          borderRadius,
        },
      ]}
    />
  ) : gradient ? (
    <LinearGradient
      colors={colors.gradients?.primary || ['#FFD700', '#FFA500']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.placeholder,
        {
          width: sizeStyles.size,
          height: sizeStyles.size,
          borderRadius,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: sizeStyles.fontSize, color: '#000' }]}>
        {getInitials()}
      </Text>
    </LinearGradient>
  ) : (
    <View
      style={[
        styles.placeholder,
        {
          width: sizeStyles.size,
          height: sizeStyles.size,
          borderRadius,
          backgroundColor: colors.primary,
        },
      ]}
    >
      <Text style={[styles.initials, { fontSize: sizeStyles.fontSize, color: '#000' }]}>
        {getInitials()}
      </Text>
    </View>
  );

  const badge = showBadge && (
    <View
      style={[
        styles.badge,
        {
          width: sizeStyles.badgeSize,
          height: sizeStyles.badgeSize,
          borderRadius: sizeStyles.badgeSize / 2,
          backgroundColor: getBadgeColor(),
          borderWidth: 2,
          borderColor: colors.background,
        },
      ]}
    >
      {getBadgeContent()}
    </View>
  );

  const containerStyle = [
    styles.container,
    shadows.md,
    {
      width: sizeStyles.size,
      height: sizeStyles.size,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={containerStyle}
        activeOpacity={0.7}
      >
        {avatarContent}
        {badge}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {avatarContent}
      {badge}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    fontWeight: '700',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Avatar;
