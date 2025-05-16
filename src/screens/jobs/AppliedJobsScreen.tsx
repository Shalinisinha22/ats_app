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
import { LinearGradient } from 'expo-linear-gradient';
import { Job } from '../../types';
import ApplicationCard from '../../components/ApplicationCard';

export default function AppliedJobsScreen() {
  const { applications, isLoading } = useAppSelector(state => state.jobs);


console.log('applications', applications);

  const renderApplications = () => (
    <View style={styles.applicationsContainer}>
      {applications.map(application => (
        <ApplicationCard
          key={application._id}
          application={application}
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
            title="Active Applications"
            value={applications.length}
            icon="briefcase-outline"
            gradient={['#1dbf73', '#34d88b']}
          />
          <KPICard
            title="Shortlisted"
            value={applications.filter(job => job.status === 'Shortlisted').length}
            icon="checkmark-circle-outline"
            gradient={['#007aff', '#32a4ff']}
          />
          <KPICard
            title="Pending Review"
            value={applications.filter(job => job.status === 'Pending').length}
            icon="time-outline"
            gradient={['#ff9500', '#ffac31']}
          />
        </View>

        {renderApplications()}

        {applications.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No applications yet</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const KPICard = ({ title, value, icon, gradient }: {
  title: string;
  value: number;
  icon: string;
  gradient: string[];
}) => (
  <View style={styles.kpiCard}>
    <LinearGradient
      colors={gradient}
      style={styles.kpiGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Ionicons name={icon as any} size={20} color="#fff" />
      <Text style={styles.kpiValue}>{value}</Text>
      <Text style={styles.kpiTitle}>{title}</Text>
    </LinearGradient>
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
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
 
  },
  kpiGradient: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 8,
  },
  kpiTitle: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
  },
  statusSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  statusHeaderGradient: {
    borderRadius: 12,
    marginBottom: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  statusHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  statusBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  jobCount: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  jobsContainer: {
    gap: 12,
  },
  applicationsContainer: {
    gap: 12,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 32,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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