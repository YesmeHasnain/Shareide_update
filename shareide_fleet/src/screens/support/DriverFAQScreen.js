import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography } from '../../theme/colors';

const faqData = [
  {
    category: 'Earnings',
    icon: 'cash',
    color: '#10B981',
    items: [
      { q: 'How is my fare calculated?', a: 'Fares are based on distance, time, and demand. You can bid your own price on ride requests.' },
      { q: 'When can I withdraw earnings?', a: 'Earnings are available for withdrawal instantly. Minimum withdrawal is Rs. 500 for JazzCash/EasyPaisa and Rs. 1000 for bank transfer.' },
      { q: 'What is the platform commission?', a: 'Shareide charges a 20% commission on ride fares. Tips from riders are 100% yours.' },
      { q: 'How do tips work?', a: 'Riders can tip after completing a ride. Tips go directly to your wallet with no commission deduction.' },
      { q: 'How do I see my earnings breakdown?', a: 'Go to Wallet > Earnings to see daily, weekly, and monthly breakdowns with trip details.' },
    ],
  },
  {
    category: 'Documents',
    icon: 'document-text',
    color: '#3B82F6',
    items: [
      { q: 'What documents are required?', a: 'CNIC (front & back), Driving License, Vehicle Registration, and a live selfie for verification.' },
      { q: 'How long does approval take?', a: 'Document verification typically takes 24-48 hours. You\'ll receive a notification once approved.' },
      { q: 'My documents were rejected. What now?', a: 'Check the rejection reason in your profile, re-upload clear photos, and submit again for review.' },
      { q: 'Can I update my vehicle?', a: 'Go to Profile > Vehicle Details to update your vehicle information. Changes require re-verification.' },
    ],
  },
  {
    category: 'Trips',
    icon: 'car',
    color: '#FCC014',
    items: [
      { q: 'How does fare negotiation work?', a: 'When a rider posts a request, you see their offered fare. You can bid higher or lower. The rider can accept, reject, or counter-offer.' },
      { q: 'What is Destination Mode?', a: 'Set a destination and only receive ride requests that are along your route. Perfect for heading home.' },
      { q: 'How do I see the demand heatmap?', a: 'Go to the Heatmap screen from your dashboard. Red zones show high demand areas.' },
      { q: 'Can I cancel a ride?', a: 'You can cancel before starting a ride, but frequent cancellations may affect your acceptance rate.' },
      { q: 'How do intercity rides work?', a: 'Post your intercity route with schedule and price. Riders search and book your available seats.' },
    ],
  },
];

const DriverFAQScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeCategory, setActiveCategory] = useState(0);
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (catIdx, itemIdx) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const key = `${catIdx}-${itemIdx}`;
    setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Driver Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryTabs}
      >
        {faqData.map((cat, idx) => (
          <TouchableOpacity
            key={idx}
            style={[
              styles.categoryTab,
              {
                backgroundColor: activeCategory === idx ? cat.color : colors.card,
                borderColor: activeCategory === idx ? cat.color : colors.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveCategory(idx);
            }}
          >
            <Ionicons
              name={cat.icon}
              size={18}
              color={activeCategory === idx ? '#000' : colors.textSecondary}
            />
            <Text style={[
              styles.categoryLabel,
              { color: activeCategory === idx ? '#000' : colors.textSecondary },
            ]}>
              {cat.category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.faqList}>
        {faqData[activeCategory].items.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={[styles.faqItem, { borderColor: colors.border }]}
            onPress={() => toggleItem(activeCategory, idx)}
            activeOpacity={0.7}
          >
            <View style={styles.faqQuestion}>
              <Text style={[styles.faqQuestionText, { color: colors.text }]}>{item.q}</Text>
              <Ionicons
                name={openItems[`${activeCategory}-${idx}`] ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textSecondary}
              />
            </View>
            {openItems[`${activeCategory}-${idx}`] && (
              <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{item.a}</Text>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[styles.contactCard, { backgroundColor: colors.primary + '12' }]}
          onPress={() => navigation.navigate('Support')}
        >
          <Ionicons name="chatbubbles" size={24} color={colors.primary} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>Need more help?</Text>
            <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>Contact driver support</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
  },
  backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: typography.h5, fontWeight: '700' },
  categoryTabs: { paddingHorizontal: spacing.lg, gap: 8, paddingBottom: spacing.lg },
  categoryTab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1,
  },
  categoryLabel: { fontSize: 14, fontWeight: '600' },
  faqList: { paddingHorizontal: spacing.lg },
  faqItem: { borderBottomWidth: 1, paddingVertical: 16 },
  faqQuestion: { flexDirection: 'row', alignItems: 'center' },
  faqQuestionText: { flex: 1, fontSize: 15, fontWeight: '600', marginRight: 8 },
  faqAnswer: { fontSize: 14, lineHeight: 22, marginTop: 10 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, borderRadius: 16, marginTop: 24,
  },
  contactTitle: { fontSize: 15, fontWeight: '700' },
  contactSubtitle: { fontSize: 13, marginTop: 2 },
});

export default DriverFAQScreen;
