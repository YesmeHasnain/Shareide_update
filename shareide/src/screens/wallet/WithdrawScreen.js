import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { walletAPI } from '../../api/wallet';
import { useTheme } from '../../context/ThemeContext';

const BANK_LOGOS = {
  jazzcash: require('../../../assets/bank-logos/jazzcash.png'),
  easypaisa: require('../../../assets/bank-logos/easypaisa.png'),
  sadapay: require('../../../assets/bank-logos/sadapay.png'),
  nayapay: require('../../../assets/bank-logos/nayapay.png'),
  meezan: require('../../../assets/bank-logos/meezan.png'),
  hbl: require('../../../assets/bank-logos/hbl.png'),
  ubl: require('../../../assets/bank-logos/ubl.png'),
  mcb: require('../../../assets/bank-logos/mcb.png'),
  alfalah: require('../../../assets/bank-logos/alfalah.png'),
  allied: require('../../../assets/bank-logos/allied.png'),
  askari: require('../../../assets/bank-logos/askari.png'),
  faysal: require('../../../assets/bank-logos/faysal.png'),
  bop: require('../../../assets/bank-logos/bop.png'),
  nbp: require('../../../assets/bank-logos/nbp.png'),
  habib_metro: require('../../../assets/bank-logos/habib_metro.png'),
  al_habib: require('../../../assets/bank-logos/al_habib.png'),
  scb: require('../../../assets/bank-logos/scb.png'),
  jsbank: require('../../../assets/bank-logos/jsbank.png'),
  soneri: require('../../../assets/bank-logos/soneri.png'),
  dubai_islamic: require('../../../assets/bank-logos/dubai_islamic.png'),
};

const BANKS = [
  { id: 'jazzcash', name: 'JazzCash', short: 'JC', color: '#E2001A', type: 'wallet' },
  { id: 'easypaisa', name: 'Easypaisa', short: 'EP', color: '#4CAF50', type: 'wallet' },
  { id: 'sadapay', name: 'SadaPay', short: 'SP', color: '#1A1A2E', type: 'wallet' },
  { id: 'nayapay', name: 'NayaPay', short: 'NP', color: '#6C63FF', type: 'wallet' },
  { id: 'meezan', name: 'Meezan Bank', short: 'MB', color: '#00695C', type: 'bank' },
  { id: 'hbl', name: 'HBL', short: 'HBL', color: '#006747', type: 'bank' },
  { id: 'ubl', name: 'UBL', short: 'UBL', color: '#E31937', type: 'bank' },
  { id: 'mcb', name: 'MCB Bank', short: 'MCB', color: '#003DA5', type: 'bank' },
  { id: 'alfalah', name: 'Bank Alfalah', short: 'BA', color: '#CC0000', type: 'bank' },
  { id: 'allied', name: 'Allied Bank', short: 'ABL', color: '#1B3A6B', type: 'bank' },
  { id: 'askari', name: 'Askari Bank', short: 'AK', color: '#8B0000', type: 'bank' },
  { id: 'faysal', name: 'Faysal Bank', short: 'FB', color: '#006B3F', type: 'bank' },
  { id: 'bop', name: 'Bank of Punjab', short: 'BOP', color: '#1C1C6B', type: 'bank' },
  { id: 'nbp', name: 'National Bank', short: 'NBP', color: '#003B71', type: 'bank' },
  { id: 'habib_metro', name: 'Habib Metropolitan', short: 'HMB', color: '#003366', type: 'bank' },
  { id: 'al_habib', name: 'Bank Al Habib', short: 'BAH', color: '#1A5276', type: 'bank' },
  { id: 'scb', name: 'Standard Chartered', short: 'SC', color: '#0072AA', type: 'bank' },
  { id: 'jsbank', name: 'JS Bank', short: 'JS', color: '#E85D00', type: 'bank' },
  { id: 'soneri', name: 'Soneri Bank', short: 'SB', color: '#FFB300', type: 'bank' },
  { id: 'silk', name: 'Silk Bank', short: 'SK', color: '#7B1FA2', type: 'bank' },
  { id: 'dubai_islamic', name: 'Dubai Islamic Bank', short: 'DIB', color: '#004D40', type: 'bank' },
];

