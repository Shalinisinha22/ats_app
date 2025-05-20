import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { Job } from "../types";
import api from "../api";
import { getState } from "redux-thunk";
import axios from "axios";

interface JobFilters {
  search: string;
  location: string;
  category: string;
  minSalary: number | null;
}

interface ApplicationDetails {
  applicationId: string;
  resume: {
    url: string;
    name: string;
    extension: string;
  };
  name: string;
  email: string;
  headline: string;
  summary: string;
  currentLocation: string;
  noticePeriod: number;
  currentCTC: number;
  expectedCTC: number;
  reasonForJobChange: string;
  achievement: string;
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    description: string;
    _id: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
    _id: string;
  }>;
  appliedAt: string;
  updatedAt: string;
}

interface Job extends BaseJob {
  applicationDetails?: ApplicationDetails;
}

interface JobsState {
  allJobs: Job[];
  savedJobs: string[];
  appliedJobs: Job[];
  applications: any[];
  isLoading: boolean;
  error: string | null;
  filters: JobFilters;
  isRefreshing: boolean;
  exploreJobs: Job[];
}

const initialState: JobsState = {
  allJobs: [],
  savedJobs: [],
  appliedJobs: [],
  applications: [],
  isLoading: false,
  error: null,
  filters: {
    search: "",
    location: "",
    category: "",
    minSalary: null,
  },
  isRefreshing: false,
  exploreJobs: [],
};

// Update the fetchAppliedJobs thunk
export const fetchAppliedJobs = createAsyncThunk(
  "jobs/fetchAppliedJobs",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: RootState = getState() as RootState;
      const user = state.auth.user;

      if (!user?.token) {
        return rejectWithValue("Please login to view applied jobs");
      }

      const response = await api.get("/user-profile/applied-jobs", {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.data.success) {
        return rejectWithValue("Failed to fetch applied jobs");
      }

      const applications = response.data.data || [];

      // Transform applications to include both job and application details
      const formattedAppliedJobs = applications.map((app) => ({
        _id: app.jobDetails._id,
        company: app.companyDetails.name,
        title: app.jobDetails.title,
        location: app.jobDetails.location,
        jobType: app.jobDetails.jobType,
        applicationDeadline: app.jobDetails.applicationDeadline,
        status: app.status,
        applicationDetails: {
          applicationId: app._id,
          resume: app.resume,
          name: app.name,
          email: app.email,
          headline: app.headline,
          summary: app.summary,
          currentLocation: app.currentLocation,
          noticePeriod: app.noticePeriod,
          currentCTC: app.currentCTC,
          expectedCTC: app.expectedCTC,
          reasonForJobChange: app.reasonForJobChange,
          achievement: app.achievement,
          experience: app.experience,
          education: app.education,
          appliedAt: app.createdAt,
          updatedAt: app.updatedAt,
        },
      }));

      return {
        jobs: formattedAppliedJobs,
        applications: applications, // Keep full application data
      };
    } catch (error: any) {
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch applied jobs"
      );
    }
  }
);

// Update the fetchSavedJobs thunk
export const fetchSavedJobs = createAsyncThunk(
  "jobs/fetchSavedJobs",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state: RootState = getState() as RootState;
      const user = state.auth.user;
      // console.log("user", user);

      if (!user?.token) {
        return rejectWithValue("Please login to view saved jobs");
      }

      const profileResponse = await api.get("/user-profile", {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileResponse.data.success) {
        return rejectWithValue(
          profileResponse.data.message || "Failed to fetch saved jobs"
        );
      }

      // Extract only job IDs from savedJobs array
      const savedJobs = profileResponse.data.data.savedJobs || [];
      const savedJobIds = savedJobs.map((job) =>
        typeof job === "string" ? job : job._id
      );

      return savedJobIds;
    } catch (error: any) {
      console.error("Fetch saved jobs error:", error);
      return rejectWithValue(
        error?.response?.data?.message || "Failed to fetch saved jobs"
      );
    }
  }
);

// Update the saveJobToApi thunk
export const saveJobToApi = createAsyncThunk(
  "jobs/saveJobToApi",
  async (jobId: string, { getState, rejectWithValue }) => {
    try {
      const state: RootState = getState() as RootState;
      const user = state.auth.user;

      if (!user?.token) {
        return rejectWithValue("Please login to save jobs");
      }

      if (state.jobs.savedJobs.includes(jobId)) {
        return rejectWithValue("You have already saved this job");
      }

      const profileResponse = await api.get("/user-profile", {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileResponse.data.success) {
        return rejectWithValue("Failed to fetch user profile");
      }

      const userProfile = profileResponse.data.data;
      const currentSavedIds = Array.isArray(userProfile.savedJobs)
        ? userProfile.savedJobs.map((job) =>
            typeof job === "string" ? job : job._id
          )
        : [];

      if (currentSavedIds.includes(jobId)) {
        return rejectWithValue("You have already saved this job");
      }

      const response = await api.put(
        "/user-profile",
        { savedJobs: [...currentSavedIds, jobId] },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to save job");
      }

      return { jobId, profile: response.data.data };
    } catch (error: any) {
      console.error("Save job error:", error?.response?.data || error);
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Failed to save job"
      );
    }
  }
);

