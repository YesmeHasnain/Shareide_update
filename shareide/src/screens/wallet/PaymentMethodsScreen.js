import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { walletAPI } from '../../api/wallet';
import { Button } from '../../components/common';
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
  success: '#10B981',
  error: '#EF4444',
  gradients: { premium: ['#FFD700', '#FFA500'] },
};

const PaymentMethodsScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState('card');
  const [saving, setSaving] = useState(false);

  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  const [mobileForm, setMobileForm] = useState({
    number: '',
    type: 'jazzcash',
  });

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const response = await walletAPI.getPaymentMethods();
      if (response.success) {
        setMethods(response.data.methods || []);
      }
    } catch (error) {
      setMethods([
        { id: 1, type: 'cash', label: 'Cash', icon: 'cash', isDefault: true },
        { id: 2, type: 'jazzcash', label: 'JazzCash', number: '0300****567', icon: 'phone-portrait', isDefault: false },
        { id: 3, type: 'card', label: 'Visa', number: '****4242', icon: 'card', isDefault: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMethods(prev => prev.map(m => ({
      ...m,
      isDefault: m.id === id,
    })));
    Alert.alert('Success', 'Default payment method updated');
  };

  const handleDelete = (id) => {
    const method = methods.find(m => m.id === id);
    if (method?.type === 'cash') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Cash payment cannot be removed');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Remove Payment Method', 'Are you sure you want to remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          setMethods(prev => prev.filter(m => m.id !== id));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleAddMethod = async () => {
    if (selectedType === 'card') {
      if (!cardForm.number || !cardForm.expiry || !cardForm.cvv || !cardForm.name) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Please fill all card details');
        return;
      }
    } else {
      if (!mobileForm.number || mobileForm.number.length !== 11) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Error', 'Please enter a valid mobile number');
        return;
      }
    }

    setSaving(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newMethod = selectedType === 'card'
        ? {
            id: Date.now(),
            type: 'card',
            label: cardForm.number.startsWith('4') ? 'Visa' : 'Mastercard',
            number: `****${cardForm.number.replace(/\s/g, '').slice(-4)}`,
            icon: 'card',
            isDefault: false,
          }
        : {
            id: Date.now(),
            type: mobileForm.type,
            label: mobileForm.type === 'jazzcash' ? 'JazzCash' : 'Easypaisa',
            number: `${mobileForm.number.slice(0, 4)}****${mobileForm.number.slice(-3)}`,
            icon: 'phone-portrait',
            isDefault: false,
          };

      setMethods(prev => [...prev, newMethod]);
      setShowAddModal(false);
      resetForms();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', 'Payment method added successfully');
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to add payment method');
    } finally {
      setSaving(false);
    }
  };

  const resetForms = () => {
    setCardForm({ number: '', expiry: '', cvv: '', name: '' });
    setMobileForm({ number: '', type: 'jazzcash' });
    setSelectedType('card');
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, '');
    const formatted = cleaned.replace(/(.{4})/g, '$1 ').trim();
    return formatted.slice(0, 19);
  };

  const formatExpiry = (text) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const getMethodIcon = (type) => {
    switch (type) {
      case 'cash': return { icon: 'cash', color: colors.success };
      case 'card': return { icon: 'card', color: colors.primary };
      case 'jazzcash': return { icon: 'phone-portrait', color: '#ed1c24' };
      case 'easypaisa': return { icon: 'phone-portrait', color: '#4caf50' };
      default: return { icon: 'wallet', color: colors.primary };
    }
  };

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.methodCard, { backgroundColor: colors.surface }]}>
          <Skeleton width={44} height={44} borderRadius={22} />
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Skeleton width="50%" height={16} style={{ marginBottom: 8 }} />
            <Skeleton width="30%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowAddModal(true);
          }}
        >
          <Ionicons name="add" size={24} color="#000" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Section Header */}
        <View
                    style={styles.sectionHeader}
        >
          <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="wallet" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            YOUR PAYMENT METHODS
          </Text>
        </View>

        {loading ? renderSkeleton() : (
          <>
            {methods.map((method, index) => {
              const iconInfo = getMethodIcon(method.type);
              return (
                <View
                  key={method.id}
                                  >
                  <TouchableOpacity
                    style={[styles.methodCard, { backgroundColor: colors.surface }, shadows.sm]}
                    onPress={() => handleSetDefault(method.id)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.methodIconContainer, { backgroundColor: iconInfo.color + '20' }]}>
                      <Ionicons name={iconInfo.icon} size={22} color={iconInfo.color} />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={[styles.methodLabel, { color: colors.text }]}>{method.label}</Text>
                      {method.number && (
                        <Text style={[styles.methodNumber, { color: colors.textSecondary }]}>
                          {method.number}
                        </Text>
                      )}
                    </View>
                    <View style={styles.methodActions}>
                      {method.isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                          <Ionicons name="checkmark" size={12} color="#000" />
                          <Text style={styles.defaultText}>Default</Text>
                        </View>
                      )}
                      {method.type !== 'cash' && (
                        <TouchableOpacity
                          style={[styles.deleteBtn, { backgroundColor: colors.error + '15' }]}
                          onPress={() => handleDelete(method.id)}
                        >
                          <Ionicons name="trash-outline" size={16} color={colors.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </>
        )}

        {/* Add Card */}
        <View >
          <TouchableOpacity
            style={[styles.addCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <View style={[styles.addCardIcon, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="add" size={24} color={colors.primary} />
            </View>
            <Text style={[styles.addCardText, { color: colors.primary }]}>Add Payment Method</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View
                    style={[styles.infoCard, { backgroundColor: colors.surface }, shadows.sm]}
        >
          <Ionicons name="information-circle" size={22} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Tap on any payment method to set it as default. Your default method will be used for all rides.
          </Text>
        </View>
      </ScrollView>

      {/* Add Method Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
                        style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Payment Method</Text>
              <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: colors.background }]}
                onPress={() => { setShowAddModal(false); resetForms(); }}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Type Selector */}
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor: selectedType === 'card' ? colors.primary : colors.background,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => setSelectedType('card')}
              >
                <Ionicons name="card" size={18} color={selectedType === 'card' ? '#000' : colors.textSecondary} />
                <Text style={[styles.typeBtnText, { color: selectedType === 'card' ? '#000' : colors.text }]}>
                  Card
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor: selectedType === 'mobile' ? colors.primary : colors.background,
                    borderColor: colors.border,
                  }
                ]}
                onPress={() => setSelectedType('mobile')}
              >
                <Ionicons name="phone-portrait" size={18} color={selectedType === 'mobile' ? '#000' : colors.textSecondary} />
                <Text style={[styles.typeBtnText, { color: selectedType === 'mobile' ? '#000' : colors.text }]}>
                  Mobile Wallet
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedType === 'card' ? (
                <>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Card Number</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name="card" size={18} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={cardForm.number}
                      onChangeText={(text) => setCardForm({ ...cardForm, number: formatCardNumber(text) })}
                      placeholder="1234 5678 9012 3456"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="numeric"
                      maxLength={19}
                    />
                  </View>

                  <View style={styles.row}>
                    <View style={styles.halfInput}>
                      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Expiry</Text>
                      <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                        <TextInput
                          style={[styles.input, { color: colors.text }]}
                          value={cardForm.expiry}
                          onChangeText={(text) => setCardForm({ ...cardForm, expiry: formatExpiry(text) })}
                          placeholder="MM/YY"
                          placeholderTextColor={colors.textTertiary}
                          keyboardType="numeric"
                          maxLength={5}
                        />
                      </View>
                    </View>
                    <View style={styles.halfInput}>
                      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>CVV</Text>
                      <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                        <TextInput
                          style={[styles.input, { color: colors.text }]}
                          value={cardForm.cvv}
                          onChangeText={(text) => setCardForm({ ...cardForm, cvv: text.replace(/\D/g, '') })}
                          placeholder="123"
                          placeholderTextColor={colors.textTertiary}
                          keyboardType="numeric"
                          maxLength={4}
                          secureTextEntry
                        />
                      </View>
                    </View>
                  </View>

                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Cardholder Name</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name="person" size={18} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={cardForm.name}
                      onChangeText={(text) => setCardForm({ ...cardForm, name: text })}
                      placeholder="Name on card"
                      placeholderTextColor={colors.textTertiary}
                      autoCapitalize="words"
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Wallet Type</Text>
                  <View style={styles.walletTypeRow}>
                    <TouchableOpacity
                      style={[
                        styles.walletTypeBtn,
                        {
                          backgroundColor: mobileForm.type === 'jazzcash' ? '#ed1c24' : colors.background,
                          borderColor: mobileForm.type === 'jazzcash' ? '#ed1c24' : colors.border,
                        }
                      ]}
                      onPress={() => setMobileForm({ ...mobileForm, type: 'jazzcash' })}
                    >
                      <Text style={[styles.walletTypeBtnText, { color: mobileForm.type === 'jazzcash' ? '#fff' : colors.text }]}>
                        JazzCash
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.walletTypeBtn,
                        {
                          backgroundColor: mobileForm.type === 'easypaisa' ? '#4caf50' : colors.background,
                          borderColor: mobileForm.type === 'easypaisa' ? '#4caf50' : colors.border,
                        }
                      ]}
                      onPress={() => setMobileForm({ ...mobileForm, type: 'easypaisa' })}
                    >
                      <Text style={[styles.walletTypeBtnText, { color: mobileForm.type === 'easypaisa' ? '#fff' : colors.text }]}>
                        Easypaisa
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mobile Number</Text>
                  <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                    <Ionicons name="call" size={18} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={mobileForm.number}
                      onChangeText={(text) => setMobileForm({ ...mobileForm, number: text.replace(/\D/g, '') })}
                      placeholder="03001234567"
                      placeholderTextColor={colors.textTertiary}
                      keyboardType="phone-pad"
                      maxLength={11}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <Button
              title="Add Payment Method"
              onPress={handleAddMethod}
              variant="primary"
              size="large"
              loading={saving}
              icon="add-circle"
              fullWidth
            />
          </View>
        </View>
      </Modal>
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#000',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
  },
  skeletonContainer: {
    gap: spacing.md,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  methodIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodInfo: {
    flex: 1,
  },
  methodLabel: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  methodNumber: {
    fontSize: typography.bodySmall,
    marginTop: 2,
  },
  methodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  defaultText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#000',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  addCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCardText: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.bodySmall,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    padding: spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  modalTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  typeBtnText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: typography.body,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  walletTypeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  walletTypeBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  walletTypeBtnText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
});

export default PaymentMethodsScreen;
