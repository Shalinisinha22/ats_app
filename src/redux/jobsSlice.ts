import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Job } from '../types';
import api from '../api';
import { getState } from 'redux-thunk';

interface JobFilters {
  search: string;
  location: string;
  category: string;
  minSalary: number | null;
}

interface JobsState {
  allJobs: Job[];
  savedJobs: string[]; // Changed from Job[] to string[]
  appliedJobs: Job[];
  isLoading: boolean;
  error: string | null;
  filters: JobFilters;
}

const initialState: JobsState = {
  allJobs: [],
  savedJobs: [], // Will store only job IDs
  appliedJobs: [],
  isLoading: false,
  error: null,
  filters: {
    search: '',
    location: '',
    category: '',
    minSalary: null,
  },
};

// Async thunks for data persistence
export const fetchAppliedJobs = createAsyncThunk(
  'jobs/fetchAppliedJobs',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: RootState = getState() as RootState;
      const user = state.auth.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      const response = await api.get('/user-profile', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch applied jobs');
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update the fetchSavedJobs thunk
export const fetchSavedJobs = createAsyncThunk(
  'jobs/fetchSavedJobs',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: RootState = getState() as RootState;
      const user = state.auth.user;

      if (!user?.token) {
        return rejectWithValue('Please login to view saved jobs');
      }

      const profileResponse = await api.get('/user-profile', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.data.success) {
        return rejectWithValue(profileResponse.data.message || 'Failed to fetch saved jobs');
      }

      // Extract only job IDs from savedJobs array
      const savedJobs = profileResponse.data.data.savedJobs || [];
      const savedJobIds = savedJobs.map(job => 
        typeof job === 'string' ? job : job._id
      );

      return savedJobIds;
    } catch (error: any) {
      console.error('Fetch saved jobs error:', error);
      return rejectWithValue(error?.response?.data?.message || 'Failed to fetch saved jobs');
    }
  }
);

// Update the saveJobToApi thunk
export const saveJobToApi = createAsyncThunk(
  'jobs/saveJobToApi',
  async (jobId: string, { getState, rejectWithValue }) => {
    try {
      const state: RootState = getState() as RootState;
      const user = state.auth.user;

      if (!user?.token) {
        return rejectWithValue('Please login to save jobs');
      }

      // Check if job is already saved in state
      if (state.jobs.savedJobs.includes(jobId)) {
        return rejectWithValue('You have already saved this job');
      }

      const profileResponse = await api.get('/user-profile', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.data.success) {
        return rejectWithValue('Failed to fetch user profile');
      }

      const userProfile = profileResponse.data.data;
      const currentSavedIds = Array.isArray(userProfile.savedJobs) ? 
        userProfile.savedJobs.map(job => typeof job === 'string' ? job : job._id) : 
        [];

      if (currentSavedIds.includes(jobId)) {
        return rejectWithValue('You have already saved this job');
      }

      const response = await api.put(
        '/user-profile',
        { savedJobs: [...currentSavedIds, jobId] },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to save job');
      }

      return { jobId, profile: response.data.data };

    } catch (error: any) {
      console.error('Save job error:', error?.response?.data || error);
      return rejectWithValue(
        error?.response?.data?.message || 
        error?.message || 
        'Failed to save job'
      );
    }
  }
);

