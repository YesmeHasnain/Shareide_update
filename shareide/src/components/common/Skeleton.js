import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { borderRadius } from '../../theme/colors';

const Skeleton = ({
  width = '100%',
  height = 20,
  variant = 'rect', // rect, circle, text
  borderRadiusValue,
  style,
  animated = true,
}) => {
  const { colors, isDark } = useTheme();

  const getBorderRadius = () => {
    if (borderRadiusValue !== undefined) return borderRadiusValue;
    switch (variant) {
      case 'circle':
        return typeof height === 'number' ? height / 2 : 50;
      case 'text':
        return borderRadius.xs;
      default:
        return borderRadius.md;
    }
  };

  const getDimensions = () => {
    if (variant === 'circle') {
      const size = typeof height === 'number' ? height : 50;
      return { width: size, height: size };
    }
    return { width, height };
  };

  const baseColor = isDark ? '#2D3748' : '#E5E7EB';
  const shimmerColor = isDark ? '#4A5568' : '#F3F4F6';

  return (
    <View
      style={[
        styles.container,
        getDimensions(),
        { borderRadius: getBorderRadius(), backgroundColor: baseColor },
        style,
      ]}
    >
      {animated && (
        <View style={styles.shimmer}>
          <LinearGradient
            colors={['transparent', shimmerColor, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
        </View>
      )}
    </View>
  );
};

// Pre-built skeleton patterns
export const SkeletonCard = ({ style }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }, style]}>
      <View style={styles.cardHeader}>
        <Skeleton variant="circle" height={48} />
        <View style={styles.cardHeaderText}>
          <Skeleton width="60%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="40%" height={12} />
        </View>
      </View>
      <Skeleton width="100%" height={12} style={{ marginTop: 16 }} />
      <Skeleton width="80%" height={12} style={{ marginTop: 8 }} />
    </View>
  );
};

export const SkeletonList = ({ count = 3, style }) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={{ marginBottom: 12 }} />
      ))}
    </View>
  );
};

export const SkeletonProfile = ({ style }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.profile, style]}>
      <Skeleton variant="circle" height={100} style={{ alignSelf: 'center' }} />
      <Skeleton width="50%" height={20} style={{ alignSelf: 'center', marginTop: 16 }} />
      <Skeleton width="30%" height={14} style={{ alignSelf: 'center', marginTop: 8 }} />
      <View style={styles.profileStats}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.profileStat}>
            <Skeleton width={40} height={24} style={{ marginBottom: 4 }} />
            <Skeleton width={60} height={12} />
          </View>
        ))}
      </View>
    </View>
  );
};

export const SkeletonDriver = ({ style }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.driver, { backgroundColor: colors.card }, style]}>
      <View style={styles.driverHeader}>
        <Skeleton variant="circle" height={56} />
        <View style={styles.driverInfo}>
          <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
          <Skeleton width="50%" height={12} />
        </View>
        <View style={styles.driverFare}>
          <Skeleton width={60} height={20} style={{ marginBottom: 4 }} />
          <Skeleton width={40} height={12} />
        </View>
      </View>
      <View style={styles.driverVehicle}>
        <Skeleton width="100%" height={44} borderRadiusValue={8} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    width: '100%',
    height: '100%',
  },
  card: {
    padding: 16,
    borderRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  profile: {
    padding: 20,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  profileStat: {
    alignItems: 'center',
  },
  driver: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12,
  },
  driverFare: {
    alignItems: 'flex-end',
  },
  driverVehicle: {
    marginTop: 12,
  },
});

export default Skeleton;
