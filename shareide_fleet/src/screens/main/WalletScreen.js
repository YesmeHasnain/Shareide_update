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
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { walletAPI } from '../../api/wallet';
import { typography, spacing, borderRadius, shadows } from '../../theme/colors';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ACCENT_COLORS = {
  today: '#10B981',
  week: '#3B82F6',
  month: '#8B5CF6',
};

const WalletScreen = () => {
  const navigation = useNavigation();
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const balanceCardAnim = useRef(new Animated.Value(0)).current;
  const balanceScale = useRef(new Animated.Value(0.9)).current;
  const earningsAnim = useRef(new Animated.Value(0)).current;
  const earningCardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(balanceCardAnim, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.spring(balanceScale, {
          toValue: 1,
          friction: 5,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(earningsAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.stagger(
        100,
        earningCardAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
          })
        )
      ),
      Animated.timing(actionsAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.spring(listAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    fetchWalletData();
  }, []);

  // Refresh wallet data when screen comes into focus
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
      case 'earning':
        return 'wallet';
      case 'withdrawal':
        return 'arrow-down-circle';
      case 'commission':
        return 'pie-chart';
      case 'refund':
        return 'refresh';
      case 'bonus':
        return 'gift';
      case 'topup':
        return 'add-circle';
      default:
        return 'cash';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top, paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: headerAnim,
              transform: [{
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              }],
            },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>WALLET</Text>
        </Animated.View>

        {/* Balance Card - Gold themed */}
        <Animated.View
          style={[
            styles.balanceCard,
            {
              opacity: balanceCardAnim,
              transform: [
                { scale: balanceScale },
                {
                  translateY: balanceCardAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.balanceTop}>
            <View style={styles.walletIconBg}>
              <Ionicons name="wallet" size={20} color="#000" />
            </View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>
            Rs. {wallet?.balance?.toLocaleString() || '0'}
          </Text>
          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatValue}>
                Rs. {wallet?.total_earned?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.balanceStatLabel}>Total Earned</Text>
            </View>
            <View style={styles.balanceStat}>
              <Text style={styles.balanceStatValue}>
                Rs. {wallet?.total_withdrawn?.toLocaleString() || '0'}
              </Text>
              <Text style={styles.balanceStatLabel}>Total Withdrawn</Text>
            </View>
          </View>

          {/* Action Buttons inside card */}
          <View style={styles.cardButtons}>
            <TouchableOpacity
              style={styles.cardBtnPrimary}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('TopUp');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add-circle" size={20} color="#000" />
              <Text style={styles.cardBtnPrimaryText}>Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cardBtnSecondary}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('Withdraw');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-down-circle" size={20} color="#FCC014" />
              <Text style={styles.cardBtnSecondaryText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Earnings Summary */}
        {earnings && (
          <Animated.View
            style={[
              styles.earningsSection,
              {
                opacity: earningsAnim,
                transform: [{
                  translateY: earningsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                }],
              },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Earnings Summary
            </Text>
            <View style={styles.earningsGrid}>
              <EarningCard
                value={earnings.today_earnings}
                label="Today"
                rides={earnings.today_rides}
                accentColor={ACCENT_COLORS.today}
                animValue={earningCardAnims[0]}
              />
              <EarningCard
                value={earnings.week_earnings}
                label="This Week"
                rides={earnings.week_rides}
                accentColor={ACCENT_COLORS.week}
                animValue={earningCardAnims[1]}
              />
              <EarningCard
                value={earnings.month_earnings}
                label="This Month"
                rides={earnings.month_rides}
                accentColor={ACCENT_COLORS.month}
                animValue={earningCardAnims[2]}
              />
            </View>
          </Animated.View>
        )}

        {/* Quick Actions */}
        <Animated.View
          style={[
            styles.quickActions,
            {
              opacity: actionsAnim,
              transform: [{
                translateY: actionsAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            },
          ]}
        >
          <QuickAction
            icon="add-circle-outline"
            label="Add Money"
            colors={colors}
            onPress={() => navigation.navigate('TopUp')}
          />
          <QuickAction
            icon="arrow-down-circle-outline"
            label="Withdraw"
            colors={colors}
            onPress={() => navigation.navigate('Withdraw')}
          />
          <QuickAction
            icon="receipt-outline"
            label="Transactions"
            colors={colors}
            onPress={() => navigation.navigate('TransactionHistory')}
          />
        </Animated.View>

        {/* Recent Transactions */}
        <Animated.View
          style={[
            styles.recentSection,
            {
              opacity: listAnim,
              transform: [{
                translateY: listAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [20, 0],
                }),
              }],
            },
          ]}
        >
          <View style={styles.recentHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
              Recent Transactions
            </Text>
            {transactions.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {transactions.length === 0 ? (
            <EmptyState
              icon="wallet-outline"
              text="No transactions yet"
              colors={colors}
            />
          ) : (
            transactions.map((transaction, index) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                colors={colors}
                getIcon={getTransactionIcon}
                index={index}
              />
            ))
          )}
        </Animated.View>

        {/* Security Badge */}
        <View style={[styles.securityBadge, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5' }]}>
          <Ionicons name="shield-checkmark" size={18} color="#10B981" />
          <Text style={[styles.securityText, { color: isDark ? '#6EE7B7' : '#065F46' }]}>
            All transactions secured by Shareide
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

// Quick Action Component
const QuickAction = ({ icon, label, colors, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <AnimatedTouchable
      style={[
        styles.quickActionBtn,
        { backgroundColor: colors.card, transform: [{ scale: scaleAnim }] },
        shadows.sm,
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start()}
      activeOpacity={1}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={[styles.quickActionLabel, { color: colors.text }]}>{label}</Text>
    </AnimatedTouchable>
  );
};

// Earning Card Component
const EarningCard = ({ value, label, rides, accentColor, animValue }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  return (
    <AnimatedTouchable
      style={[
        styles.earningCard,
        {
          opacity: animValue,
          transform: [
            { scale: scaleAnim },
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        },
      ]}
      onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start()}
      activeOpacity={1}
    >
      <View style={[styles.earningAccent, { backgroundColor: accentColor }]} />
      <Text style={styles.earningValue}>Rs. {value || 0}</Text>
      <Text style={styles.earningLabel}>{label}</Text>
      <Text style={styles.earningRides}>{rides || 0} rides</Text>
    </AnimatedTouchable>
  );
};

// Transaction Card Component
const TransactionCard = ({ transaction, colors, getIcon, index }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isPositive = transaction.type === 'earning' || transaction.type === 'bonus' || transaction.type === 'topup';
  const accentColor = isPositive ? colors.success : colors.error;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 6,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <AnimatedTouchable
      style={[
        styles.transactionCard,
        { backgroundColor: colors.card },
        shadows.sm,
        {
          opacity: slideAnim,
          transform: [
            { scale: scaleAnim },
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
      onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start()}
      activeOpacity={1}
    >
      <View style={[styles.transactionAccentLine, { backgroundColor: accentColor }]} />
      <View style={styles.transactionLeft}>
        <View style={[styles.transactionIconContainer, { backgroundColor: accentColor + '15' }]}>
          <Ionicons name={getIcon(transaction.type)} size={20} color={accentColor} />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionTitle, { color: colors.text }]}>
            {transaction.description || transaction.type}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {new Date(transaction.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <Text style={[styles.transactionAmount, { color: accentColor }]}>
        {isPositive ? '+' : '-'}Rs. {transaction.amount}
      </Text>
    </AnimatedTouchable>
  );
};

// Empty State Component
const EmptyState = ({ icon, text, colors }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={[styles.emptyState, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.inputBackground }]}>
        <Ionicons name={icon} size={48} color={colors.textTertiary} />
      </View>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{text}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.h5,
    fontWeight: '600',
  },
  // Gold-themed balance card
  balanceCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: '#1A1A2E',
  },
  balanceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  walletIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FCC014',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  balanceLabel: {
    fontSize: typography.bodySmall,
    color: 'rgba(255,255,255,0.6)',
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.lg,
  },
  balanceStats: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  balanceStat: {
    flex: 1,
  },
  balanceStatValue: {
    fontSize: typography.body,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  balanceStatLabel: {
    fontSize: typography.caption,
    color: 'rgba(255,255,255,0.5)',
  },
  cardButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cardBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCC014',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  cardBtnPrimaryText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#000',
  },
  cardBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(252, 192, 20, 0.15)',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  cardBtnSecondaryText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#FCC014',
  },
  // Earnings
  earningsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  earningsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  earningCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    overflow: 'hidden',
  },
  earningAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  earningValue: {
    fontSize: typography.body,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  earningLabel: {
    fontSize: typography.caption,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 2,
  },
  earningRides: {
    fontSize: typography.caption,
    color: 'rgba(255,255,255,0.35)',
  },
  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  // Recent Transactions
  recentSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  seeAll: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
  },
  // Transaction Card
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  transactionAccentLine: {
    position: 'absolute',
    left: 0,
    top: 8,
    bottom: 8,
    width: 3,
    borderRadius: 2,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  transactionDate: {
    fontSize: typography.caption,
  },
  transactionAmount: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.huge,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.body,
  },
  // Security Badge
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  securityText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
});

export default WalletScreen;
