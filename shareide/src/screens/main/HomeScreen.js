import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { getUpcomingCount } from '../../api/scheduledRides';
import { ridesAPI } from '../../api/rides';
import { Card, Avatar, Badge, IconButton, EmptyState } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const { width } = Dimensions.get('window');

const QuickActionCard = ({ icon, label, badge, onPress, colors, index }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[
          styles.quickActionCard,
          { backgroundColor: colors.card },
          shadows.md,
        ]}
      >
        {badge > 0 && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{badge}</Text>
          </View>
        )}
        <View style={[styles.actionIconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <Text style={[styles.actionLabel, { color: colors.text }]}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
};

const RecentRideCard = ({ ride, colors, onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.recentRideCard,
        { backgroundColor: colors.card },
        shadows.md,
      ]}
    >
      <View style={styles.rideHeader}>
        <Avatar name={ride.driver_name} size="small" gradient />
        <View style={styles.rideInfo}>
          <Text style={[styles.rideDriver, { color: colors.text }]}>{ride.driver_name}</Text>
          <Text style={[styles.rideDate, { color: colors.textSecondary }]}>{ride.date}</Text>
        </View>
        <View style={styles.rideFare}>
          <Text style={[styles.rideFareAmount, { color: colors.primary }]}>Rs. {ride.fare}</Text>
          <Badge label={ride.status} variant={ride.status === 'completed' ? 'success' : 'warning'} size="small" />
        </View>
      </View>
      <View style={styles.rideRoute}>
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>{ride.pickup}</Text>
        </View>
        <View style={[styles.routeLine, { backgroundColor: colors.border }]} />
        <View style={styles.routePoint}>
          <View style={[styles.routeDot, { backgroundColor: colors.error }]} />
          <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>{ride.dropoff}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [scheduledCount, setScheduledCount] = useState(0);
  const [recentRides, setRecentRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [scheduleRes, ridesRes] = await Promise.all([
        getUpcomingCount().catch(() => ({ success: false })),
        ridesAPI.getRideHistory(1, null).catch(() => ({ success: false })),
      ]);

      if (scheduleRes.success && scheduleRes.data) {
        setScheduledCount(scheduleRes.data.count || 0);
      }

      if (ridesRes.success && ridesRes.data) {
        // Transform rides data for display
        const rides = (ridesRes.data.rides || []).slice(0, 3).map(ride => ({
          id: ride.id,
          driver_name: ride.driver?.user?.name || 'Driver',
          date: new Date(ride.created_at).toLocaleDateString(),
          fare: ride.estimated_price || 0,
          status: ride.status,
          pickup: ride.pickup_address || 'Pickup',
          dropoff: ride.drop_address || 'Dropoff',
        }));
        setRecentRides(rides);
      }
    } catch (error) {
      console.log('Error fetching home data:', error);
      setRecentRides([]);
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

  const quickActions = [
    { id: 1, icon: 'people-outline', label: 'Carpool', screen: 'SharedRides' },
    { id: 2, icon: 'calendar-outline', label: 'Scheduled', screen: 'ScheduledRides', badge: scheduledCount },
    { id: 3, icon: 'bookmark-outline', label: 'Saved Places', screen: 'SavedPlaces' },
    { id: 4, icon: 'gift-outline', label: 'Promos', screen: 'PromoCodes' },
  ];

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" />

      {/* Premium Header */}
      <LinearGradient
        colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate('ProfileTab');
            }}
            style={styles.menuButton}
          >
            <Ionicons name="menu" size={28} color="#000" />
          </TouchableOpacity>

          <View>
            <Text style={styles.logoText}>SHAREIDE</Text>
          </View>

          <IconButton
            icon="notifications-outline"
            onPress={() => navigation.navigate('Notifications')}
            variant="ghost"
            color="#000"
          />
        </View>

        <View style={styles.welcomeSection}>
          <View style={styles.welcomeLeft}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'Rider'}</Text>
          </View>
          <Avatar
            source={user?.avatar}
            name={user?.name}
            size="large"
            onPress={() => navigation.navigate('ProfileTab')}
            gradient
            showBadge
            badgeType="verified"
          />
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Search Card */}
        <View>
          <Card
            style={styles.searchCard}
            shadow="lg"
            onPress={() => navigation.navigate('LocationSearch', { type: 'pickup' })}
          >
            <View style={styles.searchHeader}>
              <Text style={[styles.searchTitle, { color: colors.text }]}>Where to?</Text>
              <View style={[styles.nowBadge, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name="time-outline" size={14} color={colors.primary} />
                <Text style={[styles.nowText, { color: colors.primary }]}>Now</Text>
              </View>
            </View>

            <View style={styles.searchInputs}>
              <View style={styles.inputRow}>
                <View style={[styles.inputDot, { backgroundColor: colors.success }]} />
                <TouchableOpacity
                  style={[styles.searchInput, { backgroundColor: colors.surface }]}
                  onPress={() => navigation.navigate('LocationSearch', { type: 'pickup' })}
                >
                  <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
                    Pickup location
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.inputConnector, { backgroundColor: colors.border }]} />

              <View style={styles.inputRow}>
                <View style={[styles.inputDot, { backgroundColor: colors.error }]} />
                <TouchableOpacity
                  style={[styles.searchInput, { backgroundColor: colors.surface }]}
                  onPress={() => navigation.navigate('LocationSearch', { type: 'dropoff' })}
                >
                  <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
                    Where are you going?
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.findRideButton}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate('LocationSearch', { type: 'pickup' });
              }}
            >
              <LinearGradient
                colors={colors.gradients?.primary || ['#FFD700', '#FFA500']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.findRideGradient}
              >
                <Ionicons name="car-sport" size={22} color="#000" />
                <Text style={styles.findRideText}>Find a Ride</Text>
                <Ionicons name="arrow-forward" size={20} color="#000" />
              </LinearGradient>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Carpooling Banner */}
        <View>
          <TouchableOpacity
            style={styles.carpoolBanner}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('SharedRides');
            }}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#6366F1', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.carpoolGradient}
            >
              <View style={styles.carpoolContent}>
                <View style={styles.carpoolLeft}>
                  <View style={styles.carpoolBadge}>
                    <Ionicons name="flash" size={12} color="#fff" />
                    <Text style={styles.carpoolBadgeText}>NEW</Text>
                  </View>
                  <Text style={styles.carpoolTitle}>Carpool & Save</Text>
                  <Text style={styles.carpoolSubtitle}>Share rides, split costs, meet new people</Text>
                </View>
                <View style={styles.carpoolIconWrapper}>
                  <Ionicons name="people" size={40} color="rgba(255,255,255,0.9)" />
                </View>
              </View>
              <View style={styles.carpoolActions}>
                <TouchableOpacity
                  style={styles.carpoolBtn}
                  onPress={() => navigation.navigate('SharedRides')}
                >
                  <Text style={styles.carpoolBtnText}>Find a Ride</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.carpoolBtn, styles.carpoolBtnOutline]}
                  onPress={() => navigation.navigate('CreateSharedRide')}
                >
                  <Text style={[styles.carpoolBtnText, styles.carpoolBtnTextOutline]}>Offer a Ride</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={action.id}
                icon={action.icon}
                label={action.label}
                badge={action.badge}
                colors={colors}
                index={index}
                onPress={() => navigation.navigate(action.screen)}
              />
            ))}
          </View>
        </View>

        {/* Recent Rides */}
        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Rides</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BookingsTab')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentRides.length === 0 ? (
            <Card style={styles.emptyCard}>
              <EmptyState
                icon="car-outline"
                title="No rides yet"
                message="Your ride history will appear here"
                actionLabel="Book a Ride"
                onAction={() => navigation.navigate('LocationSearch', { type: 'pickup' })}
              />
            </Card>
          ) : (
            recentRides.map((ride) => (
              <RecentRideCard
                key={ride.id}
                ride={ride}
                colors={colors}
                onPress={() => navigation.navigate('BookingDetails', { rideId: ride.id })}
              />
            ))
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: borderRadius.xxl,
    borderBottomRightRadius: borderRadius.xxl,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  menuButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
    letterSpacing: 2,
  },
  welcomeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.bodySmall,
    color: '#000',
    opacity: 0.7,
    marginBottom: 4,
  },
  userName: {
    fontSize: typography.h2,
    fontWeight: '700',
    color: '#000',
  },
  scrollContent: {
    paddingTop: spacing.lg,
  },
  searchCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  searchTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
  },
  nowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  nowText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  searchInputs: {
    marginBottom: spacing.lg,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
  },
  inputConnector: {
    width: 2,
    height: 20,
    marginLeft: 5,
    marginVertical: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 48,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  searchPlaceholder: {
    fontSize: typography.body,
  },
  findRideButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  findRideGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: spacing.sm,
  },
  findRideText: {
    fontSize: typography.body,
    fontWeight: '700',
    color: '#000',
  },
  quickActionsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickActionCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2 - spacing.md / 2,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  actionBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  actionBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '700',
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  actionLabel: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  seeAllText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 0,
    minHeight: 200,
  },
  recentRideCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
  },
  rideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  rideInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  rideDriver: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  rideDate: {
    fontSize: typography.caption,
  },
  rideFare: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  rideFareAmount: {
    fontSize: typography.h5,
    fontWeight: '700',
  },
  rideRoute: {
    paddingLeft: spacing.sm,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.md,
  },
  routeLine: {
    width: 2,
    height: 16,
    marginLeft: 3,
    marginVertical: 2,
  },
  routeText: {
    fontSize: typography.bodySmall,
    flex: 1,
  },
  carpoolBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  carpoolGradient: {
    padding: spacing.lg,
  },
  carpoolContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  carpoolLeft: {
    flex: 1,
  },
  carpoolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    gap: 4,
  },
  carpoolBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  carpoolTitle: {
    fontSize: typography.h4,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  carpoolSubtitle: {
    fontSize: typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
  },
  carpoolIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  carpoolActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  carpoolBtn: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  carpoolBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  carpoolBtnText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
    color: '#6366F1',
  },
  carpoolBtnTextOutline: {
    color: '#fff',
  },
});

export default HomeScreen;
