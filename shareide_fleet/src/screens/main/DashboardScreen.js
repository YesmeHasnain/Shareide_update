import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Switch,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { rideAPI } from '../../api/ride';

const DashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [activeRide, setActiveRide] = useState(null);
  const [availableRides, setAvailableRides] = useState([]);
  const [stats, setStats] = useState({
    today_earnings: 0,
    today_rides: 0,
    rating: 0,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [activeRideRes, availableRidesRes] = await Promise.all([
        rideAPI.getActiveRide(),
        rideAPI.getAvailableRides(),
      ]);

      if (activeRideRes.success) {
        setActiveRide(activeRideRes.data.ride);
      }

      if (availableRidesRes.success) {
        setAvailableRides(availableRidesRes.data.rides || []);
      }
    } catch (error) {
      console.error('Fetch dashboard error:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const toggleOnlineStatus = async (value) => {
    try {
      const status = value ? 'online' : 'offline';
      await rideAPI.updateDriverStatus(status);
      setIsOnline(value);
    } catch (error) {
      console.error('Toggle status error:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleAcceptRide = async (rideId) => {
    try {
      const response = await rideAPI.acceptRide(rideId);
      if (response.success) {
        Alert.alert('Success', 'Ride accepted!');
        navigation.navigate('RideRequest', { rideId });
      }
    } catch (error) {
      console.error('Accept ride error:', error);
      Alert.alert('Error', 'Failed to accept ride');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Good Morning
            </Text>
            <Text style={[styles.name, { color: colors.text }]}>
              {user?.first_name || 'Driver'} 👋
            </Text>
          </View>
          
          <View style={styles.onlineToggle}>
            <Text style={[styles.onlineText, { color: colors.text }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={isOnline}
              onValueChange={toggleOnlineStatus}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.statIcon}>💰</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              Rs. {stats.today_earnings}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Today's Earnings
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.statIcon}>🚗</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.today_rides}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Today's Rides
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <Text style={styles.statIcon}>⭐</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {stats.rating.toFixed(1)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Your Rating
            </Text>
          </View>
        </View>

        {/* Active Ride */}
        {activeRide && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Active Ride 🚗
            </Text>
            <TouchableOpacity
              style={[styles.rideCard, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('RideRequest', { rideId: activeRide.id })}
            >
              <View style={styles.rideCardHeader}>
                <Text style={styles.rideCardTitle}>Ongoing Ride</Text>
                <Text style={styles.rideCardStatus}>{activeRide.status}</Text>
              </View>
              <Text style={styles.rideCardLocation}>
                📍 {activeRide.pickup_location}
              </Text>
              <Text style={styles.rideCardLocation}>
                🎯 {activeRide.dropoff_location}
              </Text>
              <Text style={styles.rideCardFare}>Rs. {activeRide.fare}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Available Rides */}
        {!activeRide && availableRides.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Available Rides 🎯
            </Text>
            {availableRides.map((ride) => (
              <View
                key={ride.id}
                style={[styles.availableRideCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.rideInfo}>
                  <Text style={[styles.rideLocation, { color: colors.text }]}>
                    📍 {ride.pickup_location}
                  </Text>
                  <Text style={[styles.rideLocation, { color: colors.text }]}>
                    🎯 {ride.dropoff_location}
                  </Text>
                  <View style={styles.rideDetails}>
                    <Text style={[styles.rideDetailText, { color: colors.textSecondary }]}>
                      {ride.distance_km} km • {ride.duration_minutes} min
                    </Text>
                  </View>
                </View>
                <View style={styles.rideActions}>
                  <Text style={[styles.rideFare, { color: colors.primary }]}>
                    Rs. {ride.fare}
                  </Text>
                  <TouchableOpacity
                    style={[styles.acceptButton, { backgroundColor: colors.primary }]}
                    onPress={() => handleAcceptRide(ride.id)}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* No Rides */}
        {!activeRide && availableRides.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No rides available
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {isOnline
                ? 'Waiting for ride requests...'
                : 'Go online to receive ride requests'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
  },
  greeting: {
    fontSize: 14,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  onlineToggle: {
    alignItems: 'center',
  },
  onlineText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rideCard: {
    padding: 20,
    borderRadius: 16,
  },
  rideCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rideCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  rideCardStatus: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textTransform: 'uppercase',
  },
  rideCardLocation: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  rideCardFare: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
  },
  availableRideCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  rideInfo: {
    flex: 1,
  },
  rideLocation: {
    fontSize: 14,
    marginBottom: 4,
  },
  rideDetails: {
    marginTop: 8,
  },
  rideDetailText: {
    fontSize: 12,
  },
  rideActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  rideFare: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  acceptButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
  },
});

export default DashboardScreen;