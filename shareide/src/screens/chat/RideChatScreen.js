import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { pusherService } from '../../utils/pusherService';

const PRIMARY_COLOR = '#FCC014';

const PRESET_MESSAGES = [
  "I'm on my way",
  "Where are you exactly?",
  "Please wait, coming in 2 mins",
  "Can you share your location?",
  "I'm at the pickup point",
  "Running 5 minutes late",
  "Is the ride still available?",
  "What time will you depart?",
  "Thank you!",
  "Cancel my booking please",
];

const RideChatScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const { rideId, driverId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [rideInfo, setRideInfo] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    fetchChatData();
    // Fallback polling (15s instead of 5s since we have real-time)
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  // Real-time: subscribe to chat channel for instant messages
  useEffect(() => {
    let channel = null;
    const setupRealTime = async () => {
      try {
        // We use rideId to get/create the chat, then subscribe to that chat's channel
        const res = await client.get(`/shared-rides/${rideId}/chat`);
        const chatId = res.data.chat_id || res.data.id;
        if (chatId) {
          channel = await pusherService.subscribe(`chat.${chatId}`);
          if (channel) {
            channel.bind('message.sent', (data) => {
              // Only add if not from current user
              if (data.sender_id !== user?.id) {
                setMessages((prev) => {
                  const exists = prev.some((m) => m.id === data.id);
                  if (exists) return prev;
                  return [...prev, data];
                });
                setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
              }
            });
          }
        }
      } catch (error) {
        console.log('Real-time setup failed, using polling:', error.message);
      }
    };
    setupRealTime();
    return () => {
      if (channel) {
        channel.unbind_all();
      }
    };
  }, [rideId]);

  const fetchChatData = async () => {
    try {
      const [chatRes, rideRes] = await Promise.all([
        client.get(`/shared-rides/${rideId}/chat`),
        client.get(`/shared-rides/${rideId}`),
      ]);

      if (chatRes.data.success) {
        setMessages(chatRes.data.messages || []);
        setOtherUser(chatRes.data.other_user);
      }
      if (rideRes.data.success) {
        setRideInfo(rideRes.data.ride || rideRes.data.data?.ride);
      }
    } catch (error) {
      console.log('Fetch chat error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await client.get(`/shared-rides/${rideId}/chat`);
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {}
  };

  const sendPresetMessage = async (text) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSending(true);

    try {
      const response = await client.post(`/shared-rides/${rideId}/chat`, {
        message: text,
      });

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.message]);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === user?.id;

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        <View style={[
          styles.messageBubble,
          isMe ? styles.bubbleMe : [styles.bubbleOther, { backgroundColor: colors.inputBackground }],
        ]}>
          <Text style={[styles.messageText, { color: isMe ? '#000' : colors.text }]}>
            {item.message}
          </Text>
          <Text style={[styles.messageTime, { color: isMe ? 'rgba(0,0,0,0.5)' : colors.textTertiary }]}>
            {formatTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={[styles.avatar, { backgroundColor: PRIMARY_COLOR + '20' }]}>
            <Ionicons name="person" size={18} color={PRIMARY_COLOR} />
          </View>
          <View>
            <Text style={[styles.headerName, { color: colors.text }]}>{otherUser?.name || 'Driver'}</Text>
            <Text style={[styles.headerStatus, { color: colors.textSecondary }]}>Shared Ride Chat</Text>
          </View>
        </View>

        <View style={[styles.safeBadge, { backgroundColor: '#10B98120' }]}>
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          <Text style={styles.safeText}>Safe</Text>
        </View>
      </View>

      {/* Ride Info Banner */}
      {rideInfo && (
        <View style={[styles.rideBanner, { backgroundColor: PRIMARY_COLOR + '15' }]}>
          <Ionicons name="car" size={18} color={PRIMARY_COLOR} />
          <Text style={[styles.rideBannerText, { color: colors.text }]} numberOfLines={1}>
            {rideInfo.from?.address || rideInfo.pickup_address} → {rideInfo.to?.address || rideInfo.dropoff_address}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      ) : (
        <>
          {/* Messages */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item, index) => item.id?.toString() || index.toString()}
            renderItem={renderMessage}
            contentContainerStyle={styles.messagesList}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.emptyChatText, { color: colors.textSecondary }]}>
                  Send a preset message to start chatting
                </Text>
                <Text style={[styles.emptyChatSub, { color: colors.textTertiary }]}>
                  For your safety, only preset messages are allowed
                </Text>
              </View>
            }
          />

          {/* Preset Messages Only - No Free Text */}
          <View style={[styles.presetContainer, { backgroundColor: colors.card, paddingBottom: insets.bottom + 16 }]}>
            <Text style={[styles.presetLabel, { color: colors.textSecondary }]}>
              Tap a message to send
            </Text>
            <FlatList
              data={PRESET_MESSAGES}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              scrollEnabled={false}
              contentContainerStyle={styles.presetGrid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.presetBtn, { backgroundColor: colors.inputBackground }]}
                  onPress={() => sendPresetMessage(item)}
                  disabled={sending}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.presetBtnText, { color: colors.text }]} numberOfLines={2}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerInfo: { flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 12 },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  headerName: { fontSize: 16, fontWeight: '600' },
  headerStatus: { fontSize: 12 },
  safeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  safeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  rideBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  rideBannerText: { fontSize: 13, flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: { padding: 16, flexGrow: 1 },
  messageRow: { marginBottom: 8 },
  messageRowMe: { alignItems: 'flex-end' },
  messageBubble: { maxWidth: '80%', padding: 12, borderRadius: 16 },
  bubbleMe: { backgroundColor: PRIMARY_COLOR, borderBottomRightRadius: 4 },
  bubbleOther: { borderBottomLeftRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageTime: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyChatText: { fontSize: 14, marginTop: 12, fontWeight: '500' },
  emptyChatSub: { fontSize: 12, marginTop: 4 },
  // Preset messages
  presetContainer: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  presetLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  presetGrid: {
    paddingHorizontal: 4,
  },
  presetBtn: {
    flex: 1,
    margin: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  presetBtnText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default RideChatScreen;
