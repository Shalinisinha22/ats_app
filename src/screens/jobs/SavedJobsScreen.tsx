import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  useWindowDimensions,
  ImageBackground
} from 'react-native';
import { useAppSelector, useAppDispatch } from '../../redux/store';
import { fetchSavedJobs, fetchAllJobs } from '../../redux/jobsSlice';
import JobCard from '../../components/JobCard';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Job } from '../../types';

export default function SavedJobsScreen() {
  const dispatch = useAppDispatch();
  const { savedJobs, allJobs, isLoading, error } = useAppSelector(state => state.jobs);

  useEffect(() => {
    const loadJobs = async () => {
      await dispatch(fetchAllJobs());
      await dispatch(fetchSavedJobs());
    };
    loadJobs();
  }, [dispatch]);

  const savedJobObjects = savedJobs.map(savedJobId => 
    allJobs.find(job => job._id === savedJobId)
  ).filter((job): job is Job => job !== undefined);

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.headerContent}>
        <View style={styles.statsContainer}>
          <MaterialCommunityIcons name="bookmark-multiple" size={28} color="#1dbf73" />
          <Text style={styles.statsText}>
            {savedJobObjects.length} Saved {savedJobObjects.length === 1 ? 'Job' : 'Jobs'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    if (savedJobObjects.length === 0) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="bookmark-off-outline" size={64} color="#666" />
          <Text style={styles.emptyStateText}>No saved jobs yet</Text>
          <Text style={styles.emptyStateSubtext}>
            Save interesting jobs to apply for them later
          </Text>
        </View>
      );
    }

    return (
      <ScrollView 
        style={styles.jobsList}
        contentContainerStyle={{ padding: 16 }}
      >
        {savedJobObjects.map(job => (
          <JobCard 
            key={job._id}
            job={job}
            showSaveButton={true}
            showApplyButton={true}
            showBadge={false}
          />
        ))}
      </ScrollView>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1dbf73" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3436',
  },
  jobsList: {
    flex: 1,
  },
  errorText: {
    color: '#ff7675',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 60,
  },
  emptyStateText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3436',
    marginTop: 24,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});