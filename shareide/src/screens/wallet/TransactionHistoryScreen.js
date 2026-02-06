import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { walletAPI } from '../../api/wallet';
import { Skeleton } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  gradients: { premium: ['#FFD700', '#FFA500'] },
};

const TransactionHistoryScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
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
      console.log('Error fetching transactions:', error);
      // Show empty - real data only
      setTransactions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchTransactions();
  };

  const handleFilterChange = (newFilter) => {
    Haptics.selectionAsync();
    setFilter(newFilter);
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup': return 'wallet';
      case 'payment': return 'car';
      case 'refund': return 'arrow-undo';
      case 'cashback': return 'gift';
      case 'withdrawal': return 'arrow-down';
      default: return 'cash';
    }
  };

  const getTransactionIconBg = (type) => {
    switch (type) {
      case 'topup': return '#22c55e';
      case 'payment': return colors.primary;
      case 'refund': return '#3b82f6';
      case 'cashback': return '#f59e0b';
      case 'withdrawal': return '#ef4444';
      default: return colors.primary;
    }
  };

  const getAmountColor = (amount) => {
    if (amount > 0) return '#22c55e';
    return '#ef4444';
  };

  const filters = [
    { key: 'all', label: 'All', icon: 'list' },
    { key: 'topup', label: 'Top-ups', icon: 'add-circle' },
    { key: 'payment', label: 'Payments', icon: 'car' },
    { key: 'refund', label: 'Refunds', icon: 'arrow-undo' },
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

  const renderTransaction = ({ item, index }) => (
    <View
            style={[styles.transactionCard, { backgroundColor: colors.surface }, shadows.sm]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: getTransactionIconBg(item.type) + '20' },
        ]}
      >
        <Ionicons
          name={getTransactionIcon(item.type)}
          size={22}
          color={getTransactionIconBg(item.type)}
        />
      </View>
      <View style={styles.transactionInfo}>
        <Text style={[styles.transactionDesc, { color: colors.text }]} numberOfLines={1}>
          {item.description}
        </Text>
        <View style={styles.transactionMeta}>
          <Ionicons name="time-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        {item.status === 'pending' && (
          <View style={[styles.pendingBadge, { backgroundColor: '#f59e0b' + '20' }]}>
            <Ionicons name="hourglass-outline" size={10} color="#f59e0b" />
            <Text style={[styles.pendingText, { color: '#f59e0b' }]}>Pending</Text>
          </View>
        )}
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.transactionAmount, { color: getAmountColor(item.amount) }]}>
          {item.amount > 0 ? '+' : ''}Rs. {Math.abs(item.amount).toLocaleString()}
        </Text>
        <Ionicons
          name={item.amount > 0 ? 'arrow-down-circle' : 'arrow-up-circle'}
          size={16}
          color={getAmountColor(item.amount)}
        />
      </View>
    </View>
  );

  const renderSkeletonItem = (index) => (
    <View
      key={index}
      style={[styles.transactionCard, { backgroundColor: colors.surface }, shadows.sm]}
    >
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={[styles.transactionInfo, { marginLeft: spacing.md }]}>
        <Skeleton width={180} height={16} borderRadius={4} />
        <Skeleton width={120} height={12} borderRadius={4} style={{ marginTop: 8 }} />
      </View>
      <Skeleton width={80} height={20} borderRadius={4} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <LinearGradient
        colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
        style={[styles.header, { paddingTop: insets.top + spacing.md }]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      {/* Summary Card */}
      <View
                style={styles.summarySection}
      >
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }, shadows.md]}>
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIconBg, { backgroundColor: '#22c55e20' }]}>
              <Ionicons name="trending-up" size={20} color="#22c55e" />
            </View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Income</Text>
            <Text style={[styles.summaryValue, { color: '#22c55e' }]}>
              Rs. {transactions.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0).toLocaleString()}
            </Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <View style={[styles.summaryIconBg, { backgroundColor: '#ef444420' }]}>
              <Ionicons name="trending-down" size={20} color="#ef4444" />
            </View>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Spent</Text>
            <Text style={[styles.summaryValue, { color: '#ef4444' }]}>
              Rs. {Math.abs(transactions.filter(t => t.amount < 0).reduce((a, b) => a + b.amount, 0)).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Filters */}
      <View
                style={styles.filtersContainer}
      >
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filters}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filtersContent}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[
                styles.filterBtn,
                {
                  backgroundColor: filter === f.key ? colors.primary : colors.surface,
                },
                shadows.sm,
              ]}
              onPress={() => handleFilterChange(f.key)}
            >
              <Ionicons
                name={f.icon}
                size={16}
                color={filter === f.key ? '#000' : colors.text}
              />
              <Text
                style={[
                  styles.filterText,
                  { color: filter === f.key ? '#000' : colors.text },
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Transaction List */}
      {loading ? (
        <View style={styles.listContent}>
          {[0, 1, 2, 3, 4, 5].map(renderSkeletonItem)}
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View
                            style={styles.emptyState}
            >
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="document-text-outline" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No transactions found
              </Text>
              <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
                {filter !== 'all' ? 'Try changing the filter' : 'Your transactions will appear here'}
              </Text>
            </View>
          }
        />
      )}
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#000',
  },
  summarySection: {
    paddingHorizontal: spacing.lg,
    marginTop: -spacing.md,
    marginBottom: spacing.md,
  },
  summaryCard: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.caption,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.h5,
    fontWeight: '700',
  },
  summaryDivider: {
    width: 1,
    marginHorizontal: spacing.md,
  },
  filtersContainer: {
    marginBottom: spacing.sm,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    marginRight: spacing.sm,
  },
  filterText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  transactionDate: {
    fontSize: typography.caption,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
    gap: 4,
  },
  pendingText: {
    fontSize: 10,
    fontWeight: '600',
  },
  amountContainer: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  transactionAmount: {
    fontSize: typography.body,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyText: {
    fontSize: typography.h5,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  emptyHint: {
    fontSize: typography.body,
    textAlign: 'center',
  },
});

export default TransactionHistoryScreen;
