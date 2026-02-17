import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { spacing, typography, borderRadius } from '../../theme/colors';
import {
  sendChatbotMessage,
  createTicket,
  pollNewMessages,
  replyToTicket,
  uploadAttachment,
  sendTypingSignal,
  sendActivityPing,
  goOffline,
} from '../../api/support';

const PHASES = { BOT: 'bot', ESCALATING: 'escalating', LIVE: 'live' };

const BOT_GREETING = 'Assalam-o-Alaikum! 👋 Main ShareIde AI Assistant hoon. Aap kisi bhi ride, payment, ya app masle mein madad le sakte hain. Kya issue hai?';

const QUICK_REPLIES = [
  'Meri ride ka issue hai',
  'Payment problem',
  'App crash ho rahi hai',
  'Driver se complaint',
  'Account issue',
  'Kuch aur madad chahiye',
];

const CATEGORY_MAP = {
  'ride': 'ride_issue',
  'payment': 'payment',
  'app': 'app_bug',
  'driver': 'driver_behavior',
  'account': 'account',
};

const SupportChatScreen = ({ navigation }) => {
  const theme = useTheme();
  const colors = theme?.colors || {
    primary: '#FCC014',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#1A1A2E',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    gradients: { premium: ['#FFD700', '#FFA500'] },
  };
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const flatListRef = useRef(null);

  const [phase, setPhase] = useState(PHASES.BOT);
  const [messages, setMessages] = useState([
    { id: 'bot-greeting', text: BOT_GREETING, isBot: true, isAdmin: false, timestamp: new Date() },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  // Live chat state
  const [replyToken, setReplyToken] = useState(null);
  const [lastMessageId, setLastMessageId] = useState(0);
  const [agentInfo, setAgentInfo] = useState(null);
  const [adminTyping, setAdminTyping] = useState(false);
  const pollIntervalRef = useRef(null);
  const activityIntervalRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (activityIntervalRef.current) clearInterval(activityIntervalRef.current);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (replyToken) {
        goOffline(replyToken).catch(() => {});
      }
    };
  }, [replyToken]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const addMessage = useCallback((msg) => {
    setMessages(prev => [...prev, msg]);
    scrollToEnd();
  }, [scrollToEnd]);

  // ===== BOT PHASE =====
  const handleBotSend = async (text) => {
    if (!text.trim() || loading) return;

    const userMsg = { id: `user-${Date.now()}`, text: text.trim(), isBot: false, isAdmin: false, timestamp: new Date() };
    addMessage(userMsg);
    setInputText('');
    setLoading(true);

    const newHistory = [...conversationHistory, { role: 'user', content: text.trim() }];
    setConversationHistory(newHistory);

    try {
      const response = await sendChatbotMessage(text.trim(), newHistory);

      if (response.success) {
        const botReply = response.reply || response.message || 'Sorry, I could not understand that.';
        const shouldEscalate = response.escalate === true;

        setConversationHistory(prev => [...prev, { role: 'assistant', content: botReply }]);

        addMessage({
          id: `bot-${Date.now()}`,
          text: botReply,
          isBot: true,
          isAdmin: false,
          timestamp: new Date(),
        });

        if (shouldEscalate) {
          setTimeout(() => handleEscalation(text.trim()), 1500);
        }
      }
    } catch (error) {
      addMessage({
        id: `bot-err-${Date.now()}`,
        text: 'Connection issue. Aap "Talk to Agent" button daba kar live agent se baat kar sakte hain.',
        isBot: true,
        isAdmin: false,
        timestamp: new Date(),
      });
    }
    setLoading(false);
  };

  const handleEscalation = async (lastUserMessage) => {
    setPhase(PHASES.ESCALATING);

    addMessage({
      id: `system-esc-${Date.now()}`,
      text: 'Aapko live agent se connect kar rahe hain...',
      isSystem: true,
      timestamp: new Date(),
    });

    // Build transcript
    const transcript = conversationHistory.map(m =>
      `${m.role === 'user' ? 'User' : 'Bot'}: ${m.content}`
    ).join('\n');

    // Detect category
    const lowerMsg = (lastUserMessage || '').toLowerCase();
    let category = 'other';
    for (const [key, val] of Object.entries(CATEGORY_MAP)) {
      if (lowerMsg.includes(key)) { category = val; break; }
    }

    const subject = `[App Chat] ${lastUserMessage?.substring(0, 60) || 'Support Request'}`;
    const description = `${lastUserMessage || 'User requested live agent'}\n\n--- Bot Conversation Transcript ---\n${transcript}\n--- End of Bot Transcript ---`;

    try {
      const result = await createTicket({
        subject,
        message: description,
        category,
        priority: 'medium',
        source: 'chatbot_app_shareide',
      });

      if (result.success && result.reply_token) {
        setReplyToken(result.reply_token);
        setPhase(PHASES.LIVE);

        addMessage({
          id: `system-connected-${Date.now()}`,
          text: `Ticket created: ${result.ticket_number}. Aap ab live agent se baat kar sakte hain!`,
          isSystem: true,
          timestamp: new Date(),
        });

        startPolling(result.reply_token);
        startActivityPing(result.reply_token);
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch (error) {
      setPhase(PHASES.BOT);
      addMessage({
        id: `system-err-${Date.now()}`,
        text: 'Agent se connect nahi ho saka. Please dubara try karein.',
        isSystem: true,
        timestamp: new Date(),
      });
    }
  };

  // ===== LIVE CHAT PHASE =====
  const startPolling = (token) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const data = await pollNewMessages(token, lastMessageId);
        if (data.success) {
          setAdminTyping(data.admin_typing || false);

          if (data.agent) {
            setAgentInfo(data.agent);
          }

          if (data.messages && data.messages.length > 0) {
            data.messages.forEach(msg => {
              if (msg.is_admin) {
                setMessages(prev => {
                  if (prev.find(m => m.serverId === msg.id)) return prev;
                  return [...prev, {
                    id: `admin-${msg.id}`,
                    serverId: msg.id,
                    text: msg.message,
                    isBot: false,
                    isAdmin: true,
                    senderName: msg.sender,
                    senderInitial: msg.sender_initial,
                    attachment: msg.attachment,
                    attachmentName: msg.attachment_name,
                    timestamp: new Date(),
                  }];
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              setLastMessageId(prev => Math.max(prev, msg.id));
            });
            scrollToEnd();
          }
        }
      } catch (e) {}
    }, 3000);
  };

  const startActivityPing = (token) => {
    if (activityIntervalRef.current) clearInterval(activityIntervalRef.current);
    activityIntervalRef.current = setInterval(() => {
      sendActivityPing(token).catch(() => {});
    }, 60000);
    // Send initial ping
    sendActivityPing(token).catch(() => {});
  };

  const handleLiveSend = async (text) => {
    if (!text.trim() || loading || !replyToken) return;

    const userMsg = {
      id: `user-live-${Date.now()}`,
      text: text.trim(),
      isBot: false,
      isAdmin: false,
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setInputText('');
    setLoading(true);

    try {
      const result = await replyToTicket(replyToken, text.trim());
      if (result.message_id) {
        setLastMessageId(prev => Math.max(prev, result.message_id));
      }
    } catch (error) {
      Alert.alert('Error', 'Message send nahi ho saka. Try again.');
    }
    setLoading(false);
  };

  const handleAttachment = async () => {
    if (!replyToken) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Photo library access chahiye attachment bhejne ke liye.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      setLoading(true);

      const file = {
        uri: asset.uri,
        type: asset.mimeType || 'image/jpeg',
        name: asset.fileName || `photo_${Date.now()}.jpg`,
      };

      addMessage({
        id: `user-file-${Date.now()}`,
        text: '',
        isBot: false,
        isAdmin: false,
        attachment: asset.uri,
        attachmentName: file.name,
        timestamp: new Date(),
      });

      try {
        const response = await uploadAttachment(replyToken, file, '');
        if (response.message_id) {
          setLastMessageId(prev => Math.max(prev, response.message_id));
        }
      } catch (error) {
        Alert.alert('Error', 'File upload nahi ho saki. Try again.');
      }
      setLoading(false);
    }
  };

  const handleInputChange = (text) => {
    setInputText(text);
    if (phase === PHASES.LIVE && replyToken) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingSignal(replyToken).catch(() => {});
      }, 500);
    }
  };

  const handleSend = () => {
    if (phase === PHASES.BOT) {
      handleBotSend(inputText);
    } else if (phase === PHASES.LIVE) {
      handleLiveSend(inputText);
    }
  };

  const renderMessage = ({ item }) => {
    if (item.isSystem) {
      return (
        <View style={styles.systemMsgContainer}>
          <View style={[styles.systemMsgBubble, { backgroundColor: colors.primary + '20' }]}>
            <Ionicons name="information-circle" size={14} color={colors.primary} />
            <Text style={[styles.systemMsgText, { color: colors.text }]}>{item.text}</Text>
          </View>
        </View>
      );
    }

    if (item.isBot) {
      return (
        <View style={styles.botMsgRow}>
          <View style={[styles.botAvatar, { backgroundColor: colors.primary }]}>
            <Ionicons name="sparkles" size={16} color="#000" />
          </View>
          <View style={[styles.botBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.msgText, { color: colors.text }]}>{item.text}</Text>
            <Text style={[styles.msgTime, { color: colors.textSecondary }]}>
              {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
      );
    }

    if (item.isAdmin) {
      return (
        <View style={styles.botMsgRow}>
          <View style={[styles.agentAvatar]}>
            {agentInfo?.profile_picture ? (
              <Image source={{ uri: agentInfo.profile_picture }} style={styles.agentAvatarImage} />
            ) : (
              <LinearGradient colors={['#FCC014', '#F5A623']} style={styles.agentAvatarGradient}>
                <Text style={styles.agentAvatarText}>{agentInfo?.initial || item.senderInitial || 'S'}</Text>
              </LinearGradient>
            )}
          </View>
          <View style={styles.adminBubbleWrapper}>
            <Text style={[styles.adminSenderName, { color: colors.textSecondary }]}>
              {item.senderName || agentInfo?.name || 'Support Agent'}
            </Text>
            <View style={[styles.adminBubble]}>
              {item.attachment && (
                <Image source={{ uri: item.attachment }} style={styles.attachmentImage} resizeMode="cover" />
              )}
              {item.text ? <Text style={styles.adminMsgText}>{item.text}</Text> : null}
              <Text style={styles.adminMsgTime}>
                {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // User message
    return (
      <View style={styles.userMsgRow}>
        <View style={[styles.userBubble]}>
          {item.attachment && (
            <Image source={{ uri: item.attachment }} style={styles.attachmentImage} resizeMode="cover" />
          )}
          {item.text ? <Text style={styles.userMsgText}>{item.text}</Text> : null}
          <Text style={styles.userMsgTime}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
        style={[styles.header, { paddingTop: insets.top + 8 }]}
      >
        <TouchableOpacity
          style={styles.headerBack}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.goBack();
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {phase === PHASES.LIVE && agentInfo ? (
            <View style={styles.headerAgentInfo}>
              <View style={styles.headerAgentAvatarWrap}>
                {agentInfo.profile_picture ? (
                  <Image source={{ uri: agentInfo.profile_picture }} style={styles.headerAgentAvatar} />
                ) : (
                  <View style={styles.headerAgentAvatarPlaceholder}>
                    <Text style={styles.headerAgentAvatarText}>{agentInfo.initial || 'S'}</Text>
                  </View>
                )}
                <View style={styles.headerOnlineDot} />
              </View>
              <View>
                <Text style={styles.headerTitle}>{agentInfo.name}</Text>
                <Text style={styles.headerSubtitle}>Support Agent - Online</Text>
              </View>
            </View>
          ) : (
            <View>
              <Text style={styles.headerTitle}>
                {phase === PHASES.BOT ? 'AI Support' : 'Connecting...'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {phase === PHASES.BOT ? 'Powered by Gemini AI' : 'Please wait'}
              </Text>
            </View>
          )}
        </View>
        {phase === PHASES.BOT && (
          <TouchableOpacity
            style={styles.headerAction}
            onPress={() => handleEscalation(conversationHistory[conversationHistory.length - 1]?.content || '')}
          >
            <Ionicons name="person" size={18} color="#000" />
            <Text style={styles.headerActionText}>Agent</Text>
          </TouchableOpacity>
        )}
        {phase !== PHASES.BOT && <View style={{ width: 60 }} />}
      </LinearGradient>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => (
            <>
              {adminTyping && phase === PHASES.LIVE && (
                <View style={styles.botMsgRow}>
                  <View style={[styles.agentAvatar]}>
                    <LinearGradient colors={['#FCC014', '#F5A623']} style={styles.agentAvatarGradient}>
                      <Text style={styles.agentAvatarText}>{agentInfo?.initial || 'S'}</Text>
                    </LinearGradient>
                  </View>
                  <View style={[styles.typingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                      {agentInfo?.name || 'Agent'} is typing...
                    </Text>
                    <View style={styles.typingDots}>
                      <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
                      <View style={[styles.dot, { backgroundColor: colors.textSecondary, opacity: 0.7 }]} />
                      <View style={[styles.dot, { backgroundColor: colors.textSecondary, opacity: 0.4 }]} />
                    </View>
                  </View>
                </View>
              )}
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary} />
                </View>
              )}
            </>
          )}
        />

        {/* Quick Replies (Bot Phase Only) */}
        {phase === PHASES.BOT && messages.length <= 2 && (
          <View style={styles.quickRepliesContainer}>
            {QUICK_REPLIES.map((reply, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickReplyChip, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  handleBotSend(reply);
                }}
              >
                <Text style={[styles.quickReplyText, { color: colors.primary }]}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          {phase === PHASES.LIVE && (
            <TouchableOpacity style={styles.attachBtn} onPress={handleAttachment}>
              <Ionicons name="attach" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.border,
            }]}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder={phase === PHASES.BOT ? 'Apna sawal likhein...' : 'Type a message...'}
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={2000}
            editable={phase !== PHASES.ESCALATING}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { opacity: inputText.trim() ? 1 : 0.5 }]}
            onPress={handleSend}
            disabled={!inputText.trim() || loading || phase === PHASES.ESCALATING}
          >
            <LinearGradient
              colors={colors.gradients?.premium || ['#FFD700', '#FFA500']}
              style={styles.sendBtnGradient}
            >
              <Ionicons name="send" size={18} color="#000" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
        <View style={{ height: insets.bottom }} />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerBack: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  headerCenter: { flex: 1, marginLeft: spacing.md },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#000' },
  headerSubtitle: { fontSize: 11, color: 'rgba(0,0,0,0.6)', marginTop: 1 },
  headerAgentInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerAgentAvatarWrap: { position: 'relative' },
  headerAgentAvatar: { width: 36, height: 36, borderRadius: 18 },
  headerAgentAvatarPlaceholder: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'center', alignItems: 'center',
  },
  headerAgentAvatarText: { fontSize: 14, fontWeight: '700', color: '#000' },
  headerOnlineDot: {
    position: 'absolute', bottom: 0, right: 0,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#10B981', borderWidth: 2, borderColor: '#FCC014',
  },
  headerAction: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 20,
  },
  headerActionText: { fontSize: 12, fontWeight: '600', color: '#000' },
  messagesList: { padding: spacing.md, paddingBottom: spacing.lg },
  // System message
  systemMsgContainer: { alignItems: 'center', marginVertical: spacing.sm },
  systemMsgBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
  },
  systemMsgText: { fontSize: 12, fontWeight: '500' },
  // Bot message
  botMsgRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: spacing.sm, gap: 8 },
  botAvatar: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
  },
  botBubble: {
    maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  // Agent avatar
  agentAvatar: { width: 30, height: 30, borderRadius: 15, overflow: 'hidden' },
  agentAvatarImage: { width: 30, height: 30, borderRadius: 15 },
  agentAvatarGradient: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: 'center', alignItems: 'center',
  },
  agentAvatarText: { fontSize: 12, fontWeight: '700', color: '#000' },
  // Admin bubble
  adminBubbleWrapper: { maxWidth: '78%' },
  adminSenderName: { fontSize: 10, fontWeight: '600', marginBottom: 3, marginLeft: 4 },
  adminBubble: {
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, borderBottomLeftRadius: 4,
    backgroundColor: '#FCC014',
  },
  adminMsgText: { fontSize: 14, color: '#000', lineHeight: 20 },
  adminMsgTime: { fontSize: 10, color: 'rgba(0,0,0,0.5)', marginTop: 4, textAlign: 'right' },
  // User message
  userMsgRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: spacing.sm },
  userBubble: {
    maxWidth: '78%', paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, borderBottomRightRadius: 4,
    backgroundColor: '#1A1A2E',
  },
  userMsgText: { fontSize: 14, color: '#fff', lineHeight: 20 },
  userMsgTime: { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4, textAlign: 'right' },
  // General message
  msgText: { fontSize: 14, lineHeight: 20 },
  msgTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  // Attachment
  attachmentImage: { width: 200, height: 150, borderRadius: 12, marginBottom: 6 },
  // Typing indicator
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 18, borderBottomLeftRadius: 4, borderWidth: 1,
  },
  typingText: { fontSize: 12 },
  typingDots: { flexDirection: 'row', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  // Loading
  loadingContainer: { alignItems: 'flex-start', paddingLeft: 46, paddingVertical: 8 },
  // Quick replies
  quickRepliesContainer: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: spacing.md, paddingBottom: spacing.sm,
  },
  quickReplyChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  quickReplyText: { fontSize: 13, fontWeight: '500' },
  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  attachBtn: { padding: 8 },
  input: {
    flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 14, maxHeight: 100, borderWidth: 1,
  },
  sendBtn: {},
  sendBtnGradient: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
});

export default SupportChatScreen;
