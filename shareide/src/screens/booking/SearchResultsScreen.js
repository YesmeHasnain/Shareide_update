import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';
import { Header, Card, Avatar, Rating, Badge, Button, EmptyState, SkeletonDriver, BiddingCard } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

const RouteCard = ({ pickup, dropoff, colors }) => (
  <View>
    <Card style={styles.routeCard} shadow="md">
      <View style={styles.routeRow}>
        <View style={[styles.routeDotGreen, { backgroundColor: colors.success }]} />
        <View style={styles.routeTextContainer}>
          <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>PICKUP</Text>
          <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
            {pickup?.address || 'Pickup location'}
          </Text>
        </View>
      </View>
      <View style={[styles.routeConnector, { borderColor: colors.border }]}>
        <View style={[styles.routeDash, { backgroundColor: colors.border }]} />
        <View style={[styles.routeDash, { backgroundColor: colors.border }]} />
        <View style={[styles.routeDash, { backgroundColor: colors.border }]} />
      </View>
      <View style={styles.routeRow}>
        <View style={[styles.routeDotRed, { backgroundColor: colors.error }]} />
        <View style={styles.routeTextContainer}>
          <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>DROPOFF</Text>
          <Text style={[styles.routeAddress, { color: colors.text }]} numberOfLines={1}>
            {dropoff?.address || 'Dropoff location'}
          </Text>
        </View>
      </View>
    </Card>
  </View>
);

