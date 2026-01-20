import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import Button from '../../components/Button';
import { rideAPI } from '../../api/ride';

const RideRequestScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { rideId } = route.params;
  
  const [loading, setLoading] = useState(false);
  const [ride, setRide] = useState(null);

  useEffect(() => {
    fetchRideDetails();
  }, []);

  const fetchRideDetails = async () => {
    try {
      const response = await rideAPI.getRideDetails(rideId);
      if (response.success) {
        setRide(response.data.ride);
      }
    } catch (error) {
      console.error('Fetch ride error:', error);
      Alert.alert('Error', 'Failed to load ride details');
      navigation.goBack();
    }
  };

  const handleUpdateStatus = async (status) => {
    setLoading(true);
    try {
      const response = await rideAPI.updateRideStatus(rideId, status);
      if (response.success) {
        Alert.alert('Success', `Ride ${status}!`);
        fetchRideDetails();
        
        if (status === 'completed') {
          navigation.navigate('Dashboard');
        }
      }
    } catch (error) {
      console.error('Update status error:', error);
      Alert.alert('Error', 'Failed to update ride status');
    } finally {
      setLoading(false);
    }
  };

  const handleStartRide = () => {
    Alert.alert(
      'Start Ride',
      'Are you sure you want to start this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Start', onPress: () => handleUpdateStatus('started') },
      ]
    );
  };

  const handleCompleteRide = () => {
    Alert.alert(
      'Complete Ride',
      'Are you sure you want to complete this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Complete', onPress: () => handleUpdateStatus('completed') },
      ]
    );
  };

  const handleCancelRide = () => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: () => handleUpdateStatus('cancelled') },
      ]
    );
  };

  const handleOpenChat = () => {
    navigation.navigate('Chat', { rideId });
  };

  if (!ride) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusColor = () => {
    switch (ride.status) {
      case 'matched': return colors.info;
      case 'accepted': return colors.warning;
      case 'started': return colors.success;
      case 'completed': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Ride Details</Text>
          <View style={styles.backButton} />
        </View>

        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {ride.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Rider Info */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Rider Information</Text>
          <View style={styles.riderInfo}>
            <View style={styles.riderAvatar}>
              <Text style={styles.riderAvatarText}>
                {ride.user?.name?.charAt(0) || 'R'}
              </Text>
            </View>
            <View style={styles.riderDetails}>
              <Text style={[styles.riderName, { color: colors.text }]}>
                {ride.user?.name || 'Rider'}
              </Text>
              {ride.user?.rating && (
                <Text style={[styles.riderRating, { color: colors.textSecondary }]}>
                  ⭐ {ride.user.rating.toFixed(1)}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={[styles.chatButton, { backgroundColor: colors.primary }]}
              onPress={handleOpenChat}
            >
              <Text style={styles.chatButtonText}>💬</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Route Info */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Route Details</Text>
          
          <View style={styles.routeItem}>
            <View style={styles.routeIcon}>
              <Text style={styles.routeIconText}>📍</Text>
            </View>
            <View style={styles.routeDetails}>
              <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>Pickup</Text>
              <Text style={[styles.routeText, { color: colors.text }]}>
                {ride.pickup_location}
              </Text>
            </View>
          </View>

          <View style={styles.routeDivider} />

          <View style={styles.routeItem}>
            <View style={styles.routeIcon}>
              <Text style={styles.routeIconText}>🎯</Text>
            </View>
            <View style={styles.routeDetails}>
              <Text style={[styles.routeLabel, { color: colors.textSecondary }]}>Dropoff</Text>
              <Text style={[styles.routeText, { color: colors.text }]}>
                {ride.dropoff_location}
              </Text>
            </View>
          </View>

          <View style={styles.routeStats}>
            <View style={styles.routeStat}>
              <Text style={[styles.routeStatValue, { color: colors.text }]}>
                {ride.distance_km} km
              </Text>
              <Text style={[styles.routeStatLabel, { color: colors.textSecondary }]}>
                Distance
              </Text>
            </View>
            <View style={styles.routeStat}>
              <Text style={[styles.routeStatValue, { color: colors.text }]}>
                {ride.duration_minutes} min
              </Text>
              <Text style={[styles.routeStatLabel, { color: colors.textSecondary }]}>
                Duration
              </Text>
            </View>
          </View>
        </View>

        {/* Fare Info */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Fare Details</Text>
          
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Total Fare</Text>
            <Text style={[styles.fareValue, { color: colors.text }]}>
              Rs. {ride.fare}
            </Text>
          </View>
          
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Commission (20%)</Text>
            <Text style={[styles.fareValue, { color: colors.error }]}>
              - Rs. {ride.commission_amount}
            </Text>
          </View>
          
          <View style={[styles.fareDivider, { backgroundColor: colors.border }]} />
          
          <View style={styles.fareRow}>
            <Text style={[styles.fareLabelBold, { color: colors.text }]}>Your Earning</Text>
            <Text style={[styles.fareValueBold, { color: colors.primary }]}>
              Rs. {ride.driver_earning}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {ride.status === 'accepted' && (
            <>
              <Button
                title="Start Ride"
                onPress={handleStartRide}
                loading={loading}
                style={styles.actionButton}
              />
              <Button
                title="Cancel Ride"
                onPress={handleCancelRide}
                variant="outline"
                style={styles.actionButton}
              />
            </>
          )}

          {ride.status === 'started' && (
            <>
              <Button
                title="Complete Ride"
                onPress={handleCompleteRide}
                loading={loading}
                style={styles.actionButton}
              />
              <Button
                title="Contact Rider"
                onPress={handleOpenChat}
                variant="outline"
                style={styles.actionButton}
              />
            </>
          )}

          {ride.status === 'completed' && (
            <Button
              title="Back to Dashboard"
              onPress={() => navigation.navigate('Dashboard')}
              style={styles.actionButton}
            />
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
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
  },
  backIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  riderAvatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  riderDetails: {
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  riderRating: {
    fontSize: 14,
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatButtonText: {
    fontSize: 20,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeIcon: {
    marginRight: 12,
  },
  routeIconText: {
    fontSize: 24,
  },
  routeDetails: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  routeText: {
    fontSize: 16,
  },
  routeDivider: {
    width: 2,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginLeft: 12,
    marginVertical: 8,
  },
  routeStats: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  routeStat: {
    flex: 1,
    alignItems: 'center',
  },
  routeStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  routeStatLabel: {
    fontSize: 12,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  fareLabel: {
    fontSize: 14,
  },
  fareValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  fareLabelBold: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  fareValueBold: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  fareDivider: {
    height: 1,
    marginVertical: 12,
  },
  actionsContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  actionButton: {
    marginBottom: 12,
  },
});

export default RideRequestScreen;