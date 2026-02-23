import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { walletAPI } from '../../api/wallet';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const PRIMARY = '#FCC014';

const WalletScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const balanceAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchWalletData();
    Animated.sequence([
      Animated.spring(balanceAnim, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(contentAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWalletData();
    }, [])
  );

  const fetchWalletData = async () => {
    try {
      const [balanceRes, earningsRes, transactionsRes] = await Promise.all([
        walletAPI.getBalance().catch(() => ({ success: false })),
        walletAPI.getEarnings().catch(() => ({ success: false })),
        walletAPI.getTransactions().catch(() => ({ success: false })),
      ]);

      if (balanceRes.success && balanceRes.data) {
        setWallet(balanceRes.data.wallet || { balance: 0, total_earned: 0, total_withdrawn: 0 });
      }
      if (earningsRes.success && earningsRes.data) {
        setEarnings({
          today_earnings: earningsRes.data.today || 0,
          today_rides: earningsRes.data.total_rides_today || 0,
          week_earnings: earningsRes.data.this_week || 0,
          week_rides: earningsRes.data.total_rides_week || 0,
          month_earnings: earningsRes.data.this_month || 0,
          month_rides: earningsRes.data.total_rides_month || 0,
        });
      }
      if (transactionsRes.success && transactionsRes.data) {
        setTransactions((transactionsRes.data.transactions || []).slice(0, 5));
      }
    } catch (error) {
      console.error('Fetch wallet error:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWalletData();
    setRefreshing(false);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earning': return 'arrow-up-circle';
      case 'withdrawal': return 'arrow-down-circle';
      case 'commission': return 'pie-chart';
      case 'refund': return 'refresh';
      case 'bonus': return 'gift';
      case 'topup': return 'add-circle';
      default: return 'cash';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A14' : '#F5F5F5' }]}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={PRIMARY}
          />
        }
      >
        {/* Header with Balance */}
        <Animated.View style={[{
          opacity: balanceAnim,
          transform: [{
            translateY: balanceAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }),
          }],
        }]}>
          <LinearGradient
            colors={isDark ? ['#1A1A2E', '#0A0A14'] : ['#1A1A2E', '#2D2D4E']}
            style={[styles.header, { paddingTop: insets.top + 16 }]}
          >
            <Text style={styles.headerTitle}>Wallet</Text>

            {/* Balance */}
            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                Rs. {wallet?.balance?.toLocaleString() || '0'}
              </Text>
            </View>

            {/* Earned / Withdrawn */}
            <View style={styles.balanceStats}>
              <View style={styles.balanceStat}>
                <Ionicons name="trending-up" size={16} color="#10B981" />
                <View>
                  <Text style={styles.balanceStatValue}>Rs. {wallet?.total_earned?.toLocaleString() || '0'}</Text>
                  <Text style={styles.balanceStatLabel}>Total Earned</Text>
                </View>
              </View>
              <View style={styles.balanceStatDivider} />
              <View style={styles.balanceStat}>
                <Ionicons name="trending-down" size={16} color="#EF4444" />
                <View>
                  <Text style={styles.balanceStatValue}>Rs. {wallet?.total_withdrawn?.toLocaleString() || '0'}</Text>
                  <Text style={styles.balanceStatLabel}>Withdrawn</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.actionBtnPrimary}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  navigation.navigate('TopUp');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={20} color="#000" />
                <Text style={styles.actionBtnPrimaryText}>Add Money</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtnSecondary}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  navigation.navigate('Withdraw');
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="arrow-down" size={20} color={PRIMARY} />
                <Text style={styles.actionBtnSecondaryText}>Withdraw</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View style={[styles.content, {
          opacity: contentAnim,
          transform: [{
            translateY: contentAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }),
          }],
        }]}>
          {/* Earnings Cards */}
          {earnings && (
            <View style={styles.earningsSection}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#1A1A2E' }]}>Earnings</Text>
              <View style={styles.earningsGrid}>
                <EarningCard
                  value={earnings.today_earnings}
                  label="Today"
                  rides={earnings.today_rides}
                  color="#10B981"
                  isDark={isDark}
                />
                <EarningCard
                  value={earnings.week_earnings}
                  label="This Week"
                  rides={earnings.week_rides}
                  color="#3B82F6"
                  isDark={isDark}
                />
                <EarningCard
                  value={earnings.month_earnings}
                  label="This Month"
                  rides={earnings.month_rides}
                  color="#8B5CF6"
                  isDark={isDark}
                />
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActionsRow}>
            <QuickAction
              icon="add-circle-outline"
              label="Add Money"
              isDark={isDark}
              onPress={() => navigation.navigate('TopUp')}
            />
            <QuickAction
              icon="arrow-down-circle-outline"
              label="Withdraw"
              isDark={isDark}
              onPress={() => navigation.navigate('Withdraw')}
            />
            <QuickAction
              icon="receipt-outline"
              label="History"
              isDark={isDark}
              onPress={() => navigation.navigate('TransactionHistory')}
            />
          </View>

          {/* Recent Transactions */}
          <View style={styles.transactionsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: isDark ? '#FFF' : '#1A1A2E' }]}>
                Recent Transactions
              </Text>
              {transactions.length > 0 && (
                <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
                  <Text style={styles.seeAll}>See All</Text>
                </TouchableOpacity>
              )}
            </View>

            {transactions.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: isDark ? '#14142B' : '#FFF' }]}>
                <View style={[styles.emptyIcon, { backgroundColor: isDark ? '#1E1E3A' : '#F9FAFB' }]}>
                  <Ionicons name="wallet-outline" size={40} color={isDark ? 'rgba(255,255,255,0.2)' : '#D1D5DB'} />
                </View>
                <Text style={[styles.emptyText, { color: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF' }]}>
                  No transactions yet
                </Text>
              </View>
            ) : (
              transactions.map((transaction) => {
                const isPositive = ['earning', 'bonus', 'topup'].includes(transaction.type);
                const accentColor = isPositive ? '#10B981' : '#EF4444';
                return (
                  <View
                    key={transaction.id}
                    style={[styles.transactionItem, { backgroundColor: isDark ? '#14142B' : '#FFF' }]}
                  >
                    <View style={[styles.transactionIcon, { backgroundColor: accentColor + '15' }]}>
                      <Ionicons name={getTransactionIcon(transaction.type)} size={20} color={accentColor} />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={[styles.transactionTitle, { color: isDark ? '#FFF' : '#1A1A2E' }]}>
                        {transaction.description || transaction.type}
                      </Text>
                      <Text style={[styles.transactionDate, { color: isDark ? 'rgba(255,255,255,0.35)' : '#9CA3AF' }]}>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text style={[styles.transactionAmount, { color: accentColor }]}>
                      {isPositive ? '+' : '-'}Rs. {transaction.amount}
                    </Text>
                  </View>
                );
              })
            )}
          </View>

          {/* Security Badge */}
          <View style={[styles.securityBadge, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={[styles.securityText, { color: isDark ? '#6EE7B7' : '#065F46' }]}>
              All transactions secured by Shareide
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

// Earning Card
const EarningCard = ({ value, label, rides, color, isDark }) => (
  <View style={[styles.earningCard, { backgroundColor: isDark ? '#14142B' : '#FFF' }]}>
    <View style={[styles.earningAccent, { backgroundColor: color }]} />
    <Text style={[styles.earningValue, { color: isDark ? '#FFF' : '#1A1A2E' }]}>
      Rs. {value || 0}
    </Text>
    <Text style={[styles.earningLabel, { color: isDark ? 'rgba(255,255,255,0.4)' : '#9CA3AF' }]}>
      {label}
    </Text>
    <Text style={[styles.earningRides, { color: isDark ? 'rgba(255,255,255,0.25)' : '#D1D5DB' }]}>
      {rides || 0} rides
    </Text>
  </View>
);

// Quick Action
const QuickAction = ({ icon, label, isDark, onPress }) => (
  <TouchableOpacity
    style={[styles.quickActionBtn, { backgroundColor: isDark ? '#14142B' : '#FFF' }]}
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}
    activeOpacity={0.7}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: PRIMARY + '18' }]}>
      <Ionicons name={icon} size={22} color={PRIMARY} />
    </View>
    <Text style={[styles.quickActionLabel, { color: isDark ? '#FFF' : '#1A1A2E' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -1,
  },
  balanceStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  balanceStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 12,
  },
  balanceStatValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFF',
  },
  balanceStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PRIMARY,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  actionBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(252, 192, 20, 0.12)',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  actionBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY,
  },

  // Content
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Earnings
  earningsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  earningsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  earningCard: {
    flex: 1,
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  earningAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  earningValue: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
    marginBottom: 2,
  },
  earningLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 1,
  },
  earningRides: {
    fontSize: 10,
  },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Transactions
  transactionsSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: PRIMARY,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  transactionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  transactionDate: {
    fontSize: 12,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 16,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Security Badge
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default WalletScreen;
