import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { pusherService } from '../../utils/pusherService';

const PRIMARY_COLOR = '#FCC014';

const SharedRideChatScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { rideId, passengerId, passengerName, passengerPhone, rideInfo } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const presetMessages = [
    "I'm on my way",
    "I've arrived at pickup",
    "Running 5 minutes late",
    "I'm at the pickup point",
    "Ride starting now",
    "Where are you exactly?",
    "Please be ready, departing soon",
    "I'll be there in 5 mins",
    "I'll be there in 10 mins",
    "Is the booking confirmed?",
    "See you soon!",
    "Thank you!",
    "Ride completed, thank you!",
  ];

  useEffect(() => {
    fetchMessages();
    // Fallback polling (15s instead of 5s since we have real-time)
    const interval = setInterval(fetchMessages, 15000);
    return () => clearInterval(interval);
  }, []);

  // Real-time: subscribe to chat channel for instant messages
  useEffect(() => {
    let channel = null;
    const setupRealTime = async () => {
      try {
        const res = await client.get(`/shared-rides/${rideId}/chat`);
        const chatId = res.data.chat_id || res.data.id;
        if (chatId) {
          channel = await pusherService.subscribe(`chat.${chatId}`);
          if (channel) {
            channel.bind('message.sent', (data) => {
              if (data.sender_id !== user?.id) {
                setMessages((prev) => {
                  const exists = prev.some((m) => m.id === data.id);
                  if (exists) return prev;
                  return [...prev, data];
                });
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
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

  const fetchMessages = async () => {
    try {
      const response = await client.get(`/shared-rides/${rideId}/chat`);
      if (response.data.success) {
        const filtered = response.data.chat.filter(
          msg => msg.sender_id === user?.id || msg.sender_id === passengerId ||
                 msg.receiver_id === user?.id || msg.receiver_id === passengerId
        );
        setMessages(filtered);
      }
    } catch (error) {
      console.log('Fetch messages error:', error);
    }
  };

  const sendMessage = async (text = newMessage) => {
    if (!text.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);

    try {
      const response = await client.post(`/shared-rides/${rideId}/chat`, {
        receiver_id: passengerId,
        message: text.trim(),
      });

      if (response.data.success) {
        setNewMessage('');
        fetchMessages();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => {
    const isMe = item.sender_id === user?.id;
    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        <View style={[
          styles.messageBubble,
          isMe ? { backgroundColor: PRIMARY_COLOR } : { backgroundColor: isDark ? '#1A1A2E' : '#F3F4F6' }
        ]}>
          <Text style={[styles.messageText, { color: isMe ? '#000' : colors.text }]}>
            {item.message}
          </Text>
          <Text style={[styles.messageTime, { color: isMe ? 'rgba(0,0,0,0.5)' : colors.textSecondary }]}>
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text }]}>{passengerName || 'Passenger'}</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>Shared Ride Chat</Text>
        </View>

        <View style={styles.headerActions}>
          <View style={[styles.headerBtn, { backgroundColor: '#10B98120' }]}>
            <Ionicons name="shield-checkmark" size={18} color="#10B981" />
          </View>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyChatText, { color: colors.textSecondary }]}>
              Start chatting with the passenger
            </Text>
          </View>
        }
      />

      {/* Preset Messages Only */}
      <View style={[styles.presetContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <Text style={[styles.presetLabel, { color: colors.textSecondary }]}>
          Tap a message to send
        </Text>
        <FlatList
          data={presetMessages}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          contentContainerStyle={styles.presetGrid}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.presetBtn, { backgroundColor: isDark ? '#1A1A2E' : '#F3F4F6' }]}
              onPress={() => sendMessage(item)}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={[styles.presetBtnText, { color: colors.text }]} numberOfLines={2}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(252, 192, 20, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageRow: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  messageRowMe: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 15,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  emptyChat: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyChatText: {
    fontSize: 14,
    marginTop: 12,
  },
  presetContainer: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingBottom: 16,
    paddingHorizontal: 12,
    maxHeight: 220,
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

export default SharedRideChatScreen;
