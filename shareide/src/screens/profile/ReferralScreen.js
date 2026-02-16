import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert,
  ScrollView, Share, Animated, Clipboard, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { referralsAPI } from '../../api/referrals';
import { Header } from '../../components/common';
import { spacing, borderRadius, typography } from '../../theme/colors';

const defaultColors = {
  primary: '#FCC014', background: '#FFFFFF', card: '#FFFFFF',
  text: '#1A1A2E', textSecondary: '#6B7280', textTertiary: '#9CA3AF',
  border: '#E5E7EB', success: '#10B981', error: '#EF4444', info: '#3B82F6',
  surface: '#F8F9FA',
};

const ReferralScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();

  const [referralCode, setReferralCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ total_referrals: 0, total_earned: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [applying, setApplying] = useState(false);
  const [copied, setCopied] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
    Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }).start();
  }, []);

  const fetchData = async () => {
    try {
      const [codeRes, histRes] = await Promise.all([
        referralsAPI.getReferralCode().catch(() => null),
        referralsAPI.getReferralHistory().catch(() => null),
      ]);
      if (codeRes?.success) {
        setReferralCode(codeRes.data?.code || codeRes.data?.referral_code || '');
        setStats({
          total_referrals: codeRes.data?.total_referrals || 0,
          total_earned: codeRes.data?.total_earned || 0,
          pending: codeRes.data?.pending || 0,
        });
      }
      if (histRes?.success) {
        setHistory(histRes.data?.referrals || histRes.data?.history || []);
      }
    } catch (e) { /* silent */ }
    setLoading(false);
    setRefreshing(false);
  };

  const handleCopy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Clipboard.setString(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        message: `Join Shareide and get a discount on your first ride! Use my referral code: ${referralCode}\n\nDownload Shareide now!`,
      });
    } catch (e) { /* cancelled */ }
  };

  const handleApply = async () => {
    if (!inputCode.trim()) return Alert.alert('Error', 'Please enter a referral code');
    setApplying(true);
    try {
      const res = await referralsAPI.applyReferralCode(inputCode.trim());
      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success!', res.message || 'Referral code applied successfully!');
        setInputCode('');
        fetchData();
      } else {
        Alert.alert('Error', res.message || 'Invalid referral code');
      }
    } catch (e) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to apply code');
    }
    setApplying(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Refer & Earn" leftIcon="arrow-back" onLeftPress={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}
      >
        {/* Hero Card */}
        <Animated.View style={[styles.heroCard, { transform: [{ scale: scaleAnim }] }]}>
          <LinearGradient colors={['#1A1A2E', '#2D2D44']} style={styles.heroGradient}>
            <View style={styles.heroIconBg}>
              <Ionicons name="gift" size={36} color="#FCC014" />
            </View>
            <Text style={styles.heroTitle}>Invite Friends, Earn Rewards</Text>
            <Text style={styles.heroSubtitle}>
              Share your code and both you and your friend get rewards when they complete their first ride!
            </Text>

            {/* Referral Code */}
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{referralCode || 'Loading...'}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
                <Ionicons name={copied ? 'checkmark' : 'copy'} size={18} color="#000" />
                <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy'}</Text>
              </TouchableOpacity>
            </View>

            {/* Share Button */}
            <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
              <Ionicons name="share-social" size={20} color="#000" />
              <Text style={styles.shareBtnText}>Share with Friends</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="people" size={22} color={colors.info} />
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.total_referrals}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Friends Invited</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="wallet" size={22} color={colors.success} />
            <Text style={[styles.statValue, { color: colors.text }]}>Rs. {stats.total_earned}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Earned</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Ionicons name="time" size={22} color={colors.primary} />
            <Text style={[styles.statValue, { color: colors.text }]}>{stats.pending}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
          </View>
        </View>

        {/* Apply Code */}
        <View style={[styles.applyCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.applyTitle, { color: colors.text }]}>Have a referral code?</Text>
          <View style={styles.applyRow}>
            <TextInput
              style={[styles.applyInput, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="Enter code"
              placeholderTextColor={colors.textTertiary}
              value={inputCode}
              onChangeText={setInputCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[styles.applyBtn, { backgroundColor: colors.primary, opacity: applying ? 0.6 : 1 }]}
              onPress={handleApply}
              disabled={applying}
            >
              <Text style={styles.applyBtnText}>{applying ? '...' : 'Apply'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* How it works */}
        <View style={[styles.howCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.howTitle, { color: colors.text }]}>How it works</Text>
          {[
            { icon: 'share-social', title: 'Share your code', desc: 'Send your unique code to friends' },
            { icon: 'person-add', title: 'Friend signs up', desc: 'They register using your code' },
            { icon: 'car', title: 'Friend takes a ride', desc: 'They complete their first ride' },
            { icon: 'gift', title: 'Both get rewarded!', desc: 'You both receive ride credits' },
          ].map((step, i) => (
            <View key={i} style={styles.howStep}>
              <View style={[styles.howStepIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name={step.icon} size={20} color={colors.primary} />
              </View>
              <View style={styles.howStepText}>
                <Text style={[styles.howStepTitle, { color: colors.text }]}>{step.title}</Text>
                <Text style={[styles.howStepDesc, { color: colors.textSecondary }]}>{step.desc}</Text>
              </View>
              {i < 3 && <View style={[styles.howStepLine, { backgroundColor: colors.border }]} />}
            </View>
          ))}
        </View>

        {/* Referral History */}
        {history.length > 0 && (
          <View style={[styles.historyCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.historyTitle, { color: colors.text }]}>Referral History</Text>
            {history.map((item, i) => (
              <View key={i} style={[styles.historyItem, { borderBottomColor: colors.border }]}>
                <View style={[styles.historyAvatar, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.historyAvatarText, { color: colors.primary }]}>
                    {(item.name || item.referred_name || 'U').charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.historyName, { color: colors.text }]}>{item.name || item.referred_name || 'User'}</Text>
                  <Text style={[styles.historyDate, { color: colors.textTertiary }]}>{item.created_at || item.date || ''}</Text>
                </View>
                <View style={[styles.historyBadge, { backgroundColor: item.status === 'completed' ? colors.success + '15' : colors.primary + '15' }]}>
                  <Text style={[styles.historyBadgeText, { color: item.status === 'completed' ? colors.success : colors.primary }]}>
                    {item.status === 'completed' ? `+Rs.${item.amount || item.reward || 0}` : 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroCard: { margin: 16, borderRadius: 20, overflow: 'hidden' },
  heroGradient: { padding: 24, alignItems: 'center' },
  heroIconBg: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(252,192,20,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  heroTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  codeBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(252,192,20,0.3)', borderStyle: 'dashed', paddingLeft: 20, overflow: 'hidden', marginBottom: 16 },
  codeText: { flex: 1, color: '#FCC014', fontSize: 20, fontWeight: '800', letterSpacing: 3 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FCC014', paddingHorizontal: 16, paddingVertical: 14, gap: 6 },
  copyText: { color: '#000', fontSize: 13, fontWeight: '700' },
  shareBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FCC014', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 14, gap: 8 },
  shareBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },

  statsRow: { flexDirection: 'row', marginHorizontal: 16, gap: 10, marginBottom: 16 },
  statCard: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  statValue: { fontSize: 18, fontWeight: '800', marginTop: 8, marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '500' },

  applyCard: { marginHorizontal: 16, padding: 18, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  applyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  applyRow: { flexDirection: 'row', gap: 10 },
  applyInput: { flex: 1, height: 48, borderRadius: 12, paddingHorizontal: 16, fontSize: 15, fontWeight: '600', borderWidth: 1, letterSpacing: 2 },
  applyBtn: { paddingHorizontal: 24, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  applyBtnText: { color: '#000', fontSize: 15, fontWeight: '700' },

  howCard: { marginHorizontal: 16, padding: 18, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  howTitle: { fontSize: 16, fontWeight: '700', marginBottom: 16 },
  howStep: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  howStepIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  howStepText: { flex: 1 },
  howStepTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  howStepDesc: { fontSize: 12 },
  howStepLine: { position: 'absolute', left: 21, top: 44, width: 2, height: 16 },

  historyCard: { marginHorizontal: 16, padding: 18, borderRadius: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  historyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  historyItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  historyAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  historyAvatarText: { fontSize: 16, fontWeight: '700' },
  historyName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  historyDate: { fontSize: 11 },
  historyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  historyBadgeText: { fontSize: 12, fontWeight: '700' },
});

export default ReferralScreen;
