import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { walletAPI } from '../../api/wallet';
import Header from '../../components/Header';
import { spacing, typography, borderRadius } from '../../theme/colors';

const { width } = Dimensions.get('window');

const EarningsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [refreshing, setRefreshing] = useState(false);
  const [earnings, setEarnings] = useState(null);
  const [dailyEarnings, setDailyEarnings] = useState([]);

  useEffect(() => {
    fetchEarnings();
  }, [selectedPeriod]);

  const fetchEarnings = async () => {
    try {
      const response = await walletAPI.getEarnings(selectedPeriod);
      if (response.success) {
        setEarnings(response.data);
        setDailyEarnings(response.data.daily_breakdown || []);
      }
    } catch (error) {
      console.log('Error fetching earnings:', error);
      // Show empty state - real data only
      setEarnings({
        total: 0,
        rides: 0,
        tips: 0,
        average_per_ride: 0,
        commission: 0,
        net_earnings: 0,
        hours_online: 0,
      });
      setDailyEarnings([]);
    } finally {
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchEarnings();
  };

  const maxEarning = Math.max(...dailyEarnings.map(d => d.earnings), 1);

  const periods = [
    { key: 'today', label: 'Today' },
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Earnings"
        onLeftPress={() => navigation.goBack()}
        rightIcon="time-outline"
        onRightPress={() => navigation.navigate('RideHistory')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[
                styles.periodButton,
                {
                  backgroundColor: selectedPeriod === period.key ? colors.primary : colors.surface,
                },
              ]}
              onPress={() => setSelectedPeriod(period.key)}
            >
              <Text
                style={[
                  styles.periodText,
                  { color: selectedPeriod === period.key ? '#000' : colors.text },
                ]}
              >
                {period.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Earnings Card */}
        <View style={[styles.earningsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardLabel, { color: colors.textSecondary }]}>Total Earnings</Text>
          <Text style={[styles.cardAmount, { color: colors.text }]}>
            Rs. {earnings?.total?.toLocaleString() || '0'}
          </Text>
          <View style={styles.cardStats}>
            <View style={styles.cardStat}>
              <Text style={[styles.cardStatValue, { color: colors.primary }]}>
                {earnings?.rides || 0}
              </Text>
              <Text style={[styles.cardStatLabel, { color: colors.textSecondary }]}>Rides</Text>
            </View>
            <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
            <View style={styles.cardStat}>
              <Text style={[styles.cardStatValue, { color: colors.primary }]}>
                Rs. {earnings?.average_per_ride || 0}
              </Text>
              <Text style={[styles.cardStatLabel, { color: colors.textSecondary }]}>Avg/Ride</Text>
            </View>
            <View style={[styles.cardDivider, { backgroundColor: colors.border }]} />
            <View style={styles.cardStat}>
              <Text style={[styles.cardStatValue, { color: colors.primary }]}>
                {earnings?.hours_online?.toFixed(1) || 0}h
              </Text>
              <Text style={[styles.cardStatLabel, { color: colors.textSecondary }]}>Online</Text>
            </View>
          </View>
        </View>

        {/* Daily Chart */}
        {selectedPeriod === 'week' && dailyEarnings.length > 0 && (
          <View style={[styles.chartCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Daily Breakdown</Text>
            <View style={styles.chartContainer}>
              {dailyEarnings.map((day, index) => (
                <View key={index} style={styles.barContainer}>
                  <Text style={[styles.barValue, { color: colors.textSecondary }]}>
                    {(day.earnings / 1000).toFixed(1)}k
                  </Text>
                  <View style={[styles.barWrapper, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.bar,
                        {
                          backgroundColor: colors.primary,
                          height: `${(day.earnings / maxEarning) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{day.day}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Breakdown */}
        <View style={[styles.breakdownCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.breakdownTitle, { color: colors.text }]}>Earnings Breakdown</Text>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(252, 192, 20, 0.12)' }]}>
                <Ionicons name="cash" size={20} color="#FCC014" />
              </View>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>Ride Earnings</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              Rs. {((earnings?.total || 0) - (earnings?.tips || 0)).toLocaleString()}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Ionicons name="gift" size={20} color="#10B981" />
              </View>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>Tips</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#22c55e' }]}>
              +Rs. {earnings?.tips?.toLocaleString() || '0'}
            </Text>
          </View>

          <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(239, 68, 68, 0.12)' }]}>
                <Ionicons name="bar-chart" size={20} color="#EF4444" />
              </View>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>Platform Fee (20%)</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#ef4444' }]}>
              -Rs. {earnings?.commission?.toLocaleString() || '0'}
            </Text>
          </View>

          <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <View style={[styles.iconBg, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
                <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              </View>
              <Text style={[styles.breakdownLabel, { color: colors.text, fontWeight: 'bold' }]}>
                Net Earnings
              </Text>
            </View>
            <Text style={[styles.breakdownValue, { color: colors.primary, fontWeight: 'bold' }]}>
              Rs. {earnings?.net_earnings?.toLocaleString() || '0'}
            </Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={[styles.quickStatCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(252, 192, 20, 0.12)' }]}>
              <Ionicons name="star" size={20} color="#FCC014" />
            </View>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>4.8</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Rating</Text>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(59, 130, 246, 0.12)' }]}>
              <Ionicons name="location" size={20} color="#3B82F6" />
            </View>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>
              {selectedPeriod === 'today' ? '45' : selectedPeriod === 'week' ? '320' : '1,280'}
            </Text>
            <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>km Driven</Text>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: colors.surface }]}>
            <View style={[styles.iconBg, { backgroundColor: 'rgba(16, 185, 129, 0.12)' }]}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>
              {selectedPeriod === 'today' ? '95' : selectedPeriod === 'week' ? '92' : '94'}%
            </Text>
            <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Acceptance</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  periodContainer: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  periodText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  earningsCard: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.xxl,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: typography.bodySmall,
    marginBottom: spacing.sm,
  },
  cardAmount: {
    fontSize: typography.displayLarge,
    fontWeight: 'bold',
    marginBottom: spacing.xxl,
  },
  cardStats: {
    flexDirection: 'row',
    width: '100%',
  },
  cardStat: {
    flex: 1,
    alignItems: 'center',
  },
  cardStatValue: {
    fontSize: typography.h5,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  cardStatLabel: {
    fontSize: typography.caption,
  },
  cardDivider: {
    width: 1,
    height: '100%',
  },
  chartCard: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  chartTitle: {
    fontSize: typography.h6,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
  },
  barValue: {
    fontSize: typography.tiny,
    marginBottom: spacing.xs,
  },
  barWrapper: {
    width: 24,
    height: 100,
    justifyContent: 'flex-end',
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
    backgroundColor: '#e5e5e5',
  },
  bar: {
    width: '100%',
    borderRadius: borderRadius.xs,
  },
  barLabel: {
    fontSize: 11,
    marginTop: spacing.xs,
  },
  breakdownCard: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  breakdownTitle: {
    fontSize: typography.h6,
    fontWeight: '600',
    marginBottom: spacing.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  breakdownLabel: {
    fontSize: typography.bodySmall,
  },
  breakdownValue: {
    fontSize: typography.h6,
    fontWeight: '600',
  },
  breakdownDivider: {
    height: 1,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  quickStatCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: typography.h5,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  quickStatLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});

export default EarningsScreen;
