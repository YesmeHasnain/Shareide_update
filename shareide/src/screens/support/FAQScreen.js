import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { spacing, borderRadius, typography } from '../../theme/colors';

const defaultColors = {
  primary: '#FCC014', background: '#FFFFFF', card: '#FFFFFF',
  text: '#1A1A2E', textSecondary: '#6B7280', border: '#E5E7EB',
};

const faqData = [
  {
    category: 'Rides',
    icon: 'car',
    color: '#FCC014',
    items: [
      { q: 'How do I book a ride?', a: 'Tap "Find a Ride" on the home screen, enter your destination, choose a driver, and confirm your booking.' },
      { q: 'Can I cancel a ride?', a: 'Yes, you can cancel before the driver arrives. A cancellation fee may apply if cancelled after the driver has been assigned.' },
      { q: 'How does fare negotiation work?', a: 'Set your offer price, drivers will bid their fares. You can accept, reject, or counter-offer until you agree on a price.' },
      { q: 'Can I add multiple stops?', a: 'Yes! During booking, tap "Add Stop" to add intermediate destinations. Each extra stop adds Rs. 50 to the fare.' },
      { q: 'How do I schedule a ride?', a: 'Go to Schedule in the Services section, pick your date and time, and set your route.' },
    ],
  },
  {
    category: 'Payments',
    icon: 'wallet',
    color: '#3B82F6',
    items: [
      { q: 'What payment methods are available?', a: 'Cash, Shareide Wallet, debit/credit card, JazzCash, and Easypaisa.' },
      { q: 'How do I top up my wallet?', a: 'Go to Wallet tab, tap "Add Money", enter the amount, and complete payment via your preferred method.' },
      { q: 'How do tips work?', a: 'After completing a ride, you can tip your driver. Tips go directly to the driver\'s wallet.' },
      { q: 'Can I get a refund?', a: 'Yes, contact support with your ride details. Refunds are processed within 3-5 business days.' },
    ],
  },
  {
    category: 'Safety',
    icon: 'shield-checkmark',
    color: '#10B981',
    items: [
      { q: 'How do I use the SOS button?', a: 'During an active ride, tap the red SOS button. This alerts your emergency contacts and our safety team with your live location.' },
      { q: 'How do I add emergency contacts?', a: 'Go to Profile > Emergency Contacts to add up to 5 trusted contacts.' },
      { q: 'Can I share my trip?', a: 'Yes! During a ride, tap "Share" to send your live tracking link to friends or family.' },
      { q: 'Are drivers verified?', a: 'All drivers go through CNIC verification, document checks, and live selfie verification before approval.' },
    ],
  },
  {
    category: 'Account',
    icon: 'person',
    color: '#8B5CF6',
    items: [
      { q: 'How do I update my profile?', a: 'Go to Account tab > Edit Profile to update your name, photo, and other details.' },
      { q: 'How do I change my phone number?', a: 'Contact support to change your registered phone number for security reasons.' },
      { q: 'How does the loyalty program work?', a: 'Earn points for every ride. Points unlock tiers (Bronze, Silver, Gold, Platinum) with increasing rewards.' },
      { q: 'How do referrals work?', a: 'Share your referral code. When a friend signs up and completes their first ride, you both earn Rs. 100.' },
    ],
  },
];

const FAQItem = ({ item, colors, isOpen, onToggle }) => {
  return (
    <TouchableOpacity
      style={[styles.faqItem, { borderColor: colors.border }]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View style={styles.faqQuestion}>
        <Text style={[styles.faqQuestionText, { color: colors.text }]}>{item.q}</Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.textSecondary}
        />
      </View>
      {isOpen && (
        <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{item.a}</Text>
      )}
    </TouchableOpacity>
  );
};

const FAQScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help Center</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Category Tabs */}
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

      {/* FAQ Items */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.faqList}
      >
        {faqData[activeCategory].items.map((item, idx) => (
          <FAQItem
            key={idx}
            item={item}
            colors={colors}
            isOpen={openItems[`${activeCategory}-${idx}`]}
            onToggle={() => toggleItem(activeCategory, idx)}
          />
        ))}

        {/* Contact Support */}
        <TouchableOpacity
          style={[styles.contactCard, { backgroundColor: colors.primary + '12' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate('Support');
          }}
        >
          <Ionicons name="chatbubbles" size={24} color={colors.primary} />
          <View style={styles.contactInfo}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>
              Still need help?
            </Text>
            <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
              Contact our support team
            </Text>
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
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 16, marginTop: 24,
  },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 15, fontWeight: '700' },
  contactSubtitle: { fontSize: 13, marginTop: 2 },
});

export default FAQScreen;
