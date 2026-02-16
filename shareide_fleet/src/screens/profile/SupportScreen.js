import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import Header from '../../components/Header';
import Card from '../../components/Card';
import { spacing, typography, borderRadius } from '../../theme/colors';

const CONTACT_ICONS = {
  call: { name: 'call', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  whatsapp: { name: 'chatbubble', color: '#25D366', bg: 'rgba(37, 211, 102, 0.12)' },
  email: { name: 'mail', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
};

const LINK_ICONS = {
  terms: { name: 'document-text', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.12)' },
  privacy: { name: 'lock-closed', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  about: { name: 'information-circle', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  updates: { name: 'refresh', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
};

const SupportScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [message, setMessage] = useState('');

  const faqs = [
    {
      id: 1,
      question: 'How do I get paid?',
      answer: 'Your earnings are automatically added to your wallet after each completed ride. You can withdraw your balance via JazzCash, Easypaisa, or bank transfer from the Wallet section.',
    },
    {
      id: 2,
      question: 'What is the commission rate?',
      answer: 'Shareide takes a 20% platform fee from each ride. The remaining 80% is your earnings. Tips from passengers go directly to you with no commission.',
    },
    {
      id: 3,
      question: 'How do I handle passenger disputes?',
      answer: 'If a passenger has an issue, remain calm and professional. If the issue cannot be resolved, you can report it through the app after the ride ends. Our support team will review and respond within 24 hours.',
    },
    {
      id: 4,
      question: 'What if I need to cancel a ride?',
      answer: 'You can cancel a ride before pickup by tapping the Cancel button. Note that frequent cancellations may affect your acceptance rate and account status.',
    },
    {
      id: 5,
      question: 'How does the rating system work?',
      answer: 'After each ride, passengers rate you from 1-5 stars. Maintain a rating above 4.0 to stay active on the platform. Ratings below 4.0 may result in temporary suspension.',
    },
    {
      id: 6,
      question: 'What documents do I need?',
      answer: 'You need a valid CNIC, driving license, vehicle registration, and vehicle photos. All documents must be current and clearly visible.',
    },
  ];

  const contactOptions = [
    { key: 'call', label: 'Call Support', action: () => Linking.openURL('tel:+923001234567') },
    { key: 'whatsapp', label: 'WhatsApp', action: () => Linking.openURL('https://wa.me/923001234567') },
    { key: 'email', label: 'Email Us', action: () => Linking.openURL('mailto:support@shareide.com') },
  ];

  const quickLinks = [
    { key: 'terms', label: 'Terms & Conditions', action: () => {
      Alert.alert('Terms & Conditions', 'By using the Shareide platform, you agree to our terms of service.\n\n• Drivers must maintain a rating above 4.0\n• Commission rate is 20% per ride\n• Tips go 100% to the driver\n• Cancellation fees apply after driver arrival\n• Drivers must keep valid documents\n• Violations may result in account suspension\n\nFull terms at: shareide.com/terms');
    }},
    { key: 'privacy', label: 'Privacy Policy', action: () => {
      Alert.alert('Privacy Policy', 'Your privacy is important to us.\n\n• We collect location data only during active rides\n• Personal data is encrypted and stored securely\n• We never sell your data to third parties\n• You can request data deletion at any time\n• Ride history is retained for 12 months\n• Payment info is handled by Bank Alfalah\n\nFull policy at: shareide.com/privacy');
    }},
    { key: 'about', label: 'About Shareide', action: () => {
      Alert.alert('About Shareide', 'Shareide is Pakistan\'s ride-hailing platform built for drivers and riders.\n\n🚗 Fair commissions for drivers\n💰 Fare negotiation system\n🛡️ Safety-first approach\n📍 Available in major cities\n\nVersion: 1.0.0\nMade with ❤️ in Pakistan');
    }},
    { key: 'updates', label: 'App Updates', action: () => {
      Alert.alert('App Updates', 'You are running the latest version!\n\nShareide Fleet v1.0.0\n\nRecent updates:\n• Fare negotiation with riders\n• Demand heatmap\n• Intercity ride offers\n• Enhanced earnings dashboard\n• Driver FAQ section');
    }},
  ];

  const handleSubmitQuery = () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    Alert.alert(
      'Query Submitted',
      'Your message has been sent. Our support team will respond within 24 hours.',
      [{ text: 'OK', onPress: () => setMessage('') }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Help & Support" onLeftPress={() => navigation.goBack()} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <Card style={styles.contactCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option) => {
              const icon = CONTACT_ICONS[option.key];
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[styles.contactButton, { backgroundColor: colors.background }]}
                  onPress={option.action}
                  activeOpacity={0.7}
                >
                  <View style={[styles.contactIconBg, { backgroundColor: icon.bg }]}>
                    <Ionicons name={icon.name} size={24} color={icon.color} />
                  </View>
                  <Text style={[styles.contactLabel, { color: colors.text }]}>{option.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Frequently Asked Questions
          </Text>
          {faqs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={[styles.faqCard, { backgroundColor: colors.card || colors.surface }]}
              onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                <Ionicons
                  name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textSecondary}
                />
              </View>
              {expandedFaq === faq.id && (
                <Text style={[styles.faqAnswer, { color: colors.textSecondary, borderTopColor: colors.border }]}>
                  {faq.answer}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Submit Query */}
        <Card style={styles.queryCard}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Send a Message</Text>
          <TextInput
            style={[styles.queryInput, { backgroundColor: colors.inputBackground || colors.background, color: colors.text }]}
            value={message}
            onChangeText={setMessage}
            placeholder="Describe your issue or question..."
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.primary }]}
            onPress={handleSubmitQuery}
            activeOpacity={0.7}
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </Card>

        {/* Quick Links */}
        <View style={[styles.linksCard, { backgroundColor: colors.card || colors.surface }]}>
          {quickLinks.map((link, index) => {
            const icon = LINK_ICONS[link.key];
            return (
              <TouchableOpacity
                key={link.key}
                style={[
                  styles.linkRow,
                  index !== quickLinks.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  },
                ]}
                onPress={() => link.action ? link.action() : null}
                activeOpacity={0.7}
              >
                <View style={styles.linkLeft}>
                  <View style={[styles.linkIconBg, { backgroundColor: icon.bg }]}>
                    <Ionicons name={icon.name} size={18} color={icon.color} />
                  </View>
                  <Text style={[styles.linkLabel, { color: colors.text }]}>{link.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Emergency */}
        <TouchableOpacity
          style={[styles.emergencyCard, { backgroundColor: '#ef4444' }]}
          onPress={() => Linking.openURL('tel:15')}
          activeOpacity={0.8}
        >
          <View style={styles.emergencyIconBg}>
            <Ionicons name="warning" size={28} color="#fff" />
          </View>
          <View style={styles.emergencyInfo}>
            <Text style={styles.emergencyTitle}>Emergency?</Text>
            <Text style={styles.emergencyText}>Tap here to call emergency services (15)</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: spacing.xxxl + spacing.sm }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  contactCard: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h6,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.xs,
  },
  contactIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  contactLabel: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  faqSection: {
    marginBottom: spacing.xl,
  },
  faqCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    flex: 1,
    paddingRight: spacing.md,
  },
  faqAnswer: {
    fontSize: typography.bodySmall - 1,
    lineHeight: 20,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  queryCard: {
    marginBottom: spacing.xl,
  },
  queryInput: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: typography.bodySmall,
    minHeight: 100,
    marginBottom: spacing.md,
  },
  submitButton: {
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  submitText: {
    fontSize: typography.h6,
    fontWeight: '700',
    color: '#000',
  },
  linksCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  linkIconBg: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkLabel: {
    fontSize: typography.bodySmall + 1,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  emergencyIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: typography.h6,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.xs,
  },
  emergencyText: {
    fontSize: typography.bodySmall - 1,
    color: '#fff',
    opacity: 0.9,
  },
});

export default SupportScreen;
