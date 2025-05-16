import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

interface ApplicationCardProps {
  application: {
    _id: string;
    job: {
      title: string;
      company: string;
      location: string;
      jobType: string;
    };
    status: string;
    createdAt: string;
    resume: {
      name: string;
    };
    currentCTC: number;
    expectedCTC: number;
    noticePeriod: number;
  };
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application }) => {
  const navigation = useNavigation();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shortlisted':
        return ['#1dbf73', '#34d88b'];
      case 'rejected':
        return ['#ff3b30', '#ff6961'];
      case 'pending':
      default:
        return ['#ff9500', '#ffac31'];
    }
  };
// console.log('ApplicationCard', application);
 
  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('ApplicationDetails', { applicationId: application._id })}
    >
      <View style={styles.header}>
        <View style={styles.jobInfo}>
          <Text style={styles.jobTitle}>{application.jobDetails.title}</Text>
          <Text style={styles.companyName}>{application.companyDetails.name}</Text>
        </View>
        <LinearGradient
          colors={getStatusColor(application.status)}
          style={styles.statusBadge}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.statusText}>
            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={16} color="#666" />
            <Text style={styles.detailText}>{application.jobDetails.location}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
            <Text style={styles.detailText}>{application.jobDetails.jobType}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="currency-inr" size={16} color="#666" />
            <Text style={styles.detailText}>
              {`${(application.currentCTC / 100000).toFixed(1)}L → ${(application.expectedCTC / 100000).toFixed(1)}L`}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="timer-sand" size={16} color="#666" />
            <Text style={styles.detailText}>{`${application.noticePeriod} days notice`}</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Ionicons name="document-text-outline" size={16} color="#666" />
          <Text style={styles.resumeText}>{application.resume.name}</Text>
        </View>
        <Text style={styles.dateText}>
          {format(new Date(application.createdAt), 'MMM d, yyyy')}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobInfo: {
    flex: 1,
    marginRight: 12,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  detailsContainer: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 13,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resumeText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 12,
  },
  dateText: {
    color: '#666',
    fontSize: 12,
  },
});

export default ApplicationCard;