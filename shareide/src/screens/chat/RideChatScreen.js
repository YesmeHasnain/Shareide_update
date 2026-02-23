import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';
import { pusherService } from '../../utils/pusherService';

const PRIMARY_COLOR = '#FCC014';

const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      );
    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 150);
    const a3 = animate(dot3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  const dotStyle = (dot) => ({
    opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
    transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
  });

  return (
    <View style={styles.typingContainer}>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[styles.typingDot, dotStyle(dot)]} />
        ))}
      </View>
    </View>
  );
};

const RideChatScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const lastTypingSentRef = useRef(0);

  const { rideId, driverId, driverName } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchChatData();
  }, []);

  // Real-time: subscribe to chat channel
  useEffect(() => {
    if (!chatId) return;
    let channel = null;
    const setupRealTime = async () => {
      try {
        channel = await pusherService.subscribe(`chat.${chatId}`);
        if (channel) {
          // New message
          channel.bind('message.sent', (data) => {
            if (data.sender_id !== user?.id) {
              setMessages((prev) => {
                const exists = prev.some((m) => m.id === data.id);
                if (exists) return prev;
                return [...prev, data];
              });
              setIsOtherTyping(false);
              // Mark as read
              client.post(`/chat/${chatId}/mark-read`).catch(() => {});
            }
          });

          // Typing indicator
          channel.bind('user.typing', (data) => {
            if (data.user_id !== user?.id) {
              setIsOtherTyping(true);
              clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => setIsOtherTyping(false), 3000);
            }
          });

          // Read receipts
          channel.bind('messages.read', (data) => {
            if (data.read_by !== user?.id) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.sender_id === user?.id && !m.is_read
                    ? { ...m, is_read: true, read_at: new Date().toISOString() }
                    : m
                )
              );
            }
          });
        }
      } catch (error) {
        console.log('Real-time setup failed, using polling:', error.message);
      }
    };
    setupRealTime();
    return () => {
      if (channel) channel.unbind_all();
      clearTimeout(typingTimeoutRef.current);
    };
  }, [chatId]);

  const fetchChatData = async () => {
    try {
      const chatRes = await client.get(`/chat/ride/${rideId}`);
      if (chatRes.data.success) {
        const chat = chatRes.data.data?.chat;
        const other = chatRes.data.data?.other_user;
        if (chat) {
          setChatId(chat.id);
          setOtherUser(other || { name: driverName || 'Driver' });
          const msgRes = await client.get(`/chat/${chat.id}/messages?per_page=50`);
          if (msgRes.data.success) {
            setMessages(msgRes.data.data?.messages || []);
            const pagination = msgRes.data.data?.pagination;
            if (pagination) {
              setHasMore(pagination.current_page < pagination.total_pages);
            }
          }
          // Mark as read on open
          client.post(`/chat/${chat.id}/mark-read`).catch(() => {});
        }
      }
    } catch (error) {
      console.log('Fetch chat error:', error.message);
      setOtherUser({ name: driverName || 'Driver' });
    } finally {
      setLoading(false);
    }
  };

  const loadOlderMessages = async () => {
    if (!chatId || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const response = await client.get(`/chat/${chatId}/messages?per_page=50&page=${nextPage}`);
      if (response.data.success) {
        const older = response.data.data?.messages || [];
        if (older.length > 0) {
          setMessages((prev) => [...older, ...prev]);
          setPage(nextPage);
        }
        const pagination = response.data.data?.pagination;
        if (pagination) {
          setHasMore(pagination.current_page < pagination.total_pages);
        }
      }
    } catch (error) {
      console.log('Load older messages error:', error.message);
    } finally {
      setLoadingMore(false);
    }
  };

  const sendTypingIndicator = useCallback(() => {
    if (!chatId) return;
    const now = Date.now();
    if (now - lastTypingSentRef.current < 2000) return;
    lastTypingSentRef.current = now;
    client.post(`/chat/${chatId}/typing`).catch(() => {});
  }, [chatId]);

  const handleTextChange = (text) => {
    setInputText(text);
    if (text.length > 0) sendTypingIndicator();
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || !chatId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Optimistic UI: add message immediately
    const tempId = `temp-${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      chat_id: chatId,
      sender_id: user?.id,
      sender_type: 'rider',
      type: 'text',
      message: text,
      is_read: false,
      created_at: new Date().toISOString(),
      _sending: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    setInputText('');

    try {
      const response = await client.post(`/chat/${chatId}/send`, { message: text });
      if (response.data.success) {
        const serverMsg = response.data.data?.message;
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? { ...serverMsg, _sending: false } : m))
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send message';
      const isModerationBlock = error.response?.data?.moderation_blocked;
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      if (isModerationBlock) {
        Alert.alert(
          'Message Blocked',
          errorMsg + '\n\nFor your safety, sharing personal contact info is not allowed.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', errorMsg);
      }
    }
  };

  const pickAndSendImage = async () => {
    if (!chatId) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.length) return;

      setSending(true);
      const asset = result.assets[0];
      const formData = new FormData();
      formData.append('image', {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || 'chat-image.jpg',
      });

      const response = await client.post(`/chat/${chatId}/send-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.data.success) {
        const serverMsg = response.data.data?.message;
        setMessages((prev) => [...prev, serverMsg]);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send image');
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
    const isImage = item.type === 'image';

    return (
      <View style={[styles.messageRow, isMe && styles.messageRowMe]}>
        <View
          style={[
            styles.messageBubble,
            isMe
              ? styles.bubbleMe
              : [styles.bubbleOther, { backgroundColor: isDark ? '#1A1A2E' : '#F0F0F0' }],
            isImage && styles.imageBubble,
          ]}
        >
          {isImage && item.image_url ? (
            <Image
              source={{ uri: item.image_url }}
              style={styles.chatImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={[styles.messageText, { color: isMe ? '#000' : colors.text }]}>
              {item.message}
            </Text>
          )}
          <View style={styles.messageFooter}>
            <Text
              style={[
                styles.messageTime,
                { color: isMe ? 'rgba(0,0,0,0.5)' : colors.textTertiary },
              ]}
            >
              {formatTime(item.created_at)}
            </Text>
            {isMe && (
              <Ionicons
                name="checkmark-done"
                size={14}
                color={item.is_read ? '#34B7F1' : isMe ? 'rgba(0,0,0,0.35)' : colors.textTertiary}
                style={styles.readReceipt}
              />
            )}
          </View>
          {item._sending && (
            <ActivityIndicator size="small" color="rgba(0,0,0,0.3)" style={styles.sendingIndicator} />
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
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
            <Text style={[styles.headerName, { color: colors.text }]}>
              {otherUser?.name || 'Driver'}
            </Text>
            <Text style={[styles.headerStatus, { color: colors.textSecondary }]}>
              {isOtherTyping ? 'typing...' : 'Ride Chat'}
            </Text>
          </View>
        </View>

        <View style={[styles.safeBadge, { backgroundColor: '#10B98120' }]}>
          <Ionicons name="shield-checkmark" size={16} color="#10B981" />
          <Text style={styles.safeText}>Safe</Text>
        </View>
      </View>

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
            contentContainerStyle={[styles.messagesList, { flexGrow: 1 }]}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
            onStartReached={loadOlderMessages}
            onStartReachedThreshold={0.1}
            ListHeaderComponent={
              loadingMore ? (
                <ActivityIndicator size="small" color={PRIMARY_COLOR} style={{ marginVertical: 10 }} />
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Ionicons name="chatbubbles-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.emptyChatText, { color: colors.textSecondary }]}>
                  Start a conversation
                </Text>
                <Text style={[styles.emptyChatSub, { color: colors.textTertiary }]}>
                  Messages are monitored for your safety
                </Text>
              </View>
            }
            ListFooterComponent={isOtherTyping ? <TypingIndicator /> : null}
          />

          {/* Input Bar */}
          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: colors.card,
                paddingBottom: insets.bottom + 8,
                borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              },
            ]}
          >
            <TouchableOpacity
              style={styles.attachBtn}
              onPress={pickAndSendImage}
              disabled={sending}
            >
              <Ionicons name="image-outline" size={24} color={sending ? colors.textTertiary : PRIMARY_COLOR} />
            </TouchableOpacity>

            <TextInput
              style={[
                styles.textInput,
                {
                  backgroundColor: isDark ? '#1A1A2E' : '#F0F0F0',
                  color: colors.text,
                },
              ]}
              placeholder="Type a message..."
              placeholderTextColor={colors.textTertiary}
              value={inputText}
              onChangeText={handleTextChange}
              multiline
              maxLength={1000}
            />

            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor:
                    inputText.trim().length > 0 ? PRIMARY_COLOR : isDark ? '#1A1A2E' : '#E0E0E0',
                },
              ]}
              onPress={sendMessage}
              disabled={inputText.trim().length === 0 || sending}
            >
              <Ionicons
                name="send"
                size={18}
                color={inputText.trim().length > 0 ? '#000' : colors.textTertiary}
              />
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
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
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerName: { fontSize: 16, fontWeight: '600' },
  headerStatus: { fontSize: 12, marginTop: 1 },
  safeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    gap: 4,
  },
  safeText: { fontSize: 12, fontWeight: '600', color: '#10B981' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesList: { padding: 16, paddingBottom: 8 },
  messageRow: { marginBottom: 4 },
  messageRowMe: { alignItems: 'flex-end' },
  messageBubble: { maxWidth: '80%', padding: 10, paddingBottom: 6, borderRadius: 16 },
  bubbleMe: { backgroundColor: PRIMARY_COLOR, borderBottomRightRadius: 4 },
  bubbleOther: { borderBottomLeftRadius: 4 },
  imageBubble: { padding: 4, overflow: 'hidden' },
  chatImage: { width: 200, height: 200, borderRadius: 12 },
  messageText: { fontSize: 15, lineHeight: 20 },
  messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 2 },
  messageTime: { fontSize: 10 },
  readReceipt: { marginLeft: 3 },
  sendingIndicator: { position: 'absolute', bottom: 4, right: 4 },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  emptyChatText: { fontSize: 14, marginTop: 12, fontWeight: '500' },
  emptyChatSub: { fontSize: 12, marginTop: 4 },
  // Typing indicator
  typingContainer: { paddingLeft: 4, marginBottom: 4 },
  typingBubble: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: 'flex-start',
    gap: 4,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#999',
  },
  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  attachBtn: {
    paddingHorizontal: 6,
    paddingBottom: 8,
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 10,
    fontSize: 15,
    maxHeight: 100,
    marginHorizontal: 6,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
});

export default RideChatScreen;
