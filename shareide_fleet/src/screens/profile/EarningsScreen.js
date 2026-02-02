import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { walletAPI } from '../../api/wallet';

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
        <TouchableOpacity onPress={() => navigation.navigate('RideHistory')}>
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>

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
                  <View style={styles.barWrapper}>
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
              <Text style={styles.breakdownIcon}>💰</Text>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>Ride Earnings</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>
              Rs. {((earnings?.total || 0) - (earnings?.tips || 0)).toLocaleString()}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <Text style={styles.breakdownIcon}>🎁</Text>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>Tips</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#22c55e' }]}>
              +Rs. {earnings?.tips?.toLocaleString() || '0'}
            </Text>
          </View>

          <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <Text style={styles.breakdownIcon}>📊</Text>
              <Text style={[styles.breakdownLabel, { color: colors.text }]}>Platform Fee (20%)</Text>
            </View>
            <Text style={[styles.breakdownValue, { color: '#ef4444' }]}>
              -Rs. {earnings?.commission?.toLocaleString() || '0'}
            </Text>
          </View>

          <View style={[styles.breakdownDivider, { backgroundColor: colors.border }]} />

          <View style={styles.breakdownRow}>
            <View style={styles.breakdownLeft}>
              <Text style={styles.breakdownIcon}>✅</Text>
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
            <Text style={styles.quickStatIcon}>⭐</Text>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>4.8</Text>
            <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Rating</Text>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.quickStatIcon}>📍</Text>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>
              {selectedPeriod === 'today' ? '45' : selectedPeriod === 'week' ? '320' : '1,280'}
            </Text>
            <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>km Driven</Text>
          </View>
          <View style={[styles.quickStatCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.quickStatIcon}>✅</Text>
            <Text style={[styles.quickStatValue, { color: colors.text }]}>
              {selectedPeriod === 'today' ? '95' : selectedPeriod === 'week' ? '92' : '94'}%
            </Text>
            <Text style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Acceptance</Text>
          </View>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backIcon: {
    fontSize: 28,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  historyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  periodContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  periodText: {
    fontSize: 14,
    fontWeight: '600',
  },
  earningsCard: {
    margin: 16,
    marginTop: 0,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 24,
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardStatLabel: {
    fontSize: 12,
  },
  cardDivider: {
    width: 1,
    height: '100%',
  },
  chartCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
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
    fontSize: 10,
    marginBottom: 4,
  },
  barWrapper: {
    width: 24,
    height: 100,
    justifyContent: 'flex-end',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#e5e5e5',
  },
  bar: {
    width: '100%',
    borderRadius: 4,
  },
  barLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  breakdownCard: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  breakdownLabel: {
    fontSize: 14,
  },
  breakdownValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  breakdownDivider: {
    height: 1,
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  quickStatCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickStatIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
});

export default EarningsScreen;
