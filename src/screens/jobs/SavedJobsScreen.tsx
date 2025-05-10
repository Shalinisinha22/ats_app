import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useAppSelector, useAppDispatch } from '../../redux/store';
import { fetchSavedJobs, fetchAllJobs } from '../../redux/jobsSlice';
import JobCard from '../../components/JobCard';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../../types';

export default function SavedJobsScreen() {
  const dispatch = useAppDispatch();
  const { savedJobs, allJobs, isLoading, error } = useAppSelector(state => state.jobs);

  useEffect(() => {
    // Fetch both saved job IDs and all jobs
    const loadJobs = async () => {
      await dispatch(fetchAllJobs());
      await dispatch(fetchSavedJobs());
    };
    loadJobs();
  }, [dispatch]);

  // Get full job objects for saved job IDs
  const savedJobObjects = savedJobs.map(savedJobId => 
    allJobs.find(job => job._id === savedJobId)
  ).filter((job): job is Job => job !== undefined);

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
      <ScrollView style={styles.jobsList}>
        {savedJobObjects.length > 0 ? (
          savedJobObjects.map(job => (
            <JobCard 
              key={job._id}
              job={job}
              showSaveButton={true}
              showApplyButton={true}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>No saved jobs yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the bookmark icon on any job to save it for later
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  jobsList: {
    flex: 1,
    padding: 16,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  }
});