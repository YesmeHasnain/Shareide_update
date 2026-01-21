import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { walletAPI } from '../../api/wallet';

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

      // Parse balance response from new API format
      const balanceData = balanceRes.data || balanceRes;
      setBalance(balanceData.balance || 0);
      setStats({
        thisMonth: balanceData.this_month_spent || 0,
        totalRides: balanceData.total_rides || 0,
        totalSpent: balanceData.total_spent || 0,
      });

      // Parse transactions response
      const txData = transactionsRes.data || transactionsRes;
      const txList = txData.transactions || txData || [];

      // Map transactions to display format
      const mappedTx = txList.map(tx => ({
        id: tx.id?.toString(),
        type: tx.type === 'topup' ? 'credit' : 'debit',
        description: tx.description || (tx.type === 'topup' ? 'Wallet top-up' : 'Ride payment'),
        amount: Math.abs(tx.amount),
        date: tx.created_at,
        icon: tx.type === 'topup' ? '💰' : '🚗',
        status: tx.status,
      }));

      setTransactions(mappedTx);
    } catch (error) {
      // Use mock data if API fails
      setBalance(1500);
      setTransactions([
        { id: '1', type: 'debit', description: 'Ride payment', amount: 250, date: '2026-01-12', icon: '🚗' },
        { id: '2', type: 'credit', description: 'Wallet top-up', amount: 1000, date: '2026-01-10', icon: '💰' },
        { id: '3', type: 'debit', description: 'Ride payment', amount: 180, date: '2026-01-08', icon: '🚗' },
        { id: '4', type: 'credit', description: 'Referral bonus', amount: 200, date: '2026-01-05', icon: '🎁' },
      ]);
      setStats({ thisMonth: 430, totalRides: 12, totalSpent: 2450 });
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
    fetchWalletData();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>Rs. {balance.toLocaleString()}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('TopUp')}
            >
              <Text style={styles.actionButtonText}>💳 Top Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('PaymentMethods')}
            >
              <Text style={styles.actionButtonText}>💰 Payment</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>Rs. {stats.thisMonth}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>This Month</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.statIcon}>🚗</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.totalRides}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Rides</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.statIcon}>💸</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>Rs. {stats.totalSpent.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Spent</Text>
          </View>
        </View>

        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No transactions yet</Text>
            </View>
          ) : (
            transactions.map((item) => (
              <View key={item.id} style={[styles.transactionCard, { backgroundColor: colors.surface }]}>
                <View style={styles.transactionLeft}>
                  <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
                    <Text style={styles.transactionIcon}>{item.icon || (item.type === 'credit' ? '💰' : '🚗')}</Text>
                  </View>
                  <View>
                    <Text style={[styles.transactionDesc, { color: colors.text }]}>{item.description}</Text>
                    <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                      {formatDate(item.date || item.created_at)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.transactionAmount, { color: item.type === 'credit' ? '#22c55e' : '#ef4444' }]}>
                  {item.type === 'credit' ? '+' : '-'}Rs. {item.amount}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
  backIcon: { fontSize: 28, color: '#000' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  balanceCard: { marginHorizontal: 20, marginTop: 20, borderRadius: 20, padding: 24, marginBottom: 20 },
  balanceLabel: { fontSize: 16, color: '#000', marginBottom: 8 },
  balanceAmount: { fontSize: 40, fontWeight: 'bold', color: '#000', marginBottom: 24 },
  cardActions: { flexDirection: 'row', gap: 12 },
  actionButton: { flex: 1, backgroundColor: '#000', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { fontSize: 14, fontWeight: 'bold', color: '#FFD700' },
  statsContainer: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 24 },
  statCard: { flex: 1, borderRadius: 12, padding: 16, alignItems: 'center' },
  statIcon: { fontSize: 32, marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12, textAlign: 'center' },
  transactionsSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  emptyState: { borderRadius: 12, padding: 40, alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyText: { fontSize: 16 },
  transactionCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 12, padding: 16, marginBottom: 12 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  transactionIcon: { fontSize: 24 },
  transactionDesc: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  transactionDate: { fontSize: 14 },
  transactionAmount: { fontSize: 18, fontWeight: 'bold' },
});

export default WalletScreen;
