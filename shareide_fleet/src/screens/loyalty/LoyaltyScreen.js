import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loyaltyAPI } from '../../api/loyalty';

const PRIMARY_COLOR = '#FCC014';

const TabButton = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    onPress={() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }}
    activeOpacity={0.7}
    style={[styles.tab, isActive && styles.tabActive]}
  >
    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const LoyaltyScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboard, setDashboard] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [tiers, setTiers] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [dashboardRes, rewardsRes, achievementsRes, tiersRes] = await Promise.all([
        loyaltyAPI.getDashboard(),
        loyaltyAPI.getRewards(),
        loyaltyAPI.getAchievements(),
        loyaltyAPI.getTiers(),
      ]);

      setDashboard(dashboardRes.data);
      setRewards(rewardsRes.data || []);
      setAchievements(achievementsRes.data || []);
      setTiers(tiersRes.data || []);
    } catch (error) {
      console.log('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchData();
  };

  const handleRedeemReward = async (rewardId, pointsRequired, rewardName) => {
    Alert.alert(
      'Redeem Reward',
      `Redeem "${rewardName}" for ${pointsRequired} points?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            try {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              await loyaltyAPI.redeemReward(rewardId);
              Alert.alert('Success', 'Reward redeemed successfully!');
              fetchData();
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert('Error', error.message || 'Failed to redeem reward');
            }
          },
        },
      ]
    );
  };

  const getTierIcon = (tierName) => {
    const icons = {
      Bronze: 'medal',
      Silver: 'medal',
      Gold: 'crown',
      Platinum: 'gem',
    };
    return icons[tierName] || 'medal';
  };

  const getTierColors = (tierName) => {
    const colors = {
      Bronze: { bg: '#CD7F32', light: '#CD7F3220' },
      Silver: { bg: '#C0C0C0', light: '#C0C0C020' },
      Gold: { bg: PRIMARY_COLOR, light: PRIMARY_COLOR + '20' },
      Platinum: { bg: '#E5E4E2', light: '#E5E4E220' },
    };
    return colors[tierName] || { bg: PRIMARY_COLOR, light: PRIMARY_COLOR + '20' };
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Driver Rewards</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Driver Rewards</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY_COLOR}
            colors={[PRIMARY_COLOR]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Points Card */}
        <View style={styles.pointsCard}>
          <View style={styles.tierBadge}>
            <FontAwesome5 name={getTierIcon(currentTier?.name)} size={16} color="#000" />
            <Text style={styles.tierName}>{currentTier?.name || 'Bronze'} Driver</Text>
          </View>

          <View style={styles.pointsContainer}>
            <Text style={styles.pointsLabel}>Available Points</Text>
            <Text style={styles.pointsValue}>
              {(dashboard?.available_points || 0).toLocaleString()}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(dashboard?.total_points || 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentTier?.discount_percentage || 0}%</Text>
              <Text style={styles.statLabel}>Commission Cut</Text>
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
                <View
                  style={[
                    styles.progressFill,
                    { width: `${Math.min(progressPercentage, 100)}%` },
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'rewards', label: 'Rewards' },
            { key: 'achievements', label: 'Achievements' },
          ].map((tab) => (
            <TabButton
              key={tab.key}
              label={tab.label}
              isActive={activeTab === tab.key}
              onPress={() => setActiveTab(tab.key)}
            />
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.content}>
          {activeTab === 'overview' && (
            <>
              {/* Recent Activity */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Earnings</Text>
                {dashboard?.recent_points?.length > 0 ? (
                  dashboard.recent_points.slice(0, 5).map((point, index) => (
                    <View key={index} style={styles.activityItem}>
                      <View
                        style={[
                          styles.activityIcon,
                          { backgroundColor: point.points > 0 ? '#D1FAE5' : '#FEE2E2' },
                        ]}
                      >
                        <Ionicons
                          name={point.points > 0 ? 'add' : 'remove'}
                          size={16}
                          color={point.points > 0 ? '#10B981' : '#EF4444'}
                        />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={styles.activityTitle}>{point.description}</Text>
                        <Text style={styles.activityDate}>
                          {new Date(point.created_at).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.activityPoints,
                          { color: point.points > 0 ? '#10B981' : '#EF4444' },
                        ]}
                      >
                        {point.points > 0 ? '+' : ''}
                        {point.points}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="time-outline" size={40} color="#9CA3AF" />
                    <Text style={styles.emptyText}>No recent earnings</Text>
                  </View>
                )}
              </View>

              {/* Tier Benefits */}
              {currentTier?.benefits && currentTier.benefits.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Your Benefits</Text>
                  <View style={styles.benefitsCard}>
                    {currentTier.benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitItem}>
                        <Ionicons name="checkmark-circle" size={20} color={PRIMARY_COLOR} />
                        <Text style={styles.benefitText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* All Tiers */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Driver Tiers</Text>
                {tiers.map((tier, index) => {
                  const tierColors = getTierColors(tier.name);
                  const isCurrentTier = tier.id === currentTier?.id;
                  return (
                    <View
                      key={tier.id}
                      style={[
                        styles.tierCard,
                        isCurrentTier && { borderColor: PRIMARY_COLOR, borderWidth: 2 },
                      ]}
                    >
                      <View style={[styles.tierIcon, { backgroundColor: tierColors.light }]}>
                        <FontAwesome5
                          name={getTierIcon(tier.name)}
                          size={20}
                          color={tierColors.bg}
                        />
                      </View>
                      <View style={styles.tierInfo}>
                        <View style={styles.tierHeader}>
                          <Text style={styles.tierCardName}>{tier.name}</Text>
                          {isCurrentTier && (
                            <View style={styles.currentBadge}>
                              <Text style={styles.currentBadgeText}>Current</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.tierPoints}>
                          {tier.min_points.toLocaleString()} points required
                        </Text>
                        <Text style={styles.tierBenefits}>
                          {tier.discount_percentage}% commission cut • {tier.points_multiplier}x points
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </>
          )}

          {activeTab === 'rewards' && (
            <View style={styles.rewardsGrid}>
              {rewards.length > 0 ? (
                rewards.map((reward) => (
                  <View key={reward.id} style={styles.rewardCard}>
                    <View style={styles.rewardIconContainer}>
                      <FontAwesome5 name="gift" size={24} color={PRIMARY_COLOR} />
                    </View>
                    <Text style={styles.rewardName}>{reward.name}</Text>
                    <Text style={styles.rewardDescription} numberOfLines={2}>
                      {reward.description}
                    </Text>
                    <View style={styles.rewardPointsRow}>
                      <Ionicons name="star" size={14} color={PRIMARY_COLOR} />
                      <Text style={styles.rewardPointsText}>
                        {reward.points_required} pts
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.redeemButton,
                        !reward.can_redeem && styles.redeemButtonDisabled,
                      ]}
                      onPress={() =>
                        handleRedeemReward(reward.id, reward.points_required, reward.name)
                      }
                      disabled={!reward.can_redeem}
                    >
                      <Text
                        style={[
                          styles.redeemButtonText,
                          !reward.can_redeem && styles.redeemButtonTextDisabled,
                        ]}
                      >
                        {reward.can_redeem ? 'Redeem' : 'Not Enough'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View style={styles.emptyStateCenter}>
                  <Ionicons name="gift-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No Rewards Available</Text>
                  <Text style={styles.emptyText}>Check back later for new rewards</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'achievements' && (
            <View style={styles.achievementsList}>
              {achievements.length > 0 ? (
                achievements.map((achievement) => (
                  <View key={achievement.id} style={styles.achievementCard}>
                    <View
                      style={[
                        styles.achievementIcon,
                        {
                          backgroundColor: achievement.is_completed
                            ? PRIMARY_COLOR
                            : '#F3F4F6',
                        },
                      ]}
                    >
                      <FontAwesome5
                        name="trophy"
                        size={18}
                        color={achievement.is_completed ? '#000' : '#9CA3AF'}
                      />
                    </View>
                    <View style={styles.achievementInfo}>
                      <Text style={styles.achievementName}>{achievement.name}</Text>
                      <Text style={styles.achievementDesc}>{achievement.description}</Text>
                      <View style={styles.achievementProgress}>
                        <View style={styles.achievementProgressBar}>
                          <View
                            style={[
                              styles.achievementProgressFill,
                              { width: `${achievement.progress_percentage}%` },
                            ]}
                          />
                        </View>
                        <Text style={styles.achievementProgressText}>
                          {achievement.current_progress}/{achievement.target_value}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.achievementReward}>
                      <Ionicons name="star" size={12} color={PRIMARY_COLOR} />
                      <Text style={styles.achievementRewardText}>
                        {achievement.points_reward}
                      </Text>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyStateCenter}>
                  <Ionicons name="trophy-outline" size={48} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>No Achievements</Text>
                  <Text style={styles.emptyText}>Complete rides to unlock achievements</Text>
                </View>
              )}
            </View>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  pointsCard: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  tierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
    gap: 6,
  },
  tierName: {
    color: '#000',
    fontWeight: '600',
    fontSize: 13,
  },
  pointsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsLabel: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 14,
    marginBottom: 4,
  },
  pointsValue: {
    color: '#000',
    fontSize: 48,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#000',
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.15)',
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
    color: 'rgba(0,0,0,0.6)',
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: PRIMARY_COLOR,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  tabTextActive: {
    color: '#000',
  },
  content: {},
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
    color: '#000',
  },
  activityDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  activityPoints: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  emptyStateCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  benefitsCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  tierIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tierInfo: {
    flex: 1,
    marginLeft: 14,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierCardName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  currentBadge: {
    backgroundColor: PRIMARY_COLOR,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  currentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#000',
  },
  tierPoints: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  tierBenefits: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
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
  rewardIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY_COLOR + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 4,
  },
  rewardDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 10,
    minHeight: 32,
  },
  rewardPointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 4,
  },
  rewardPointsText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
  redeemButton: {
    backgroundColor: PRIMARY_COLOR,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
  },
  redeemButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  redeemButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 13,
  },
  redeemButtonTextDisabled: {
    color: '#9CA3AF',
  },
  achievementsList: {},
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  achievementIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    flex: 1,
    marginLeft: 14,
  },
  achievementName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  achievementDesc: {
    fontSize: 12,
    color: '#6B7280',
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
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 3,
  },
  achievementProgressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  achievementReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PRIMARY_COLOR + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  achievementRewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY_COLOR,
  },
});

export default LoyaltyScreen;
