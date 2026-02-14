import Pusher from 'pusher-js/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.shareide.com/api';

let pusherInstance = null;
let subscribedChannels = {};

const PUSHER_CONFIG = {
  key: null,
  cluster: 'ap2',
};

/**
 * Fetch Pusher config from backend
 */
const fetchConfig = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/pusher/config`);
    const data = await response.json();
    if (data.success && data.data?.key) {
      PUSHER_CONFIG.key = data.data.key;
      PUSHER_CONFIG.cluster = data.data.cluster || 'ap2';
    }
  } catch (error) {
    console.log('Failed to fetch Pusher config:', error.message);
  }
};

/**
 * Initialize Pusher connection
 */
const init = async () => {
  if (pusherInstance) return pusherInstance;

  if (!PUSHER_CONFIG.key) {
    await fetchConfig();
  }

  if (!PUSHER_CONFIG.key) {
    console.log('Pusher key not available, real-time disabled');
    return null;
  }

  const token = await AsyncStorage.getItem('userToken');

  pusherInstance = new Pusher(PUSHER_CONFIG.key, {
    cluster: PUSHER_CONFIG.cluster,
    encrypted: true,
    authEndpoint: `${API_BASE_URL}/broadcasting/auth`,
    auth: {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    },
  });

  pusherInstance.connection.bind('connected', () => {
    console.log('Pusher connected');
  });

  pusherInstance.connection.bind('error', (err) => {
    console.log('Pusher error:', err);
  });

  return pusherInstance;
};

/**
 * Subscribe to a private channel
 */
const subscribe = async (channelName) => {
  const pusher = await init();
  if (!pusher) return null;

  const fullName = `private-${channelName}`;
  if (subscribedChannels[fullName]) {
    return subscribedChannels[fullName];
  }

  const channel = pusher.subscribe(fullName);
  subscribedChannels[fullName] = channel;
  return channel;
};

/**
 * Subscribe to a public channel
 */
const subscribePublic = async (channelName) => {
  const pusher = await init();
  if (!pusher) return null;

  if (subscribedChannels[channelName]) {
    return subscribedChannels[channelName];
  }

  const channel = pusher.subscribe(channelName);
  subscribedChannels[channelName] = channel;
  return channel;
};

/**
 * Unsubscribe from a channel
 */
const unsubscribe = (channelName, isPrivate = true) => {
  const fullName = isPrivate ? `private-${channelName}` : channelName;
  if (subscribedChannels[fullName]) {
    pusherInstance?.unsubscribe(fullName);
    delete subscribedChannels[fullName];
  }
};

/**
 * Disconnect Pusher entirely
 */
const disconnect = () => {
  if (pusherInstance) {
    pusherInstance.disconnect();
    pusherInstance = null;
    subscribedChannels = {};
  }
};

/**
 * Update auth token (call after login)
 */
const updateAuthToken = async () => {
  if (!pusherInstance) return;
  const token = await AsyncStorage.getItem('userToken');
  pusherInstance.config.auth.headers.Authorization = `Bearer ${token}`;
};

export const pusherService = {
  init,
  subscribe,
  subscribePublic,
  unsubscribe,
  disconnect,
  updateAuthToken,
};
