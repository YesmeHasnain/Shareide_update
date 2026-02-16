import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.38;
const CARD_SPACING = 10;

const BiddingCard = ({
  baseFare,
  selectedBid,
  onBidChange,
  driversCount,
  searchRadius,
  style,
}) => {
  const { colors } = useTheme();
  const scrollRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const bidOptions = [
    { percentage: 0, label: 'Standard', icon: 'car-outline', tag: null },
    { percentage: 10, label: '+10%', icon: 'trending-up', tag: 'More drivers' },
    { percentage: 20, label: '+20%', icon: 'flash-outline', tag: 'Priority' },
    { percentage: 30, label: '+30%', icon: 'rocket-outline', tag: 'Fast Match' },
    { percentage: 50, label: '+50%', icon: 'diamond-outline', tag: 'Instant' },
  ];

  const calculateFare = (percentage) => Math.round(baseFare + baseFare * (percentage / 100));
  const calculateExtra = (percentage) => Math.round(baseFare * (percentage / 100));

  const handleSelect = useCallback((percentage, index) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onBidChange(percentage);
    scrollRef.current?.scrollTo({
      x: index * (CARD_WIDTH + CARD_SPACING) - (SCREEN_WIDTH - CARD_WIDTH) / 2 + CARD_WIDTH / 2,
      animated: true,
    });
  }, [onBidChange]);

  const selectedIndex = bidOptions.findIndex(o => o.percentage === selectedBid);
  const currentFare = calculateFare(selectedBid);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface || colors.card }, style]}>
      {/* Fare Display */}
      <View style={styles.fareDisplay}>
        <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Offer your fare</Text>
        <View style={styles.fareRow}>
          <TouchableOpacity
            style={[styles.fareBtn, { backgroundColor: colors.border || '#E5E7EB' }]}
            onPress={() => {
              const prevIdx = Math.max(0, selectedIndex - 1);
              handleSelect(bidOptions[prevIdx].percentage, prevIdx);
            }}
          >
            <Ionicons name="remove" size={22} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.fareCenter}>
            <Text style={[styles.fareAmount, { color: colors.text }]}>
              Rs. {currentFare}
            </Text>
            {selectedBid > 0 && (
              <Text style={[styles.fareExtra, { color: '#10B981' }]}>
                +Rs. {calculateExtra(selectedBid)} ({selectedBid}% boost)
              </Text>
            )}
            {selectedBid === 0 && (
              <Text style={[styles.fareExtra, { color: colors.textTertiary }]}>
                Base fare
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.fareBtn, { backgroundColor: '#FCC014' }]}
            onPress={() => {
              const nextIdx = Math.min(bidOptions.length - 1, selectedIndex + 1);
              handleSelect(bidOptions[nextIdx].percentage, nextIdx);
            }}
          >
            <Ionicons name="add" size={22} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Horizontal Scroll Bid Options */}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + CARD_SPACING}
        decelerationRate="fast"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {bidOptions.map((option, index) => {
          const isSelected = selectedBid === option.percentage;
          const fare = calculateFare(option.percentage);

          return (
            <TouchableOpacity
              key={option.percentage}
              activeOpacity={0.8}
              onPress={() => handleSelect(option.percentage, index)}
              style={{ width: CARD_WIDTH, marginRight: CARD_SPACING }}
            >
              {isSelected ? (
                <LinearGradient
                  colors={['#FCC014', '#FF9500']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.bidCard}
                >
                  <Ionicons name={option.icon} size={22} color="#000" />
                  <Text style={styles.bidCardFareSelected}>Rs. {fare}</Text>
                  <Text style={styles.bidCardLabelSelected}>{option.label}</Text>
                  {option.tag && (
                    <View style={styles.tagSelected}>
                      <Text style={styles.tagTextSelected}>{option.tag}</Text>
                    </View>
                  )}
                  <View style={styles.selectedDot} />
                </LinearGradient>
              ) : (
                <View style={[styles.bidCard, { backgroundColor: colors.background || '#F5F5F5', borderColor: colors.border || '#E5E7EB', borderWidth: 1.5 }]}>
                  <Ionicons name={option.icon} size={22} color={colors.textSecondary} />
                  <Text style={[styles.bidCardFare, { color: colors.text }]}>Rs. {fare}</Text>
                  <Text style={[styles.bidCardLabel, { color: colors.textSecondary }]}>{option.label}</Text>
                  {option.tag && (
                    <View style={[styles.tag, { backgroundColor: colors.primary + '15' }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>{option.tag}</Text>
                    </View>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom hint */}
      <View style={styles.hintRow}>
        <Ionicons name="swap-horizontal" size={14} color={colors.textTertiary} />
        <Text style={[styles.hintText, { color: colors.textTertiary }]}>
          Swipe to see more options • Higher fare = faster match
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    paddingVertical: 16,
    marginBottom: 12,
    ...shadows.sm,
  },
  fareDisplay: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  fareLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  fareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fareBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fareCenter: {
    alignItems: 'center',
    flex: 1,
  },
  fareAmount: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
  },
  fareExtra: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  bidCard: {
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    gap: 4,
  },
  bidCardFare: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 4,
  },
  bidCardFareSelected: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000',
    marginTop: 4,
  },
  bidCardLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  bidCardLabelSelected: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 2,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tagSelected: {
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 2,
  },
  tagTextSelected: {
    fontSize: 9,
    fontWeight: '700',
    color: '#000',
    textTransform: 'uppercase',
  },
  selectedDot: {
    position: 'absolute',
    bottom: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#000',
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  hintText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default BiddingCard;
