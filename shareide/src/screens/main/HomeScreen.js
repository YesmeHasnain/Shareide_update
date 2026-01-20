import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const HomeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();

  const quickActions = [
    { id: 1, icon: '', label: 'Saved Places', screen: 'SavedPlaces' },
    { id: 2, icon: '', label: 'Schedule', screen: 'Schedule' },
    { id: 3, icon: '', label: 'Promos', screen: 'PromoCodes' },
    { id: 4, icon: '', label: 'Support', screen: 'Support' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Text style={styles.menuIcon}></Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SHAREIDE</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
          <Text style={styles.notificationIcon}></Text>
        </TouchableOpacity>
      </View>

      <ScrollView>
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>
            Hello, {user?.name?.split(' ')[0]}! 
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Where do you want to go today?
          </Text>
        </View>

        <View style={[styles.searchCard, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.searchRow} onPress={() => navigation.navigate('LocationSearch', { type: 'pickup' })}>
            <Text style={styles.searchIcon}></Text>
            <Text style={[styles.searchText, { color: colors.textSecondary }]}>Pickup location</Text>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.searchRow} onPress={() => navigation.navigate('LocationSearch', { type: 'dropoff' })}>
            <Text style={styles.searchIcon}></Text>
            <Text style={[styles.searchText, { color: colors.textSecondary }]}>Dropoff location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.findButton, { backgroundColor: colors.primary }]}>
            <Text style={styles.findButtonText}> Find Ride</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActionsContainer}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.actionCard, { backgroundColor: colors.surface }]}
              onPress={() => navigation.navigate(action.screen)}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={[styles.actionLabel, { color: colors.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.recentSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Rides</Text>
            <TouchableOpacity onPress={() => navigation.navigate('BookingsTab')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Text style={styles.emptyEmoji}></Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No recent rides yet</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 50, paddingBottom: 16 },
  menuIcon: { fontSize: 24, color: '#000' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
  notificationIcon: { fontSize: 24 },
  welcomeSection: { padding: 20 },
  welcomeText: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 16 },
  searchCard: { marginHorizontal: 20, borderRadius: 16, padding: 20, marginBottom: 24 },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  searchIcon: { fontSize: 20, marginRight: 12 },
  searchText: { fontSize: 16 },
  divider: { height: 1, marginVertical: 8 },
  findButton: { marginTop: 16, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  findButtonText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  quickActionsContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 12, marginBottom: 24 },
  actionCard: { width: '47%', aspectRatio: 1.5, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  actionIcon: { fontSize: 40, marginBottom: 8 },
  actionLabel: { fontSize: 14, fontWeight: '600' },
  recentSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  seeAll: { fontSize: 14, fontWeight: '600' },
  emptyState: { borderRadius: 12, padding: 40, alignItems: 'center' },
  emptyEmoji: { fontSize: 60, marginBottom: 12 },
  emptyText: { fontSize: 16 },
});

export default HomeScreen;
