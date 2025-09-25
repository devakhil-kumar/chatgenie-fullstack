import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {authAPI} from '../../services/authService';

const initialState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  pending: false,
  error: null,
};

export const loginWithOTP = createAsyncThunk(
  'auth/loginWithOTP',
  async ({phone, otp}) => {
    // const response = await authAPI.verifyOTP(phone, otp);
    return true;
  },
);

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (phone) => {
    const response = await authAPI.sendOTP(phone);
    return response.data;
  },
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, {getState}) => {
    const state = getState();
    const response = await authAPI.refreshToken(state.auth.token);
    return response.data;
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = null;
      state.pending = false;
    },
    clearError: state => {
      state.error = null;
    },
    setPending: (state, action) => {
      state.pending = action.payload;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = {...state.user, ...action.payload};
      }
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loginWithOTP.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginWithOTP.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginWithOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      })
      .addCase(sendOTP.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, state => {
        state.loading = false;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to send OTP';
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.token = action.payload.token;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      });
  },
});

export const {logout, clearError, setPending, updateUser} = authSlice.actions;
export default authSlice.reducer;