// Update the unsaveJobFromApi thunk
export const unsaveJobFromApi = createAsyncThunk(
  "jobs/unsaveJobFromApi",
  async (jobId: string, { getState, rejectWithValue }) => {
    try {
      const state: RootState = getState() as RootState;
      const user = state.auth.user;

      if (!user) {
        return rejectWithValue("User not authenticated");
      }

      // First check if the job is actually saved
      if (!state.jobs.savedJobs.includes(jobId)) {
        return rejectWithValue("Job is not in your saved list");
      }

      const profileResponse = await api.get("/user-profile", {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!profileResponse.data.success) {
        return rejectWithValue("Failed to fetch user profile");
      }

      const userProfile = profileResponse.data.data;
      const currentSavedIds = Array.isArray(userProfile.savedJobs)
        ? userProfile.savedJobs.map((job) =>
            typeof job === "string" ? job : job._id
          )
        : [];

      const updatedSavedJobs = currentSavedIds.filter((id) => id !== jobId);
      // console.log("Updated saved jobs:", updatedSavedJobs);

      const response = await api.put(
        "/user-profile",
        { savedJobs: updatedSavedJobs },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.message || "Failed to unsave job");
      }

      return jobId;
    } catch (error: any) {
      console.error("Unsave job error:", error?.response?.data || error);
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to unsave job"
      );
    }
  }
);

// Update applyJobToApi thunk
export const applyJobToApi = createAsyncThunk(
  "jobs/applyJobToApi",
  async (
    { job, applicationData }: { job: Job; applicationData: any },
    { getState, rejectWithValue }
  ) => {
    try {
      const state: RootState = getState() as RootState;
      const user = state.auth.user;

      if (!user?.token) {
        return rejectWithValue("Please login to apply for jobs");
      }

      // // First check if already applied by getting current profile
      // const profileResponse = await api.get('/user-profile', {
      //   headers: {
      //     'Authorization': `Bearer ${user.token}`,
      //     'Content-Type': 'application/json',
      //   },
      // });

      // if (!profileResponse.data.success) {
      //   return rejectWithValue('Failed to fetch user profile');
      // }

      // const userProfile = profileResponse.data.data;
      // const currentAppliedJobs = Array.isArray(userProfile.appliedJobs) ?
      //   userProfile.appliedJobs.map(j => typeof j === 'string' ? j : j._id) :
      //   [];

      // // Check if already applied
      // if (currentAppliedJobs.includes(job._id)) {
      //   return rejectWithValue('You have already applied to this job');
      // }

      // Submit application using the new API endpoint format
      const response = await api.post(
        `/application?job=${job._id}`,
        applicationData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        return rejectWithValue(
          response.data.message || "Failed to submit application"
        );
      }

      return {
        jobId: job._id,
        application: applicationData,
        profile: response.data.data,
      };
    } catch (error: any) {
      console.error("Apply job error:", error?.response?.data || error);
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to submit application"
      );
    }
  }
);

