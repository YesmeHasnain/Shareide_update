import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, Linking } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { walletAPI } from '../../api/wallet';

const TopUpScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000];

  const paymentMethods = [
    { id: 'card', name: 'Debit/Credit Card', icon: '💳', desc: 'Bank Alfalah Gateway' },
    { id: 'jazzcash', name: 'JazzCash', icon: '📱', desc: 'Mobile Wallet' },
    { id: 'easypaisa', name: 'Easypaisa', icon: '📲', desc: 'Mobile Wallet' },
  ];

  const handleTopUp = async () => {
    const numAmount = parseInt(amount, 10);
    if (!numAmount || numAmount < 100) {
      Alert.alert('Invalid Amount', 'Please enter an amount of at least Rs. 100');
      return;
    }

    if (numAmount > 50000) {
      Alert.alert('Invalid Amount', 'Maximum top-up amount is Rs. 50,000');
      return;
    }

    try {
      setLoading(true);
      const response = await walletAPI.topUp(numAmount, selectedMethod);

      if (response.success) {
        // For card/bank_alfalah - redirect to payment gateway
        if (selectedMethod === 'card' || selectedMethod === 'bank_alfalah') {
          if (response.data?.payment_url) {
            // Navigate to payment webview
            navigation.navigate('PaymentWebView', {
              paymentUrl: response.data.payment_url,
              formData: response.data.form_data,
              orderId: response.data.order_id,
              amount: numAmount,
            });
          }
        } else {
          // For JazzCash/Easypaisa - show reference info
          Alert.alert(
            'Payment Initiated',
            `Reference ID: ${response.data?.reference_id}\n\nPlease complete payment via ${selectedMethod === 'jazzcash' ? 'JazzCash' : 'Easypaisa'} app.`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        }
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to initiate payment. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Top Up Wallet</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.amountSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Enter Amount</Text>
          <View style={[styles.amountInput, { backgroundColor: colors.surface }]}>
            <Text style={[styles.currencyPrefix, { color: colors.text }]}>Rs.</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={amount}
              onChangeText={(text) => setAmount(text.replace(/[^0-9]/g, ''))}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="number-pad"
            />
          </View>
          <Text style={[styles.minAmount, { color: colors.textSecondary }]}>
            Min: Rs. 100 | Max: Rs. 50,000
          </Text>
        </View>

        <View style={styles.quickAmountSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Select</Text>
          <View style={styles.quickAmountGrid}>
            {quickAmounts.map((amt) => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.quickAmountBtn,
                  {
                    backgroundColor: amount === amt.toString() ? colors.primary : colors.surface,
                    borderColor: amount === amt.toString() ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setAmount(amt.toString())}
              >
                <Text
                  style={[
                    styles.quickAmountText,
                    { color: amount === amt.toString() ? '#000' : colors.text },
                  ]}
                >
                  Rs. {amt.toLocaleString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.methodSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: selectedMethod === method.id ? colors.primary : colors.border,
                  borderWidth: selectedMethod === method.id ? 2 : 1,
                },
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <Text style={styles.methodIcon}>{method.icon}</Text>
              <View style={styles.methodInfo}>
                <Text style={[styles.methodName, { color: colors.text }]}>{method.name}</Text>
                <Text style={[styles.methodDesc, { color: colors.textSecondary }]}>{method.desc}</Text>
              </View>
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: selectedMethod === method.id ? colors.primary : colors.border },
                ]}
              >
                {selectedMethod === method.id && (
                  <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.securityNote, { backgroundColor: colors.surface }]}>
          <Text style={styles.securityIcon}>🔒</Text>
          <Text style={[styles.securityText, { color: colors.textSecondary }]}>
            Payments are processed securely via Bank Alfalah payment gateway. Your card details are never stored.
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[
            styles.topUpButton,
            { backgroundColor: amount && parseInt(amount, 10) >= 100 ? colors.primary : colors.border },
          ]}
          onPress={handleTopUp}
          disabled={!amount || parseInt(amount, 10) < 100 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.topUpText}>
              {selectedMethod === 'card' ? 'Pay with Card' : 'Top Up'} {amount ? `Rs. ${parseInt(amount, 10).toLocaleString()}` : ''}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backIcon: { fontSize: 28, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  content: { padding: 16, paddingBottom: 100 },
  amountSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 64,
  },
  currencyPrefix: { fontSize: 24, fontWeight: 'bold', marginRight: 8 },
  input: { flex: 1, fontSize: 32, fontWeight: 'bold' },
  minAmount: { fontSize: 12, marginTop: 8 },
  quickAmountSection: { marginBottom: 24 },
  quickAmountGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickAmountBtn: {
    width: '47%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  quickAmountText: { fontSize: 16, fontWeight: '600' },
  methodSection: { marginBottom: 24 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  methodIcon: { fontSize: 28, marginRight: 12 },
  methodInfo: { flex: 1 },
  methodName: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
  methodDesc: { fontSize: 12 },
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
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  securityIcon: { fontSize: 24 },
  securityText: { flex: 1, fontSize: 12, lineHeight: 18 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
  },
  topUpButton: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topUpText: { fontSize: 18, fontWeight: 'bold', color: '#000' },
});

export default TopUpScreen;
