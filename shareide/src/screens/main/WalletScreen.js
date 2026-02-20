import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { walletAPI } from '../../api/wallet';
import { useTheme } from '../../context/ThemeContext';

const PRIMARY_COLOR = '#FCC014';
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const WalletScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const fetchWalletData = useCallback(async () => {
    try {
      const [balanceRes, txRes] = await Promise.allSettled([
        walletAPI.getBalance(),
        walletAPI.getTransactions(1, 5),
      ]);

      if (balanceRes.status === 'fulfilled') {
        const balanceData = balanceRes.value.data || balanceRes.value;
        setBalance(balanceData.balance || 0);
      }

      if (txRes.status === 'fulfilled') {
        const txData = txRes.value.data || txRes.value;
        setTransactions(txData.transactions || []);
      }
    } catch (error) {
      console.log('Error fetching wallet data:', error);
      setBalance(0);
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

  const formatCurrency = (amount) => {
    return `Rs. ${Number(amount || 0).toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'topup': return { name: 'arrow-down-circle', color: '#10B981' };
      case 'withdrawal': return { name: 'arrow-up-circle', color: '#EF4444' };
      case 'ride': return { name: 'car', color: '#F59E0B' };
      case 'refund': return { name: 'refresh-circle', color: '#3B82F6' };
      default: return { name: 'swap-horizontal', color: '#6B7280' };
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />
        <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.background }]}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.inputBackground }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Wallet</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.inputBackground }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Wallet</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
      >
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <View style={styles.balanceTop}>
            <View style={styles.walletIconCircle}>
              <Ionicons name="wallet" size={22} color="#000" />
            </View>
            <Text style={styles.balanceLabel}>Available Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
          <View style={styles.balanceActions}>
            <TouchableOpacity
              style={styles.topUpButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('TopUp');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color={PRIMARY_COLOR} />
              <Text style={styles.topUpButtonText}>Add Money</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.withdrawBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('Withdraw');
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="send" size={18} color="#FFF" />
              <Text style={styles.historyBtnText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('PromoCodes');
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="gift-outline" size={22} color="#F59E0B" />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.textSecondary }]}>Voucher</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('TopUp');
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="card-outline" size={22} color="#3B82F6" />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.textSecondary }]}>Add Money</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('TransactionHistory');
            }}
            activeOpacity={0.7}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#D1FAE5' }]}>
              <Ionicons name="receipt-outline" size={22} color="#10B981" />
            </View>
            <Text style={[styles.quickActionLabel, { color: colors.textSecondary }]}>Transactions</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            {transactions.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('TransactionHistory')}>
                <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            )}
          </View>

          {transactions.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <View style={[styles.emptyIcon, { backgroundColor: colors.inputBackground }]}>
                <Ionicons name="receipt-outline" size={32} color={colors.textTertiary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No transactions yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>
                Top up your wallet to get started
              </Text>
            </View>
          ) : (
            <View style={[styles.transactionsList, { backgroundColor: colors.card }]}>
              {transactions.map((tx, index) => {
                const icon = getTransactionIcon(tx.type);
                const isCredit = tx.amount > 0;
                return (
                  <View
                    key={tx.id || index}
                    style={[
                      styles.transactionItem,
                      index < transactions.length - 1 && [styles.transactionBorder, { borderBottomColor: colors.borderLight }],
                    ]}
                  >
                    <View style={[styles.txIcon, { backgroundColor: icon.color + '15' }]}>
                      <Ionicons name={icon.name} size={20} color={icon.color} />
                    </View>
                    <View style={styles.txInfo}>
                      <Text style={[styles.txDesc, { color: colors.text }]}>{tx.description || tx.type}</Text>
                      <Text style={[styles.txDate, { color: colors.textTertiary }]}>{formatDate(tx.created_at)}</Text>
                    </View>
                    <Text style={[styles.txAmount, { color: isCredit ? '#10B981' : colors.text }]}>
                      {isCredit ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* Payment Info */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? colors.successLight : '#F0FDF4' }]}>
          <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            All transactions are secured by Shareide
          </Text>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Balance Card
  balanceCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  walletIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(0,0,0,0.6)',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#000',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  balanceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  topUpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  topUpButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: PRIMARY_COLOR,
  },
  withdrawBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 6,
  },
  historyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 28,
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
    borderRadius: 16,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
  },

  // Transactions
  transactionsList: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  transactionBorder: {
    borderBottomWidth: 1,
  },
  txIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txDesc: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  txDate: {
    fontSize: 13,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '700',
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});

export default WalletScreen;
