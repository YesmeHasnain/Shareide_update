import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { walletAPI } from '../../api/wallet';
import { Header, Card, Button } from '../../components/common';
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
  success: '#10B981',
  gradients: { primary: ['#FFD700', '#FFA500'] },
};

const QuickAmountButton = ({ amount, isSelected, onPress, colors }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(amount);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <LinearGradient
        colors={
          isSelected
            ? colors.gradients?.primary || ['#FFD700', '#FFA500']
            : [colors.surface, colors.surface]
        }
        style={[
          styles.quickAmountBtn,
          !isSelected && { borderColor: colors.border, borderWidth: 1 },
        ]}
      >
        <Text
          style={[
            styles.quickAmountText,
            { color: isSelected ? '#000' : colors.text },
          ]}
        >
          Rs. {amount.toLocaleString()}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const PaymentMethodCard = ({ method, isSelected, onPress, colors }) => {
  const handlePress = () => {
    if (method.disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(method.id);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={method.disabled ? 1 : 0.7}
    >
      <Card
        style={[
          styles.methodCard,
          isSelected && !method.disabled && { borderColor: colors.primary, borderWidth: 2 },
          method.disabled && { opacity: 0.5 },
        ]}
        shadow={isSelected && !method.disabled ? 'md' : 'sm'}
      >
        <View
          style={[
            styles.methodIconContainer,
            { backgroundColor: isSelected && !method.disabled ? colors.primary + '20' : colors.background },
          ]}
        >
          <Ionicons
            name={method.icon}
            size={24}
            color={isSelected && !method.disabled ? colors.primary : colors.textSecondary}
          />
        </View>
        <View style={styles.methodInfo}>
          <Text style={[styles.methodName, { color: method.disabled ? colors.textTertiary : colors.text }]}>
            {method.name}
          </Text>
          <Text style={[styles.methodDesc, { color: colors.textSecondary }]}>
            {method.desc}
          </Text>
        </View>
        {!method.disabled && (
          <View
            style={[
              styles.radioOuter,
              { borderColor: isSelected ? colors.primary : colors.border },
            ]}
          >
            {isSelected && (
              <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
            )}
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};

const TopUpScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [accountNumber, setAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000];

  // Check if method requires account number
  const requiresAccountNumber = selectedMethod === 'alfa_wallet' || selectedMethod === 'bank_account';
  const accountPlaceholder = selectedMethod === 'alfa_wallet' ? '03XX XXXXXXX' : 'Account Number';

  const paymentMethods = [
    { id: 'card', name: 'Debit/Credit Card', icon: 'card-outline', desc: 'Visa, Mastercard via Bank Alfalah' },
    { id: 'alfa_wallet', name: 'Alfa Wallet', icon: 'phone-portrait-outline', desc: 'Bank Alfalah Mobile Wallet' },
    { id: 'bank_account', name: 'Bank Account', icon: 'business-outline', desc: 'Alfalah Bank Account' },
    { id: 'jazzcash', name: 'JazzCash', icon: 'phone-portrait-outline', desc: 'Coming Soon', disabled: true },
    { id: 'easypaisa', name: 'Easypaisa', icon: 'wallet-outline', desc: 'Coming Soon', disabled: true },
  ];

  const handleTopUp = async () => {
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount < 100) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Amount', 'Please enter an amount of at least Rs. 100');
      return;
    }

    if (numAmount > 50000) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Invalid Amount', 'Maximum top-up amount is Rs. 50,000');
      return;
    }

    // Validate account number for Alfa Wallet / Bank Account
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

      // Build request data
      const requestData = {
        amount: numAmount,
        method: selectedMethod,
      };

      // Add account number if required
      if (requiresAccountNumber) {
        requestData.account_number = accountNumber.replace(/\s/g, ''); // Remove spaces
      }

      const response = await walletAPI.topUp(requestData.amount, requestData.method, requestData.account_number);

      console.log('TopUp API Response:', JSON.stringify(response, null, 2));

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // For Alfa Wallet / Bank Account - need OTP verification
        if ((selectedMethod === 'alfa_wallet' || selectedMethod === 'bank_account') && response.data?.requires_otp) {
          console.log('Navigating to OTP Verification');
          navigation.navigate('OTPVerification', {
            orderId: response.data.order_id,
            amount: numAmount,
            method: selectedMethod,
            otpLength: response.data.otp_length || 8,
            message: response.message,
          });
          return;
        }

        // For card/bank_alfalah - redirect to payment gateway
        if (selectedMethod === 'card' || selectedMethod === 'bank_alfalah') {
          // Check if test mode with inline HTML
          if (response.data?.test_mode && response.data?.test_html) {
            console.log('Navigating to PaymentWebView (TEST MODE)');
            navigation.navigate('PaymentWebView', {
              paymentUrl: response.data.payment_url,
              formData: response.data.form_data,
              orderId: response.data.order_id,
              amount: numAmount,
              testMode: true,
              testHtml: response.data.test_html,
            });
          } else if (response.data?.payment_url && response.data?.form_data) {
            console.log('Navigating to PaymentWebView with:', {
              paymentUrl: response.data.payment_url,
              formDataKeys: Object.keys(response.data.form_data),
              orderId: response.data.order_id,
            });
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
            `Reference ID: ${response.data?.reference_id}\n\nPlease complete payment via ${selectedMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} app.`,
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Top Up Wallet"
        leftIcon="arrow-back"
        onLeftPress={() => navigation.goBack()}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Amount Input Section */}
        <View >
          <Card style={styles.amountCard} shadow="lg">
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Enter Amount
            </Text>
            <View style={styles.amountInputContainer}>
              <Text style={[styles.currencyPrefix, { color: colors.primary }]}>
                Rs.
              </Text>
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
            <View style={styles.amountLimits}>
              <Text style={[styles.limitText, { color: colors.textSecondary }]}>
                Min: Rs. 100
              </Text>
              <Text style={[styles.limitText, { color: colors.textSecondary }]}>
                Max: Rs. 50,000
              </Text>
            </View>
          </Card>
        </View>

        {/* Quick Select */}
        <View
                    style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Select
          </Text>
          <View style={styles.quickAmountGrid}>
            {quickAmounts.map((amt, index) => (
              <QuickAmountButton
                key={amt}
                amount={amt}
                isSelected={amount === amt.toString()}
                onPress={(a) => setAmount(a.toString())}
                colors={colors}
              />
            ))}
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Payment Method
          </Text>
          {paymentMethods.map((method, index) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              isSelected={selectedMethod === method.id}
              onPress={setSelectedMethod}
              colors={colors}
            />
          ))}
        </View>

        {/* Account Number Input (for Alfa Wallet / Bank Account) */}
        {requiresAccountNumber && (
          <View style={styles.section}>
            <Card style={styles.amountCard} shadow="md">
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedMethod === 'alfa_wallet' ? 'Alfa Wallet Number' : 'Bank Account Number'}
              </Text>
              <TextInput
                style={[styles.accountInput, { color: colors.text, borderColor: colors.border }]}
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
              <Text style={[styles.accountHint, { color: colors.textSecondary }]}>
                {selectedMethod === 'alfa_wallet'
                  ? 'Enter your registered Alfa Wallet mobile number'
                  : 'Enter your Alfalah Bank account number'}
              </Text>
            </Card>
          </View>
        )}

        {/* Security Note */}
        <View >
          <Card style={styles.securityCard} shadow="sm">
            <View style={styles.securityContent}>
              <View
                style={[
                  styles.securityIconContainer,
                  { backgroundColor: colors.success + '15' },
                ]}
              >
                <Ionicons name="shield-checkmark" size={24} color={colors.success} />
              </View>
              <Text style={[styles.securityText, { color: colors.textSecondary }]}>
                Payments are processed securely via Bank Alfalah payment gateway. Your card details are never stored.
              </Text>
            </View>
          </Card>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View
                style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            paddingBottom: insets.bottom + spacing.md,
          },
          shadows.lg,
        ]}
      >
        <Button
          title={
            canProceed
              ? `${selectedMethod === 'card' ? 'Pay with Card' : selectedMethod === 'alfa_wallet' ? 'Pay with Alfa Wallet' : selectedMethod === 'bank_account' ? 'Pay with Bank Account' : 'Top Up'} - Rs. ${numAmount.toLocaleString()}`
              : !isValidAmount ? 'Enter Amount' : 'Enter Account Number'
          }
          onPress={handleTopUp}
          variant="primary"
          size="large"
          loading={loading}
          disabled={!canProceed}
          icon={selectedMethod === 'card' ? 'card' : selectedMethod === 'alfa_wallet' ? 'phone-portrait' : 'wallet'}
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  amountCard: {
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  currencyPrefix: {
    fontSize: typography.h3,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '700',
    minWidth: 100,
    textAlign: 'center',
  },
  amountLimits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  limitText: {
    fontSize: typography.caption,
  },
  section: {
    marginBottom: spacing.xl,
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAmountBtn: {
    width: '48%',
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    flexGrow: 1,
  },
  quickAmountText: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  methodIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  methodDesc: {
    fontSize: typography.caption,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  accountInput: {
    fontSize: typography.h4,
    fontWeight: '600',
    textAlign: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
  },
  accountHint: {
    fontSize: typography.caption,
    textAlign: 'center',
  },
  securityCard: {
    padding: spacing.lg,
  },
  securityContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  securityText: {
    flex: 1,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
});

export default TopUpScreen;
