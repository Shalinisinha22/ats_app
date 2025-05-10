export type Job = {
  _id: string;
  company: {
    _id: string;
    userId: {
      _id: string;
      name: string;
    };
    logo: string;
    industry: string;
    location: string;
  };
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
  status: string;
};