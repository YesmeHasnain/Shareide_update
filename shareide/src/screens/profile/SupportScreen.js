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
import { useTheme } from '../../context/ThemeContext';

const SupportScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [message, setMessage] = useState('');

  const faqs = [
    {
      id: 1,
      question: 'How do I book a ride?',
      answer: 'Tap on "Where to?" on the home screen, enter your destination, select a driver from available options, and confirm your booking. Your driver will arrive at your pickup location.',
    },
    {
      id: 2,
      question: 'What payment methods are accepted?',
      answer: 'We accept Cash, JazzCash, Easypaisa, Credit/Debit Cards, and Shareide Wallet. You can add payment methods in the Profile > Payment Methods section.',
    },
    {
      id: 3,
      question: 'How do I cancel a ride?',
      answer: 'You can cancel a ride from the ride tracking screen by tapping "Cancel Ride". Cancellation fees may apply if the driver has already started coming to your location.',
    },
    {
      id: 4,
      question: 'How do I contact my driver?',
      answer: 'During an active ride, you can call or message your driver using the buttons on the ride tracking screen.',
    },
    {
      id: 5,
      question: 'How does pricing work?',
      answer: 'Fare is calculated based on distance, time, and vehicle type. The estimated fare is shown before you confirm the booking. Surge pricing may apply during peak hours.',
    },
    {
      id: 6,
      question: 'How do I add money to my wallet?',
      answer: 'Go to Wallet > Top Up, enter the amount, select your payment method (JazzCash, Easypaisa, or Card), and complete the payment.',
    },
    {
      id: 7,
      question: 'What is the rating system?',
      answer: 'After each ride, you can rate your driver from 1-5 stars. This helps maintain quality and safety for all users.',
    },
    {
      id: 8,
      question: 'How do I report an issue?',
      answer: 'You can report issues through this support screen or by going to your ride history and selecting the specific ride you want to report.',
    },
  ];

  const contactOptions = [
    { icon: '📞', label: 'Call Us', subtitle: '24/7 Support', action: () => Linking.openURL('tel:+923001234567') },
    { icon: '💬', label: 'WhatsApp', subtitle: 'Quick Response', action: () => Linking.openURL('https://wa.me/923001234567') },
    { icon: '📧', label: 'Email', subtitle: 'Get detailed help', action: () => Linking.openURL('mailto:support@shareide.pk') },
  ];

  const quickLinks = [
    { icon: '📋', label: 'Terms & Conditions' },
    { icon: '🔒', label: 'Privacy Policy' },
    { icon: '💳', label: 'Payment Policy' },
    { icon: '🔄', label: 'Refund Policy' },
    { icon: 'ℹ️', label: 'About Shareide' },
  ];

  const handleSubmitQuery = () => {
    if (!message.trim()) {
      Alert.alert('Error', 'Please enter your message');
      return;
    }

    Alert.alert(
      'Message Sent',
      'Thank you for reaching out! Our support team will respond within 24 hours.',
      [{ text: 'OK', onPress: () => setMessage('') }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View style={styles.contactSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.contactCard, { backgroundColor: colors.surface }]}
                onPress={option.action}
              >
                <Text style={styles.contactIcon}>{option.icon}</Text>
                <Text style={[styles.contactLabel, { color: colors.text }]}>{option.label}</Text>
                <Text style={[styles.contactSubtitle, { color: colors.textSecondary }]}>
                  {option.subtitle}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.faqSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Frequently Asked Questions
          </Text>
          {faqs.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={[styles.faqCard, { backgroundColor: colors.surface }]}
              onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <Text style={[styles.faqQuestion, { color: colors.text }]}>{faq.question}</Text>
                <Text style={[styles.faqArrow, { color: colors.textSecondary }]}>
                  {expandedFaq === faq.id ? '▲' : '▼'}
                </Text>
              </View>
              {expandedFaq === faq.id && (
                <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>
                  {faq.answer}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Send Message */}
        <View style={styles.messageSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Send a Message</Text>
          <View style={[styles.messageCard, { backgroundColor: colors.surface }]}>
            <TextInput
              style={[styles.messageInput, { backgroundColor: colors.background, color: colors.text }]}
              value={message}
              onChangeText={setMessage}
              placeholder="Describe your issue or question..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmitQuery}
            >
              <Text style={styles.sendButtonText}>Send Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.linksSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Links</Text>
          <View style={[styles.linksCard, { backgroundColor: colors.surface }]}>
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
                onPress={() => Alert.alert(link.label, 'This document will be available soon.')}
              >
                <View style={styles.linkLeft}>
                  <Text style={styles.linkIcon}>{link.icon}</Text>
                  <Text style={[styles.linkLabel, { color: colors.text }]}>{link.label}</Text>
                </View>
                <Text style={[styles.linkArrow, { color: colors.textSecondary }]}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Emergency */}
        <TouchableOpacity
          style={styles.emergencyCard}
          onPress={() => Linking.openURL('tel:15')}
        >
          <Text style={styles.emergencyIcon}>🚨</Text>
          <View style={styles.emergencyInfo}>
            <Text style={styles.emergencyTitle}>Emergency Services</Text>
            <Text style={styles.emergencyText}>Tap here to call 15 (Police)</Text>
          </View>
          <Text style={styles.emergencyArrow}>›</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Shareide v1.0.0
          </Text>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            © 2026 Shareide. All rights reserved.
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contactSection: {
    padding: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  contactIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 11,
  },
  faqSection: {
    padding: 16,
    paddingTop: 0,
  },
  faqCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    paddingRight: 12,
  },
  faqArrow: {
    fontSize: 12,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 20,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  messageSection: {
    padding: 16,
    paddingTop: 0,
  },
  messageCard: {
    padding: 16,
    borderRadius: 16,
  },
  messageInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 12,
  },
  sendButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  linksSection: {
    padding: 16,
    paddingTop: 0,
  },
  linksCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    fontSize: 20,
    marginRight: 14,
  },
  linkLabel: {
    fontSize: 15,
  },
  linkArrow: {
    fontSize: 22,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
  },
  emergencyIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  emergencyInfo: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 13,
    color: '#fff',
    opacity: 0.9,
  },
  emergencyArrow: {
    fontSize: 24,
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 12,
    marginBottom: 4,
  },
});

export default SupportScreen;
