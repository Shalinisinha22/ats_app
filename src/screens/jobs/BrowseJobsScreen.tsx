import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector, useAppDispatch } from '../../redux/store';
import { setFilters, clearFilters, fetchAllJobs, fetchSavedJobs } from '../../redux/jobsSlice';
import { Job, JobFilters } from '../../types';
import { fetchUserProfile } from '../../redux/authSlice';
import { RootState } from '../../redux/store';
import { mockJobs } from '../../utils/mockData'; // Add this import
import JobCard from '../../components/JobCard';
import { JobCardSkeleton } from '../../components/JobCardSkeleton'; // Add import
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerParamList } from '../../navigation/types';

// Add type for navigation
type BrowseScreenNavigationProp = NativeStackNavigationProp<DrawerParamList>;

// Update the filterJobs function with null checks
const filterJobs = (jobs: Job[], filters: JobFilters) => {
  if (!jobs || !filters) return [];
  
  return jobs.filter(job => {
    // Add null checks for job properties
    if (!job || !job.title) return false;

    const matchesSearch = !filters.search || 
      job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (job.company?.userId?.name || '').toLowerCase().includes(filters.search.toLowerCase());

    const matchesLocation = !filters.location || 
      (job.location && job.location.toLowerCase() === filters.location.toLowerCase());

    const matchesCategory = !filters.category || 
      job.title.toLowerCase() === filters.category.toLowerCase();

    return matchesSearch && matchesLocation && matchesCategory;
  });
};

