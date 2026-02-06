import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { walletAPI } from '../../api/wallet';
import { typography, spacing, borderRadius, shadows } from '../../theme/colors';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ACCENT_COLORS = {
  today: '#10B981',
  week: '#3B82F6',
  month: '#8B5CF6',
};

const WalletScreen = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [wallet, setWallet] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('transactions');

  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    method: 'jazzcash',
    mobile_number: '',
    bank_name: '',
    account_title: '',
    iban: '',
  });

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
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;
  const listAnim = useRef(new Animated.Value(0)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

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
      Animated.spring(listAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    fetchWalletData();
  }, []);

  useEffect(() => {
    Animated.spring(tabIndicatorPosition, {
      toValue: selectedTab === 'transactions' ? 0 : 1,
      friction: 8,
      useNativeDriver: false,
    }).start();
  }, [selectedTab]);

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(modalAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    } else {
      modalAnim.setValue(0);
    }
  }, [modalVisible]);

  const fetchWalletData = async () => {
    try {
      const [balanceRes, earningsRes, transactionsRes, withdrawalsRes] = await Promise.all([
        walletAPI.getBalance().catch(() => ({ success: false })),
        walletAPI.getEarnings().catch(() => ({ success: false })),
        walletAPI.getTransactions().catch(() => ({ success: false })),
        walletAPI.getWithdrawals().catch(() => ({ success: false })),
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
        setTransactions(transactionsRes.data.transactions || []);
      }
      if (withdrawalsRes.success && withdrawalsRes.data) {
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', 'Withdrawal request submitted successfully!');
        setModalVisible(false);
        resetWithdrawForm();
        fetchWalletData();
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.error('Withdrawal error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to request withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelWithdrawal = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Success', 'Withdrawal cancelled');
              fetchWalletData();
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
      default:
        return 'cash';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'processing':
        return colors.info;
      case 'rejected':
        return colors.error;
      case 'cancelled':
        return colors.textSecondary;
      default:
        return colors.text;
    }
  };

  const handleTabPress = (tab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

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
              transform: [
                {
                  translateY: headerAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={[styles.headerTitle, { color: colors.text }]}>WALLET</Text>
        </Animated.View>

        {/* Balance Card - Dark Gradient */}
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
          <WithdrawButton
            onPress={() => setModalVisible(true)}
          />
        </Animated.View>

        {/* Earnings Summary */}
        {earnings && (
          <Animated.View
            style={[
              styles.earningsSection,
              {
                opacity: earningsAnim,
                transform: [
                  {
                    translateY: earningsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
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

        {/* Tabs - Pill-shaped */}
        <Animated.View
          style={[
            styles.tabsContainer,
            { opacity: listAnim },
          ]}
        >
          <View style={[styles.tabsWrapper, { backgroundColor: colors.inputBackground }]}>
            <Animated.View
              style={[
                styles.tabIndicator,
                { backgroundColor: colors.primary },
                {
                  left: tabIndicatorPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['2%', '50%'],
                  }),
                },
              ]}
            />
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabPress('transactions')}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: selectedTab === 'transactions' ? '#000' : colors.textSecondary,
                    fontWeight: selectedTab === 'transactions' ? '700' : '500',
                  },
                ]}
              >
                Transactions
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => handleTabPress('withdrawals')}
            >
              <Text
                style={[
                  styles.tabText,
                  {
                    color: selectedTab === 'withdrawals' ? '#000' : colors.textSecondary,
                    fontWeight: selectedTab === 'withdrawals' ? '700' : '500',
                  },
                ]}
              >
                Withdrawals
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Transactions List */}
        {selectedTab === 'transactions' && (
          <Animated.View
            style={[
              styles.listContainer,
              {
                opacity: listAnim,
                transform: [
                  {
                    translateY: listAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
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
        )}

        {/* Withdrawals List */}
        {selectedTab === 'withdrawals' && (
          <Animated.View
            style={[
              styles.listContainer,
              {
                opacity: listAnim,
                transform: [
                  {
                    translateY: listAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {withdrawals.length === 0 ? (
              <EmptyState
                icon="arrow-down-circle-outline"
                text="No withdrawals yet"
                colors={colors}
              />
            ) : (
              withdrawals.map((withdrawal, index) => (
                <WithdrawalCard
                  key={withdrawal.id}
                  withdrawal={withdrawal}
                  colors={colors}
                  getStatusColor={getStatusColor}
                  onCancel={handleCancelWithdrawal}
                  index={index}
                />
              ))
            )}
          </Animated.View>
        )}
      </ScrollView>

      {/* Withdrawal Modal */}
      <Modal
        visible={modalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalContent,
              { backgroundColor: colors.card },
              {
                opacity: modalAnim,
                transform: [
                  {
                    translateY: modalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Withdraw Money
              </Text>
              <TouchableOpacity
                style={[styles.modalCloseButton, { backgroundColor: colors.inputBackground }]}
                onPress={() => {
                  setModalVisible(false);
                  resetWithdrawForm();
                }}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Input
                label="Amount"
                value={withdrawForm.amount}
                onChangeText={(value) => setWithdrawForm({ ...withdrawForm, amount: value })}
                placeholder="Enter amount"
                keyboardType="numeric"
              />

              <Text style={[styles.methodLabel, { color: colors.text }]}>
                Withdrawal Method
              </Text>
              <View style={styles.methodsContainer}>
                <MethodButton
                  label="JazzCash"
                  selected={withdrawForm.method === 'jazzcash'}
                  onPress={() => setWithdrawForm({ ...withdrawForm, method: 'jazzcash' })}
                  colors={colors}
                />
                <MethodButton
                  label="EasyPaisa"
                  selected={withdrawForm.method === 'easypaisa'}
                  onPress={() => setWithdrawForm({ ...withdrawForm, method: 'easypaisa' })}
                  colors={colors}
                />
                <MethodButton
                  label="Bank"
                  selected={withdrawForm.method === 'bank_transfer'}
                  onPress={() => setWithdrawForm({ ...withdrawForm, method: 'bank_transfer' })}
                  colors={colors}
                />
              </View>

              {(withdrawForm.method === 'jazzcash' || withdrawForm.method === 'easypaisa') && (
                <Input
                  label="Mobile Number"
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
                    label="Bank Name"
                    value={withdrawForm.bank_name}
                    onChangeText={(value) => setWithdrawForm({ ...withdrawForm, bank_name: value })}
                    placeholder="HBL"
                  />
                  <Input
                    label="Account Title"
                    value={withdrawForm.account_title}
                    onChangeText={(value) =>
                      setWithdrawForm({ ...withdrawForm, account_title: value })
                    }
                    placeholder="Your Name"
                  />
                  <Input
                    label="IBAN"
                    value={withdrawForm.iban}
                    onChangeText={(value) => setWithdrawForm({ ...withdrawForm, iban: value })}
                    placeholder="PK36HABB0000001234567890"
                    maxLength={24}
                  />
                </>
              )}

              <View style={[styles.noteCard, { backgroundColor: colors.inputBackground }]}>
                <Ionicons name="information-circle" size={20} color={colors.primary} />
                <Text style={[styles.noteText, { color: colors.textSecondary }]}>
                  Minimum: Mobile Wallets Rs. 500, Bank Rs. 1000{'\n'}
                  Processing: 24-48 hours
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
                  title="Submit"
                  onPress={handleWithdraw}
                  loading={loading}
                  style={styles.modalButton}
                />
              </View>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

// Withdraw Button Component
const WithdrawButton = ({ onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <AnimatedTouchable
      style={[
        styles.withdrawButton,
        { transform: [{ scale: scaleAnim }] },
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Ionicons name="arrow-down-circle" size={20} color="#1A1A2E" />
      <Text style={styles.withdrawButtonText}>
        Withdraw Money
      </Text>
    </AnimatedTouchable>
  );
};

// Earning Card Component - with accent colors
const EarningCard = ({ value, label, rides, accentColor, animValue }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

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
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={[styles.earningAccent, { backgroundColor: accentColor }]} />
      <Text style={styles.earningValue}>
        Rs. {value || 0}
      </Text>
      <Text style={styles.earningLabel}>
        {label}
      </Text>
      <Text style={styles.earningRides}>
        {rides || 0} rides
      </Text>
    </AnimatedTouchable>
  );
};

// Transaction Card Component - with left accent line
const TransactionCard = ({ transaction, colors, getIcon, index }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const isPositive = transaction.type === 'earning' || transaction.type === 'bonus';
  const accentColor = isPositive ? colors.success : colors.error;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 6,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

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
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <View style={[styles.transactionAccentLine, { backgroundColor: accentColor }]} />
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.transactionIconContainer,
            { backgroundColor: accentColor + '15' },
          ]}
        >
          <Ionicons
            name={getIcon(transaction.type)}
            size={20}
            color={accentColor}
          />
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
      <Text
        style={[
          styles.transactionAmount,
          { color: accentColor },
        ]}
      >
        {isPositive ? '+' : '-'}
        Rs. {transaction.amount}
      </Text>
    </AnimatedTouchable>
  );
};

// Withdrawal Card Component
const WithdrawalCard = ({ withdrawal, colors, getStatusColor, onCancel, index }) => {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 1,
      friction: 6,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.withdrawalCard,
        { backgroundColor: colors.card },
        shadows.sm,
        {
          opacity: slideAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
          ],
        },
      ]}
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
          onPress={() => onCancel(withdrawal.id)}
        >
          <Text style={[styles.cancelButtonText, { color: colors.error }]}>
            Cancel Request
          </Text>
        </TouchableOpacity>
      )}
    </Animated.View>
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
    <Animated.View
      style={[
        styles.emptyState,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <View style={[styles.emptyIconContainer, { backgroundColor: colors.inputBackground }]}>
        <Ionicons name={icon} size={48} color={colors.textTertiary} />
      </View>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        {text}
      </Text>
    </Animated.View>
  );
};

// Method Button Component
const MethodButton = ({ label, selected, onPress, colors }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <AnimatedTouchable
      style={[
        styles.methodButton,
        {
          backgroundColor: selected ? colors.primary : colors.inputBackground,
          borderColor: selected ? colors.primary : colors.border,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Text
        style={[
          styles.methodButtonText,
          { color: selected ? '#000' : colors.text },
        ]}
      >
        {label}
      </Text>
    </AnimatedTouchable>
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
  // Dark gradient balance card
  balanceCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: '#1A1A2E',
  },
  balanceLabel: {
    fontSize: typography.bodySmall,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.xs,
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
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FCC014',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  withdrawButtonText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#1A1A2E',
  },
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
  // Earning card with accent top line
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
  // Pill-shaped tabs
  tabsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  tabsWrapper: {
    flexDirection: 'row',
    position: 'relative',
    borderRadius: borderRadius.full,
    padding: 4,
  },
  tabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    width: '48%',
    borderRadius: borderRadius.full,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: typography.body,
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
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
  // Transaction card with left accent line
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
  withdrawalCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  withdrawalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  withdrawalAmount: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  withdrawalMethod: {
    fontSize: typography.caption,
  },
  withdrawalStatus: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  withdrawalStatusText: {
    fontSize: typography.caption,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  withdrawalDate: {
    fontSize: typography.caption,
    marginBottom: spacing.sm,
  },
  cancelButton: {
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.h5,
    fontWeight: '700',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  methodsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  methodButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  methodButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  noteText: {
    flex: 1,
    fontSize: typography.caption,
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalButton: {
    flex: 1,
  },
});

export default WalletScreen;
