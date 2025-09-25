import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {chatAPI} from '../../services/chatService';

const initialState = {
  activeChat: null,
  chats: [],
  messages: {},
  loading: false,
  loadingMessages: false,
  error: null,
  onlineUsers: [],
  isTyping: false,
  aiSuggestions: [],
  loadingAISuggestions: false,
};

export const fetchChats = createAsyncThunk('chat/fetchChats', async () => {
  const response = await chatAPI.getChats();
  return response.data;
});

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async ({chatId, page = 1}) => {
    const response = await chatAPI.getMessages(chatId, page);
    return {chatId, messages: response.data.messages, page};
  },
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({chatId, content, type = 'text'}) => {
    const response = await chatAPI.sendMessage(chatId, content, type);
    return {chatId, message: response.data};
  },
);

export const getAISuggestions = createAsyncThunk(
  'chat/getAISuggestions',
  async ({message, tone, context}) => {
    const response = await chatAPI.getAISuggestions(message, tone, context);
    return response.data;
  },
);

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
      if (action.payload && state.chats.find(c => c.id === action.payload)) {
        const chat = state.chats.find(c => c.id === action.payload);
        chat.unreadCount = 0;
      }
    },
    addMessage: (state, action) => {
      const {chatId, message} = action.payload;
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(message);

      const chatIndex = state.chats.findIndex(c => c.id === chatId);
      if (chatIndex !== -1) {
        state.chats[chatIndex].lastMessage = message;
        state.chats[chatIndex].updatedAt = message.timestamp;
        if (state.activeChat !== chatId) {
          state.chats[chatIndex].unreadCount += 1;
        }
      }
    },
    updateMessageStatus: (state, action) => {
      const {chatId, messageId, status} = action.payload;
      const messages = state.messages[chatId];
      if (messages) {
        const messageIndex = messages.findIndex(m => m.id === messageId);
        if (messageIndex !== -1) {
          messages[messageIndex].status = status;
        }
      }
    },
    setTyping: (state, action) => {
      const {chatId, isTyping, userId} = action.payload;
      const chatIndex = state.chats.findIndex(c => c.id === chatId);
      if (chatIndex !== -1) {
        if (userId) {
          if (isTyping) {
            if (!state.chats[chatIndex].typingUsers.includes(userId)) {
              state.chats[chatIndex].typingUsers.push(userId);
            }
          } else {
            state.chats[chatIndex].typingUsers = state.chats[chatIndex].typingUsers.filter(
              id => id !== userId,
            );
          }
        }
        state.chats[chatIndex].isTyping = state.chats[chatIndex].typingUsers.length > 0;
      }
    },
    setOnlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    clearAISuggestions: state => {
      state.aiSuggestions = [];
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchChats.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch chats';
      })
      .addCase(fetchMessages.pending, state => {
        state.loadingMessages = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loadingMessages = false;
        const {chatId, messages, page} = action.payload;
        if (page === 1) {
          state.messages[chatId] = messages;
        } else {
          state.messages[chatId] = [...messages, ...(state.messages[chatId] || [])];
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loadingMessages = false;
        state.error = action.error.message || 'Failed to fetch messages';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const {chatId, message} = action.payload;
        if (!state.messages[chatId]) {
          state.messages[chatId] = [];
        }
        const existingIndex = state.messages[chatId].findIndex(m => m.id === message.id);
        if (existingIndex === -1) {
          state.messages[chatId].push(message);
        }
      })
      .addCase(getAISuggestions.pending, state => {
        state.loadingAISuggestions = true;
      })
      .addCase(getAISuggestions.fulfilled, (state, action) => {
        state.loadingAISuggestions = false;
        state.aiSuggestions = action.payload;
      })
      .addCase(getAISuggestions.rejected, (state, action) => {
        state.loadingAISuggestions = false;
        state.error = action.error.message || 'Failed to get AI suggestions';
      });
  },
});

export const {
  setActiveChat,
  addMessage,
  updateMessageStatus,
  setTyping,
  setOnlineUsers,
  clearAISuggestions,
  clearError,
} = chatSlice.actions;

export default chatSlice.reducer;