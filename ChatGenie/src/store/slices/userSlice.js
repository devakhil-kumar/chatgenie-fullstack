import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import {userAPI} from '../../services/userService';

const initialState = {
  profile: null,
  contacts: [],
  referralStats: null,
  loading: false,
  loadingContacts: false,
  loadingReferrals: false,
  error: null,
};

export const fetchProfile = createAsyncThunk('user/fetchProfile', async () => {
  const response = await userAPI.getProfile();
  return response.data;
});

export const updateProfile = createAsyncThunk(
  'user/updateProfile',
  async (updates) => {
    const response = await userAPI.updateProfile(updates);
    return response.data;
  },
);

export const uploadAvatar = createAsyncThunk(
  'user/uploadAvatar',
  async (imageUri) => {
    const response = await userAPI.uploadAvatar(imageUri);
    return response.data;
  },
);

export const fetchContacts = createAsyncThunk('user/fetchContacts', async () => {
  const response = await userAPI.getContacts();
  return response.data;
});

export const syncContacts = createAsyncThunk(
  'user/syncContacts',
  async (phoneNumbers) => {
    const response = await userAPI.syncContacts(phoneNumbers);
    return response.data;
  },
);

export const fetchReferralStats = createAsyncThunk('user/fetchReferralStats', async () => {
  const response = await userAPI.getReferralStats();
  return response.data;
});

export const generateReferralLink = createAsyncThunk('user/generateReferralLink', async () => {
  const response = await userAPI.generateReferralLink();
  return response.data;
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateSettings: (state, action) => {
      if (state.profile) {
        state.profile.settings = {...state.profile.settings, ...action.payload};
      }
    },
    incrementAIUsage: state => {
      if (state.profile) {
        state.profile.aiRepliesUsed += 1;
      }
    },
    updateCredits: (state, action) => {
      if (state.profile) {
        state.profile.credits = action.payload;
      }
    },
    addContact: (state, action) => {
      const existingIndex = state.contacts.findIndex(c => c.id === action.payload.id);
      if (existingIndex === -1) {
        state.contacts.push(action.payload);
      } else {
        state.contacts[existingIndex] = action.payload;
      }
    },
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchProfile.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch profile';
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile = {...state.profile, ...action.payload};
        }
      })
      .addCase(uploadAvatar.fulfilled, (state, action) => {
        if (state.profile) {
          state.profile.avatar = action.payload.avatar;
        }
      })
      .addCase(fetchContacts.pending, state => {
        state.loadingContacts = true;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loadingContacts = false;
        state.contacts = action.payload;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loadingContacts = false;
        state.error = action.error.message || 'Failed to fetch contacts';
      })
      .addCase(syncContacts.fulfilled, (state, action) => {
        state.contacts = action.payload;
      })
      .addCase(fetchReferralStats.pending, state => {
        state.loadingReferrals = true;
      })
      .addCase(fetchReferralStats.fulfilled, (state, action) => {
        state.loadingReferrals = false;
        state.referralStats = action.payload;
      })
      .addCase(fetchReferralStats.rejected, (state, action) => {
        state.loadingReferrals = false;
        state.error = action.error.message || 'Failed to fetch referral stats';
      });
  },
});

export const {updateSettings, incrementAIUsage, updateCredits, addContact, clearError} =
  userSlice.actions;

export default userSlice.reducer;