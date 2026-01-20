import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ridesAPI } from '../../api/rides';

const BookingsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState({ upcoming: [], completed: [], cancelled: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchBookings = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      if (refresh) {
        setPage(1);
        pageNum = 1;
      }

      const response = await ridesAPI.getRideHistory(pageNum);
      const rides = response.rides || response.data || [];

      const categorized = {
        upcoming: rides.filter(r => r.status === 'upcoming' || r.status === 'ongoing' || r.status === 'arriving'),
        completed: rides.filter(r => r.status === 'completed'),
        cancelled: rides.filter(r => r.status === 'cancelled'),
      };

      if (refresh || pageNum === 1) {
        setBookings(categorized);
      } else {
        setBookings(prev => ({
          upcoming: [...prev.upcoming, ...categorized.upcoming],
          completed: [...prev.completed, ...categorized.completed],
          cancelled: [...prev.cancelled, ...categorized.cancelled],
        }));
      }

      setHasMore(rides.length > 0);
      setPage(pageNum + 1);
    } catch (error) {
      // Use mock data if API fails
      setBookings({
        upcoming: [],
        completed: [
          {
            id: '1',
            date: '2026-01-15',
            pickup: 'Gulshan-e-Iqbal Block 13',
            dropoff: 'Clifton Block 4',
            driver: { name: 'Ahmed Khan', rating: 4.8, vehicle: { model: 'Toyota Corolla', plate: 'ABC-123' } },
            fare: 350,
            status: 'completed',
          },
          {
            id: '2',
            date: '2026-01-12',
            pickup: 'Saddar',
            dropoff: 'DHA Phase 5',
            driver: { name: 'Ali Hassan', rating: 4.9, vehicle: { model: 'Honda Civic', plate: 'XYZ-456' } },
            fare: 420,
            status: 'completed',
          },
          {
            id: '3',
            date: '2026-01-08',
            pickup: 'Tariq Road',
            dropoff: 'Karachi Airport',
            driver: { name: 'Usman Shah', rating: 4.7, vehicle: { model: 'Suzuki Alto', plate: 'DEF-789' } },
            fare: 580,
            status: 'completed',
          },
        ],
        cancelled: [
          {
            id: '4',
            date: '2026-01-05',
            pickup: 'North Nazimabad',
            dropoff: 'Bahadurabad',
            driver: { name: 'Waseem Ali', rating: 4.6, vehicle: { model: 'Toyota Vitz', plate: 'GHI-012' } },
            fare: 280,
            status: 'cancelled',
          },
        ],
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchBookings(page);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#22c55e';
      case 'cancelled':
        return '#ef4444';
      case 'ongoing':
      case 'arriving':
        return '#3b82f6';
      default:
        return colors.primary;
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderBooking = ({ item }) => (
    <TouchableOpacity
      style={[styles.bookingCard, { backgroundColor: colors.surface }]}
      onPress={() => navigation.navigate('BookingDetails', { booking: item })}
    >
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
        <Text style={styles.statusText}>
          {item.status === 'completed' ? '✓' : item.status === 'cancelled' ? '✕' : '●'} {item.status}
        </Text>
      </View>
      <Text style={[styles.bookingDate, { color: colors.textSecondary }]}>
        {formatDate(item.date || item.created_at)}
      </Text>
      <View style={styles.routeInfo}>
        <View style={styles.routeRow}>
          <Text style={styles.routeIcon}>🟢</Text>
          <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
            {item.pickup?.address || item.pickup}
          </Text>
        </View>
        <View style={styles.dotLine} />
        <View style={styles.routeRow}>
          <Text style={styles.routeIcon}>🔴</Text>
          <Text style={[styles.routeText, { color: colors.text }]} numberOfLines={1}>
            {item.dropoff?.address || item.dropoff}
          </Text>
        </View>
      </View>
      <View style={styles.bookingFooter}>
        <View style={styles.driverInfo}>
          <View style={[styles.driverAvatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.driverInitial}>
              {(item.driver?.name || 'D').charAt(0)}
            </Text>
          </View>
          <View>
            <Text style={[styles.driverName, { color: colors.text }]}>
              {item.driver?.name || 'Driver'}
            </Text>
            <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
              {item.driver?.vehicle?.model || 'Vehicle'}
            </Text>
          </View>
        </View>
        <Text style={[styles.fareText, { color: colors.primary }]}>Rs. {item.fare}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
      <Text style={styles.emptyEmoji}>
        {activeTab === 'upcoming' ? '📅' : activeTab === 'completed' ? '✅' : '❌'}
      </Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        No {activeTab} bookings
      </Text>
      {activeTab === 'upcoming' && (
        <TouchableOpacity
          style={[styles.bookButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('HomeTab')}
        >
          <Text style={styles.bookButtonText}>Book a Ride</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
        {['upcoming', 'completed', 'cancelled'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomColor: colors.primary, borderBottomWidth: 3 }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? colors.primary : colors.textSecondary }]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
            {bookings[tab].length > 0 && (
              <View style={[styles.badge, { backgroundColor: activeTab === tab ? colors.primary : colors.border }]}>
                <Text style={[styles.badgeText, { color: activeTab === tab ? '#000' : colors.textSecondary }]}>
                  {bookings[tab].length}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={bookings[activeTab]}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
  backIcon: { fontSize: 28, color: '#000' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  tabs: { flexDirection: 'row' },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  tabText: { fontSize: 14, fontWeight: '600' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, minWidth: 24, alignItems: 'center' },
  badgeText: { fontSize: 12, fontWeight: 'bold' },
  listContent: { padding: 16, flexGrow: 1 },
  bookingCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 8 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#FFF', textTransform: 'capitalize' },
  bookingDate: { fontSize: 14, marginBottom: 12 },
  routeInfo: { marginBottom: 16 },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4 },
  routeIcon: { fontSize: 12, marginRight: 8 },
  routeText: { flex: 1, fontSize: 14 },
  dotLine: { width: 2, height: 16, backgroundColor: '#E0E0E0', marginLeft: 4, marginVertical: 2 },
  bookingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  driverInfo: { flexDirection: 'row', alignItems: 'center' },
  driverAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  driverInitial: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  driverName: { fontSize: 16, fontWeight: '600' },
  vehicleText: { fontSize: 12 },
  fareText: { fontSize: 20, fontWeight: 'bold' },
  emptyState: { borderRadius: 16, padding: 40, alignItems: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 80, marginBottom: 16 },
  emptyText: { fontSize: 16, marginBottom: 20 },
  bookButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  bookButtonText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
});

export default BookingsScreen;
