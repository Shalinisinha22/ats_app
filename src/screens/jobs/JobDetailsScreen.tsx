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
  const exploreJobs = useAppSelector(state => state.jobs.exploreJobs);
  const appliedJobs = useAppSelector(state => state.jobs.appliedJobs);
  const job = exploreJobs.find(j => j._id === jobId);
  
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
    navigation.navigate('JobApplication', { job });
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
          {job.company.logo ? (
            <Image 
              source={{ uri: job.company.logo }} 
              style={styles.companyLogo}
              defaultSource={require('../../../assets/default-logo.png')}
            />
          ) : (
            <Ionicons name="business" size={45} color="#666" />
          )}
          <Text style={styles.title}>{job.title}</Text>
          <Text style={styles.company}>{job.company.name}</Text>
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
            icon="laptop-outline"
            label="Work Mode"
            value={job.jobMode}
          />
          <DetailRow
            icon="cash-outline"
            label="Salary Range"
            value={`₹${job.salaryRange.min.toLocaleString()} - ₹${job.salaryRange.max.toLocaleString()} /year`}
          />
          <DetailRow
            icon="briefcase-outline"
            label="Department"
            value={job.department}
          />
          <DetailRow
            icon="trending-up-outline"
            label="Experience Level"
            value={job.experienceLevel}
          />
          <DetailRow
            icon="time-outline"
            label="Experience Required"
            value={`${job.experienceRange.min}-${job.experienceRange.max} years`}
          />
          <DetailRow
            icon="calendar-outline"
            label="Application Deadline"
            value={new Date(job.applicationDeadline).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          />
          <DetailRow
            icon="time-outline"
            label="Posted On"
            value={new Date(job.createdAt).toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
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

        {/* Company Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company Details</Text>
          <View style={styles.companyDetails}>
            <DetailRow
              icon="business-outline"
              label="Company Size"
              value={job.companyProfile?.companySize || 'Not specified'}
            />
            <DetailRow
              icon="globe-outline"
              label="Industry"
              value={job.companyProfile?.industry || 'Not specified'}
            />
            <DetailRow
              icon="location-outline"
              label="Company Location"
              value={job.companyProfile?.location || 'Not specified'}
            />
            {job.companyProfile?.website && (
              <DetailRow
                icon="link-outline"
                label="Website"
                value={job.companyProfile.website}
              />
            )}
            {job.companyProfile?.about && (
              <View style={styles.aboutCompany}>
                <Text style={styles.aboutLabel}>About Company</Text>
                <Text style={styles.aboutText}>{job.companyProfile.about}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Application Status Section */}
        {job.alreadyApplied && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Application Status</Text>
            <View style={styles.statusContainer}>
              <View style={[styles.statusBadge, styles.pending]}>
                <Ionicons name="time" size={24} color="#fff" />
                <Text style={styles.statusText}>Application Under Review</Text>
              </View>
              <Text style={styles.appliedDate}>
                Applied on: {new Date(job.updatedAt).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer Section */}
      <View style={styles.footer}>
        {job.alreadyApplied ? (
          <View style={[styles.appliedButton, styles.pending,{    backgroundColor: '#a5a5a5',
    }]}>
            <Text style={styles.appliedButtonText}> Already Applied</Text>
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
    backgroundColor: '#495057',
    
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
  statusContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  statusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statusDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  appliedDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  aboutCompany: {
    marginTop: 16,
  },
  aboutLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
  },
  companyDetails: {
    marginTop: 8,
  },
});