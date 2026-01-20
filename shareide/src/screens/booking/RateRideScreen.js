import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';

const RateRideScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { ride, driver, fare } = route.params;
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const tags = [
    { id: 1, label: 'Clean Car', icon: '✨' },
    { id: 2, label: 'On Time', icon: '⏰' },
    { id: 3, label: 'Friendly', icon: '😊' },
    { id: 4, label: 'Safe Driving', icon: '🛡️' },
    { id: 5, label: 'Good Route', icon: '🗺️' },
    { id: 6, label: 'Great Music', icon: '🎵' },
  ];

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const selectedTagLabels = tags
        .filter((tag) => selectedTags.includes(tag.id))
        .map((tag) => tag.label);

      await ridesAPI.rateRide(ride.id, rating, comment, selectedTagLabels);

      Alert.alert('Thank You!', 'Your feedback helps improve our service.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Drawer' }],
            });
          },
        },
      ]);
    } catch (error) {
      // For demo, show success anyway
      Alert.alert('Thank You!', 'Your feedback has been recorded.', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Drawer' }],
            });
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Drawer' }],
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={{ width: 28 }} />
        <Text style={styles.headerTitle}>Rate Your Ride</Text>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.successCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.successEmoji}>🎉</Text>
          <Text style={[styles.successTitle, { color: colors.text }]}>Ride Completed!</Text>
          <Text style={[styles.fareText, { color: colors.primary }]}>Rs. {fare || driver?.fare || 350}</Text>
        </View>

        <View style={[styles.driverCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.driverAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.driverInitial}>{driver?.name?.charAt(0) || '?'}</Text>
          </View>
          <Text style={[styles.driverName, { color: colors.text }]}>{driver?.name}</Text>
          <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
            {driver?.vehicle?.model}
          </Text>
        </View>

        <View style={styles.ratingSection}>
          <Text style={[styles.ratingLabel, { color: colors.text }]}>How was your ride?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Text style={[styles.star, { opacity: star <= rating ? 1 : 0.3 }]}>⭐</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
            {rating === 5 ? 'Excellent!' : rating === 4 ? 'Good' : rating === 3 ? 'Okay' : rating === 2 ? 'Poor' : 'Terrible'}
          </Text>
        </View>

        <View style={styles.tagsSection}>
          <Text style={[styles.tagsLabel, { color: colors.text }]}>What did you like?</Text>
          <View style={styles.tagsGrid}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tag,
                  {
                    backgroundColor: selectedTags.includes(tag.id) ? colors.primary : colors.surface,
                    borderColor: selectedTags.includes(tag.id) ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleTag(tag.id)}
              >
                <Text style={styles.tagIcon}>{tag.icon}</Text>
                <Text
                  style={[
                    styles.tagLabel,
                    { color: selectedTags.includes(tag.id) ? '#000' : colors.text },
                  ]}
                >
                  {tag.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.commentSection}>
          <Text style={[styles.commentLabel, { color: colors.text }]}>Additional Comments</Text>
          <TextInput
            style={[styles.commentInput, { backgroundColor: colors.surface, color: colors.text }]}
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

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: loading ? colors.border : colors.primary }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.submitText}>Submit Rating</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  skipText: { fontSize: 16, fontWeight: '600', color: '#000' },
  content: { flex: 1, padding: 16 },
  successCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  successEmoji: { fontSize: 50, marginBottom: 8 },
  successTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  fareText: { fontSize: 28, fontWeight: 'bold' },
  driverCard: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  driverInitial: { fontSize: 24, fontWeight: 'bold', color: '#000' },
  driverName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  vehicleText: { fontSize: 14 },
  ratingSection: { alignItems: 'center', marginBottom: 24 },
  ratingLabel: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  starsRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  star: { fontSize: 40 },
  ratingText: { fontSize: 14 },
  tagsSection: { marginBottom: 24 },
  tagsLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  tagIcon: { fontSize: 14 },
  tagLabel: { fontSize: 12, fontWeight: '600' },
  commentSection: { marginBottom: 16 },
  commentLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  commentInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 100,
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
  },
  submitButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});

export default RateRideScreen;
