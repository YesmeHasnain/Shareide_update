import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { walletAPI } from '../../api/wallet';
import { Header, Card, Button, EmptyState, Skeleton } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const { width } = Dimensions.get('window');

const ActionButton = ({ icon, label, onPress, colors }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={styles.actionButton}
    >
      <View style={[styles.actionIconBg, { backgroundColor: colors.primary + '20' }]}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
};

const TransactionItem = ({ item, colors, index }) => {
  const isCredit = item.type === 'credit' || item.type === 'topup';

  const getIcon = () => {
    switch (item.type) {
      case 'topup':
      case 'credit':
        return 'arrow-down-circle';
      case 'ride':
      case 'debit':
        return 'car';
      case 'refund':
        return 'refresh-circle';
      case 'bonus':
        return 'gift';
      default:
        return 'swap-horizontal';
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View>
      <View style={[styles.transactionItem, { backgroundColor: colors.card }]}>
        <View
          style={[
            styles.transactionIcon,
            { backgroundColor: isCredit ? colors.successLight : colors.errorLight },
          ]}
        >
          <Ionicons
            name={getIcon()}
            size={20}
            color={isCredit ? colors.success : colors.error}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={[styles.transactionTitle, { color: colors.text }]}>
            {item.description}
          </Text>
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {formatDate(item.date || item.created_at)}
          </Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.amountText,
              { color: isCredit ? colors.success : colors.error },
            ]}
          >
            {isCredit ? '+' : '-'}Rs. {item.amount?.toLocaleString()}
          </Text>
          {item.status && (
            <Text
              style={[
                styles.statusText,
                {
                  color:
                    item.status === 'completed'
                      ? colors.success
                      : item.status === 'pending'
                      ? colors.warning
                      : colors.error,
                },
              ]}
            >
              {item.status}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const WalletScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ thisMonth: 0, totalRides: 0, totalSpent: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWalletData = useCallback(async () => {
    try {
      const [balanceRes, transactionsRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getTransactions(),
      ]);

      const balanceData = balanceRes.data || balanceRes;
      setBalance(balanceData.balance || 0);
      setStats({
        thisMonth: balanceData.this_month_spent || 0,
        totalRides: balanceData.total_rides || 0,
        totalSpent: balanceData.total_spent || 0,
      });

      const txData = transactionsRes.data || transactionsRes;
      const txList = txData.transactions || txData || [];

      const mappedTx = txList.map((tx) => ({
        id: tx.id?.toString(),
        type: tx.type === 'topup' ? 'credit' : 'debit',
        description: tx.description || (tx.type === 'topup' ? 'Wallet top-up' : 'Ride payment'),
        amount: Math.abs(tx.amount),
        date: tx.created_at,
        status: tx.status,
      }));

      setTransactions(mappedTx);
    } catch (error) {
      console.log('Error fetching wallet data:', error);
      // Keep empty - show real data only
      setBalance(0);
      setTransactions([]);
      setStats({ thisMonth: 0, totalRides: 0, totalSpent: 0 });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchWalletData();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Header title="My Wallet" onLeftPress={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <Skeleton width="100%" height={180} style={{ marginHorizontal: 16, marginBottom: 20 }} />
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 16 }}>
            <Skeleton width="30%" height={80} />
            <Skeleton width="30%" height={80} />
            <Skeleton width="30%" height={80} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="My Wallet"
        onLeftPress={() => navigation.goBack()}
        rightIcon="time-outline"
        onRightPress={() => navigation.navigate('TransactionHistory')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Card */}
        <View>
          <LinearGradient
            colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.balanceCard, shadows.goldLg]}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Ionicons name="wallet" size={32} color="#000" />
            </View>
            <Text style={styles.balanceAmount}>
              Rs. {balance.toLocaleString()}
            </Text>
            <View style={styles.balanceActions}>
              <TouchableOpacity
                style={styles.primaryAction}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  navigation.navigate('TopUp');
                }}
              >
                <Ionicons name="add-circle" size={20} color="#FFD700" />
                <Text style={styles.primaryActionText}>Top Up</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryAction}
                onPress={() => navigation.navigate('PaymentMethods')}
              >
                <Ionicons name="card" size={18} color="#000" />
                <Text style={styles.secondaryActionText}>Cards</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <ActionButton
            icon="add-circle-outline"
            label="Top Up"
            onPress={() => navigation.navigate('TopUp')}
            colors={colors}
          />
          <ActionButton
            icon="card-outline"
            label="Cards"
            onPress={() => navigation.navigate('PaymentMethods')}
            colors={colors}
          />
          <ActionButton
            icon="time-outline"
            label="History"
            onPress={() => navigation.navigate('TransactionHistory')}
            colors={colors}
          />
          <ActionButton
            icon="gift-outline"
            label="Promos"
            onPress={() => navigation.navigate('PromoCodes')}
            colors={colors}
          />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, shadows.md]}>
            <Ionicons name="trending-up" size={24} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              Rs. {stats.thisMonth.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              This Month
            </Text>
          </Card>
          <Card style={[styles.statCard, shadows.md]}>
            <Ionicons name="car-sport" size={24} color={colors.info} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.totalRides}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Rides
            </Text>
          </Card>
          <Card style={[styles.statCard, shadows.md]}>
            <Ionicons name="cash" size={24} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text }]}>
              Rs. {stats.totalSpent.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Total Spent
            </Text>
          </Card>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Transactions
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <EmptyState
              icon="receipt-outline"
              title="No transactions"
              message="Your transaction history will appear here"
            />
          ) : (
            transactions.slice(0, 5).map((item, index) => (
              <TransactionItem
                key={item.id}
                item={item}
                colors={colors}
                index={index}
              />
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    paddingTop: spacing.xl,
  },
  scrollContent: {
    paddingTop: spacing.lg,
  },
  balanceCard: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.xxl,
    padding: spacing.xxl,
    marginBottom: spacing.xl,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    fontSize: typography.body,
    color: '#000',
    opacity: 0.7,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '800',
    color: '#000',
    marginBottom: spacing.xl,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  primaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  primaryActionText: {
    color: '#FFD700',
    fontSize: typography.body,
    fontWeight: '700',
  },
  secondaryAction: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  secondaryActionText: {
    color: '#000',
    fontSize: typography.body,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    alignItems: 'center',
    borderRadius: borderRadius.xl,
  },
  statValue: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.tiny,
    textAlign: 'center',
  },
  transactionsSection: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h5,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  transactionIcon: {
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
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: typography.caption,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: 2,
  },
  statusText: {
    fontSize: typography.tiny,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default WalletScreen;
