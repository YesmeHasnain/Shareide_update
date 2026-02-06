import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';
import { Card, Avatar, Rating, Badge, EmptyState, SkeletonDriver, BiddingCard } from '../../components/common';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';

// Default colors fallback
const defaultColors = {
  primary: '#FCC014',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  inputBackground: '#F5F5F5',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  price: '#F5A623',
};

const RouteHeader = ({ pickup, dropoff, date, time, seats, colors }) => (
  <View style={[styles.routeHeader, { backgroundColor: colors.inputBackground || '#F5F5F5' }]}>
    <Text style={[styles.routeHeaderText, { color: colors.text }]} numberOfLines={1}>
      {pickup?.name || pickup?.address || 'Pickup'} → {dropoff?.name || dropoff?.address || 'Dropoff'}
    </Text>
    <View style={styles.routeMetaRow}>
      <Text style={[styles.routeMetaText, { color: colors.textSecondary }]}>
        {date || 'Today'} • {time || 'Now'} • {seats || 1} seat{(seats || 1) > 1 ? 's' : ''}
      </Text>
    </View>
  </View>
);

const FilterTabs = ({ activeFilter, onFilterChange, colors }) => {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'male', label: 'Male only' },
    { key: 'female', label: 'Female only' },
  ];

  return (
    <View style={styles.filterTabs}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterTab,
            activeFilter === filter.key && { backgroundColor: colors.primary },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onFilterChange(filter.key);
          }}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: activeFilter === filter.key ? '#000' : colors.textSecondary },
            ]}
          >
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const DriverCard = ({ driver, colors, onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  const formatTime = (time) => {
    if (!time) return '5:00 PM';
    return time;
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[styles.driverCard, { backgroundColor: colors.card }]}
    >
      {/* Driver Info Row */}
      <View style={styles.driverHeader}>
        <View style={styles.avatarContainer}>
          <Avatar
            source={driver.avatar}
            name={driver.name}
            size="medium"
          />
          <View style={[styles.ratingBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="star" size={10} color="#000" />
            <Text style={styles.ratingBadgeText}>{driver.rating?.toFixed(1) || '4.9'}</Text>
          </View>
        </View>
        <View style={styles.driverInfo}>
          <Text style={[styles.driverName, { color: colors.text }]}>{driver.name}</Text>
          <View style={styles.driverMeta}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={[styles.driverMetaText, { color: colors.textSecondary }]}>
              {formatTime(driver.departure_time)} • {driver.distance || '2.5'} km away
            </Text>
          </View>
        </View>
        <Text style={[styles.fareAmount, { color: colors.price || '#F5A623' }]}>
          Rs. {driver.fare || 350}
        </Text>
      </View>
    </TouchableOpacity>
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
  const theme = useTheme();
  const colors = theme?.colors || defaultColors;
  const insets = useSafeAreaInsets();
  const params = route?.params || {};
  const { pickup, dropoff } = params;
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBid, setSelectedBid] = useState(0);
  const [searchRadius, setSearchRadius] = useState(5);
  const [baseFare, setBaseFare] = useState(0);
  const [activeFilter, setActiveFilter] = useState('all');

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

  const renderDriver = ({ item }) => (
    <DriverCard
      driver={item}
      colors={colors}
      onPress={() => selectDriver(item)}
    />
  );

  // Filter drivers based on selected filter
  const filteredDrivers = drivers.filter((driver) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'male') return driver.gender === 'male';
    if (activeFilter === 'female') return driver.gender === 'female';
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.inputBackground || '#F5F5F5' }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Available Rides</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <LoadingState colors={colors} />
      ) : drivers.length === 0 ? (
        <EmptyState
          icon="car-outline"
          title="No Rides Available"
          message="There are no rides available for this route right now. Please try again later."
          actionLabel="Retry"
          onAction={fetchDrivers}
        />
      ) : (
        <FlatList
          data={filteredDrivers}
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
              <RouteHeader pickup={pickup} dropoff={dropoff} colors={colors} />
              <FilterTabs
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                colors={colors}
              />
              <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                AVAILABLE RIDES
              </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.h5,
    fontWeight: '600',
  },
  placeholder: {
    width: 40,
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
    paddingHorizontal: spacing.lg,
  },
  routeHeader: {
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  routeHeaderText: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  routeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeMetaText: {
    fontSize: typography.caption,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  filterTabText: {
    fontSize: typography.bodySmall,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: typography.caption,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  driverCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  ratingBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    gap: 2,
  },
  ratingBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  driverInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  driverName: {
    fontSize: typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  driverMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  driverMetaText: {
    fontSize: typography.caption,
  },
  fareAmount: {
    fontSize: typography.h5,
    fontWeight: '700',
  },
});

export default SearchResultsScreen;
