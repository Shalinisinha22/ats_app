import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
            <Image 
              source={{ uri: job.company.logo }} 
              style={styles.companyLogo} 
            />
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{job.title}</Text>
              <Text style={styles.company}>
                {job.company?.userId?.name || 'Company Name'}
              </Text>
            </View>
          </View>
          {props.showSaveButton && (
            <TouchableOpacity onPress={handleSave} style={styles.saveIconButton}>
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"}
                size={24} 
                color={isSaved ? "#1dbf73" : "#666"} 
              />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.location}>{job.location || 'Location not specified'}</Text>
        <Text style={styles.jobType}>{job.jobType || 'Not specified'}</Text>
        <Text style={styles.salary}>
          {job.salaryRange ? 
            `₹${job.salaryRange.min.toLocaleString()} - ₹${job.salaryRange.max.toLocaleString()} /year` :
            'Salary not disclosed'
          }
        </Text>
        <Text style={styles.experience}>
          {job.experienceRange ? 
            `Experience: ${job.experienceRange.min}-${job.experienceRange.max} years` :
            'Experience: Not specified'
          }
        </Text>

        {props.showStatus && appliedJob?.status && (
          <View style={[styles.statusContainer, styles[appliedJob.status]]}>
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
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        )}

        {isApplied && !props.showStatus && (     
          <View style={styles.appliedBadge}>
            <Text style={styles.appliedText}>Applied Job</Text>
          </View>
        )}

  
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    margin:10
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
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  saveIconButton: {
    padding: 4,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex:1,
  },
  companyLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  company: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  jobType: {
    fontSize: 14,
    color: '#007AFF',
    backgroundColor: '#E5F1FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  salary: {
    fontSize: 14,
    color: '#1dbf73',
    marginTop: 4,
  },
  experience: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  applyButton: {
    backgroundColor: '#1dbf73',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
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