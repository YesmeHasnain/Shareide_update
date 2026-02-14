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
import { rideAPI } from '../../api/ride';
import Header from '../../components/Header';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const Star = ({ filled, onPress, index, colors }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(index + 1);
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Ionicons
        name={filled ? 'star' : 'star-outline'}
        size={44}
        color={filled ? (colors.star || '#FCC014') : colors.textSecondary}
      />
    </TouchableOpacity>
  );
};

const FeedbackTag = ({ icon, label, isSelected, onPress, colors, isNegative }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const activeColor = isNegative ? (colors.error || '#EF4444') : colors.primary;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.tag,
        {
          backgroundColor: isSelected ? activeColor : colors.surface || colors.card,
          borderColor: isSelected ? activeColor : colors.border,
        },
      ]}
    >
      <Ionicons
        name={icon}
        size={16}
        color={isSelected ? (isNegative ? '#FFF' : '#000') : colors.textSecondary}
      />
      <Text
        style={[
          styles.tagLabel,
          { color: isSelected ? (isNegative ? '#FFF' : '#000') : colors.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const RateRiderScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const { ride, rider, fare } = params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [negativeReason, setNegativeReason] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const isNegative = rating <= 2;

  const positiveTags = [
    { id: 1, label: 'Polite', icon: 'happy' },
    { id: 2, label: 'On Time', icon: 'time' },
    { id: 3, label: 'Clean', icon: 'sparkles' },
    { id: 4, label: 'Respectful', icon: 'heart' },
    { id: 5, label: 'Good Communication', icon: 'chatbubble' },
    { id: 6, label: 'Friendly', icon: 'people' },
  ];

  const negativeTags = [
    { id: 101, label: 'Rude', icon: 'sad-outline' },
    { id: 102, label: 'Late', icon: 'time-outline' },
    { id: 103, label: 'Messy', icon: 'trash-outline' },
    { id: 104, label: 'Disrespectful', icon: 'thumbs-down-outline' },
    { id: 105, label: 'No-show risk', icon: 'close-circle-outline' },
    { id: 106, label: 'Unsafe behavior', icon: 'warning-outline' },
  ];

  const tags = isNegative ? negativeTags : positiveTags;

  const getRatingText = () => {
    switch (rating) {
      case 5: return 'Excellent!';
      case 4: return 'Good';
      case 3: return 'Okay';
      case 2: return 'Poor';
      case 1: return 'Terrible';
      default: return '';
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

      await rideAPI.rateRider(
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
        title="Rate Rider"
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
            colors={colors.gradientPrimary || ['#FCC014', '#F5A623']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.successCard, shadows.glow]}
          >
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={60} color="#000" />
            </View>
            <Text style={styles.successTitle}>Ride Completed!</Text>
            <Text style={styles.fareText}>
              Rs. {fare || ride?.fare || 350}
            </Text>
          </LinearGradient>
        </View>

        {/* Rider Card */}
        <View>
          <Card style={styles.riderCard} shadow="md">
            <Avatar
              source={rider?.avatar}
              name={rider?.name}
              size="large"
              showBadge
              badgeType="verified"
            />
            <Text style={[styles.riderName, { color: colors.text }]}>
              {rider?.name || 'Rider'}
            </Text>
            <View style={styles.rideInfoRow}>
              <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
              <Text style={[styles.rideInfoText, { color: colors.textSecondary }]}>
                {ride?.pickup_address || 'Pickup location'}
              </Text>
            </View>
          </Card>
        </View>

        {/* Rating Section */}
        <View style={styles.ratingSection}>
          <Text style={[styles.ratingLabel, { color: colors.text }]}>
            How was the rider?
          </Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                filled={star <= rating}
                onPress={handleSetRating}
                index={star - 1}
                colors={colors}
              />
            ))}
          </View>
          <Text style={[styles.ratingText, { color: isNegative ? (colors.error || '#EF4444') : colors.primary }]}>
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
                  backgroundColor: colors.surface || colors.card,
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
                isNegative={isNegative}
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
              { backgroundColor: colors.surface || colors.card },
            ]}
          >
            <TextInput
              style={[styles.commentInput, { color: colors.text }]}
              value={comment}
              onChangeText={setComment}
              placeholder="Tell us more about the rider..."
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
            backgroundColor: colors.surface || colors.card,
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
  riderCard: {
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  riderName: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  rideInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  rideInfoText: {
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

export default RateRiderScreen;
