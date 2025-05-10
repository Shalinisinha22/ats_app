import { Job } from '../types';

const jobCategories = [
  'Software Development',
  'Full Stack Development',
  'Mobile App Development',
  'Data Science & Analytics',
  'DevOps & Cloud',
  'UI/UX Design',
  'Product Management',
  'Digital Marketing',
];

const locations = [
  'Bangalore, Karnataka',
  'Mumbai, Maharashtra',
  'Hyderabad, Telangana',
  'Delhi NCR',
  'Chennai, Tamil Nadu',
  'Pune, Maharashtra',
  'Remote',
];

const companies = [
  'TechCorp India',
  'Innovate Solutions',
  'CloudScale Technologies',
  'Digital Dynamics',
  'DataTech Systems',
  'SmartBridge IT',
  'Global Innovations',
];

const generateJobDescription = (category: string, isRemote: boolean) => {
  const baseSalary = Math.floor(Math.random() * 20 + 5);
  const maxSalary = baseSalary + Math.floor(Math.random() * 10 + 5);
  const experience = Math.floor(Math.random() * 5 + 2);

  return `We are seeking an experienced ${category} professional to join our dynamic team${isRemote ? ' in a remote capacity' : ''}. The ideal candidate will be passionate about technology and innovation.

Key Responsibilities:
• Lead technical design and implementation of complex features
• Collaborate with cross-functional teams to deliver high-quality solutions
• Participate in code reviews and maintain coding standards
• Mentor junior team members and contribute to team growth
• Optimize application performance and scalability

Required Skills:
• ${experience}+ years of experience in ${category}
• Strong proficiency in modern development tools and frameworks
• Excellent problem-solving and analytical skills
• Experience with Agile/Scrum methodologies
• Strong communication and teamwork abilities

Technical Requirements:
• Bachelor's degree in Computer Science or related field
• Proficiency in version control systems (Git)
• Experience with CI/CD pipelines
• Knowledge of cloud platforms (AWS/Azure/GCP)

Benefits:
• Competitive salary package: ₹${baseSalary} - ₹${maxSalary} LPA
• Health insurance coverage
• Flexible work hours
• Professional development opportunities
• Annual performance bonus
${isRemote ? '• Remote work setup allowance' : '• Modern office facilities'}

Join us in building the next generation of innovative solutions!`;
};

export const generateMockJobs = (count: number = 20): Job[] => {
  return Array.from({ length: count }, (_, index) => {
    const category = jobCategories[index % jobCategories.length];
    const isRemote = Math.random() > 0.7;
    const location = isRemote ? 'Remote' : locations[Math.floor(Math.random() * (locations.length - 1))];
    const salary = `₹${Math.floor(Math.random() * 20 + 5)} - ₹${Math.floor(Math.random() * 30 + 15)} LPA`;

    return {
      id: `job-${index + 1}`,
      title: `${category} ${Math.random() > 0.5 ? 'Senior' : ''} ${Math.random() > 0.7 ? 'Lead' : ''} Engineer`,
      company: companies[index % companies.length],
      location,
      salary,
      description: generateJobDescription(category, isRemote),
      category,
    };
  });
};

export const mockJobs = generateMockJobs();

export const filterJobs = (
  jobs: Job[],
  filters: {
    search?: string;
    location?: string;
    category?: string;
    minSalary?: number | null;
  }
) => {
  return jobs.filter((job) => {
    const matchesSearch =
      !filters.search ||
      job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
      job.description.toLowerCase().includes(filters.search.toLowerCase());

    const matchesLocation =
      !filters.location || job.location === filters.location;

    const matchesCategory =
      !filters.category || job.category === filters.category;

    const matchesSalary = !filters.minSalary || 
      (job.salary && parseInt(job.salary.split('LPA')[0].replace(/\D/g, '')) >= filters.minSalary);

    return matchesSearch && matchesLocation && matchesCategory && matchesSalary;
  });
};

export const getUniqueLocations = (jobs: Job[]) => 
  Array.from(new Set(jobs.map(job => job.location)));

export const getUniqueCategories = (jobs: Job[]) => 
  Array.from(new Set(jobs.map(job => job.category)));