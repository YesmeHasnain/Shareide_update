import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const PRIMARY_COLOR = '#FCC014';

const RideChatScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);

  const { rideId, driverId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [rideInfo, setRideInfo] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    fetchChatData();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

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
        setRideInfo(rideRes.data.ride);
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

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const response = await client.post(`/shared-rides/${rideId}/chat`, {
        message: messageText,
      });

      if (response.data.success) {
        setMessages((prev) => [...prev, response.data.message]);
        setTimeout(() => flatListRef.current?.scrollToEnd(), 100);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const shareLocationOnWhatsApp = () => {
    if (!rideInfo) return;

    const phone = otherUser?.phone?.replace(/[^0-9]/g, '');
    const message = `📍 Track my ride!\n\nFrom: ${rideInfo.pickup_address}\nTo: ${rideInfo.dropoff_address}\n\nDriver Location: https://maps.google.com/?q=${rideInfo.driver_lat || rideInfo.pickup_lat},${rideInfo.driver_lng || rideInfo.pickup_lng}`;

    if (phone) {
      Linking.openURL(`whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`);
    } else {
      Linking.openURL(`whatsapp://send?text=${encodeURIComponent(message)}`);
    }
  };

  const callUser = () => {
    if (otherUser?.phone) {
      Linking.openURL(`tel:${otherUser.phone}`);
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

  const quickMessages = [
    "I'm on my way!",
    "Where are you exactly?",
    "Please wait, coming in 2 mins",
    "Can you share location?",
  ];

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
            <Text style={[styles.headerName, { color: colors.text }]}>{otherUser?.name || 'User'}</Text>
            <Text style={[styles.headerStatus, { color: colors.textSecondary }]}>
              {rideInfo?.status === 'active' ? 'Active ride' : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: colors.inputBackground }]} onPress={callUser}>
            <Ionicons name="call" size={18} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: '#25D366' }]} onPress={shareLocationOnWhatsApp}>
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Ride Info Banner */}
      {rideInfo && (
        <View style={[styles.rideBanner, { backgroundColor: PRIMARY_COLOR + '15' }]}>
          <Ionicons name="car" size={18} color={PRIMARY_COLOR} />
          <Text style={[styles.rideBannerText, { color: colors.text }]} numberOfLines={1}>
            {rideInfo.pickup_address} → {rideInfo.dropoff_address}
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        </View>
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
          keyboardVerticalOffset={0}
        >
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
                  Start the conversation!
                </Text>
              </View>
            }
          />

          {/* Quick Messages */}
          <View style={styles.quickMessagesRow}>
            <FlatList
              horizontal
              data={quickMessages}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.quickMsgBtn, { backgroundColor: colors.inputBackground }]}
                  onPress={() => setNewMessage(item)}
                >
                  <Text style={[styles.quickMsgText, { color: colors.text }]}>{item}</Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.quickMsgList}
            />
          </View>

          {/* Input */}
          <View style={[styles.inputContainer, { backgroundColor: colors.card, paddingBottom: insets.bottom + 10 }]}>
            <View style={[styles.inputBox, { backgroundColor: colors.inputBackground }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={newMessage}
                onChangeText={setNewMessage}
                placeholder="Type a message..."
                placeholderTextColor={colors.textSecondary}
                multiline
                maxLength={500}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendBtn, { opacity: sending || !newMessage.trim() ? 0.5 : 1 }]}
              onPress={sendMessage}
              disabled={sending || !newMessage.trim()}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Ionicons name="send" size={20} color="#000" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
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
  headerActions: { flexDirection: 'row', gap: 8 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
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
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 100 },
  emptyChatText: { fontSize: 14, marginTop: 12 },
  quickMessagesRow: { borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)', paddingVertical: 8 },
  quickMsgList: { paddingHorizontal: 16 },
  quickMsgBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  quickMsgText: { fontSize: 13 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
  },
  inputBox: { flex: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, maxHeight: 100 },
  input: { fontSize: 15, lineHeight: 20 },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: PRIMARY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RideChatScreen;
