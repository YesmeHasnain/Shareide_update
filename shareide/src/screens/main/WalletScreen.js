import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Switch,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { walletAPI } from '../../api/wallet';

const PRIMARY_COLOR = '#FCC014';

const PaymentMethodItem = ({ icon, label, sublabel, onPress }) => (
  <TouchableOpacity
    style={styles.paymentMethod}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.paymentIcon}>
      <Ionicons name={icon} size={24} color="#000" />
    </View>
    <View style={styles.paymentInfo}>
      <Text style={styles.paymentLabel}>{label}</Text>
      {sublabel && (
        <Text style={styles.paymentSublabel}>{sublabel}</Text>
      )}
    </View>
    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
  </TouchableOpacity>
);

const WalletScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState(0);
  const [cashEnabled, setCashEnabled] = useState(true);
  const [balanceEnabled, setBalanceEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWalletData = useCallback(async () => {
    try {
      const balanceRes = await walletAPI.getBalance();
      const balanceData = balanceRes.data || balanceRes;
      setBalance(balanceData.balance || 0);
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
    return `Rs. ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY_COLOR}
            colors={[PRIMARY_COLOR]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Ionicons name="wallet-outline" size={24} color="#000" />
          </View>
          <Text style={styles.balanceAmount}>
            {formatCurrency(balance)}
          </Text>
          <TouchableOpacity
            style={styles.addFundsButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('TopUp');
            }}
          >
            <Ionicons name="add" size={18} color={PRIMARY_COLOR} />
            <Text style={styles.addFundsText}>Add funds</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Options */}
        <View style={styles.section}>
          {/* Cash Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={styles.toggleIcon}>
                <Ionicons name="cash-outline" size={20} color="#000" />
              </View>
              <Text style={styles.toggleLabel}>Cash</Text>
            </View>
            <Switch
              value={cashEnabled}
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCashEnabled(value);
              }}
              trackColor={{ false: '#E5E7EB', true: PRIMARY_COLOR + '50' }}
              thumbColor={cashEnabled ? PRIMARY_COLOR : '#9CA3AF'}
            />
          </View>

          {/* Balance Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <View style={styles.toggleIcon}>
                <Ionicons name="wallet-outline" size={20} color="#000" />
              </View>
              <Text style={styles.toggleLabel}>Balance</Text>
            </View>
            <Switch
              value={balanceEnabled}
              onValueChange={(value) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setBalanceEnabled(value);
              }}
              trackColor={{ false: '#E5E7EB', true: PRIMARY_COLOR + '50' }}
              thumbColor={balanceEnabled ? PRIMARY_COLOR : '#9CA3AF'}
            />
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment methods</Text>

          <View style={styles.methodsCard}>
            <PaymentMethodItem
              icon="card"
              label="VISA"
              sublabel="****4242"
              onPress={() => navigation.navigate('PaymentMethods')}
            />
            <View style={styles.divider} />
            <PaymentMethodItem
              icon="card"
              label="Mastercard"
              sublabel="****8888"
              onPress={() => navigation.navigate('PaymentMethods')}
            />
          </View>

          <TouchableOpacity
            style={styles.addPaymentButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('PaymentMethods');
            }}
          >
            <Ionicons name="add-circle-outline" size={20} color={PRIMARY_COLOR} />
            <Text style={styles.addPaymentText}>Add payment method</Text>
          </TouchableOpacity>
        </View>

        {/* Voucher */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Voucher</Text>

          <TouchableOpacity
            style={styles.voucherButton}
            onPress={() => navigation.navigate('PromoCodes')}
          >
            <Ionicons name="add-circle-outline" size={20} color={PRIMARY_COLOR} />
            <Text style={styles.voucherText}>Voucher code</Text>
          </TouchableOpacity>
        </View>

        {/* Transaction History */}
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => navigation.navigate('TransactionHistory')}
        >
          <Text style={styles.historyButtonText}>View Transaction History</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  balanceCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    backgroundColor: PRIMARY_COLOR,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 15,
    color: '#000',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000',
    marginBottom: 16,
  },
  addFundsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 27,
    gap: 6,
  },
  addFundsText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  methodsCard: {
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  paymentIcon: {
    width: 48,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#000',
  },
  paymentSublabel: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginLeft: 76,
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  addPaymentText: {
    fontSize: 15,
    fontWeight: '500',
    color: PRIMARY_COLOR,
  },
  voucherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E5E7EB',
  },
  voucherText: {
    fontSize: 15,
    fontWeight: '500',
    color: PRIMARY_COLOR,
  },
  historyButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 27,
    paddingVertical: 16,
    alignItems: 'center',
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

export default WalletScreen;
