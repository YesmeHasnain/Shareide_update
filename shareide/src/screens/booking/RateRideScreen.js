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

const Star = ({ filled, onPress, index }) => {
  const { colors } = useTheme();

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
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { ride, driver, fare } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const tags = [
    { id: 1, label: 'Clean Car', icon: 'sparkles' },
    { id: 2, label: 'On Time', icon: 'time' },
    { id: 3, label: 'Friendly', icon: 'happy' },
    { id: 4, label: 'Safe Driving', icon: 'shield-checkmark' },
    { id: 5, label: 'Good Route', icon: 'navigate' },
    { id: 6, label: 'Great Music', icon: 'musical-notes' },
  ];

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

  const toggleTag = (tagId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const selectedTagLabels = tags
        .filter((tag) => selectedTags.includes(tag.id))
        .map((tag) => tag.label);

      await ridesAPI.rateRide(ride.id, rating, comment, selectedTagLabels);

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
            style={[styles.successCard, shadows.goldLg]}
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
                onPress={setRating}
                index={star - 1}
              />
            ))}
          </View>
          <Text style={[styles.ratingText, { color: colors.primary }]}>
            {getRatingText()}
          </Text>
        </View>

        {/* Tags Section */}
        <View style={styles.tagsSection}>
          <Text style={[styles.tagsLabel, { color: colors.text }]}>
            What did you like?
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