export default function BrowseJobsScreen() {
  // Add navigation hook near other hooks
  const navigation = useNavigation<BrowseScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { allJobs, savedJobs, appliedJobs, isLoading, error, applications } = useAppSelector(state => state.jobs);
  const filters = useAppSelector(state => state.jobs.filters) || {
    search: '',
    location: '',
    category: '',
  };

  const [showFilters, setShowFilters] = useState(false);

  const userProfile = useAppSelector((state: RootState) => state.auth.userProfile);
  
  // Fetch profile on component mount if not available
  useEffect(() => {
    if (!userProfile) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, userProfile]);

  // Add fetchSavedJobs to initial data loading
  useEffect(() => {
    const loadData = async () => {
      await dispatch(fetchAllJobs());
      await dispatch(fetchSavedJobs());
    };
    loadData();
  }, [dispatch]);

  // Helper functions for unique values from API data
  const getUniqueLocations = (jobs: Job[]) => {
    return Array.from(new Set(
      jobs
        .filter(job => job && job.location)
        .map(job => job.location)
    ));
  };

  const getUniqueCategories = (jobs: Job[]) => {
    return Array.from(new Set(
      jobs
        .filter(job => job && job.title)
        .map(job => job.title)
    ));
  };

  // Use mockJobs as fallback if API fails or returns empty
  const jobs = allJobs.length > 0 ? allJobs : mockJobs;
  
  const locations = getUniqueLocations(jobs);
  const categories = getUniqueCategories(jobs);

  // Calculate KPI metrics
  const totalApplied = applications.length;
  const shortlisted =applications.filter(job => job.status === 'Shortlisted').length;
  const pending = applications.filter(job => job.status === 'Pending').length

  // Update the isValidJob function with more thorough validation
  const isValidJob = (job: any): job is Job => {
    return (
      job &&
      typeof job._id === 'string' &&
      typeof job.title === 'string' &&
      job.company && 
      typeof job.company._id === 'string'
    );
  };

  // Filter out invalid jobs before rendering
  const validJobs = allJobs.filter(isValidJob);

  // Update the renderJobs function
  const renderJobs = () => {
    if (isLoading && allJobs.length === 0) {
      return (
        <View style={styles.jobsList}>
          {[1, 2, 3, 4].map((_, index) => (
            <JobCardSkeleton key={index} />
          ))}
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    const filteredJobs = filterJobs(allJobs, filters);

    if (filteredJobs.length === 0) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.noResults}>No jobs found matching your criteria</Text>
        </View>
      );
    }

    return filteredJobs.map(job => {
      if (!job || !job.company) return null;
      
      return (
        <JobCard
          key={`job-${job._id || 'unknown'}-${job.company._id || 'unknown'}`}
          job={job}
          showSaveButton={true}
          showApplyButton={true}
          onPress={() => navigation.navigate('JobDetails', { jobId: job._id })}
        />
      );
    }).filter(Boolean);
  };

  const filteredJobs = filterJobs(allJobs, filters);

  // console.log('Filtered Jobs:', filteredJobs);

    // Group jobs by category
    const jobsByCategory = filteredJobs.reduce((acc, job) => {
      if (!job || !job.title) return acc;
      
      if (!acc[job.title]) {
        acc[job.title] = [];
      }
      acc[job.title].push(job);
      return acc;
    }, {} as Record<string, Job[]>);


  // Update the search handler to include null check
  const handleSearch = (text: string) => {
    dispatch(setFilters({ 
      search: text 
    }));
  };

  const handleFilter = (filterType: 'location' | 'category', value: string) => {
    dispatch(setFilters({ [filterType]: value }));
  };

  const handleRefresh = () => {
    dispatch(fetchAllJobs());
  };

  const KPICard = ({ title, value, icon, color }: { title: string; value: number; icon: string; color: string }) => (
    <View style={[styles.kpiCard, { borderColor: color }]}>
      <View style={[styles.kpiIconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiTitle} numberOfLines={1} adjustsFontSizeToFit>{title}</Text>
    </View>
  );

  const recommendedJobsCount = filteredJobs.length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs..."
            placeholderTextColor="#666"
            value={filters.search}
            onChangeText={handleSearch}
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <View style={styles.filterButtonContent}>
              <Ionicons name="options-outline" size={20} color="#fff" />
              <Text style={styles.filterButtonText}>Filters</Text>
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          onPress={handleRefresh}
          style={styles.refreshButton}
        >
          <Ionicons name="refresh" size={24} color="#1dbf73" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.kpiContainer}>
          <KPICard
            title="Applied Jobs"
            value={totalApplied}
            icon="briefcase-outline"
            color="#1dbf73"
          />
          <KPICard
            title="Shortlisted"
            value={shortlisted}
            icon="checkmark-circle-outline"
          
            color="#ff9500"
          />
          <KPICard
            title="Pending Jobs"
            value={pending}
            icon="time-outline"
            color="#007aff"
          />
        </View>

        <View style={styles.recommendedSection}>
          <View style={styles.recommendedHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recommended Jobs</Text>
              <Text style={styles.jobCount}>{recommendedJobsCount} jobs found</Text>
            </View>
            <TouchableOpacity 
              style={styles.exploreButton}
              onPress={() => navigation.navigate('ExploreJobs')}
            >
              <Text style={styles.exploreButtonText}>Explore All Jobs</Text>
              <Ionicons name="arrow-forward" size={16} color="#1dbf73" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.jobsList}>
          {renderJobs()}
        </View>
      </ScrollView>

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filters</Text>

            <Text style={styles.filterLabel}>Location</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {locations.map(location => (
                <TouchableOpacity
                  key={location}
                  style={[
                    styles.filterChip,
                    filters.location === location && styles.filterChipSelected,
                  ]}
                  onPress={() => handleFilter('location', location)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.location === location && styles.filterChipTextSelected,
                  ]}>
                    {location}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.filterLabel}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.filterChip,
                    filters.category === category && styles.filterChipSelected,
                  ]}
                  onPress={() => handleFilter('category', category)}
                >
                  <Text style={[
                    styles.filterChipText,
                    filters.category === category && styles.filterChipTextSelected,
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.clearButton]}
                onPress={() => {
                  dispatch(clearFilters());
                  setShowFilters(false);
                }}
              >
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.applyButton]}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get('window');
const kpiCardWidth = (width - 48) / 3; // 48 = total horizontal padding

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    fontSize: 16,
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
    marginTop: 16,  // Added top margin
  },
  kpiCard: {
    width: kpiCardWidth,
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    height: 'auto',
    minHeight: 90,
    elevation: 2,
    shadowColor: '#000',    
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    marginBottom: 16,
  },
  kpiIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4
  },
  kpiValue: {
    fontSize: Math.min(18, kpiCardWidth * 0.15),
    fontWeight: 'bold',
    marginBottom: 2,
  },
  kpiTitle: {
    fontSize: Math.min(11, kpiCardWidth * 0.1),
    color: '#666',
    textAlign: 'center',
  },
  categorySection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  jobCount: {
    fontSize: 14,
    color: '#666',
  },
  filterButton: {
    backgroundColor: '#1dbf73',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  filterButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 102, 204, 0.1)',
    marginLeft:5
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  filterChip: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  filterChipSelected: {
    backgroundColor: '#1dbf73',
    borderColor: '#1dbf73',
  },
  filterChipText: {
    color: '#666',
    fontSize: 14,
  },
  filterChipTextSelected: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  clearButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#1dbf73',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
    fontSize: 16,
  },
  recommendedTitle: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1dbf73',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recommendedTitleContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1dbf73',
    marginHorizontal: 15,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  recommendedSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  recommendedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  jobCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#e8f7f0',
  },
  exploreButtonText: {
    color: '#1dbf73',
    fontSize: 14,
    fontWeight: '600',
  },
});