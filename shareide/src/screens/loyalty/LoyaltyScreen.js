import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { loyaltyAPI } from '../../api/loyalty';

const LoyaltyScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dashboardRes, rewardsRes, achievementsRes] = await Promise.all([
        loyaltyAPI.getDashboard(),
        loyaltyAPI.getRewards(),
        loyaltyAPI.getAchievements(),
      ]);

      setDashboard(dashboardRes.data);
      setRewards(rewardsRes.data || []);
      setAchievements(achievementsRes.data || []);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleRedeemReward = async (rewardId, pointsRequired) => {
    Alert.alert(
      'Redeem Reward',
      `This will use ${pointsRequired} points. Continue?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            try {
              await loyaltyAPI.redeemReward(rewardId);
              Alert.alert('Success', 'Reward redeemed successfully!');
              fetchData();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to redeem reward');
            }
          },
        },
      ]
    );
  };

  const getTierColor = (tierName) => {
    const colors = {
      Bronze: ['#CD7F32', '#B87333'],
      Silver: ['#C0C0C0', '#A8A8A8'],
      Gold: ['#FFD700', '#FFA500'],
      Platinum: ['#E5E4E2', '#B4B4B4'],
    };
    return colors[tierName] || ['#FFD700', '#FFA500'];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const currentTier = dashboard?.current_tier;
  const nextTier = dashboard?.next_tier;
  const progressPercentage = nextTier
    ? ((dashboard?.total_points - (currentTier?.min_points || 0)) /
        (nextTier.min_points - (currentTier?.min_points || 0))) *
      100
    : 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Loyalty Rewards</Text>
        <TouchableOpacity onPress={() => navigation.navigate('PointsHistory')}>
          <Ionicons name="time-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        {/* Points Card */}
        <LinearGradient colors={getTierColor(currentTier?.name)} style={styles.pointsCard}>
          <View style={styles.tierBadge}>
            <FontAwesome5 name="crown" size={20} color="#FFF" />
            <Text style={styles.tierName}>{currentTier?.name || 'Bronze'}</Text>
          </View>

          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>Available Points</Text>
            <Text style={styles.pointsValue}>{dashboard?.available_points?.toLocaleString() || 0}</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dashboard?.total_points?.toLocaleString() || 0}</Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentTier?.discount_percentage || 0}%</Text>
              <Text style={styles.statLabel}>Discount</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentTier?.points_multiplier || 1}x</Text>
              <Text style={styles.statLabel}>Multiplier</Text>
            </View>
          </View>

          {nextTier && (
            <View style={styles.progressContainer}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>Progress to {nextTier.name}</Text>
                <Text style={styles.progressText}>{dashboard?.points_to_next_tier} pts left</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(progressPercentage, 100)}%` }]} />
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Tabs */}
        <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
          {['overview', 'rewards', 'achievements'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && { backgroundColor: colors.primary }]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText, { color: activeTab === tab ? '#000' : colors.textSecondary }]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === 'overview' && (
            <>
              {/* Recent Points */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
                {dashboard?.recent_points?.slice(0, 5).map((point, index) => (
                  <View key={index} style={[styles.activityItem, { backgroundColor: colors.card }]}>
                    <View style={[styles.activityIcon, { backgroundColor: point.points > 0 ? '#10B981' : '#EF4444' }]}>
                      <Ionicons name={point.points > 0 ? 'add' : 'remove'} size={16} color="#FFF" />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityTitle, { color: colors.text }]}>{point.description}</Text>
                      <Text style={[styles.activityDate, { color: colors.textSecondary }]}>{new Date(point.created_at).toLocaleDateString()}</Text>
                    </View>
                    <Text style={[styles.activityPoints, { color: point.points > 0 ? '#10B981' : '#EF4444' }]}>
                      {point.points > 0 ? '+' : ''}{point.points}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Tier Benefits */}
              {currentTier?.benefits && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Benefits</Text>
                  {currentTier.benefits.map((benefit, index) => (
                    <View key={index} style={styles.benefitItem}>
                      <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                      <Text style={[styles.benefitText, { color: colors.text }]}>{benefit}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {activeTab === 'rewards' && (
            <View style={styles.rewardsGrid}>
              {rewards.map((reward) => (
                <View key={reward.id} style={styles.rewardCard}>
                  <View style={[styles.rewardIcon, { backgroundColor: colors.primary + '20' }]}>
                    <FontAwesome5 name="gift" size={24} color={colors.primary} />
                  </View>
                  <Text style={[styles.rewardName, { color: colors.text }]}>{reward.name}</Text>
                  <Text style={[styles.rewardDescription, { color: colors.textSecondary }]} numberOfLines={2}>{reward.description}</Text>
                  <View style={styles.rewardPoints}>
                    <Ionicons name="star" size={14} color={colors.primary} />
                    <Text style={[styles.rewardPointsText, { color: colors.primary }]}>{reward.points_required} pts</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.redeemButton, !reward.can_redeem && styles.redeemButtonDisabled, !reward.can_redeem && { backgroundColor: colors.border }]}
                    onPress={() => handleRedeemReward(reward.id, reward.points_required)}
                    disabled={!reward.can_redeem}
                  >
                    <Text style={[styles.redeemButtonText, !reward.can_redeem && styles.redeemButtonTextDisabled, !reward.can_redeem && { color: colors.textSecondary }]}>
                      {reward.can_redeem ? 'Redeem' : 'Not Enough Points'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'achievements' && (
            <View style={styles.achievementsList}>
              {achievements.map((achievement) => (
                <View key={achievement.id} style={[styles.achievementCard, { backgroundColor: colors.card }]}>
                  <View style={[styles.achievementIcon, achievement.is_completed && { backgroundColor: colors.primary }, !achievement.is_completed && { backgroundColor: colors.border }]}>
                    <FontAwesome5 name="trophy" size={20} color={achievement.is_completed ? '#FFF' : colors.textSecondary} />
                  </View>
                  <View style={styles.achievementInfo}>
                    <Text style={[styles.achievementName, { color: colors.text }]}>{achievement.name}</Text>
                    <Text style={[styles.achievementDesc, { color: colors.textSecondary }]}>{achievement.description}</Text>
                    <View style={styles.achievementProgress}>
                      <View style={[styles.achievementProgressBar, { backgroundColor: colors.border }]}>
                        <View style={[styles.achievementProgressFill, { backgroundColor: colors.primary }]} style={{ width: `${achievement.progress_percentage}%` }} />
                      </View>
                      <Text style={[styles.achievementProgressText, { color: colors.textSecondary }]}>
                        {achievement.current_progress}/{achievement.target_value}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.achievementReward, { backgroundColor: colors.primary + '20' }]}>
                    <Ionicons name="star" size={14} color={colors.primary} />
                    <Text style={[styles.achievementRewardText, { color: colors.primary }]}>{achievement.points_reward}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  pointsCard: {
    margin: 16,
    borderRadius: 20,
    padding: 20,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  tierName: {
    color: '#FFF',
    fontWeight: '700',
    marginLeft: 6,
    fontSize: 14,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  pointsLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 4,
  },
  pointsValue: {
    color: '#FFF',
    fontSize: 42,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFF',
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    // Handled in JSX with inline style
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#000',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  activityDate: {
    fontSize: 12,
    marginTop: 2,
  },
  activityPoints: {
    fontSize: 16,
    fontWeight: '700',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    marginLeft: 8,
    fontSize: 14,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  rewardCard: {
    width: '50%',
    padding: 6,
  },
  rewardIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    marginBottom: 8,
  },
  rewardPoints: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rewardPointsText: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  redeemButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  redeemButtonDisabled: {
    // Handled in JSX with inline style
  },
  redeemButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 13,
  },
  redeemButtonTextDisabled: {
    // Handled in JSX with inline style
  },
  achievementsList: {},
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementCompleted: {
    // Handled in JSX with inline style
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 12,
  },
  achievementName: {
    fontSize: 15,
    fontWeight: '600',
  },
  achievementDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  achievementProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  achievementProgressText: {
    fontSize: 12,
  },
  achievementReward: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  achievementRewardText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LoyaltyScreen;
