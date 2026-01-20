import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { walletAPI } from '../../api/wallet';

const PaymentMethodsScreen = ({ navigation }) => {
  const { colors } = useTheme();
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
      // Mock data
      setMethods([
        { id: 1, type: 'cash', label: 'Cash', icon: '💵', isDefault: true },
        { id: 2, type: 'jazzcash', label: 'JazzCash', number: '0300****567', icon: '📱', isDefault: false },
        { id: 3, type: 'card', label: 'Visa', number: '****4242', icon: '💳', isDefault: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = (id) => {
    setMethods(prev => prev.map(m => ({
      ...m,
      isDefault: m.id === id,
    })));
    Alert.alert('Success', 'Default payment method updated');
  };

  const handleDelete = (id) => {
    const method = methods.find(m => m.id === id);
    if (method?.type === 'cash') {
      Alert.alert('Error', 'Cash payment cannot be removed');
      return;
    }

    Alert.alert(
      'Remove Payment Method',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setMethods(prev => prev.filter(m => m.id !== id));
          },
        },
      ]
    );
  };

  const handleAddMethod = async () => {
    if (selectedType === 'card') {
      if (!cardForm.number || !cardForm.expiry || !cardForm.cvv || !cardForm.name) {
        Alert.alert('Error', 'Please fill all card details');
        return;
      }
    } else {
      if (!mobileForm.number || mobileForm.number.length !== 11) {
        Alert.alert('Error', 'Please enter a valid mobile number');
        return;
      }
    }

    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newMethod = selectedType === 'card'
        ? {
            id: Date.now(),
            type: 'card',
            label: cardForm.number.startsWith('4') ? 'Visa' : 'Mastercard',
            number: `****${cardForm.number.slice(-4)}`,
            icon: '💳',
            isDefault: false,
          }
        : {
            id: Date.now(),
            type: mobileForm.type,
            label: mobileForm.type === 'jazzcash' ? 'JazzCash' : 'Easypaisa',
            number: `${mobileForm.number.slice(0, 4)}****${mobileForm.number.slice(-3)}`,
            icon: '📱',
            isDefault: false,
          };

      setMethods(prev => [...prev, newMethod]);
      setShowAddModal(false);
      resetForms();
      Alert.alert('Success', 'Payment method added successfully');
    } catch (error) {
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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Methods</Text>
          <View style={{ width: 28 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <TouchableOpacity onPress={() => setShowAddModal(true)}>
          <Text style={styles.addIcon}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          YOUR PAYMENT METHODS
        </Text>

        {methods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[styles.methodCard, { backgroundColor: colors.surface }]}
            onPress={() => handleSetDefault(method.id)}
          >
            <View style={styles.methodLeft}>
              <Text style={styles.methodIcon}>{method.icon}</Text>
              <View>
                <Text style={[styles.methodLabel, { color: colors.text }]}>{method.label}</Text>
                {method.number && (
                  <Text style={[styles.methodNumber, { color: colors.textSecondary }]}>
                    {method.number}
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.methodRight}>
              {method.isDefault && (
                <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.defaultText}>Default</Text>
                </View>
              )}
              {method.type !== 'cash' && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(method.id)}
                >
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.addCard, { backgroundColor: colors.surface, borderColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={[styles.addCardIcon, { color: colors.primary }]}>+</Text>
          <Text style={[styles.addCardText, { color: colors.primary }]}>Add Payment Method</Text>
        </TouchableOpacity>

        <View style={[styles.infoCard, { backgroundColor: colors.surface }]}>
          <Text style={styles.infoIcon}>ℹ️</Text>
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
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => { setShowAddModal(false); resetForms(); }}>
                <Text style={[styles.closeIcon, { color: colors.textSecondary }]}>✕</Text>
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
                <Text style={[styles.typeBtnText, { color: selectedType === 'card' ? '#000' : colors.text }]}>
                  💳 Card
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
                <Text style={[styles.typeBtnText, { color: selectedType === 'mobile' ? '#000' : colors.text }]}>
                  📱 Mobile Wallet
                </Text>
              </TouchableOpacity>
            </View>

            {selectedType === 'card' ? (
              <>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Card Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={cardForm.number}
                  onChangeText={(text) => setCardForm({ ...cardForm, number: formatCardNumber(text) })}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="numeric"
                  maxLength={19}
                />

                <View style={styles.row}>
                  <View style={styles.halfInput}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>Expiry</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                      value={cardForm.expiry}
                      onChangeText={(text) => setCardForm({ ...cardForm, expiry: formatExpiry(text) })}
                      placeholder="MM/YY"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  <View style={styles.halfInput}>
                    <Text style={[styles.inputLabel, { color: colors.text }]}>CVV</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                      value={cardForm.cvv}
                      onChangeText={(text) => setCardForm({ ...cardForm, cvv: text.replace(/\D/g, '') })}
                      placeholder="123"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      maxLength={4}
                      secureTextEntry
                    />
                  </View>
                </View>

                <Text style={[styles.inputLabel, { color: colors.text }]}>Cardholder Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={cardForm.name}
                  onChangeText={(text) => setCardForm({ ...cardForm, name: text })}
                  placeholder="Name on card"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="words"
                />
              </>
            ) : (
              <>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Wallet Type</Text>
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

                <Text style={[styles.inputLabel, { color: colors.text }]}>Mobile Number</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={mobileForm.number}
                  onChangeText={(text) => setMobileForm({ ...mobileForm, number: text.replace(/\D/g, '') })}
                  placeholder="03001234567"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: saving ? colors.border : colors.primary }]}
              onPress={handleAddMethod}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Add Payment Method</Text>
              )}
            </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  backIcon: {
    fontSize: 28,
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  addIcon: {
    fontSize: 28,
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 12,
  },
  methodCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  methodIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  methodNumber: {
    fontSize: 13,
    marginTop: 2,
  },
  methodRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  defaultBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  defaultText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
  deleteBtn: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 18,
  },
  addCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginTop: 8,
    marginBottom: 24,
  },
  addCardIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  addCardText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeIcon: {
    fontSize: 24,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 12,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  walletTypeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  walletTypeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  walletTypeBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
});

export default PaymentMethodsScreen;
