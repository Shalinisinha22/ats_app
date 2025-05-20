import { Job } from '../types';

export type AuthStackParamList = {
    Splash: undefined;
    Onboarding: undefined;
    Login: undefined;
    Register: undefined;
    RegisterSuccess: { loginId: string; password: string };
};

export type DrawerParamList = {
    MainStack: undefined;
    MainTabs: undefined;
    BrowseJobs: undefined;
    SavedJobs: undefined;
    AppliedJobs: undefined;
    RecommendedJobs: undefined;
    Profile: undefined;
    JobDetails: { jobId: string };
    JobApplication: { job: Job };
    Notifications: undefined;
    ApplicationDetails: { applicationId: string };
    ExploreJobs: undefined;
};

// For backwards compatibility
export type MainTabParamList = DrawerParamList;