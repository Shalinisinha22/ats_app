import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState,UserProfile } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api';
import { act } from 'react';

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    userProfile: null,
};

// --- Register User ---
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData: Omit<User, 'id' | 'loginId'>, { rejectWithValue }) => {
        try {

      
            const response = await api.post('/user/register', userData);
           
            
          
            
            const { user } = response.data?.data;


            await AsyncStorage.setItem('user', JSON.stringify(user));
            return { user }; 
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

// --- Login User ---
// Modify the loginUser thunk
export const loginUser = createAsyncThunk(
  'auth/login',
  async (userData: { email: string; password: string }, { dispatch }) => {
    try {
      const response = await api.post('/user/login', userData);
      const user = response.data?.data?.user;

      if (!user) {
        throw new Error('Invalid credentials');
      }



      const updateUser = { ...user, password: userData?.password };
      await AsyncStorage.setItem('user', JSON.stringify(updateUser));
      
      // Wait for profile fetch to complete before returning
      // await dispatch(fetchUserProfile()).unwrap();
      
      return updateUser;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }
);



export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<User>, { getState, dispatch, rejectWithValue }) => {
    try {
      const state: any = getState();
      const currentUser = state.auth.user;

      if (!currentUser) {
        throw new Error('No user logged in');
      }

      const token = currentUser.token;
      const method = state.auth.userProfile ? 'put' : 'post';
      const url = '/user-profile';

      const response = await api[method](url, profileData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update profile');
      }

      // Fetch the updated profile to ensure we have the latest data
      await dispatch(fetchUserProfile()).unwrap();

      return response.data.data;
    } catch (error: any) {
      // ...existing error handling...
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile', 
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: any = getState();
      const currentUser = state.auth.user;

      if (!currentUser) {
        throw new Error('No user logged in');
      }

      const token = currentUser.token;
      const response = await api.get('/user-profile', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        return response.data.data; // Return the profile data
      }

      throw new Error('Failed to fetch profile data');
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message;
      console.error('GET /user-profile failed:', errMsg);

      if (errMsg?.toLowerCase().includes('token expired')) {
        return rejectWithValue('Session expired. Please login again.');
      }

      return rejectWithValue(errMsg || 'Failed to fetch user profile');
    }
  }
);






// --- Slice ---
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.userProfile = null; // Clear userProfile on logout
            state.loading = false;
            state.error = null;
            AsyncStorage.removeItem('user');
            AsyncStorage.removeItem('userProfile');
        },
        skipLogin: (state) => {
            state.isAuthenticated = true;
            state.user = {
                id: 'guest',
                name: 'Guest User',
                email: 'guest@example.com',
                loginId: 'GUEST'
            };
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.loading = false;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Registration failed';
            });

        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Login failed';
            });

        // Update Profile
        builder
            .addCase(updateProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.error = null;
                state.userProfile = {
                  ...state.userProfile,
                  ...action.payload
                };
            })
            .addCase(updateProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string || 'Profile update failed';
            });


            //fetchUserProfile  
            builder

            .addCase(fetchUserProfile.pending, (state) => {
              state.loading = true;
              state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
              state.loading = false;
              state.error = null;
              state.userProfile = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload as string;
              state.userProfile = null;
            });

          
    },
    
});

export const { logout, skipLogin } = authSlice.actions;
export default authSlice.reducer;