const BankLogo = ({ bank, size = 42, borderRadius = 12 }) => {
  const logoSource = BANK_LOGOS[bank.id];

  if (!logoSource) {
    return (
      <View style={{
        width: size, height: size, borderRadius,
        backgroundColor: bank.color,
        justifyContent: 'center', alignItems: 'center',
      }}>
        <Text style={{
          color: '#FFF',
          fontSize: bank.short.length > 2 ? size * 0.22 : size * 0.3,
          fontWeight: '900',
        }}>
          {bank.short}
        </Text>
      </View>
    );
  }

  return (
    <View style={{
      width: size, height: size, borderRadius,
      overflow: 'hidden',
    }}>
      <Image
        source={logoSource}
        style={{ width: size, height: size }}
        resizeMode="cover"
      />
    </View>
  );
};

const WithdrawScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  // Form state
  const [selectedBank, setSelectedBank] = useState(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountTitle, setAccountTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [balance, setBalance] = useState(0);

  // UI state
  const [step, setStep] = useState(1); // 1 = form, 2 = confirm
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    walletAPI.getBalance().then(res => {
      const data = res.data || res;
      setBalance(data.balance || 0);
    }).catch(() => {});
  }, []);

  const filteredBanks = BANKS.filter(b =>
    b.name.toLowerCase().includes(bankSearch.toLowerCase())
  );

  const quickAmounts = [500, 1000, 2000, 5000];

  // Validate and go to confirmation
  const goToConfirm = () => {
    if (!selectedBank) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Select Bank', 'Please select where to send money');
      return;
    }

    const trimmed = accountNumber.replace(/\s+/g, '').trim();
    if (!trimmed) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Required', selectedBank.type === 'wallet'
        ? 'Enter your mobile number'
        : 'Enter your IBAN or account number');
      return;
    }

    if (selectedBank.type === 'wallet' && !/^03\d{9}$/.test(trimmed)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Number', 'Mobile number must be 11 digits (03XXXXXXXXX)');
      return;
    }

    if (!accountTitle.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Required', 'Enter account holder name');
      return;
    }

    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount < 100) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Amount', 'Minimum withdrawal is Rs. 100');
      return;
    }
    if (numAmount > balance) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Insufficient Balance', `Your balance is Rs. ${balance.toLocaleString()}`);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStep(2);
  };

  // Process withdrawal
  const confirmWithdraw = async () => {
    const numAmount = parseInt(amount, 10);
    const trimmed = accountNumber.replace(/\s+/g, '').trim();

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const method = selectedBank.type === 'wallet'
        ? (selectedBank.id === 'easypaisa' ? 'easypaisa' : 'jazzcash')
        : 'bank_transfer';

      const response = await walletAPI.requestWithdrawal(
        numAmount,
        method,
        accountTitle.trim(),
        trimmed,
        selectedBank.name
      );

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const newBal = response.data?.new_balance ?? (balance - numAmount);

        Alert.alert(
          'Withdrawal Successful',
          `Rs. ${numAmount.toLocaleString()} sent to ${selectedBank.name}\n\nNew balance: Rs. ${Number(newBal).toLocaleString()}`,
          [{ text: 'Done', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Failed', error.response?.data?.message || 'Withdrawal failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderBankItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.bankItem, {
        backgroundColor: selectedBank?.id === item.id ? (isDark ? '#1E3A5F' : '#EFF6FF') : 'transparent',
      }]}
      onPress={() => {
        setSelectedBank(item);
        setShowBankPicker(false);
        setBankSearch('');
        setAccountNumber('');
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      activeOpacity={0.7}
    >
      <BankLogo bank={item} size={42} borderRadius={12} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.bankItemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.bankItemType, { color: colors.textTertiary }]}>
          {item.type === 'wallet' ? 'Mobile Wallet' : 'Bank Account'}
        </Text>
      </View>
      {selectedBank?.id === item.id && (
        <Ionicons name="checkmark-circle" size={22} color="#10B981" />
      )}
    </TouchableOpacity>
  );

  // ──────────── STEP 2: CONFIRMATION SCREEN ────────────
  if (step === 2) {
    const numAmount = parseInt(amount, 10);
    const trimmed = accountNumber.replace(/\s+/g, '').trim();
    const remaining = Math.max(0, balance - numAmount);

    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

        <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.background }]}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: colors.inputBackground }]}
            onPress={() => setStep(1)}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Confirm Withdrawal</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]}>
          {/* Warning */}
          <View style={[styles.warningBox, { backgroundColor: isDark ? '#422006' : '#FEF3C7' }]}>
            <Ionicons name="alert-circle" size={20} color="#F59E0B" />
            <Text style={[styles.warningText, { color: isDark ? '#FCD34D' : '#92400E' }]}>
              Please verify all details are correct. Money sent to wrong account cannot be reversed.
            </Text>
          </View>

          {/* Amount Display */}
          <View style={styles.confirmAmountWrap}>
            <Text style={[styles.confirmAmountLabel, { color: colors.textTertiary }]}>You are sending</Text>
            <Text style={[styles.confirmAmount, { color: colors.text }]}>Rs. {numAmount.toLocaleString()}</Text>
          </View>

          {/* Recipient Card */}
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.confirmCardTitle, { color: colors.textSecondary }]}>SENDING TO</Text>

            {/* Bank */}
            <View style={styles.confirmRow}>
              <BankLogo bank={selectedBank} size={40} borderRadius={12} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.confirmLabel, { color: colors.textTertiary }]}>Bank / Wallet</Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedBank.name}</Text>
              </View>
            </View>

            <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />

            {/* Account Number */}
            <View style={styles.confirmRow}>
              <View style={[styles.confirmIconWrap, { backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE' }]}>
                <Ionicons name={selectedBank.type === 'wallet' ? 'call' : 'card'} size={18} color="#3B82F6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.confirmLabel, { color: colors.textTertiary }]}>
                  {selectedBank.type === 'wallet' ? 'Mobile Number' : 'Account / IBAN'}
                </Text>
                <Text style={[styles.confirmValue, { color: colors.text }]}>{trimmed}</Text>
              </View>
            </View>

            <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />

            {/* Account Holder Name - PROMINENT */}
            <View style={styles.confirmRow}>
              <View style={[styles.confirmIconWrap, { backgroundColor: isDark ? '#064E3B' : '#D1FAE5' }]}>
                <Ionicons name="person" size={18} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.confirmLabel, { color: colors.textTertiary }]}>Account Holder Name</Text>
                <Text style={[styles.confirmNameValue, { color: colors.text }]}>{accountTitle.trim()}</Text>
              </View>
            </View>
          </View>

          {/* Balance Summary */}
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
            <View style={styles.balanceSummaryRow}>
              <Text style={[styles.balanceSummaryLabel, { color: colors.textTertiary }]}>Current Balance</Text>
              <Text style={[styles.balanceSummaryVal, { color: colors.text }]}>Rs. {balance.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceSummaryRow}>
              <Text style={[styles.balanceSummaryLabel, { color: colors.textTertiary }]}>Withdrawal</Text>
              <Text style={[styles.balanceSummaryVal, { color: '#EF4444' }]}>- Rs. {numAmount.toLocaleString()}</Text>
            </View>
            <View style={[styles.confirmDivider, { backgroundColor: colors.border }]} />
            <View style={styles.balanceSummaryRow}>
              <Text style={[styles.balanceSummaryLabel, { color: colors.text, fontWeight: '700' }]}>Remaining</Text>
              <Text style={[styles.balanceSummaryVal, { color: colors.primary, fontWeight: '800', fontSize: 18 }]}>
                Rs. {remaining.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Confirm Button */}
          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: '#10B981', opacity: loading ? 0.7 : 1 }]}
            onPress={confirmWithdraw}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#FFF" />
                <Text style={styles.confirmBtnText}>Confirm & Send Rs. {numAmount.toLocaleString()}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Edit Button */}
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: colors.border }]}
            onPress={() => setStep(1)}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.editBtnText, { color: colors.textSecondary }]}>Edit Details</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  // ──────────── STEP 1: FORM ────────────
  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.background }]}>
        <TouchableOpacity style={[styles.backBtn, { backgroundColor: colors.inputBackground }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Withdraw</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 30 }]} showsVerticalScrollIndicator={false}>
          {/* Balance */}
          <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
            <View style={styles.balanceRow}>
              <View style={styles.balanceIconBg}>
                <Ionicons name="wallet" size={18} color="#000" />
              </View>
              <Text style={styles.balanceLbl}>Available Balance</Text>
            </View>
            <Text style={styles.balanceAmt}>Rs. {balance.toLocaleString()}</Text>
          </View>

          {/* Bank Selection */}
          <Text style={[styles.fieldLabel, { color: colors.text }]}>Send to</Text>
          <TouchableOpacity
            style={[styles.selector, {
              backgroundColor: colors.card,
              borderColor: selectedBank ? colors.primary : colors.border,
            }]}
            onPress={() => setShowBankPicker(true)}
            activeOpacity={0.7}
          >
            {selectedBank ? (
              <View style={styles.selectorInner}>
                <BankLogo bank={selectedBank} size={36} borderRadius={10} />
                <Text style={[styles.selectorText, { color: colors.text }]}>{selectedBank.name}</Text>
              </View>
            ) : (
              <View style={styles.selectorInner}>
                <Ionicons name="business-outline" size={20} color={colors.textTertiary} />
                <Text style={[styles.selectorPlaceholder, { color: colors.textTertiary }]}>Select bank or wallet</Text>
              </View>
            )}
            <Ionicons name="chevron-down" size={20} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Account Number */}
          <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 16 }]}>
            {selectedBank?.type === 'wallet' ? 'Mobile Number' : 'IBAN / Account Number'}
          </Text>
          <View style={[styles.inputRow, {
            backgroundColor: colors.card,
            borderColor: accountNumber ? colors.primary : colors.border,
          }]}>
            <Ionicons
              name={selectedBank?.type === 'wallet' ? 'call' : 'card'}
              size={18}
              color={accountNumber ? colors.primary : colors.textTertiary}
              style={{ marginRight: 12 }}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={accountNumber}
              onChangeText={setAccountNumber}
              placeholder={!selectedBank ? 'Select bank first' : (selectedBank.type === 'wallet' ? '03XXXXXXXXX' : 'PK00XXXX...')}
              placeholderTextColor={colors.textTertiary}
              keyboardType={selectedBank?.type === 'wallet' ? 'phone-pad' : 'default'}
              autoCapitalize="characters"
              editable={!!selectedBank}
            />
          </View>

          {/* Account Holder Name */}
          <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 16 }]}>Account Holder Name</Text>
          <View style={[styles.inputRow, {
            backgroundColor: colors.card,
            borderColor: accountTitle ? colors.primary : colors.border,
          }]}>
            <Ionicons
              name="person"
              size={18}
              color={accountTitle ? colors.primary : colors.textTertiary}
              style={{ marginRight: 12 }}
            />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={accountTitle}
              onChangeText={setAccountTitle}
              placeholder="Full name as per bank account"
              placeholderTextColor={colors.textTertiary}
              editable={!!selectedBank}
            />
          </View>

          {/* Amount */}
          <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 16 }]}>Amount</Text>
          <View style={[styles.amountRow, {
            backgroundColor: colors.card,
            borderColor: amount ? colors.primary : colors.border,
          }]}>
            <Text style={[styles.rs, { color: colors.textSecondary }]}>Rs.</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.quickRow}>
            {quickAmounts.map(qa => (
              <TouchableOpacity
                key={qa}
                style={[styles.quickBtn, {
                  backgroundColor: amount === String(qa) ? colors.primary : colors.card,
                  borderColor: amount === String(qa) ? colors.primary : colors.border,
                }]}
                onPress={() => { setAmount(String(qa)); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              >
                <Text style={[styles.quickText, { color: amount === String(qa) ? '#000' : colors.text }]}>
                  {qa.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.continueBtn, {
              backgroundColor: (selectedBank && accountNumber && accountTitle && amount) ? colors.primary : (isDark ? '#374151' : '#E5E7EB'),
            }]}
            onPress={goToConfirm}
            activeOpacity={0.8}
          >
            <Text style={[styles.continueBtnText, {
              color: (selectedBank && accountNumber && accountTitle && amount) ? '#000' : '#9CA3AF',
            }]}>Continue</Text>
            <Ionicons
              name="arrow-forward"
              size={20}
              color={(selectedBank && accountNumber && accountTitle && amount) ? '#000' : '#9CA3AF'}
            />
          </TouchableOpacity>

          <View style={[styles.infoBox, { backgroundColor: isDark ? '#1e293b' : '#F0FDF4' }]}>
            <Ionicons name="shield-checkmark" size={16} color="#10B981" />
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              You will review all details on the next screen before confirming. Minimum Rs. 100.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bank Picker Modal */}
      <Modal
        visible={showBankPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowBankPicker(false)}
      >
        <View style={[styles.modalWrap, { backgroundColor: colors.background }]}>
          <View style={[styles.modalTop, { borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Send to</Text>
            <TouchableOpacity onPress={() => { setShowBankPicker(false); setBankSearch(''); }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchBox, { backgroundColor: colors.inputBackground, marginHorizontal: 16, marginVertical: 12 }]}>
            <Ionicons name="search" size={18} color={colors.textTertiary} style={{ marginRight: 10 }} />
            <TextInput
              style={[styles.searchField, { color: colors.text }]}
              value={bankSearch}
              onChangeText={setBankSearch}
              placeholder="Search..."
              placeholderTextColor={colors.textTertiary}
              autoFocus
            />
            {bankSearch ? (
              <TouchableOpacity onPress={() => setBankSearch('')}>
                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>

          <FlatList
            data={filteredBanks}
            renderItem={({ item, index }) => {
              const prevType = index > 0 ? filteredBanks[index - 1].type : null;
              const showHeader = item.type !== prevType;
              return (
                <>
                  {showHeader && (
                    <Text style={[styles.listSectionHeader, { color: colors.textSecondary }]}>
                      {item.type === 'wallet' ? 'MOBILE WALLETS' : 'BANKS'}
                    </Text>
                  )}
                  {renderBankItem({ item })}
                </>
              );
            }}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 20 },

  // Balance
  balanceCard: {
    borderRadius: 18, padding: 18, marginBottom: 24,
    shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 5,
  },
  balanceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  balanceIconBg: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center', alignItems: 'center', marginRight: 8,
  },
  balanceLbl: { fontSize: 12, fontWeight: '600', color: 'rgba(0,0,0,0.5)' },
  balanceAmt: { fontSize: 28, fontWeight: '800', color: '#000', letterSpacing: -0.5 },

  // Form
  fieldLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  selector: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 16, paddingVertical: 14,
  },
  selectorInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  selectorIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  selectorText: { fontSize: 15, fontWeight: '600' },
  selectorPlaceholder: { fontSize: 15 },

  inputRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 16,
  },
  input: { flex: 1, fontSize: 15, fontWeight: '500', paddingVertical: 13 },

  amountRow: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, paddingHorizontal: 16,
  },
  rs: { fontSize: 18, fontWeight: '800', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 26, fontWeight: '800', paddingVertical: 12 },

  quickRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  quickBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  quickText: { fontSize: 13, fontWeight: '700' },

  continueBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 16, marginTop: 24, gap: 8,
  },
  continueBtnText: { fontSize: 17, fontWeight: '700' },

  infoBox: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, gap: 10, marginTop: 14 },
  infoText: { flex: 1, fontSize: 12, lineHeight: 17 },

  // Confirm Screen
  warningBox: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, gap: 10, marginBottom: 20,
  },
  warningText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },

  confirmAmountWrap: { alignItems: 'center', marginBottom: 24 },
  confirmAmountLabel: { fontSize: 14, fontWeight: '500', marginBottom: 4 },
  confirmAmount: { fontSize: 38, fontWeight: '800', letterSpacing: -1 },

  confirmCard: { borderRadius: 16, borderWidth: 1, padding: 18 },
  confirmCardTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 14 },
  confirmRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 4 },
  confirmIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  confirmLabel: { fontSize: 12, marginBottom: 2 },
  confirmValue: { fontSize: 15, fontWeight: '600' },
  confirmNameValue: { fontSize: 18, fontWeight: '700' },
  confirmDivider: { height: 1, marginVertical: 12 },

  balanceSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  balanceSummaryLabel: { fontSize: 14 },
  balanceSummaryVal: { fontSize: 15, fontWeight: '600' },

  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 16, marginTop: 24, gap: 8,
  },
  confirmBtnText: { fontSize: 16, fontWeight: '700', color: '#FFF' },

  editBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, paddingVertical: 14, marginTop: 10, borderWidth: 1, gap: 6,
  },
  editBtnText: { fontSize: 15, fontWeight: '600' },

  // Modal
  modalWrap: { flex: 1 },
  modalTop: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14 },
  searchField: { flex: 1, fontSize: 15, paddingVertical: 12 },
  listSectionHeader: {
    fontSize: 11, fontWeight: '700', letterSpacing: 1, paddingHorizontal: 20, paddingTop: 14, paddingBottom: 6,
  },
  bankItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 14 },
  bankIconCirc: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  bankItemName: { fontSize: 15, fontWeight: '600' },
  bankItemType: { fontSize: 12, marginTop: 1 },
});

export default WithdrawScreen;
