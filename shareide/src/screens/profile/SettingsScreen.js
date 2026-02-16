import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useI18n, LANGUAGES } from '../../i18n';
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
  error: '#EF4444',
  gradients: { premium: ['#FFD700', '#FFA500'] },
};

const SettingsScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const isDark = theme?.isDark || false;
  const toggleTheme = theme?.toggleTheme || (() => {});
  const auth = useAuth();
  const logout = auth?.logout;
  const insets = useSafeAreaInsets();
  const { locale, changeLanguage } = useI18n();

  const [settings, setSettings] = useState({
    locationServices: true,
    faceId: false,
    autoTopup: false,
    rideSharing: true,
    soundEffects: true,
    vibration: true,
  });

  const toggleSetting = (key) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDeleteAccount = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Account Deleted',
              'Your account has been scheduled for deletion.',
              [{ text: 'OK', onPress: logout }]
            );
          },
        },
      ]
    );
  };

  const settingSections = [
    {
      title: 'Account',
      icon: 'person-circle',
      items: [
        { icon: 'key', label: 'Change Password', type: 'link' },
        { icon: 'shield-checkmark', label: 'Two-Factor Auth', type: 'link' },
        { icon: 'finger-print', label: 'Face ID / Fingerprint', key: 'faceId', type: 'toggle' },
      ],
    },
    {
      title: 'Privacy',
      icon: 'lock-closed',
      items: [
        { icon: 'location', label: 'Location Services', key: 'locationServices', type: 'toggle' },
        { icon: 'people', label: 'Ride Sharing', key: 'rideSharing', type: 'toggle', desc: 'Share rides with others' },
        { icon: 'analytics', label: 'Analytics', type: 'link' },
      ],
    },
    {
      title: 'Payments',
      icon: 'card',
      items: [
        { icon: 'wallet', label: 'Payment Methods', type: 'link', screen: 'PaymentMethods' },
        { icon: 'refresh', label: 'Auto Top-up', key: 'autoTopup', type: 'toggle' },
        { icon: 'receipt', label: 'Receipts', type: 'link' },
      ],
    },
    {
      title: 'Appearance',
      icon: 'color-palette',
      items: [
        { icon: isDark ? 'sunny' : 'moon', label: isDark ? 'Light Mode' : 'Dark Mode', type: 'toggle', value: isDark, action: toggleTheme },
        { icon: 'globe', label: 'Language', type: 'value', value: LANGUAGES.find(l => l.code === locale)?.name || 'English', action: () => {
          Alert.alert('Select Language', 'Choose your preferred language', [
            ...LANGUAGES.map(l => ({
              text: `${l.nativeName} (${l.name})`,
              onPress: () => changeLanguage(l.code),
            })),
            { text: 'Cancel', style: 'cancel' },
          ]);
        }},
        { icon: 'cash', label: 'Currency', type: 'value', value: 'PKR' },
      ],
    },
    {
      title: 'Sounds',
      icon: 'volume-high',
      items: [
        { icon: 'volume-medium', label: 'Sound Effects', key: 'soundEffects', type: 'toggle' },
        { icon: 'phone-portrait', label: 'Vibration', key: 'vibration', type: 'toggle' },
      ],
    },
  ];

  const renderItem = (item, isLast) => {
    if (item.type === 'toggle') {
      const value = item.value !== undefined ? item.value : settings[item.key];
      const onToggle = item.action || (() => toggleSetting(item.key));

      return (
        <View
          style={[
            styles.settingItem,
            !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
          ]}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name={item.icon} size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={[styles.settingLabel, { color: colors.text }]}>
                {item.label}
              </Text>
              {item.desc && (
                <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>
                  {item.desc}
                </Text>
              )}
            </View>
          </View>
          <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor="#fff"
            ios_backgroundColor={colors.border}
          />
        </View>
      );
    }

    if (item.type === 'value') {
      return (
        <TouchableOpacity
          style={[
            styles.settingItem,
            !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
          ]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); item.action && item.action(); }}
        >
          <View style={styles.settingLeft}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name={item.icon} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.settingLabel, { color: colors.text }]}>
              {item.label}
            </Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>
              {item.value}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[
          styles.settingItem,
          !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          item.screen && navigation.navigate(item.screen);
        }}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name={item.icon} size={18} color={colors.primary} />
          </View>
          <Text style={[styles.settingLabel, { color: colors.text }]}>
            {item.label}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </TouchableOpacity>
    );
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 44 }} />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {settingSections.map((section, sectionIndex) => (
          <View
            key={sectionIndex}
                        style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={section.icon} size={16} color={colors.primary} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {section.title}
              </Text>
            </View>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface }, shadows.sm]}>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  {renderItem(item, itemIndex === section.items.length - 1)}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Danger Zone */}
        <View
                    style={styles.section}
        >
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconContainer, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="warning" size={16} color={colors.error} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.error }]}>
              Danger Zone
            </Text>
          </View>
          <View style={[styles.sectionCard, { backgroundColor: colors.surface }, shadows.sm]}>
            <TouchableOpacity style={styles.dangerItem} onPress={handleDeleteAccount}>
              <View style={styles.settingLeft}>
                <View style={[styles.iconContainer, { backgroundColor: colors.error + '15' }]}>
                  <Ionicons name="trash" size={18} color={colors.error} />
                </View>
                <Text style={[styles.dangerLabel, { color: colors.error }]}>
                  Delete Account
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View
                    style={styles.footer}
        >
          <View style={[styles.logoContainer, { backgroundColor: colors.primary + '15' }]}>
            <Ionicons name="car-sport" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.versionText, { color: colors.textSecondary }]}>
            SHAREIDE v1.0.0 (Build 100)
          </Text>
          <Text style={[styles.copyrightText, { color: colors.textTertiary }]}>
            Made with love in Pakistan
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
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    gap: spacing.sm,
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
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionCard: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: typography.body,
    fontWeight: '500',
  },
  settingDesc: {
    fontSize: typography.caption,
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  settingValue: {
    fontSize: typography.bodySmall,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  dangerLabel: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
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
  versionText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  copyrightText: {
    fontSize: typography.caption,
  },
});

export default SettingsScreen;