// Update fetchAllJobs thunk
export const fetchAllJobs = createAsyncThunk(
  "jobs/fetchAllJobs",
  async (_, { getState, rejectWithValue }) => {
    // console.log("called")
    try {
      const state: RootState = getState() as RootState;
      const user = state.auth.user;

      if (!user?.token) {
        return rejectWithValue("Please login to view jobs");
      }

      const response = await api.get("/user-profile/recommended-jobs", {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch jobs");
      }

      const jobs = response.data.data;

      // Separate jobs into all and applied
      const appliedJobs = jobs.filter((job) => job.alreadyApplied === true);
      const allJobs = jobs.map((job) => ({
        ...job,
        // Preserve company object structure instead of just taking ID
        company: {
          _id: job.company?._id || "",
          name: job.company?.name || "",
          email: job.company?.email || "",
          logo: job?.companyProfile?.logo || "",
        },
        applicationDeadline: new Date(job.applicationDeadline).toISOString(),
        salaryRange: {
          min: job.salaryRange?.min || 0,
          max: job.salaryRange?.max || 0,
        },
        experienceRange: {
          min: job.experienceRange?.min || 0,
          max: job.experienceRange?.max || 0,
        },
        skillsRequired: job.skillsRequired || [],
        responsibilities: job.responsibilities || [],
        department: job.department || "",
        experienceLevel: job.experienceLevel || "",
        jobMode: job.jobMode || "",
        status: job.status || "Active",
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
      }));

      return {
        allJobs,
        appliedJobs: appliedJobs.map((job) => ({
          ...job,
          // Also preserve company data in applied jobs
          company: {
            _id: job.company?._id || "",
            name: job.company?.name || "",
            email: job.company?.email || "",
          },
          applicationDeadline: new Date(job.applicationDeadline).toISOString(),
          status: job.status || "applied",
        })),
      };
    } catch (error: any) {
      console.error("Fetch jobs error:", error?.response?.data || error);
      return rejectWithValue(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch jobs"
      );
    }
  }
);

// Add new thunk for exploring all jobs
export const exploreAllJobs = createAsyncThunk(
  "jobs/exploreAllJobs",
  async ({ page = 1, limit = 10 }: { page: number; limit: number }, { getState, rejectWithValue }) => {
    try {
      const state: RootState = getState() as RootState;
      const user = state.auth.user;

      if (!user?.token) {
        return rejectWithValue("Please login to explore jobs");
      }

      const response = await api.get(`/job?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch explore jobs");
      }

      const transformedJobs = response.data.data.jobs.map((job: any) => ({
        ...job,
        company: {
          _id: job.company._id || "",
          name: job.company.name || "",
        },
        applicationDeadline: new Date(job.applicationDeadline).toISOString(),
        salaryRange: {
          min: job.salaryRange?.min || 0,
          max: job.salaryRange?.max || 0,
        },
        experienceRange: {
          min: job.experienceRange?.min || 0,
          max: job.experienceRange?.max || 0,
        },
        skillsRequired: Array.isArray(job.skillsRequired) ? job.skillsRequired : [],
        responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
      }));

      return {
        jobs: transformedJobs,
        pagination: response.data.data.pagination,
      };
    } catch (error: any) {
      console.error("Explore jobs error:", error?.response?.data || error);
      return rejectWithValue(
        error?.response?.data?.message || error?.message || "Failed to fetch explore jobs"
      );
    }
  }
);

const jobsSlice = createSlice({
  name: "jobs",
  initialState,
  reducers: {
    saveJob: (state, action: PayloadAction<Job>) => {
      if (!state.savedJobs.find((job) => job._id === action.payload.id)) {
        state.savedJobs.push(action.payload);
      }
    },
    unsaveJob: (state, action: PayloadAction<string>) => {
      state.savedJobs = state.savedJobs.filter(
        (job) => job._id !== action.payload
      );
    },
    updateJobStatus: (
      state,
      action: PayloadAction<{
        jobId: string;
        status: "pending" | "shortlisted" | "rejected";
      }>
    ) => {
      const job = state.appliedJobs.find(
        (job) => job._id === action.payload.jobId
      );
      if (job) {
        job.status = action.payload.status;
      }
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<JobsState["filters"]>>
    ) => {
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
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(fetchAllJobs.fulfilled, (state, action) => {
        state.isRefreshing = false;
        state.error = null;
        state.allJobs = action.payload.allJobs;

        // Update appliedJobs with jobs that have alreadyApplied = true
        const newAppliedJobs = action.payload.appliedJobs;

        // Merge with existing applied jobs, avoiding duplicates
        const existingIds = state.appliedJobs.map((job) => job._id);
        const uniqueNewAppliedJobs = newAppliedJobs.filter(
          (job) => !existingIds.includes(job._id)
        );

        state.appliedJobs = [...state.appliedJobs, ...uniqueNewAppliedJobs];
      })
      .addCase(fetchAllJobs.rejected, (state, action) => {
        state.isRefreshing = false;
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
        state.savedJobs = state.savedJobs.filter((id) => id !== action.payload);
      })

      // Handle fetchAppliedJobs states
      .addCase(fetchAppliedJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppliedJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.appliedJobs = action.payload.jobs;
        state.applications = action.payload.applications;
      })
      .addCase(fetchAppliedJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // Handle applyJobToApi states
      .addCase(applyJobToApi.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        if (!state.appliedJobs.includes(action.payload.jobId)) {
          state.appliedJobs.push(action.payload.jobId);
        }
        if (state.applications) {
          state.applications.push(action.payload.application);
        } else {
          state.applications = [action.payload.application];
        }
      })

      // Handle exploreAllJobs states
      .addCase(exploreAllJobs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(exploreAllJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;

        // Append new jobs to the existing list
        if (action.payload.pagination.page > 1) {
          state.exploreJobs = [...state.exploreJobs, ...action.payload.jobs];
        } else {
          state.exploreJobs = action.payload.jobs;
        }

        state.pagination = action.payload.pagination;
      })
      .addCase(exploreAllJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.exploreJobs = [];
      });
  },
});

export const { saveJob, unsaveJob, updateJobStatus, setFilters, clearFilters } =
  jobsSlice.actions;

export default jobsSlice.reducer;
