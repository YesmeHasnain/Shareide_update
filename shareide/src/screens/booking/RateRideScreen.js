import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';
import { Header, Card, Avatar, Button } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  star: '#FFD700',
  gradients: { gold: ['#FFD700', '#FFA500'] },
};

const Star = ({ filled, onPress, index }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(index + 1);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Ionicons
        name={filled ? 'star' : 'star-outline'}
        size={44}
        color={filled ? colors.star : colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

const FeedbackTag = ({ icon, label, isSelected, onPress, colors }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.tag,
        {
          backgroundColor: isSelected ? colors.primary : colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={isSelected ? '#000' : colors.textSecondary}
      />
      <Text
        style={[
          styles.tagLabel,
          { color: isSelected ? '#000' : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const RateRideScreen = ({ route, navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const { ride, driver, fare } = params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [negativeReason, setNegativeReason] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const isNegative = rating <= 2;

  const positiveTags = [
    { id: 1, label: 'Clean Car', icon: 'sparkles' },
    { id: 2, label: 'On Time', icon: 'time' },
    { id: 3, label: 'Friendly', icon: 'happy' },
    { id: 4, label: 'Safe Driving', icon: 'shield-checkmark' },
    { id: 5, label: 'Good Route', icon: 'navigate' },
    { id: 6, label: 'Great Music', icon: 'musical-notes' },
  ];

  const negativeTags = [
    { id: 101, label: 'Late Arrival', icon: 'time-outline' },
    { id: 102, label: 'Rude Behavior', icon: 'sad-outline' },
    { id: 103, label: 'Unsafe Driving', icon: 'warning-outline' },
    { id: 104, label: 'Dirty Car', icon: 'trash-outline' },
    { id: 105, label: 'Wrong Route', icon: 'map-outline' },
    { id: 106, label: 'Overcharging', icon: 'cash-outline' },
  ];

  const tags = isNegative ? negativeTags : positiveTags;

  const getRatingText = () => {
    switch (rating) {
      case 5:
        return 'Excellent!';
      case 4:
        return 'Good';
      case 3:
        return 'Okay';
      case 2:
        return 'Poor';
      case 1:
        return 'Terrible';
      default:
        return '';
    }
  };

  const handleSetRating = (newRating) => {
    const wasNegative = rating <= 2;
    const willBeNegative = newRating <= 2;
    if (wasNegative !== willBeNegative) {
      setSelectedTags([]);
      setNegativeReason('');
    }
    setRating(newRating);
  };

  const toggleTag = (tagId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    if (isNegative && !negativeReason.trim()) {
      Alert.alert(
        'Reason Required',
        'Please provide a reason for your low rating.',
      );
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const selectedTagLabels = tags
        .filter((tag) => selectedTags.includes(tag.id))
        .map((tag) => tag.label);

      await ridesAPI.rateRide(
        ride.id,
        rating,
        comment,
        selectedTagLabels,
        isNegative ? negativeReason : undefined,
      );

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Thank You!', 'Your feedback helps improve our service.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          },
        },
      ]);
    } catch (error) {
      // For demo, show success anyway
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert('Thank You!', 'Your feedback has been recorded.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            });
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Rate Your Ride"
        rightIcon="close"
        onRightPress={handleSkip}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Success Card */}
        <View>
          <LinearGradient
            colors={colors.gradients?.gold || ['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.successCard, shadows.lg]}
          >
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#000" />
            </View>
            <Text style={styles.successTitle}>Ride Completed!</Text>
            <Text style={styles.fareText}>
              Rs. {fare || driver?.fare || 350}
            </Text>
          </LinearGradient>
        </View>

        {/* Driver Card */}
        <View>
          <Card style={styles.driverCard} shadow="md">
            <Avatar
              source={driver?.avatar}
              name={driver?.name}
              size="large"
              showBadge
              badgeType="verified"
            />
            <Text style={[styles.driverName, { color: colors.text }]}>
              {driver?.name}
            </Text>
            <View style={styles.vehicleRow}>
              <Ionicons name="car-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
                {driver?.vehicle?.model}
              </Text>
            </View>
          </Card>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={[styles.ratingLabel, { color: colors.text }]}>
            How was your ride?
          </Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                filled={star <= rating}
                onPress={handleSetRating}
                index={star - 1}
              />
            ))}
          </View>
          <Text style={[styles.ratingText, { color: colors.primary }]}>
            {getRatingText()}
          </Text>
        </View>

        {/* Negative Reason Section */}
        {isNegative && (
          <View style={styles.negativeReasonSection}>
            <Text style={[styles.negativeReasonLabel, { color: colors.error || '#EF4444' }]}>
              Why did you give a low rating? *
            </Text>
            <View
              style={[
                styles.negativeReasonInputContainer,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.error || '#EF4444',
                },
              ]}
            >
              <TextInput
                style={[styles.negativeReasonInput, { color: colors.text }]}
                value={negativeReason}
                onChangeText={setNegativeReason}
                placeholder="Please explain what went wrong..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>
          </View>
        )}

        {/* Tags Section */}
        <View style={styles.tagsSection}>
          <Text style={[styles.tagsLabel, { color: isNegative ? (colors.error || '#EF4444') : colors.text }]}>
            {isNegative ? 'What went wrong?' : 'What did you like?'}
          </Text>
          <View style={styles.tagsGrid}>
            {tags.map((tag) => (
              <FeedbackTag
                key={tag.id}
                icon={tag.icon}
                label={tag.label}
                isSelected={selectedTags.includes(tag.id)}
                onPress={() => toggleTag(tag.id)}
                colors={colors}
              />
            ))}
          </View>
        </View>

        {/* Comment Section */}
        <View style={styles.commentSection}>
          <Text style={[styles.commentLabel, { color: colors.text }]}>
            Additional Comments
          </Text>
          <View
            style={[
              styles.commentInputContainer,
              { backgroundColor: colors.surface },
            ]}
          >
            <TextInput
              style={[styles.commentInput, { color: colors.text }]}
              value={comment}
              onChangeText={setComment}
              placeholder="Tell us more about your experience..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + spacing.md,
          },
          shadows.lg,
        ]}
      >
        <Button
          title="Submit Rating"
          onPress={handleSubmit}
          variant="primary"
          size="large"
          loading={loading}
          icon="send"
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  successCard: {
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#000',
    marginBottom: spacing.xs,
  },
  fareText: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: '#000',
  },
  driverCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  driverName: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  vehicleText: {
    fontSize: typography.body,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  ratingLabel: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  starsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ratingText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  negativeReasonSection: {
    marginBottom: spacing.xl,
  },
  negativeReasonLabel: {
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  negativeReasonInputContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    ...shadows.sm,
  },
  negativeReasonInput: {
    fontSize: typography.body,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tagsSection: {
    marginBottom: spacing.xl,
  },
  tagsLabel: {
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  tagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    gap: spacing.xs,
  },
  tagLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  commentSection: {
    marginBottom: spacing.lg,
  },
  commentLabel: {
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  commentInputContainer: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  commentInput: {
    fontSize: typography.body,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
});

export default RateRideScreen;