// Update the unsaveJobFromApi thunk
export const unsaveJobFromApi = createAsyncThunk(
  'jobs/unsaveJobFromApi',
  async (jobId: string, { getState, rejectWithValue }) => {
    try {
      const state: RootState = getState() as RootState;
      const user = state.auth.user;

      if (!user) {
        return rejectWithValue('User not authenticated');
      }

      // First check if the job is actually saved
      if (!state.jobs.savedJobs.includes(jobId)) {
        return rejectWithValue('Job is not in your saved list');
      }

      const profileResponse = await api.get('/user-profile', {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!profileResponse.data.success) {
        return rejectWithValue('Failed to fetch user profile');
      }

      const userProfile = profileResponse.data.data;
      const currentSavedIds = Array.isArray(userProfile.savedJobs) ? 
        userProfile.savedJobs.map(job => typeof job === 'string' ? job : job._id) : 
        [];

      // Remove the job ID from saved jobs
      const updatedSavedJobs = currentSavedIds.filter(id => id !== jobId);

      const response = await api.put(
        '/user-profile',
        { savedJobs: updatedSavedJobs },
        {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Failed to unsave job');
      }

      return jobId;
    } catch (error: any) {
      console.error('Unsave job error:', error?.response?.data || error);
      return rejectWithValue(
        error?.response?.data?.message || 
        error?.message || 
        'Failed to unsave job'
      );
    }
  }
);

export const applyToJob = createAsyncThunk(
  'jobs/apply',
  async (applicationData: any, { getState, rejectWithValue }) => {
    try {
      const state: RootState = getState() as RootState;
      const user = state.auth.user;

      if (!user) {
        throw new Error('User not authenticated');
      }

      let resumeLink = '';
      if (applicationData.applicationData.resumeFile) {
        const formData = new FormData();
        formData.append('file', {
          uri: applicationData.applicationData.resumeFile.uri,
          type: applicationData.applicationData.resumeFile.type,
          name: applicationData.applicationData.resumeFile.name,
        });

        resumeLink = applicationData.applicationData.resumeFile.uri;
      }

      const payload = { ...applicationData, resumeLink };

      const response = await api.post('/application', payload, {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to submit application');
      }

      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchAllJobs = createAsyncThunk(
  'jobs/fetchAllJobs',
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: RootState = getState() as RootState;

      const response = await api.get('/job', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch jobs');
      }

      return response.data.data.jobs;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    saveJob: (state, action: PayloadAction<Job>) => {
      if (!state.savedJobs.find((job) => job._id === action.payload.id)) {
        state.savedJobs.push(action.payload);
      }
    },
    unsaveJob: (state, action: PayloadAction<string>) => {
      state.savedJobs = state.savedJobs.filter((job) => job._id !== action.payload);
    },
    updateJobStatus: (
      state,
      action: PayloadAction<{ jobId: string; status: 'pending' | 'shortlisted' | 'rejected' }>
    ) => {
      const job = state.appliedJobs.find((job) => job._id === action.payload.jobId);
      if (job) {
        job.status = action.payload.status;
      }
    },
    setFilters: (state, action: PayloadAction<Partial<JobsState['filters']>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
    },
    clearFilters: (state) => {
      state.filters = { ...initialState.filters };
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAllJobs states
      .addCase(fetchAllJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.allJobs = action.payload;
      })
      .addCase(fetchAllJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Handle fetchSavedJobs states
      .addCase(fetchSavedJobs.pending, (state) => {
        state.error = null;
        // Don't set isLoading to true if we already have data
        if (state.savedJobs.length === 0) {
          state.isLoading = true;
        }
      })
      .addCase(fetchSavedJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.savedJobs = action.payload;
      })
      .addCase(fetchSavedJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Handle saveJobToApi states
      .addCase(saveJobToApi.pending, (state) => {
        state.error = null;
        // Don't show loading for quick operations
      })
      .addCase(saveJobToApi.fulfilled, (state, action) => {
        state.error = null;
        if (!state.savedJobs.includes(action.payload.jobId)) {
          state.savedJobs.push(action.payload.jobId);
        }
      })

      // Handle unsaveJobFromApi states
      .addCase(unsaveJobFromApi.pending, (state) => {
        state.error = null;
        // Don't show loading for quick operations
      })
      .addCase(unsaveJobFromApi.fulfilled, (state, action) => {
        state.error = null;
        state.savedJobs = state.savedJobs.filter(id => id !== action.payload);
      });
  },
});

export const { saveJob, unsaveJob, updateJobStatus, setFilters, clearFilters } =
  jobsSlice.actions;

export default jobsSlice.reducer;