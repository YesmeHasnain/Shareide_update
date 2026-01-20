import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { walletAPI } from '../../api/wallet';

const WalletScreen = () => {
  const { colors } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('transactions'); // transactions, withdrawals
  
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    method: 'jazzcash', // jazzcash, easypaisa, bank_transfer
    mobile_number: '',
    bank_name: '',
    account_title: '',
    iban: '',
  });

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, earningsRes, transactionsRes, withdrawalsRes] = await Promise.all([
        walletAPI.getBalance(),
        walletAPI.getEarnings(),
        walletAPI.getTransactions(),
        walletAPI.getWithdrawals(),
      ]);

      if (balanceRes.success) {
        setWallet(balanceRes.data.wallet);
      }
      if (earningsRes.success) {
        setEarnings(earningsRes.data);
      }
      if (transactionsRes.success) {
        setTransactions(transactionsRes.data.transactions || []);
      }
      if (withdrawalsRes.success) {
        setWithdrawals(withdrawalsRes.data.withdrawals || []);
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

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawForm.amount);
    
    if (!amount || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (amount > wallet.balance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    // Validate based on method
    if (withdrawForm.method === 'jazzcash' || withdrawForm.method === 'easypaisa') {
      if (amount < 500) {
        Alert.alert('Error', 'Minimum withdrawal for mobile wallets is Rs. 500');
        return;
      }
      if (!withdrawForm.mobile_number || !/^03[0-9]{9}$/.test(withdrawForm.mobile_number)) {
        Alert.alert('Error', 'Please enter a valid mobile number');
        return;
      }
    } else if (withdrawForm.method === 'bank_transfer') {
      if (amount < 1000) {
        Alert.alert('Error', 'Minimum withdrawal for bank transfer is Rs. 1000');
        return;
      }
      if (!withdrawForm.bank_name || !withdrawForm.account_title || !withdrawForm.iban) {
        Alert.alert('Error', 'Please fill all bank details');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        amount: amount,
        method: withdrawForm.method,
        account_details: {},
      };

      if (withdrawForm.method === 'jazzcash' || withdrawForm.method === 'easypaisa') {
        payload.account_details = {
          mobile_number: withdrawForm.mobile_number,
        };
      } else {
        payload.account_details = {
          bank_name: withdrawForm.bank_name,
          account_title: withdrawForm.account_title,
          iban: withdrawForm.iban,
        };
      }

      const response = await walletAPI.requestWithdrawal(payload);

      if (response.success) {
        Alert.alert('Success', 'Withdrawal request submitted successfully!');
        setModalVisible(false);
        resetWithdrawForm();
        fetchWalletData();
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to request withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWithdrawal = (id) => {
    Alert.alert(
      'Cancel Withdrawal',
      'Are you sure you want to cancel this withdrawal?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              await walletAPI.cancelWithdrawal(id);
              Alert.alert('Success', 'Withdrawal cancelled');
              fetchWalletData();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel withdrawal');
            }
          },
        },
      ]
    );
  };

  const resetWithdrawForm = () => {
    setWithdrawForm({
      amount: '',
      method: 'jazzcash',
      mobile_number: '',
      bank_name: '',
      account_title: '',
      iban: '',
    });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earning': return '💰';
      case 'withdrawal': return '💸';
      case 'commission': return '📊';
      case 'refund': return '↩️';
      case 'bonus': return '🎁';
      default: return '💵';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return colors.success;
      case 'approved': return colors.success;
      case 'pending': return colors.warning;
      case 'processing': return colors.info;
      case 'rejected': return colors.error;
      case 'cancelled': return colors.textSecondary;
      default: return colors.text;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
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
          <Button
            title="Withdraw Money"
            onPress={() => setModalVisible(true)}
            style={styles.withdrawButton}
          />
        </View>

        {/* Earnings Summary */}
        {earnings && (
          <View style={styles.earningsSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Earnings Summary 📊
            </Text>
            <View style={styles.earningsGrid}>
              <View style={[styles.earningCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.earningValue, { color: colors.text }]}>
                  Rs. {earnings.today_earnings || 0}
                </Text>
                <Text style={[styles.earningLabel, { color: colors.textSecondary }]}>
                  Today
                </Text>
                <Text style={[styles.earningRides, { color: colors.textSecondary }]}>
                  {earnings.today_rides || 0} rides
                </Text>
              </View>

              <View style={[styles.earningCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.earningValue, { color: colors.text }]}>
                  Rs. {earnings.week_earnings || 0}
                </Text>
                <Text style={[styles.earningLabel, { color: colors.textSecondary }]}>
                  This Week
                </Text>
                <Text style={[styles.earningRides, { color: colors.textSecondary }]}>
                  {earnings.week_rides || 0} rides
                </Text>
              </View>

              <View style={[styles.earningCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.earningValue, { color: colors.text }]}>
                  Rs. {earnings.month_earnings || 0}
                </Text>
                <Text style={[styles.earningLabel, { color: colors.textSecondary }]}>
                  This Month
                </Text>
                <Text style={[styles.earningRides, { color: colors.textSecondary }]}>
                  {earnings.month_rides || 0} rides
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'transactions' && [styles.activeTab, { borderColor: colors.primary }],
            ]}
            onPress={() => setSelectedTab('transactions')}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === 'transactions' ? colors.primary : colors.textSecondary },
              ]}
            >
              Transactions
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'withdrawals' && [styles.activeTab, { borderColor: colors.primary }],
            ]}
            onPress={() => setSelectedTab('withdrawals')}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === 'withdrawals' ? colors.primary : colors.textSecondary },
              ]}
            >
              Withdrawals
            </Text>
          </TouchableOpacity>
        </View>

        {/* Transactions List */}
        {selectedTab === 'transactions' && (
          <View style={styles.listContainer}>
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💰</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No transactions yet
                </Text>
              </View>
            ) : (
              transactions.map((transaction) => (
                <View
                  key={transaction.id}
                  style={[styles.transactionCard, { backgroundColor: colors.surface }]}
                >
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionIcon}>
                      {getTransactionIcon(transaction.type)}
                    </Text>
                    <View style={styles.transactionInfo}>
                      <Text style={[styles.transactionTitle, { color: colors.text }]}>
                        {transaction.description || transaction.type}
                      </Text>
                      <Text style={[styles.transactionDate, { color: colors.textSecondary }]}>
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.transactionAmount,
                      {
                        color:
                          transaction.type === 'earning' || transaction.type === 'bonus'
                            ? colors.success
                            : colors.error,
                      },
                    ]}
                  >
                    {transaction.type === 'earning' || transaction.type === 'bonus' ? '+' : '-'}
                    Rs. {transaction.amount}
                  </Text>
                </View>
              ))
            )}
          </View>
        )}

        {/* Withdrawals List */}
        {selectedTab === 'withdrawals' && (
          <View style={styles.listContainer}>
            {withdrawals.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>💸</Text>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No withdrawals yet
                </Text>
              </View>
            ) : (
              withdrawals.map((withdrawal) => (
                <View
                  key={withdrawal.id}
                  style={[styles.withdrawalCard, { backgroundColor: colors.surface }]}
                >
                  <View style={styles.withdrawalHeader}>
                    <View>
                      <Text style={[styles.withdrawalAmount, { color: colors.text }]}>
                        Rs. {withdrawal.amount}
                      </Text>
                      <Text style={[styles.withdrawalMethod, { color: colors.textSecondary }]}>
                        {withdrawal.method.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.withdrawalStatus,
                        { backgroundColor: getStatusColor(withdrawal.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.withdrawalStatusText,
                          { color: getStatusColor(withdrawal.status) },
                        ]}
                      >
                        {withdrawal.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.withdrawalDate, { color: colors.textSecondary }]}>
                    {new Date(withdrawal.created_at).toLocaleString()}
                  </Text>
                  {withdrawal.status === 'pending' && (
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => handleCancelWithdrawal(withdrawal.id)}
                    >
                      <Text style={[styles.cancelButtonText, { color: colors.error }]}>
                        Cancel Request
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* Withdrawal Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Withdraw Money 💸
            </Text>

            <Input
              label="Amount *"
              value={withdrawForm.amount}
              onChangeText={(value) => setWithdrawForm({ ...withdrawForm, amount: value })}
              placeholder="500"
              keyboardType="numeric"
            />

            <Text style={[styles.methodLabel, { color: colors.text }]}>
              Withdrawal Method *
            </Text>
            <View style={styles.methodsContainer}>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  {
                    backgroundColor:
                      withdrawForm.method === 'jazzcash' ? colors.primary : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setWithdrawForm({ ...withdrawForm, method: 'jazzcash' })}
              >
                <Text
                  style={[
                    styles.methodButtonText,
                    { color: withdrawForm.method === 'jazzcash' ? '#000' : colors.text },
                  ]}
                >
                  JazzCash
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  {
                    backgroundColor:
                      withdrawForm.method === 'easypaisa' ? colors.primary : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setWithdrawForm({ ...withdrawForm, method: 'easypaisa' })}
              >
                <Text
                  style={[
                    styles.methodButtonText,
                    { color: withdrawForm.method === 'easypaisa' ? '#000' : colors.text },
                  ]}
                >
                  EasyPaisa
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  {
                    backgroundColor:
                      withdrawForm.method === 'bank_transfer' ? colors.primary : colors.background,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setWithdrawForm({ ...withdrawForm, method: 'bank_transfer' })}
              >
                <Text
                  style={[
                    styles.methodButtonText,
                    { color: withdrawForm.method === 'bank_transfer' ? '#000' : colors.text },
                  ]}
                >
                  Bank
                </Text>
              </TouchableOpacity>
            </View>

            {(withdrawForm.method === 'jazzcash' || withdrawForm.method === 'easypaisa') && (
              <Input
                label="Mobile Number *"
                value={withdrawForm.mobile_number}
                onChangeText={(value) =>
                  setWithdrawForm({ ...withdrawForm, mobile_number: value })
                }
                placeholder="03001234567"
                keyboardType="phone-pad"
                maxLength={11}
              />
            )}

            {withdrawForm.method === 'bank_transfer' && (
              <>
                <Input
                  label="Bank Name *"
                  value={withdrawForm.bank_name}
                  onChangeText={(value) => setWithdrawForm({ ...withdrawForm, bank_name: value })}
                  placeholder="HBL"
                />
                <Input
                  label="Account Title *"
                  value={withdrawForm.account_title}
                  onChangeText={(value) =>
                    setWithdrawForm({ ...withdrawForm, account_title: value })
                  }
                  placeholder="Ali Ahmed"
                />
                <Input
                  label="IBAN *"
                  value={withdrawForm.iban}
                  onChangeText={(value) => setWithdrawForm({ ...withdrawForm, iban: value })}
                  placeholder="PK36HABB0000001234567890"
                  maxLength={24}
                />
              </>
            )}

            <View style={[styles.noteCard, { backgroundColor: colors.background }]}>
              <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                📌 Minimum withdrawal:{'\n'}
                • Mobile Wallets: Rs. 500{'\n'}
                • Bank Transfer: Rs. 1000{'\n\n'}
                Processing time: 24-48 hours
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setModalVisible(false);
                  resetWithdrawForm();
                }}
                variant="outline"
                style={styles.modalButton}
              />
              <Button
                title="Submit Request"
                onPress={handleWithdraw}
                loading={loading}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  balanceCard: {
    margin: 24,
    padding: 24,
    borderRadius: 20,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#000',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  balanceStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  balanceStat: {
    flex: 1,
  },
  balanceStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  balanceStatLabel: {
    fontSize: 12,
    color: '#000',
  },
  withdrawButton: {
    backgroundColor: '#000',
  },
  earningsSection: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  earningsGrid: {
    flexDirection: 'row',
  },
  earningCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  earningValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  earningLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  earningRides: {
    fontSize: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
  },
  transactionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  withdrawalCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  withdrawalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  withdrawalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  withdrawalMethod: {
    fontSize: 12,
  },
  withdrawalStatus: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  withdrawalStatusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  withdrawalDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  methodLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  methodsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  methodButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  methodButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noteCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default WalletScreen;