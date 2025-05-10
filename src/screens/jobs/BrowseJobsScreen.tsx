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

// Add filterJobs function before the component
const filterJobs = (jobs: Job[], filters: JobFilters) => {
  if (!jobs || !filters) return [];
  
  return jobs.filter(job => {
    const matchesSearch = !filters.search || 
      job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      (job.company?.name || '').toLowerCase().includes(filters.search.toLowerCase());

    const matchesLocation = !filters.location || 
      job.location.toLowerCase() === filters.location.toLowerCase();

    const matchesCategory = !filters.category || 
      job.category.toLowerCase() === filters.category.toLowerCase();

    return matchesSearch && matchesLocation && matchesCategory;
  });
};

export default function BrowseJobsScreen() {
  const dispatch = useAppDispatch();
  const { allJobs, savedJobs, appliedJobs, isLoading, error } = useAppSelector(state => state.jobs);
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
    return Array.from(new Set(jobs.map(job => job.location)));
  };

  const getUniqueCategories = (jobs: Job[]) => {
    return Array.from(new Set(jobs.map(job => job.category)));
  };

  // Use mockJobs as fallback if API fails or returns empty
  const jobs = allJobs.length > 0 ? allJobs : mockJobs;
  
  const locations = getUniqueLocations(jobs);
  const categories = getUniqueCategories(jobs);

  // Calculate KPI metrics
  const totalApplied = appliedJobs.length;
  const totalSaved = savedJobs.length;
  const totalInterviews = appliedJobs.filter(job => job.status === 'shortlisted').length;

  // Add validation function for jobs
  const isValidJob = (job: any): job is Job => {
    return job && typeof job._id === 'string';
  };

  // Filter out invalid jobs before rendering
  const validJobs = allJobs.filter(isValidJob);

  const renderJobs = () => {
    // Only show loading on initial load
    if (isLoading && allJobs.length === 0) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#1dbf73" />
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

    return filteredJobs.map(job => (
      <JobCard
      key={`job-${job._id}-${job.company._id}`}
        job={job}
        showSaveButton={true}
        showApplyButton={true}
      />
    ));
  };


  // Update the search handler to include null check
  const handleSearch = (text: string) => {
    dispatch(setFilters({ 
      search: text 
    }));
  };

  const handleFilter = (filterType: 'location' | 'category', value: string) => {
    dispatch(setFilters({ [filterType]: value }));
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

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
      <TextInput
          style={styles.searchInput}
          placeholder="Search jobs..."
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

      <ScrollView style={styles.content}>
      <View style={styles.kpiContainer}>
          <KPICard
            title="Applied Jobs"
            value={totalApplied}
            icon="briefcase-outline"
            color="#1dbf73"
          />
          <KPICard
            title="Recommended Jobs"
            value={totalInterviews}
            icon="calendar-outline"
            color="#ff9500"
          />
          <KPICard
            title="Saved Jobs"
            value={totalSaved}
            icon="bookmark-outline"
            color="#007aff"
          />
        </View>


        <View style={styles.recommendedTitleContainer}>
          <Text style={styles.recommendedTitle}>Recommended Jobs</Text>
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
  searchContainer: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
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
    padding: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
    height: 'auto',
    minHeight: 90,
  },
  kpiIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
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
    marginHorizontal: 16,
    marginBottom: 16,
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
});