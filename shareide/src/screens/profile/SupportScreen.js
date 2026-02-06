import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/common';
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
  gradients: { premium: ['#FFD700', '#FFA500'] },
};

const SupportScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [message, setMessage] = useState('');

  const faqs = [
    {
      id: 1,
      question: 'How do I book a ride?',
      answer:
        'Tap on "Where to?" on the home screen, enter your destination, select a driver from available options, and confirm your booking. Your driver will arrive at your pickup location.',
    },
    {
      id: 2,
      question: 'What payment methods are accepted?',
      answer:
        'We accept Cash, JazzCash, Easypaisa, Credit/Debit Cards, and Shareide Wallet. You can add payment methods in the Profile > Payment Methods section.',
    },
    {
      id: 3,
      question: 'How do I cancel a ride?',
      answer:
        'You can cancel a ride from the ride tracking screen by tapping "Cancel Ride". Cancellation fees may apply if the driver has already started coming to your location.',
    },
    {
      id: 4,
      question: 'How do I contact my driver?',
      answer:
        'During an active ride, you can call or message your driver using the buttons on the ride tracking screen.',
    },
    {
      id: 5,
      question: 'How does pricing work?',
      answer:
        'Fare is calculated based on distance, time, and vehicle type. The estimated fare is shown before you confirm the booking. Surge pricing may apply during peak hours.',
    },
  ];

  const contactOptions = [
    {
      icon: 'call',
      label: 'Call Us',
      subtitle: '24/7 Support',
      color: colors.success,
      action: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Linking.openURL('tel:+923001234567');
      },
    },
    {
      icon: 'logo-whatsapp',
      label: 'WhatsApp',
      subtitle: 'Quick Response',
      color: '#25D366',
      action: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Linking.openURL('https://wa.me/923001234567');
      },
    },
    {
      icon: 'mail',
      label: 'Email',
      subtitle: 'Detailed Help',
      color: colors.primary,
      action: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Linking.openURL('mailto:support@shareide.com');
      },
    },
  ];

  const quickLinks = [
    { icon: 'document-text', label: 'Terms & Conditions' },
    { icon: 'shield-checkmark', label: 'Privacy Policy' },
    { icon: 'card', label: 'Payment Policy' },
    { icon: 'refresh', label: 'Refund Policy' },
    { icon: 'information-circle', label: 'About Shareide' },
  ];

  const handleSubmitQuery = () => {
    if (!message.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Message Sent',
      'Thank you for reaching out! Our support team will respond within 24 hours.',
      [{ text: 'OK', onPress: () => setMessage('') }]
    );
  };

  const toggleFaq = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedFaq(expandedFaq === id ? null : id);
  };

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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Contact Options */}
        <View
                    style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="chatbubbles" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              CONTACT US
            </Text>
          </View>
          <View style={styles.contactGrid}>
            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.contactCard, { backgroundColor: colors.surface }, shadows.sm]}
                onPress={option.action}
                activeOpacity={0.8}
              >
                <View style={[styles.contactIconContainer, { backgroundColor: option.color + '20' }]}>
                  <Ionicons name={option.icon} size={24} color={option.color} />
                </View>
                <Text style={[styles.contactLabel, { color: colors.text }]}>
                  {option.label}
                </Text>
                <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
                  {option.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View
                    style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="help-circle" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              FREQUENTLY ASKED QUESTIONS
            </Text>
          </View>
          <View style={[styles.faqContainer, { backgroundColor: colors.surface }, shadows.sm]}>
            {faqs.map((faq, index) => (
              <TouchableOpacity
                key={faq.id}
                style={[
                  styles.faqItem,
                  index !== faqs.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => toggleFaq(faq.id)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <View style={[styles.faqIconContainer, { backgroundColor: colors.primary + '10' }]}>
                    <Ionicons name="help" size={14} color={colors.primary} />
                  </View>
                  <Text style={[styles.faqQuestion, { color: colors.text }]}>
                    {faq.question}
                  </Text>
                  <Ionicons
                    name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </View>
                {expandedFaq === faq.id && (
                  <View
                                        style={[styles.faqAnswer, { borderTopColor: colors.border }]}
                  >
                    <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Send Message */}
        <View
                    style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="mail" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              SEND A MESSAGE
            </Text>
          </View>
          <View style={[styles.messageCard, { backgroundColor: colors.surface }, shadows.sm]}>
            <TextInput
              style={[
                styles.messageInput,
                { backgroundColor: colors.background, color: colors.text },
              ]}
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue or question..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <Button
              title="Send Message"
              onPress={handleSubmitQuery}
              variant="primary"
              size="large"
              icon="send"
              fullWidth
            />
          </View>
        </View>

        {/* Quick Links */}
        <View
                    style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="link" size={16} color={colors.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              QUICK LINKS
            </Text>
          </View>
          <View style={[styles.linksCard, { backgroundColor: colors.surface }, shadows.sm]}>
            {quickLinks.map((link, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.linkRow,
                  index !== quickLinks.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(link.label, 'This document will be available soon.');
                }}
              >
                <View style={styles.linkLeft}>
                  <View style={[styles.linkIconContainer, { backgroundColor: colors.primary + '10' }]}>
                    <Ionicons name={link.icon} size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.linkLabel, { color: colors.text }]}>
                    {link.label}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency */}
        <View
                  >
          <TouchableOpacity
            style={[styles.emergencyCard, shadows.md]}
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              Linking.openURL('tel:15');
            }}
            activeOpacity={0.9}
          >
            <View style={styles.emergencyIconContainer}>
              <Ionicons name="alert-circle" size={28} color="#fff" />
            </View>
            <View style={styles.emergencyInfo}>
              <Text style={styles.emergencyTitle}>Emergency Services</Text>
              <Text style={styles.emergencyText}>Tap here to call 15 (Police)</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View
                    style={styles.footer}
        >
          <View style={[styles.logoContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="car-sport" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            SHAREIDE v1.0.0
          </Text>
          <Text style={[styles.footerSubtext, { color: colors.textTertiary }]}>
            Pakistan's Smartest Ride-sharing Platform
          </Text>
        </View>
      </ScrollView>
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
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  sectionIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
  },
  contactGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contactCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.sm,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
  },
  contactSubtitle: {
    fontSize: typography.caption,
  },
  faqContainer: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  faqItem: {
    padding: spacing.md,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  faqIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  faqAnswer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    marginLeft: 40,
  },
  faqAnswerText: {
    fontSize: typography.bodySmall,
    lineHeight: 22,
  },
  messageCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  messageInput: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.body,
    minHeight: 120,
  },
  linksCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  linkIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkLabel: {
    fontSize: typography.body,
    fontWeight: '500',
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  emergencyIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  emergencyText: {
    fontSize: typography.bodySmall,
    color: '#fff',
    opacity: 0.9,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  logoContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  footerText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: typography.caption,
  },
});

export default SupportScreen;
