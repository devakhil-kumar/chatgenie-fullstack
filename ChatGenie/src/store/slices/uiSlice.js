import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  theme: 'light', // 'light', 'dark', 'auto'
  activeTab: 'chats', // 'chats', 'contacts', 'profile', 'referrals'
  showAISuggestions: false,
  keyboardVisible: false,
  modalVisible: false,
  modalType: null, // 'payment', 'profile', 'settings', etc.
  toastMessage: null,
  toastType: 'info', // 'success', 'error', 'warning', 'info'
  loading: false,
  refreshing: false,
  networkStatus: 'online', // 'online', 'offline', 'connecting'
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },
    toggleAISuggestions: state => {
      state.showAISuggestions = !state.showAISuggestions;
    },
    setAISuggestions: (state, action) => {
      state.showAISuggestions = action.payload;
    },
    setKeyboardVisible: (state, action) => {
      state.keyboardVisible = action.payload;
    },
    showModal: (state, action) => {
      state.modalVisible = true;
      state.modalType = action.payload;
    },
    hideModal: state => {
      state.modalVisible = false;
      state.modalType = null;
    },
    showToast: (state, action) => {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type || 'info';
    },
    hideToast: state => {
      state.toastMessage = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setRefreshing: (state, action) => {
      state.refreshing = action.payload;
    },
    setNetworkStatus: (state, action) => {
      state.networkStatus = action.payload;
    },
  },
});

export const {
  setTheme,
  setActiveTab,
  toggleAISuggestions,
  setAISuggestions,
  setKeyboardVisible,
  showModal,
  hideModal,
  showToast,
  hideToast,
  setLoading,
  setRefreshing,
  setNetworkStatus,
} = uiSlice.actions;

export default uiSlice.reducer;