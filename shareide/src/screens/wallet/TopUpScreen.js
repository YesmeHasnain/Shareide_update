import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { walletAPI } from '../../api/wallet';
import { useTheme } from '../../context/ThemeContext';

const TopUpScreen = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000];

  const requiresAccountNumber = selectedMethod === 'alfa_wallet' || selectedMethod === 'bank_account' || selectedMethod === 'jazzcash' || selectedMethod === 'easypaisa';
  const accountPlaceholder = (selectedMethod === 'alfa_wallet' || selectedMethod === 'jazzcash' || selectedMethod === 'easypaisa') ? '03XX XXXXXXX' : 'Account Number';

  const paymentMethods = [
    { id: 'card', name: 'Debit/Credit Card', icon: 'card-outline', desc: 'Visa, Mastercard' },
    { id: 'alfa_wallet', name: 'Alfa Wallet', icon: 'phone-portrait-outline', desc: 'Bank Alfalah Wallet' },
    { id: 'bank_account', name: 'Bank Account', icon: 'business-outline', desc: 'Alfalah Bank Account' },
    { id: 'jazzcash', name: 'JazzCash', icon: 'phone-portrait-outline', desc: 'Mobile Wallet' },
    { id: 'easypaisa', name: 'Easypaisa', icon: 'wallet-outline', desc: 'Mobile Wallet' },
  ];

  const handleTopUp = async () => {
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount < 100) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Amount', 'Please enter at least Rs. 100');
      return;
    }

    if (numAmount > 50000) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Amount', 'Maximum top-up is Rs. 50,000');
      return;
    }

    if (requiresAccountNumber && !accountNumber.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Required', selectedMethod === 'alfa_wallet'
        ? 'Please enter your Alfa Wallet mobile number'
        : 'Please enter your bank account number');
      return;
    }

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const acctNum = requiresAccountNumber ? accountNumber.replace(/\s/g, '') : null;
      const response = await walletAPI.topUp(numAmount, selectedMethod, acctNum);

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if ((selectedMethod === 'alfa_wallet' || selectedMethod === 'bank_account') && response.data?.requires_otp) {
          navigation.navigate('OTPVerification', {
            orderId: response.data.order_id,
            amount: numAmount,
            method: selectedMethod,
            otpLength: response.data.otp_length || 8,
            message: response.message,
          });
          return;
        }

        if (selectedMethod === 'card' || selectedMethod === 'bank_alfalah') {
          if (response.data?.test_mode && response.data?.test_html) {
            navigation.navigate('PaymentWebView', {
              paymentUrl: response.data.payment_url,
              formData: response.data.form_data,
              orderId: response.data.order_id,
              amount: numAmount,
              testMode: true,
              testHtml: response.data.test_html,
            });
          } else if (response.data?.payment_url && response.data?.form_data) {
            navigation.navigate('PaymentWebView', {
              paymentUrl: response.data.payment_url,
              formData: response.data.form_data,
              orderId: response.data.order_id,
              amount: numAmount,
            });
          } else {
            Alert.alert('Error', 'Payment gateway not available. Please try again later.');
          }
        } else {
          Alert.alert(
            'Payment Initiated',
            `Reference: ${response.data?.reference_id}\n\nComplete payment via your app.`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const message = error.response?.data?.message || 'Failed to initiate payment. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  const numAmount = parseInt(amount, 10) || 0;
  const isValidAmount = numAmount >= 100 && numAmount <= 50000;
  const isAccountValid = !requiresAccountNumber || accountNumber.trim().length >= 10;
  const canProceed = isValidAmount && isAccountValid;

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary || colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12, backgroundColor: colors.card }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.inputBackground }]} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Top Up</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Input Card */}
        <View style={[styles.amountCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.amountLabel, { color: colors.textTertiary }]}>Enter Amount</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.currencyText, { color: colors.primary }]}>Rs.</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              value={amount}
              onChangeText={(text) => {
                setAmount(text.replace(/[^0-9]/g, ''));
                Haptics.selectionAsync();
              }}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
          <View style={[styles.amountRange, { borderTopColor: colors.border }]}>
            <Text style={[styles.rangeText, { color: colors.textTertiary }]}>Min Rs. 100</Text>
            <View style={[styles.rangeDot, { backgroundColor: colors.border }]} />
            <Text style={[styles.rangeText, { color: colors.textTertiary }]}>Max Rs. 50,000</Text>
          </View>
        </View>

        {/* Quick Amounts */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Select</Text>
        <View style={styles.quickGrid}>
          {quickAmounts.map((amt) => {
            const isSelected = amount === amt.toString();
            return (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.quickBtn,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAmount(amt.toString());
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.quickBtnText,
                  { color: colors.text },
                  isSelected && { color: '#000' },
                ]}>
                  Rs. {amt.toLocaleString()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Payment Methods */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
        <View style={[styles.methodsList, { backgroundColor: colors.card }]}>
          {paymentMethods.map((method) => {
            const isSelected = selectedMethod === method.id;
            return (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodItem,
                  { borderBottomColor: colors.border },
                  isSelected && !method.disabled && { backgroundColor: colors.primary + '12' },
                  method.disabled && styles.methodItemDisabled,
                ]}
                onPress={() => {
                  if (!method.disabled) {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedMethod(method.id);
                  }
                }}
                activeOpacity={method.disabled ? 1 : 0.7}
              >
                <View style={[
                  styles.methodIcon,
                  { backgroundColor: colors.inputBackground },
                  isSelected && !method.disabled && { backgroundColor: colors.primary + '20' },
                ]}>
                  <Ionicons
                    name={method.icon}
                    size={22}
                    color={method.disabled ? colors.border : isSelected ? colors.primary : colors.textSecondary}
                  />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={[
                    styles.methodName,
                    { color: colors.text },
                    method.disabled && { color: colors.border },
                  ]}>{method.name}</Text>
                  <Text style={[
                    styles.methodDesc,
                    { color: colors.textTertiary },
                    method.disabled && { color: colors.border },
                  ]}>{method.desc}</Text>
                </View>
                {!method.disabled && (
                  <View style={[styles.radio, { borderColor: colors.border }, isSelected && { borderColor: colors.primary }]}>
                    {isSelected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Account Number Input */}
        {requiresAccountNumber && (
          <View style={styles.accountSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {selectedMethod === 'alfa_wallet' ? 'Wallet Number' : 'Account Number'}
            </Text>
            <View style={[styles.accountInputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="keypad-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.accountInput, { color: colors.text }]}
                value={accountNumber}
                onChangeText={(text) => {
                  setAccountNumber(text);
                  Haptics.selectionAsync();
                }}
                placeholder={accountPlaceholder}
                placeholderTextColor={colors.textTertiary}
                keyboardType={selectedMethod === 'alfa_wallet' ? 'phone-pad' : 'number-pad'}
                maxLength={selectedMethod === 'alfa_wallet' ? 11 : 20}
              />
            </View>
            <Text style={[styles.accountHint, { color: colors.textTertiary }]}>
              {selectedMethod === 'alfa_wallet'
                ? 'Enter your registered Alfa Wallet mobile number'
                : 'Enter your Alfalah Bank account number'}
            </Text>
          </View>
        )}

        {/* Security Note */}
        <View style={[styles.securityNote, { backgroundColor: colors.success + '12' }]}>
          <Ionicons name="shield-checkmark" size={18} color={colors.success} />
          <Text style={[styles.securityText, { color: colors.textSecondary }]}>
            Secured via Bank Alfalah. Your details are never stored.
          </Text>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Button */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 16, backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.payButton,
            { backgroundColor: colors.primary },
            !canProceed && { backgroundColor: colors.inputBackground },
          ]}
          onPress={handleTopUp}
          disabled={!canProceed || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#000" size="small" />
          ) : (
            <>
              <Text style={[
                styles.payButtonText,
                !canProceed && { color: colors.textTertiary },
              ]}>
                {canProceed
                  ? `Top Up Rs. ${numAmount.toLocaleString()}`
                  : !isValidAmount ? 'Enter Amount (min Rs. 100)' : 'Enter Account Number'
                }
              </Text>
              {canProceed && <Ionicons name="arrow-forward" size={20} color="#000" />}
            </>
          )}
        </TouchableOpacity>
      </View>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Amount Card
  amountCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  currencyText: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 4,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '800',
    minWidth: 80,
    textAlign: 'center',
    padding: 0,
  },
  amountRange: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  rangeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },

  // Section Title
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },

  // Quick Amounts
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  quickBtn: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  quickBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },

  // Payment Methods
  methodsList: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  methodItemDisabled: {
    opacity: 0.5,
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: 13,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },

  // Account Input
  accountSection: {
    marginBottom: 24,
  },
  accountInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1.5,
    gap: 12,
  },
  accountInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  accountHint: {
    fontSize: 12,
    marginTop: 8,
    marginLeft: 4,
  },

  // Security
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 10,
  },
  securityText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  payButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  payButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
});

export default TopUpScreen;
