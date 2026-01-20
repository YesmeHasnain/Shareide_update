import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, ActivityIndicator, Clipboard } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { promosAPI } from '../../api/promos';

const PromoCodesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchPromos = useCallback(async () => {
    try {
      const response = await promosAPI.getPromoCodes();
      setPromos(response.promos || response.data || []);
    } catch (error) {
      // Mock data
      setPromos([
        {
          id: 1,
          code: 'WELCOME50',
          discount: 50,
          type: 'fixed',
          description: 'Welcome bonus! Rs. 50 off on your first ride',
          expires: '2026-02-28',
          used: false,
        },
        {
          id: 2,
          code: 'RIDE20',
          discount: 20,
          type: 'percentage',
          description: '20% off on your next ride (max Rs. 100)',
          expires: '2026-01-31',
          used: false,
        },
        {
          id: 3,
          code: 'WEEKEND15',
          discount: 15,
          type: 'percentage',
          description: '15% off on weekend rides',
          expires: '2026-03-15',
          used: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromos();
  }, [fetchPromos]);

  const handleApplyCode = async () => {
    if (!promoCode.trim()) {
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    try {
      setApplying(true);
      const response = await promosAPI.applyPromoCode(promoCode.trim().toUpperCase());
      Alert.alert('Success', response.message || 'Promo code applied successfully!');
      setPromoCode('');
      fetchPromos();
    } catch (error) {
      // Mock validation
      const upperCode = promoCode.trim().toUpperCase();
      if (upperCode === 'FIRST100') {
        Alert.alert('Success', 'Promo code added! Rs. 100 off on your next ride.');
        setPromos(prev => [
          {
            id: Date.now(),
            code: 'FIRST100',
            discount: 100,
            type: 'fixed',
            description: 'Rs. 100 off on your next ride',
            expires: '2026-02-15',
            used: false,
          },
          ...prev,
        ]);
        setPromoCode('');
      } else {
        Alert.alert('Invalid Code', 'This promo code is invalid or has expired.');
      }
    } finally {
      setApplying(false);
    }
  };

  const copyCode = (code) => {
    Clipboard.setString(code);
    Alert.alert('Copied!', `Code "${code}" copied to clipboard`);
  };

  const formatExpiry = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderPromo = ({ item }) => (
    <View style={[styles.promoCard, { backgroundColor: colors.surface, opacity: item.used ? 0.6 : 1 }]}>
      <View style={styles.promoHeader}>
        <View style={[styles.discountBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.discountText}>
            {item.type === 'percentage' ? `${item.discount}%` : `Rs. ${item.discount}`}
          </Text>
        </View>
        <TouchableOpacity onPress={() => copyCode(item.code)} disabled={item.used}>
          <View style={[styles.codeBox, { backgroundColor: colors.background }]}>
            <Text style={[styles.codeText, { color: colors.text }]}>{item.code}</Text>
            <Text style={styles.copyIcon}>📋</Text>
          </View>
        </TouchableOpacity>
      </View>
      <Text style={[styles.promoDesc, { color: colors.text }]}>{item.description}</Text>
      <View style={styles.promoFooter}>
        <Text style={[styles.expiryText, { color: colors.textSecondary }]}>
          Expires: {formatExpiry(item.expires)}
        </Text>
        {item.used && (
          <View style={[styles.usedBadge, { backgroundColor: colors.border }]}>
            <Text style={[styles.usedText, { color: colors.textSecondary }]}>Used</Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Promo Codes</Text>
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
        <Text style={styles.headerTitle}>Promo Codes</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={[styles.inputSection, { backgroundColor: colors.surface }]}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Have a promo code?</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
            value={promoCode}
            onChangeText={setPromoCode}
            placeholder="Enter code"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="characters"
          />
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: applying ? colors.border : colors.primary }]}
            onPress={handleApplyCode}
            disabled={applying}
          >
            {applying ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <Text style={styles.applyText}>Apply</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Promos</Text>
        <Text style={[styles.promoCount, { color: colors.textSecondary }]}>
          {promos.filter(p => !p.used).length} available
        </Text>
      </View>

      <FlatList
        data={promos}
        keyExtractor={item => item.id.toString()}
        renderItem={renderPromo}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎟️</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No promo codes yet
            </Text>
            <Text style={[styles.emptyHint, { color: colors.textSecondary }]}>
              Enter a code above or check back for offers
            </Text>
          </View>
        }
      />
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  inputSection: { margin: 16, padding: 16, borderRadius: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  inputRow: { flexDirection: 'row', gap: 12 },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  applyButton: {
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  promoCount: { fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 20, flexGrow: 1 },
  promoCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  discountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  discountText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  codeText: { fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },
  copyIcon: { fontSize: 14 },
  promoDesc: { fontSize: 14, marginBottom: 12 },
  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryText: { fontSize: 12 },
  usedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  usedText: { fontSize: 12, fontWeight: '600' },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  emptyHint: { fontSize: 14 },
});

export default PromoCodesScreen;
