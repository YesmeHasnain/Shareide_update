import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const PRIMARY_COLOR = '#FCC014';

const SharedRideChatScreen = ({ navigation, route }) => {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const { rideId, passengerId, passengerName, passengerPhone, rideInfo } = route.params || {};

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);

  const quickMessages = [
    "I'm on my way",
    "Running 5 mins late",
    "I'm at the pickup point",
    "See you soon!",
  ];

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, []);

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

  const shareLocationOnWhatsApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const phone = passengerPhone?.replace(/[^0-9]/g, '') || '';
    const message = `I'm your driver for the shared ride!\n\nFrom: ${rideInfo?.pickup_address || 'Pickup'}\nTo: ${rideInfo?.dropoff_address || 'Dropoff'}\n\nSee you soon!`;
    Linking.openURL(`whatsapp://send?phone=${phone}&text=${encodeURIComponent(message)}`);
  };

  const callPassenger = () => {
    if (passengerPhone) {
      Linking.openURL(`tel:${passengerPhone}`);
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
          <TouchableOpacity style={styles.headerBtn} onPress={callPassenger}>
            <Ionicons name="call" size={20} color={PRIMARY_COLOR} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} onPress={shareLocationOnWhatsApp}>
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          </TouchableOpacity>
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

      {/* Quick Messages */}
      <View style={[styles.quickMessages, { borderTopColor: colors.border }]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={quickMessages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.quickBtn, { backgroundColor: isDark ? '#1A1A2E' : '#F3F4F6' }]}
              onPress={() => sendMessage(item)}
            >
              <Text style={[styles.quickBtnText, { color: colors.text }]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[styles.input, { backgroundColor: isDark ? '#1A1A2E' : '#F3F4F6', color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: PRIMARY_COLOR, opacity: loading ? 0.5 : 1 }]}
            onPress={() => sendMessage()}
            disabled={loading || !newMessage.trim()}
          >
            <Ionicons name="send" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  quickMessages: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
  },
  quickBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SharedRideChatScreen;
