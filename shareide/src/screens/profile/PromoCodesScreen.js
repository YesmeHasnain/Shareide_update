import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { promosAPI } from '../../api/promos';
import { Button } from '../../components/common';
import { Skeleton } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const PromoCodesScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoCode, setPromoCode] = useState('');
  const [applying, setApplying] = useState(false);

  const fetchPromos = useCallback(async () => {
    try {
      const response = await promosAPI.getPromoCodes();
      setPromos(response.promos || response.data || []);
    } catch (error) {
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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter a promo code');
      return;
    }

    try {
      setApplying(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const response = await promosAPI.applyPromoCode(promoCode.trim().toUpperCase());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', response.message || 'Promo code applied successfully!');
      setPromoCode('');
      fetchPromos();
    } catch (error) {
      const upperCode = promoCode.trim().toUpperCase();
      if (upperCode === 'FIRST100') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Invalid Code', 'This promo code is invalid or has expired.');
      }
    } finally {
      setApplying(false);
    }
  };

  const copyCode = (code) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Clipboard.setString(code);
    Alert.alert('Copied!', `Code "${code}" copied to clipboard`);
  };

  const formatExpiry = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderPromo = ({ item, index }) => (
    <View >
      <View
        style={[
          styles.promoCard,
          { backgroundColor: colors.surface, opacity: item.used ? 0.6 : 1 },
          shadows.sm,
        ]}
      >
        <View style={styles.promoHeader}>
          <LinearGradient
            colors={item.used ? [colors.border, colors.border] : (colors.gradients?.premium || ['#FFD700', '#FFA500'])}
            style={styles.discountBadge}
          >
            <Ionicons
              name={item.type === 'percentage' ? 'pricetag' : 'cash'}
              size={14}
              color={item.used ? colors.textSecondary : '#000'}
            />
            <Text style={[styles.discountText, item.used && { color: colors.textSecondary }]}>
              {item.type === 'percentage' ? `${item.discount}%` : `Rs. ${item.discount}`}
            </Text>
          </LinearGradient>

          <TouchableOpacity
            style={[styles.codeBox, { backgroundColor: colors.background }]}
            onPress={() => !item.used && copyCode(item.code)}
            disabled={item.used}
          >
            <Text style={[styles.codeText, { color: colors.text }]}>{item.code}</Text>
            <Ionicons name="copy-outline" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.promoDesc, { color: colors.text }]}>{item.description}</Text>

        <View style={styles.promoFooter}>
          <View style={styles.expiryContainer}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.expiryText, { color: colors.textSecondary }]}>
              Expires: {formatExpiry(item.expires)}
            </Text>
          </View>
          {item.used && (
            <View style={[styles.usedBadge, { backgroundColor: colors.border }]}>
              <Ionicons name="checkmark-circle" size={12} color={colors.textSecondary} />
              <Text style={[styles.usedText, { color: colors.textSecondary }]}>Used</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={[styles.promoCard, { backgroundColor: colors.surface }]}>
          <View style={styles.promoHeader}>
            <Skeleton width={80} height={32} borderRadius={8} />
            <Skeleton width={100} height={32} borderRadius={8} />
          </View>
          <Skeleton width="90%" height={16} style={{ marginTop: 12 }} />
          <Skeleton width="60%" height={12} style={{ marginTop: 12 }} />
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
        <Text style={styles.headerTitle}>Promo Codes</Text>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <FlatList
        data={loading ? [] : promos}
        keyExtractor={item => item.id.toString()}
        renderItem={renderPromo}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Input Section */}
            <View
                            style={[styles.inputSection, { backgroundColor: colors.surface }, shadows.md]}
            >
              <View style={styles.inputHeader}>
                <View style={[styles.inputIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="ticket" size={20} color={colors.primary} />
                </View>
                <Text style={[styles.inputLabel, { color: colors.text }]}>
                  Have a promo code?
                </Text>
              </View>
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    value={promoCode}
                    onChangeText={setPromoCode}
                    placeholder="Enter code"
                    placeholderTextColor={colors.textTertiary}
                    autoCapitalize="characters"
                  />
                </View>
                <TouchableOpacity
                  style={[
                    styles.applyButton,
                    { backgroundColor: applying ? colors.border : colors.primary },
                  ]}
                  onPress={handleApplyCode}
                  disabled={applying}
                >
                  {applying ? (
                    <Ionicons name="hourglass" size={20} color="#000" />
                  ) : (
                    <Ionicons name="arrow-forward" size={20} color="#000" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {loading && renderSkeleton()}

            {!loading && (
              <View
                                style={styles.sectionHeader}
              >
                <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons name="gift" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  YOUR PROMOS
                </Text>
                <View style={[styles.badge, { backgroundColor: colors.success }]}>
                  <Text style={styles.badgeText}>
                    {promos.filter(p => !p.used).length} available
                  </Text>
                </View>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          !loading && (
            <View
                            style={styles.emptyState}
            >
              <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="ticket-outline" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Promo Codes</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Enter a promo code above or check back for special offers
              </Text>
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      />
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
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  inputSection: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.lg,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  inputIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  inputContainer: {
    flex: 1,
    height: 52,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  input: {
    fontSize: typography.body,
    fontWeight: '600',
    letterSpacing: 1,
  },
  applyButton: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
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
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: typography.caption,
    fontWeight: '600',
    color: '#fff',
  },
  skeletonContainer: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  promoCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  promoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  discountText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#000',
  },
  codeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  codeText: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    letterSpacing: 1,
  },
  promoDesc: {
    fontSize: typography.bodySmall,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  promoFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  expiryText: {
    fontSize: typography.caption,
  },
  usedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  usedText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: typography.body,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});

export default PromoCodesScreen;
