import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import SwipeToAccept from '../../components/common/SwipeToAccept';
import { getPendingRequests, acceptBookingRequest, rejectBookingRequest } from '../../api/sharedRides';

const SharedRideRequestsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      const response = await getPendingRequests();
      setRequests(response.data?.bookings || response.data || []);
    } catch (error) {
      console.log('Error fetching requests:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRequests();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchRequests();
  };

  const handleAccept = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      await acceptBookingRequest(bookingId);
      Alert.alert('Accepted!', 'You have accepted this booking request. The passenger will be notified.');
      fetchRequests();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to accept booking');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (bookingId) => {
    setProcessingId(bookingId);
    try {
      await rejectBookingRequest(bookingId);
      Alert.alert('Rejected', 'The booking request has been rejected.');
      fetchRequests();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to reject booking');
    } finally {
      setProcessingId(null);
    }
  };

  const formatDateTime = (datetime) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const renderRequestCard = ({ item }) => {
    const ride = item.ride || item.shared_ride;
    const passenger = item.passenger;
    const { date, time } = ride?.departure_time ? formatDateTime(ride.departure_time) : { date: '', time: '' };
    const isProcessing = processingId === item.id;

    return (
      <View style={[styles.requestCard, { backgroundColor: colors.surface, borderColor: colors.primary + '30' }]}>
        {/* Ride Info Header */}
        <View style={[styles.rideHeader, { borderBottomColor: colors.border }]}>
          <View style={styles.routeInfo}>
            <View style={styles.routeLine}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={[styles.line, { backgroundColor: colors.border }]} />
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
            </View>
            <View style={styles.routeText}>
              <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
                {ride?.from?.address || ride?.from_address || 'Pickup'}
              </Text>
              <Text style={[styles.locationText, { color: colors.textSecondary, marginTop: 8 }]} numberOfLines={1}>
                {ride?.to?.address || ride?.to_address || 'Destination'}
              </Text>
            </View>
          </View>
          <View style={styles.dateTimeInfo}>
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>{date}</Text>
            <Text style={[styles.timeText, { color: colors.primary }]}>{time}</Text>
          </View>
        </View>

        {/* Passenger Info */}
        <View style={styles.passengerSection}>
          <View style={[styles.avatarContainer, { backgroundColor: colors.primary + '20' }]}>
            {passenger?.photo ? (
              <Image source={{ uri: passenger.photo }} style={styles.avatar} />
            ) : (
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {passenger?.name?.charAt(0)?.toUpperCase() || 'P'}
              </Text>
            )}
          </View>
          <View style={styles.passengerInfo}>
            <Text style={[styles.passengerName, { color: colors.text }]}>{passenger?.name || 'Passenger'}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={[styles.rating, { color: colors.warning }]}>{passenger?.rating || '4.5'}</Text>
              <Text style={[styles.rides, { color: colors.textSecondary }]}>({passenger?.rides_count || 0} rides)</Text>
            </View>
            {passenger?.gender && (
              <View style={styles.genderRow}>
                <Ionicons
                  name={passenger.gender === 'female' ? 'female' : 'male'}
                  size={14}
                  color={passenger.gender === 'female' ? '#FF69B4' : colors.info || '#3B82F6'}
                />
                <Text style={[styles.genderText, { color: colors.textSecondary }]}>
                  {passenger.gender === 'female' ? 'Female' : 'Male'}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={[styles.viewProfileBtn, { backgroundColor: colors.primary + '15' }]}
            onPress={() => navigation.navigate('PassengerProfile', { passengerId: passenger?.id })}
          >
            <Ionicons name="person" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Booking Details */}
        <View style={[styles.bookingDetails, { backgroundColor: colors.background }]}>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={18} color={colors.primary} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Seats</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{item.seats_booked || 1}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={18} color={colors.success} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Amount</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>Rs. {item.amount}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={18} color={colors.warning} />
            <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Requested</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Today'}
            </Text>
          </View>
        </View>

        {/* Custom Pickup/Drop if specified */}
        {(item.pickup?.address || item.drop?.address) && (
          <View style={[styles.customRoute, { borderTopColor: colors.border }]}>
            {item.pickup?.address && (
              <View style={styles.customRouteItem}>
                <Ionicons name="navigate" size={14} color={colors.primary} />
                <Text style={[styles.customRouteText, { color: colors.textSecondary }]}>
                  Custom pickup: {item.pickup.address}
                </Text>
              </View>
            )}
            {item.drop?.address && (
              <View style={styles.customRouteItem}>
                <Ionicons name="flag" size={14} color={colors.success} />
                <Text style={[styles.customRouteText, { color: colors.textSecondary }]}>
                  Custom drop: {item.drop.address}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Swipe to Accept/Reject */}
        {isProcessing ? (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.processingText, { color: colors.textSecondary }]}>Processing...</Text>
          </View>
        ) : (
          <SwipeToAccept
            onAccept={() => handleAccept(item.id)}
            onReject={() => handleReject(item.id)}
            acceptText="Accept"
            rejectText="Reject"
          />
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Booking Requests</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading requests...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Booking Requests</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Stats Banner */}
      {requests.length > 0 && (
        <View style={[styles.statsBanner, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{requests.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pending</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {requests.reduce((sum, r) => sum + (r.seats_booked || 1), 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Seats</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              Rs. {requests.reduce((sum, r) => sum + parseFloat(r.amount || 0), 0).toFixed(0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Potential</Text>
          </View>
        </View>
      )}

      <FlatList
        data={requests}
        renderItem={renderRequestCard}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-done-circle-outline" size={60} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Pending Requests</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              You're all caught up! New booking requests will appear here.
            </Text>
          </View>
        }
      />
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
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 14,
  },
  statsBanner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 3,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  listContent: {
    padding: 20,
    paddingBottom: 30,
  },
  requestCard: {
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
  },
  routeInfo: {
    flex: 1,
    flexDirection: 'row',
  },
  routeLine: {
    alignItems: 'center',
    marginRight: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    width: 2,
    height: 18,
    marginVertical: 2,
  },
  routeText: {
    flex: 1,
  },
  locationText: {
    fontSize: 12,
  },
  dateTimeInfo: {
    alignItems: 'flex-end',
  },
  dateText: {
    fontSize: 11,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  passengerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
  },
  passengerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  rides: {
    fontSize: 12,
    marginLeft: 5,
  },
  genderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 5,
  },
  genderText: {
    fontSize: 12,
  },
  viewProfileBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  detailItem: {
    alignItems: 'center',
    gap: 5,
  },
  detailLabel: {
    fontSize: 11,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  customRoute: {
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  customRouteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 5,
  },
  customRouteText: {
    fontSize: 12,
    flex: 1,
  },
  processingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  processingText: {
    marginTop: 10,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default SharedRideRequestsScreen;
