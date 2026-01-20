import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
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
    { icon: '📞', label: 'Call Support', action: () => Linking.openURL('tel:+923001234567') },
    { icon: '💬', label: 'WhatsApp', action: () => Linking.openURL('https://wa.me/923001234567') },
    { icon: '📧', label: 'Email Us', action: () => Linking.openURL('mailto:support@shareide.pk') },
  ];

  const quickLinks = [
    { icon: '📋', label: 'Terms & Conditions', screen: 'Terms' },
    { icon: '🔒', label: 'Privacy Policy', screen: 'Privacy' },
    { icon: 'ℹ️', label: 'About Shareide', screen: 'About' },
    { icon: '🔄', label: 'App Updates', screen: 'Updates' },
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Options */}
        <View style={[styles.contactCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact Us</Text>
          <View style={styles.contactGrid}>
            {contactOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.contactButton, { backgroundColor: colors.background }]}
                onPress={option.action}
              >
                <Text style={styles.contactIcon}>{option.icon}</Text>
                <Text style={[styles.contactLabel, { color: colors.text }]}>{option.label}</Text>
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

        {/* Submit Query */}
        <View style={[styles.queryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Send a Message</Text>
          <TextInput
            style={[styles.queryInput, { backgroundColor: colors.background, color: colors.text }]}
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
          >
            <Text style={styles.submitText}>Submit</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
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
              onPress={() => Alert.alert(link.label, 'This feature is coming soon!')}
            >
              <View style={styles.linkLeft}>
                <Text style={styles.linkIcon}>{link.icon}</Text>
                <Text style={[styles.linkLabel, { color: colors.text }]}>{link.label}</Text>
              </View>
              <Text style={[styles.linkArrow, { color: colors.textSecondary }]}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Emergency */}
        <TouchableOpacity
          style={[styles.emergencyCard, { backgroundColor: '#ef4444' }]}
          onPress={() => Linking.openURL('tel:15')}
        >
          <Text style={styles.emergencyIcon}>🚨</Text>
          <View style={styles.emergencyInfo}>
            <Text style={styles.emergencyTitle}>Emergency?</Text>
            <Text style={styles.emergencyText}>Tap here to call emergency services (15)</Text>
          </View>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
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
  content: {
    flex: 1,
    padding: 16,
  },
  contactCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  contactGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contactButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  contactIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  faqSection: {
    marginBottom: 20,
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
  queryCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  queryInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 12,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  linksCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
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
});

export default SupportScreen;
