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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(method.id);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Card
        style={[
          styles.methodCard,
          isSelected && { borderColor: colors.primary, borderWidth: 2 },
        ]}
        shadow={isSelected ? 'md' : 'sm'}
      >
        <View
          style={[
            styles.methodIconContainer,
            { backgroundColor: isSelected ? colors.primary + '20' : colors.background },
          ]}
        >
          <Ionicons
            name={method.icon}
            size={24}
            color={isSelected ? colors.primary : colors.textSecondary}
          />
        </View>
        <View style={styles.methodInfo}>
          <Text style={[styles.methodName, { color: colors.text }]}>
            {method.name}
          </Text>
          <Text style={[styles.methodDesc, { color: colors.textSecondary }]}>
            {method.desc}
          </Text>
        </View>
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
      </Card>
    </TouchableOpacity>
  );
};

const TopUpScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [500, 1000, 2000, 5000];

  const paymentMethods = [
    { id: 'card', name: 'Debit/Credit Card', icon: 'card-outline', desc: 'Bank Alfalah Gateway' },
    { id: 'jazzcash', name: 'JazzCash', icon: 'phone-portrait-outline', desc: 'Mobile Wallet' },
    { id: 'easypaisa', name: 'Easypaisa', icon: 'wallet-outline', desc: 'Mobile Wallet' },
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

    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response = await walletAPI.topUp(numAmount, selectedMethod);

      if (response.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // For card/bank_alfalah - redirect to payment gateway
        if (selectedMethod === 'card' || selectedMethod === 'bank_alfalah') {
          if (response.data?.payment_url) {
            navigation.navigate('PaymentWebView', {
              paymentUrl: response.data.payment_url,
              formData: response.data.form_data,
              orderId: response.data.order_id,
              amount: numAmount,
            });
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
        <View
                    style={styles.section}
        >
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
            isValidAmount
              ? `${selectedMethod === 'card' ? 'Pay with Card' : 'Top Up'} - Rs. ${numAmount.toLocaleString()}`
              : 'Enter Amount'
          }
          onPress={handleTopUp}
          variant="primary"
          size="large"
          loading={loading}
          disabled={!isValidAmount}
          icon={selectedMethod === 'card' ? 'card' : 'wallet'}
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
