import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Job } from '../types';
import { useAppDispatch, useAppSelector } from '../redux/store';
import { saveJobToApi, unsaveJobFromApi, fetchSavedJobs } from '../redux/jobsSlice';
import { RootState } from '../redux/store';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerParamList } from '../navigation/types';
import Toast from 'react-native-toast-message';

type Props = {
  job: Job;
  showSaveButton?: boolean;
  showApplyButton?: boolean;
  showStatus?: boolean;
  onPress?: () => void;
  
};

export default function JobCard({ job, ...props }: Props) {
  if (!job) {
    return (
      <View style={styles.card}>
        <Text>Loading job details...</Text>
      </View>
    );
  }

  const dispatch = useAppDispatch();
  const navigation = useNavigation<NativeStackNavigationProp<DrawerParamList>>();
  
  const savedJobs = useAppSelector((state: RootState) => state.jobs.savedJobs);
  const appliedJobs = useAppSelector((state: RootState) => state.jobs.appliedJobs ?? []);

  const isSaved = savedJobs.includes(job._id);
  const isApplied = appliedJobs?.some(appliedJob => appliedJob._id === job._id) ?? false;
  const appliedJob = appliedJobs?.find(appliedJob => appliedJob._id === job._id);

  useEffect(() => {
    dispatch(fetchSavedJobs());
  }, [dispatch]);

  const handleSave = async () => {
    try {
      if (isSaved) {
        await dispatch(unsaveJobFromApi(job._id)).unwrap();
        Toast.show({
          type: 'success',
          text1: 'Job Unsaved',
          text2: 'Job has been removed from your saved jobs',
          position: 'bottom',
          visibilityTime: 2000,
        });
      } else {
        await dispatch(saveJobToApi(job._id)).unwrap();
        Toast.show({
          type: 'success',
          text1: 'Job Saved',
          text2: 'Job has been added to your saved jobs',
          position: 'bottom',
          visibilityTime: 2000,
        });
      }
    } catch (error: any) {
      console.error('Error saving/unsaving job:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error?.message || 'Failed to save/unsave job',
        position: 'bottom',
        visibilityTime: 2000,
      });
    }
  };

  const handleApply = () => {
    navigation.navigate('JobApplication', { job });
  };

  return (
    <View style={styles.card}>
      <TouchableOpacity 
        style={styles.cardContent}
        onPress={props.onPress || (() => navigation.navigate('JobDetails', { jobId: job._id }))}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            <View style={styles.logoContainer}>
              <Image 
                source={{ uri: job.company.logo }} 
                style={styles.companyLogo} 
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{job.title}</Text>
              <Text style={styles.company}>
                <Ionicons name="business" size={14} color="#666" /> {job.company?.userId?.name || 'Company Name'}
              </Text>
            </View>
          </View>
          {props.showSaveButton && (
            <TouchableOpacity onPress={handleSave} style={styles.saveIconButton}>
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={24} 
                color={isSaved ? "#5e5e5e" : "#666"} 
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <Ionicons name="location" size={16} color="#666" />
              <Text style={styles.location}>{job.location || 'Location not specified'}</Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
              <Text style={styles.jobType}>{job.jobType || 'Not specified'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="currency-inr" size={16} color="#1dbf73" />
              <Text style={styles.salary}>
                {job.salaryRange ? 
                  `${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()} /year` :
                  'Salary not disclosed'
                }
              </Text>
            </View>
            <View style={styles.detailItem}>
              <MaterialCommunityIcons name="badge-account" size={16} color="#666" />
              <Text style={styles.experience}>
                {job.experienceRange ? 
                  `${job.experienceRange.min}-${job.experienceRange.max} years` :
                  'Not specified'
                }
              </Text>
            </View>
          </View>
        </View>

        {props.showStatus && appliedJob?.status && (
          <View style={[styles.statusContainer, styles[appliedJob.status]]}>
            <MaterialCommunityIcons 
              name={appliedJob.status === 'shortlisted' ? 'check-circle' : 
                   appliedJob.status === 'rejected' ? 'close-circle' : 'clock-outline'} 
              size={18} 
              color="#fff" 
            />
            <Text style={styles.statusText}>
              {appliedJob.status.charAt(0).toUpperCase() + appliedJob.status.slice(1)}
            </Text>
          </View>
        )}

        {(props.showApplyButton && !isApplied) && (
          <TouchableOpacity 
            style={styles.applyButton}
            onPress={handleApply}
          >
            <Ionicons name="paper-plane" size={18} color="#fff" />
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        )}

        {isApplied && !props.showStatus && (     
          <View style={styles.appliedBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.appliedText}>Applied</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    margin: 15,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  saveIconButton: {
    padding: 4,
  },
  icon: {
    padding: 4,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    backgroundColor: '#f5f5f5',
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  companyLogo: {
    width: 45,
    height: 45,
    borderRadius: 10,
  },
  titleContainer: {
    flex: 1,
  },
  company: {
    fontSize: 14,
    color: '#666',
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsContainer: {
    marginTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  jobType: {
    fontSize: 14,
    color: '#007AFF',
  },
  salary: {
    fontSize: 14,
    color: '#1dbf73',
    fontWeight: '600',
  },
  experience: {
    fontSize: 14,
    color: '#666',
  },
  applyButton: {
    backgroundColor: '#1dbf73',
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#1dbf73',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  appliedBadge: {
    backgroundColor: '#34C759',
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  appliedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusContainer: {
    padding: 8,
    borderRadius: 6,
    marginTop: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    gap: 6,
  },
  pending: {
    backgroundColor: '#FF9500',
  },
  shortlisted: {
    backgroundColor: '#34C759',
  },
  rejected: {
    backgroundColor: '#FF3B30',
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});