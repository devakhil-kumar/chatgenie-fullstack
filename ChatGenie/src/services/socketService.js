import io from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

class SocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {};
  }

  async connect() {
    const token = await AsyncStorage.getItem('authToken');
    const BASE_URL = __DEV__ ? 'http://localhost:5000' : 'https://api.chatgenie.com';

    this.socket = io(BASE_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
      this.emit('callback', 'connected', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.emit('callback', 'disconnected');
    });

    this.socket.on('error', (error) => {
      console.log('Socket error:', error);
      this.emit('callback', 'error', error);
    });

    // Chat events
    this.socket.on('new_message', (data) => {
      this.emit('callback', 'new_message', data);
    });

    this.socket.on('message_status_update', (data) => {
      this.emit('callback', 'message_status_update', data);
    });

    this.socket.on('typing_start', (data) => {
      this.emit('callback', 'typing_start', data);
    });

    this.socket.on('typing_stop', (data) => {
      this.emit('callback', 'typing_stop', data);
    });

    this.socket.on('user_online', (data) => {
      this.emit('callback', 'user_online', data);
    });

    this.socket.on('user_offline', (data) => {
      this.emit('callback', 'user_offline', data);
    });

    this.socket.on('chat_updated', (data) => {
      this.emit('callback', 'chat_updated', data);
    });

    // AI events
    this.socket.on('ai_suggestion_ready', (data) => {
      this.emit('callback', 'ai_suggestion_ready', data);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Join chat room
  joinChat(chatId) {
    if (this.socket) {
      this.socket.emit('join_chat', { chatId });
    }
  }

  // Leave chat room
  leaveChat(chatId) {
    if (this.socket) {
      this.socket.emit('leave_chat', { chatId });
    }
  }

  // Send message
  sendMessage(chatId, message) {
    if (this.socket) {
      this.socket.emit('send_message', { chatId, message });
    }
  }

  // Send typing indicator
  sendTyping(chatId, isTyping) {
    if (this.socket) {
      this.socket.emit('typing', { chatId, isTyping });
    }
  }

  // Mark messages as read
  markAsRead(chatId, messageIds) {
    if (this.socket) {
      this.socket.emit('mark_read', { chatId, messageIds });
    }
  }

  // Update user presence
  updatePresence(status) {
    if (this.socket) {
      this.socket.emit('update_presence', { status });
    }
  }

  // Register callback for events
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  // Remove callback
  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  // Emit callback
  emit(type, event, data) {
    if (type === 'callback' && this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data));
    }
  }

  // Check if socket is connected
  isConnected() {
    return this.socket && this.socket.connected;
  }
}

export default new SocketService();