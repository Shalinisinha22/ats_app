import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../../redux/store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerParamList } from '../../navigation/types';
import { RouteProp } from '@react-navigation/native';

type Props = {
  navigation: NativeStackNavigationProp<DrawerParamList, 'JobDetails'>;
  route: RouteProp<DrawerParamList, 'JobDetails'>;
};

export default function JobDetailsScreen({ navigation, route }: Props) {
  const { jobId } = route.params;
  const allJobs = useAppSelector(state => state.jobs.allJobs);
  const appliedJobs = useAppSelector(state => state.jobs.appliedJobs);
  const job = allJobs.find(j => j._id === jobId);
  
  const appliedJob = appliedJobs.find(j => j._id === jobId);
  const isApplied = Boolean(appliedJob);

  if (!job) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Job not found</Text>
      </View>
    );
  }

  const handleApply = () => {
    navigation.replace('JobApplication', { job });
  };

  const DetailRow = ({ icon, label, value }: { icon: string; label: string; value: string }) => (
    <View style={styles.detailRow}>
      <View style={styles.detailIconContainer}>
        <Ionicons name={icon as any} size={20} color="#1dbf73" />
      </View>
      <View style={styles.detailTextContainer}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.header}>
          <Image 
            source={{ uri: job.company.logo }} 
            style={styles.companyLogo}
            defaultSource={require('../../../assets/default-logo.png')}
          />
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company.userId.name}</Text>
        </View>

        {/* Quick Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Overview</Text>
          <DetailRow
            icon="location-outline"
            label="Location"
            value={job.location}
          />
          <DetailRow
            icon="business-outline"
            label="Employment Type"
            value={job.jobType}
          />
          <DetailRow
            icon="cash-outline"
            label="Salary Range"
            value={`₹${job.salaryRange.min.toLocaleString()} - ₹${job.salaryRange.max.toLocaleString()} /year`}
          />
          <DetailRow
            icon="time-outline"
            label="Experience Required"
            value={`${job.experienceRange.min}-${job.experienceRange.max} years`}
          />
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.description}>{job.description}</Text>
        </View>

        {/* Key Responsibilities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Responsibilities</Text>
          <View style={styles.bulletList}>
            {job.responsibilities.map((resp, index) => (
              <View key={index} style={styles.bulletItem}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{resp.trim()}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Required Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Required Skills</Text>
          <View style={styles.skillsContainer}>
            {job.skillsRequired.map((skill, index) => (
              <View key={index} style={styles.skillBadge}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Company Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Company</Text>
          <Text style={styles.description}>
            {job.company?.userId?.name} is a leading organization in {job.company.industry}. 
            {job.company.about}
          </Text>
        </View>
      </ScrollView>

      {/* Apply Button */}
      <View style={styles.footer}>
        {isApplied ? (
          <View style={[styles.appliedButton, styles[appliedJob?.status || 'pending']]}>
            <Text style={styles.appliedButtonText}>
              {appliedJob?.status === 'shortlisted' ? 'Shortlisted' :
               appliedJob?.status === 'rejected' ? 'Application Rejected' :
               'Application Submitted'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
          >
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  companyLogo: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  company: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(29, 191, 115, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailTextContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  skillBadge: {
    backgroundColor: 'rgba(29, 191, 115, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  skillText: {
    color: '#1dbf73',
    fontSize: 14,
    fontWeight: '500',
  },
  bulletList: {
    paddingLeft: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  bullet: {
    fontSize: 16,
    color: '#1dbf73',
    marginRight: 8,
    marginTop: -2,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  applyButton: {
    backgroundColor: '#1dbf73',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  appliedButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  appliedButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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
  errorText: {
    fontSize: 18,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 20,
  },
});