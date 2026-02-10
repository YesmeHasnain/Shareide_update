import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { shadows } from '../theme/colors';
import { defaultMaleAvatar, defaultFemaleAvatar } from '../utils/avatars';

const Avatar = ({
  source,
  name,
  gender,
  size = 'medium', // tiny, small, medium, large, xlarge
  variant = 'circle', // circle, rounded, square
  showBadge = false,
  badgeType = 'online', // online, verified, edit, rating
  badgeValue, // for rating badge
  onPress,
  style,
  gradient = false,
  useDefaultAvatar = true,
  showYellowVerified = false,
}) => {
  const { colors } = useTheme();
  const { user } = useAuth();

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
        return { size: 32, fontSize: 12, badgeSize: 10, iconSize: 6, ratingSize: 16 };
      case 'small':
        return { size: 40, fontSize: 14, badgeSize: 14, iconSize: 8, ratingSize: 18 };
      case 'medium':
        return { size: 56, fontSize: 20, badgeSize: 18, iconSize: 10, ratingSize: 22 };
      case 'large':
        return { size: 80, fontSize: 28, badgeSize: 22, iconSize: 12, ratingSize: 26 };
      case 'xlarge':
        return { size: 120, fontSize: 40, badgeSize: 28, iconSize: 16, ratingSize: 32 };
      default:
        return { size: 56, fontSize: 20, badgeSize: 18, iconSize: 10, ratingSize: 22 };
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
          <Ionicons name="checkmark" size={sizeStyles.iconSize} color="#FFFFFF" />
        );
      case 'edit':
        return (
          <Ionicons name="camera" size={sizeStyles.iconSize} color="#FFFFFF" />
        );
      case 'rating':
        return (
          <View style={styles.ratingBadgeContent}>
            <Ionicons name="star" size={sizeStyles.iconSize - 2} color="#000" />
            {badgeValue && (
              <Text style={[styles.ratingText, { fontSize: sizeStyles.iconSize - 1 }]}>
                {badgeValue}
              </Text>
            )}
          </View>
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
      case 'rating':
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
  const borderRadiusVal = getBorderRadius(sizeStyles.size);
  const defaultAvatar = avatarGender === 'female' ? defaultFemaleAvatar : defaultMaleAvatar;

  const avatarContent = source ? (
    <Image
      source={typeof source === 'string' ? { uri: source } : source}
      style={[
        styles.image,
        {
          width: sizeStyles.size,
          height: sizeStyles.size,
          borderRadius: borderRadiusVal,
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
          borderRadius: borderRadiusVal,
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
          borderRadius: borderRadiusVal,
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
          borderRadius: borderRadiusVal,
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
          width: badgeType === 'rating' ? 'auto' : sizeStyles.badgeSize,
          height: sizeStyles.badgeSize,
          borderRadius: sizeStyles.badgeSize / 2,
          backgroundColor: getBadgeColor(),
          borderWidth: 2,
          borderColor: colors.background,
          paddingHorizontal: badgeType === 'rating' ? 4 : 0,
          minWidth: sizeStyles.badgeSize,
        },
      ]}
    >
      {getBadgeContent()}
    </View>
  );

  const yellowVerified = showYellowVerified && (
    <View
      style={[
        styles.yellowBadge,
        {
          width: sizeStyles.badgeSize + 2,
          height: sizeStyles.badgeSize + 2,
          borderRadius: (sizeStyles.badgeSize + 2) / 2,
          borderWidth: 2,
          borderColor: colors.background,
        },
      ]}
    >
      <View style={[styles.yellowBadgeInner, { backgroundColor: colors.primary }]}>
        <Ionicons name="checkmark" size={sizeStyles.iconSize} color="#000" />
      </View>
    </View>
  );

  const containerStyle = [
    styles.container,
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
        {yellowVerified}
      </TouchableOpacity>
    );
  }

  return (
    <View style={containerStyle}>
      {avatarContent}
      {badge}
      {yellowVerified}
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
  ratingBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  ratingText: {
    fontWeight: '700',
    color: '#000',
  },
  yellowBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yellowBadgeInner: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Avatar;
