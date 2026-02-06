import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { loyaltyAPI } from '../../api/loyalty';

const PRIMARY_COLOR = '#FCC014';

const PointsHistoryScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [points, setPoints] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = useCallback(async (pageNum = 1, refresh = false) => {
    try {
      const response = await loyaltyAPI.getPointsHistory(pageNum);
      const data = response.data?.data || response.data || [];
      const lastPage = response.data?.last_page || 1;

      if (refresh || pageNum === 1) {
        setPoints(data);
      } else {
        setPoints((prev) => [...prev, ...data]);
      }

      setHasMore(pageNum < lastPage);
      setPage(pageNum);
    } catch (error) {
      console.log('Error fetching points history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const onRefresh = () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchHistory(1, true);
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchHistory(page + 1);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    const hours = date.getHours();
    const mins = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${day} ${month} ${year}, ${hour12}:${mins} ${ampm}`;
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earned':
        return 'add-circle';
      case 'redeemed':
        return 'gift';
      case 'expired':
        return 'time';
      case 'bonus':
        return 'star';
      default:
        return 'swap-horizontal';
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View
        style={[
          styles.historyIcon,
          { backgroundColor: item.points > 0 ? '#D1FAE5' : '#FEE2E2' },
        ]}
      >
        <Ionicons
          name={item.points > 0 ? 'add' : 'remove'}
          size={20}
          color={item.points > 0 ? '#10B981' : '#EF4444'}
        />
      </View>
      <View style={styles.historyInfo}>
        <Text style={styles.historyTitle}>{item.description}</Text>
        <Text style={styles.historyDate}>{formatDate(item.created_at)}</Text>
        {item.reference_type && (
          <Text style={styles.historyRef}>
            {item.reference_type === 'ride' ? 'Ride' : item.reference_type}
            {item.reference_id ? ` #${item.reference_id}` : ''}
          </Text>
        )}
      </View>
      <View style={styles.pointsContainer}>
        <Text
          style={[
            styles.historyPoints,
            { color: item.points > 0 ? '#10B981' : '#EF4444' },
          ]}
        >
          {item.points > 0 ? '+' : ''}
          {item.points}
        </Text>
        <Text style={styles.pointsLabel}>pts</Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Ionicons name="time-outline" size={48} color="#9CA3AF" />
      </View>
      <Text style={styles.emptyTitle}>No History Yet</Text>
      <Text style={styles.emptyMessage}>
        Your points history will appear here as you earn and redeem points.
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={PRIMARY_COLOR} />
      </View>
    );
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
          <Text style={styles.headerTitle}>Points History</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>Points History</Text>
        <View style={styles.placeholder} />
      </View>

      <FlatList
        data={points}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={PRIMARY_COLOR}
            colors={[PRIMARY_COLOR]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
      />
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
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  historyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyInfo: {
    flex: 1,
    marginLeft: 14,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  historyDate: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  historyRef: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  historyPoints: {
    fontSize: 18,
    fontWeight: '700',
  },
  pointsLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 60,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default PointsHistoryScreen;
