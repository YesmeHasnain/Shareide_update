import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { walletAPI } from '../../api/wallet';

const TransactionHistoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await walletAPI.getTransactions();
      if (response.success) {
        setTransactions(response.data.transactions || []);
      }
    } catch (error) {
      // Mock data
      setTransactions([
        { id: 1, type: 'topup', amount: 1000, description: 'Wallet Top-up via JazzCash', status: 'completed', created_at: new Date().toISOString() },
        { id: 2, type: 'payment', amount: -350, description: 'Ride to Clifton Beach', status: 'completed', created_at: new Date(Date.now() - 3600000).toISOString() },
        { id: 3, type: 'refund', amount: 100, description: 'Ride cancellation refund', status: 'completed', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 4, type: 'payment', amount: -450, description: 'Ride to DHA Phase 6', status: 'completed', created_at: new Date(Date.now() - 172800000).toISOString() },
        { id: 5, type: 'topup', amount: 2000, description: 'Wallet Top-up via Card', status: 'completed', created_at: new Date(Date.now() - 259200000).toISOString() },
        { id: 6, type: 'cashback', amount: 50, description: 'Promo cashback - RIDE20', status: 'completed', created_at: new Date(Date.now() - 345600000).toISOString() },
        { id: 7, type: 'payment', amount: -280, description: 'Ride to Saddar', status: 'completed', created_at: new Date(Date.now() - 432000000).toISOString() },
        { id: 8, type: 'topup', amount: 500, description: 'Wallet Top-up via Easypaisa', status: 'pending', created_at: new Date(Date.now() - 518400000).toISOString() },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup': return '💳';
      case 'payment': return '🚗';
      case 'refund': return '↩️';
      case 'cashback': return '🎁';
      case 'withdrawal': return '💸';
      default: return '💰';
    }
  };

  const getTransactionColor = (type, amount) => {
    if (amount > 0) return '#22c55e';
    return '#ef4444';
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'topup', label: 'Top-ups' },
    { key: 'payment', label: 'Payments' },
    { key: 'refund', label: 'Refunds' },
  ];

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(t => t.type === filter);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={[styles.transactionCard, { backgroundColor: colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
        <Text style={styles.icon}>{getTransactionIcon(item.type)}</Text>
      </View>
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionDesc, { color: colors.text }]} numberOfLines={1}>
          {item.description}
        </Text>
        <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
          {formatDate(item.created_at)}
        </Text>
        {item.status === 'pending' && (
          <View style={[styles.pendingBadge, { backgroundColor: '#fbbf24' + '30' }]}>
            <Text style={[styles.pendingText, { color: '#fbbf24' }]}>Pending</Text>
          </View>
        )}
      </View>
      <Text style={[styles.transactionAmount, { color: getTransactionColor(item.type, item.amount) }]}>
        {item.amount > 0 ? '+' : ''}Rs. {Math.abs(item.amount).toLocaleString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction History</Text>
          <View style={{ width: 28 }} />
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
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[
              styles.filterBtn,
              {
                backgroundColor: filter === f.key ? colors.primary : colors.surface,
              }
            ]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[
              styles.filterText,
              { color: filter === f.key ? '#000' : colors.text }
            ]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No transactions found
            </Text>
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
              {filter !== 'all' ? 'Try changing the filter' : 'Your transactions will appear here'}
            </Text>
          </View>
        }
      />
    </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  pendingBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default TransactionHistoryScreen;
