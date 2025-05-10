type EducationEntry = {
    id: string;
    degree: string;
    institution: string;
    startDate: string;
    endDate: string;
};

type ExperienceEntry = {
    id: string;
    companyName: string;
    jobTitle: string;
    startDate: string;
    endDate: string;
    description: string;
};

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    loginId: string;
    profileImage?: string;
    skills?: string[];
    headline?: string;
    summary?: string;
    currentLocation?: string;
    preferredWorkLocation?: string;
    education?: EducationEntry[];
    experience?: ExperienceEntry[];
    noticePeriod?: string;
    currentCTC?: string;
    expectedCTC?: string;
    reasonForJobChange?: string;
    resume?: {
        name: string;
        uri: string;
        type: string;
        size: number;
    };
}

export interface UserProfile {
    id: string;
    name: string;
    profileImage?: string;
    skills?: string[];
    headline?: string;
    summary?: string;
    currentLocation?: string;
    preferredWorkLocation?: string;
    education?: EducationEntry[];
    experience?: ExperienceEntry[];
    noticePeriod?: string;
    currentCTC?: string;
    expectedCTC?: string;
    reasonForJobChange?: string;
    resume?: {
        name: string;
        uri: string;
        type: string;
        size: number;
    };
    totalExperience: string;
    relevantExperience:string;
    currentCompany: string;
    currentJobTitle:string;
}


export interface ApplicationData {
    email: string;
    firstName: string;
    lastName: string;
    professionalHeadline: string;
    professionalSummary: string;
    phoneNumber: string;
    currentLocation: string;
    preferredLocation: string;
    education: EducationEntry[];
    experience: ExperienceEntry[];
    totalExperience: string;
    relevantExperience: string;
    currentCompany: string;
    currentJobTitle: string;
    noticePeriod: string;
    currentCTC: string;
    expectedCTC: string;
    reasonForChange: string;
    projectDescription: string;
    resumeFile: {
        name: string;
        uri: string;
        type: string;
        size: number;
    };
}

export interface Company {
    _id: string;
    userId: {
        _id: string;
        name: string;
    };
    logo: string;
    industry: string;
    location: string;
    website: string;
    companySize: string;
    about: string;
    jobsPosted: string[];
    applicationsReceived: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface Job {
    _id: string;
    company: Company;
    title: string;
    location: string;
    jobType: string;
    salaryRange: {
        min: number;
        max: number;
    };
    experienceRange: {
        min: number;
        max: number;
    };
    skillsRequired: string[];
    description: string;
    responsibilities: string[];
    department: string;
    experienceLevel: string;
    applicationDeadline: string;
    status: 'pending' | 'shortlisted' | 'rejected' | 'Active';
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export interface AuthState {
    user: User | null;
    userProfile: UserProfile | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}