const DriverCard = ({ driver, pickup, dropoff, colors, onPress, index }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <View>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={[styles.driverCard, { backgroundColor: colors.card }, shadows.md]}
      >
        {/* Header Row */}
        <View style={styles.driverHeader}>
          <Avatar
            source={driver.avatar}
            name={driver.name}
            size="medium"
            gradient
            showBadge
            badgeType="verified"
          />
          <View style={styles.driverInfo}>
            <View style={styles.driverNameRow}>
              <Text style={[styles.driverName, { color: colors.text }]}>{driver.name}</Text>
              {driver.is_premium && (
                <Badge label="PRO" gradient size="small" />
              )}
            </View>
            <View style={styles.ratingRow}>
              <Rating value={driver.rating} size={14} showValue />
              <Text style={[styles.ridesCount, { color: colors.textSecondary }]}>
                {driver.total_rides} rides
              </Text>
            </View>
          </View>
          <View style={styles.fareContainer}>
            <Text style={[styles.fareAmount, { color: colors.primary }]}>
              Rs. {driver.fare}
            </Text>
            <View style={[styles.etaBadge, { backgroundColor: colors.successLight }]}>
              <Ionicons name="time-outline" size={12} color={colors.success} />
              <Text style={[styles.etaText, { color: colors.success }]}>
                {driver.eta} min
              </Text>
            </View>
          </View>
        </View>

        {/* Vehicle Info */}
        <View style={[styles.vehicleRow, { backgroundColor: colors.surface }]}>
          <View style={styles.vehicleInfo}>
            <Ionicons name="car-sport" size={20} color={colors.primary} />
            <Text style={[styles.vehicleText, { color: colors.text }]}>
              {driver.vehicle?.color} {driver.vehicle?.model}
            </Text>
          </View>
          <View style={[styles.plateContainer, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.plateText, { color: colors.primary }]}>
              {driver.vehicle?.plate}
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.featuresRow}>
          {driver.has_ac && (
            <View style={[styles.featureBadge, { backgroundColor: colors.infoLight }]}>
              <Ionicons name="snow-outline" size={12} color={colors.info} />
              <Text style={[styles.featureText, { color: colors.info }]}>AC</Text>
            </View>
          )}
          {driver.accepts_cash && (
            <View style={[styles.featureBadge, { backgroundColor: colors.successLight }]}>
              <Ionicons name="cash-outline" size={12} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.success }]}>Cash</Text>
            </View>
          )}
          <View style={styles.flexSpacer} />
          <TouchableOpacity
            style={styles.selectButton}
            onPress={handlePress}
          >
            <LinearGradient
              colors={colors.gradients?.primary || ['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.selectButtonGradient}
            >
              <Text style={styles.selectButtonText}>Select</Text>
              <Ionicons name="arrow-forward" size={16} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const LoadingState = ({ colors }) => {
  return (
    <View style={styles.loadingContainer}>
      <View style={styles.loadingContent}>
        <View style={[styles.loadingIcon, { backgroundColor: colors.primary }]}>
          <Ionicons name="car-sport" size={40} color="#000" />
        </View>
        <Text style={[styles.loadingTitle, { color: colors.text }]}>
          Finding drivers near you
        </Text>
        <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>
          This may take a moment...
        </Text>
      </View>
      <View style={styles.skeletonsContainer}>
        {[1, 2, 3].map((i) => (
          <SkeletonDriver key={i} />
        ))}
      </View>
    </View>
  );
};

const SearchResultsScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { pickup, dropoff } = route.params;
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBid, setSelectedBid] = useState(0);
  const [searchRadius, setSearchRadius] = useState(5);
  const [baseFare, setBaseFare] = useState(0);

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Refetch when bid changes
  useEffect(() => {
    if (!loading) {
      fetchDrivers();
    }
  }, [selectedBid]);

  const fetchDrivers = async () => {
    try {
      setError(null);
      // Use bidding API for search
      const response = await ridesAPI.searchWithBidding(pickup, dropoff, null, selectedBid);
      const driversData = response.data?.drivers || response.drivers || [];
      setDrivers(driversData);
      setSearchRadius(response.data?.search_radius || 5);

      // Set base fare from first driver if available
      if (driversData.length > 0 && driversData[0].base_fare) {
        setBaseFare(driversData[0].base_fare);
      } else if (driversData.length > 0) {
        setBaseFare(driversData[0].fare || 300);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch available drivers');
      setDrivers([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchDrivers();
  };

  const handleBidChange = (newBid) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedBid(newBid);
    setLoading(true);
  };

  const selectDriver = (driver) => {
    navigation.navigate('DriverProfile', {
      driver: {
        ...driver,
        baseFare: driver.base_fare || baseFare,
        bidPercentage: selectedBid,
      },
      pickup,
      dropoff,
      bidPercentage: selectedBid,
    });
  };

  const renderDriver = ({ item, index }) => (
    <DriverCard
      driver={item}
      pickup={pickup}
      dropoff={dropoff}
      colors={colors}
      onPress={() => selectDriver(item)}
      index={index}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="Available Drivers"
        subtitle={`${drivers.length} found`}
        onLeftPress={() => navigation.goBack()}
      />

      {loading ? (
        <LoadingState colors={colors} />
      ) : drivers.length === 0 ? (
        <EmptyState
          icon="car-outline"
          title="No Drivers Available"
          message="There are no drivers available in your area right now. Please try again later."
          actionLabel="Retry"
          onAction={fetchDrivers}
          variant="error"
        />
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderDriver}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListHeaderComponent={
            <>
              <RouteCard pickup={pickup} dropoff={dropoff} colors={colors} />
              {baseFare > 0 && (
                <BiddingCard
                  baseFare={baseFare}
                  selectedBid={selectedBid}
                  onBidChange={handleBidChange}
                  driversCount={drivers.length}
                  searchRadius={searchRadius}
                  style={{ marginHorizontal: 0, marginBottom: spacing.lg }}
                />
              )}
            </>
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    padding: spacing.lg,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  loadingTitle: {
    fontSize: typography.h5,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  loadingSubtitle: {
    fontSize: typography.body,
  },
  skeletonsContainer: {
    marginTop: spacing.lg,
  },
  listContainer: {
    padding: spacing.lg,
  },
  routeCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDotGreen: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: spacing.md,
  },
  routeDotRed: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: spacing.md,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeLabel: {
    fontSize: typography.tiny,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  routeConnector: {
    marginLeft: 6,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  routeDash: {
    width: 2,
    height: 6,
    marginLeft: 0,
  },
  driverCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  driverInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  driverNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  driverName: {
    fontSize: typography.body,
    fontWeight: '700',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ridesCount: {
    fontSize: typography.caption,
  },
  fareContainer: {
    alignItems: 'flex-end',
  },
  fareAmount: {
    fontSize: typography.h4,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  etaText: {
    fontSize: typography.caption,
    fontWeight: '600',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  vehicleText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  plateContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  plateText: {
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1,
  },
  featuresRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  featureText: {
    fontSize: typography.tiny,
    fontWeight: '600',
  },
  flexSpacer: {
    flex: 1,
  },
  selectButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  selectButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  selectButtonText: {
    fontSize: typography.bodySmall,
    fontWeight: '700',
    color: '#000',
  },
});

export default SearchResultsScreen;
