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
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Header, Card, Avatar, EmptyState, SwipeToAccept } from '../../components/common';
import { useTheme } from '../../context/ThemeContext';
import { shadows, spacing, borderRadius, typography } from '../../theme/colors';
import { getPendingRequests, acceptBookingRequest, rejectBookingRequest } from '../../api/sharedRides';

const { width } = Dimensions.get('window');

const SharedRideRequestsScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchRequests = async () => {
    try {
      const response = await getPendingRequests();
      setRequests(response.data || []);
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
    const ride = item.shared_ride;
    const passenger = item.passenger;
    const { date, time } = formatDateTime(ride?.departure_time);
    const isProcessing = processingId === item.id;

    return (
      <Card style={styles.requestCard}>
        {/* Ride Info Header */}
        <View style={styles.rideHeader}>
          <View style={styles.routeInfo}>
            <View style={styles.routeLine}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              <View style={styles.line} />
              <View style={[styles.dot, styles.dotEnd, { backgroundColor: colors.success }]} />
            </View>
            <View style={styles.routeText}>
              <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>{ride?.from_address}</Text>
              <Text style={[styles.locationText, { marginTop: 8, color: colors.textSecondary }]} numberOfLines={1}>{ride?.to_address}</Text>
            </View>
          </View>
          <View style={styles.dateTimeInfo}>
            <Text style={[styles.dateText, { color: colors.textMuted }]}>{date}</Text>
            <Text style={[styles.timeText, { color: colors.primary }]}>{time}</Text>
          </View>
        </View>

        {/* Passenger Info */}
        <View style={styles.passengerSection}>
          <Avatar
            source={passenger?.avatar ? { uri: passenger.avatar } : null}
            name={passenger?.name}
            size={60}
          />
          <View style={styles.passengerInfo}>
            <Text style={[styles.passengerName, { color: colors.text }]}>{passenger?.name || 'Passenger'}</Text>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={[styles.rating, { color: colors.warning }]}>{passenger?.rating || '4.5'}</Text>
              <Text style={[styles.rides, { color: colors.textMuted }]}>({passenger?.total_rides || 0} rides)</Text>
            </View>
            {passenger?.gender && (
              <View style={styles.genderRow}>
                <Ionicons
                  name={passenger.gender === 'female' ? 'female' : 'male'}
                  size={14}
                  color={passenger.gender === 'female' ? '#FF69B4' : colors.info}
                />
                <Text style={[styles.genderText, { color: colors.textMuted }]}>
                  {passenger.gender === 'female' ? 'Female' : 'Male'}
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.viewProfileBtn}
            onPress={() => navigation.navigate('PassengerProfile', { passengerId: passenger?.id })}
          >
            <Ionicons name="person" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Booking Details */}
        <View style={styles.bookingDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={18} color={colors.primary} />
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Seats</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>{item.seats_booked}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={18} color={colors.success} />
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Amount</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>Rs. {item.amount}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time" size={18} color={colors.warning} />
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>Requested</Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Custom Pickup/Drop if specified */}
        {(item.pickup_address || item.drop_address) && (
          <View style={styles.customRoute}>
            {item.pickup_address && (
              <View style={styles.customRouteItem}>
                <Ionicons name="navigate" size={14} color={colors.primary} />
                <Text style={[styles.customRouteText, { color: colors.textMuted }]}>
                  Custom pickup: {item.pickup_address}
                </Text>
              </View>
            )}
            {item.drop_address && (
              <View style={styles.customRouteItem}>
                <Ionicons name="flag" size={14} color={colors.success} />
                <Text style={[styles.customRouteText, { color: colors.textMuted }]}>
                  Custom drop: {item.drop_address}
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
      </Card>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
        <Header title="Booking Requests" onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading requests...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.container}>
      <Header title="Booking Requests" onBack={() => navigation.goBack()} />

      {/* Stats Banner */}
      {requests.length > 0 && (
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{requests.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              {requests.reduce((sum, r) => sum + r.seats_booked, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Total Seats</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>
              Rs. {requests.reduce((sum, r) => sum + parseFloat(r.amount), 0).toFixed(0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textMuted }]}>Potential</Text>
          </View>
        </View>
      )}

      <FlatList
        data={requests}
        renderItem={renderRequestCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="checkmark-done-circle-outline"
            title="No Pending Requests"
            subtitle="You're all caught up! New booking requests will appear here."
          />
        }
      />
    </LinearGradient>
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
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
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  listContent: {
    padding: 20,
    paddingBottom: 30,
  },
  requestCard: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(244, 182, 66, 0.3)',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
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
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 2,
  },
  dotEnd: {},
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
    backgroundColor: 'rgba(244, 182, 66, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
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
    borderTopColor: 'rgba(255,255,255,0.05)',
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
});

export default SharedRideRequestsScreen;
