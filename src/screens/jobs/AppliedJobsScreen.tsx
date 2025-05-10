import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useAppSelector } from '../../redux/store';
import JobCard from '../../components/JobCard';
import { Ionicons } from '@expo/vector-icons';
import { Job } from '../../types';

export default function AppliedJobsScreen() {
  const { appliedJobs, isLoading } = useAppSelector(state => state.jobs);

  // Group jobs by status with proper type checking
  const jobsByStatus = appliedJobs.reduce((acc, job: Job) => {
    // Ensure status is a string
    const status = (job.status || 'pending').toString();
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(job);
    return acc;
  }, {} as Record<string, Job[]>);

  const renderStatusSection = (status: string, jobs: Job[]) => (
    <View key={status} style={styles.statusSection}>
      <View style={styles.statusHeader}>
        <Text style={styles.statusTitle}>
          {String(status).charAt(0).toUpperCase() + String(status).slice(1)} Applications
        </Text>
        <Text style={styles.jobCount}>{jobs.length.toString()}</Text>
      </View>
      {jobs.map((job: Job) => (
        <JobCard
          key={job._id.toString()}
          job={{
            ...job,
            company: {
              ...job.company,
              name: job.company?.userId?.name || 'Company Name' // Ensure company name is a string
            }
          }}
          showStatus
          showSaveButton={false}
          showApplyButton={false}
        />
      ))}
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#1dbf73" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        <View style={styles.kpiContainer}>
          <KPICard
            title="Total Applied"
            value={appliedJobs.length}
            icon="document-text-outline"
            color="#1dbf73"
          />
          <KPICard
            title="Shortlisted"
            value={appliedJobs.filter(job => job.status === 'shortlisted').length}
            icon="checkmark-circle-outline"
            color="#007aff"
          />
          <KPICard
            title="Pending"
            value={appliedJobs.filter(job => job.status === 'pending').length}
            icon="time-outline"
            color="#ff9500"
          />
        </View>

        {Object.entries(jobsByStatus).map(([status, jobs]) => 
          renderStatusSection(status, jobs)
        )}

        {appliedJobs.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#666" />
            <Text style={styles.emptyStateText}>No applications yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start applying to jobs to track your applications here
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const KPICard = ({ title, value, icon, color }: {
  title: string;
  value: number;
  icon: string;
  color: string;
}) => (
  <View style={[styles.kpiCard, { borderColor: color }]}>
    <View style={[styles.kpiIconContainer, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon as any} size={24} color={color} />
    </View>
    <Text style={styles.kpiValue}>{value.toString()}</Text>
    <Text style={styles.kpiTitle}>{title}</Text>
  </View>
);

const { width } = Dimensions.get('window');
const kpiCardWidth = (width - 48) / 3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  kpiCard: {
    width: kpiCardWidth,
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  kpiTitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  statusSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  jobCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
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
  },
});