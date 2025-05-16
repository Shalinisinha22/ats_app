import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Linking ,
  Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DrawerParamList } from '../../navigation/types';
import { useAppSelector } from '../../redux/store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as WebBrowser from 'expo-web-browser';

type Props = NativeStackScreenProps<DrawerParamList, 'ApplicationDetails'>;

export default function ApplicationDetails({ route, navigation }: Props) {
  const { applicationId } = route.params;
  const { applications } = useAppSelector(state => state.jobs);
  
  const application = applications.find(app => app._id === applicationId);

  if (!application) {
    return (
      <View style={styles.container}>
        <Text>Application not found</Text>
      </View>
    );
  }

    const handleOpenResume = async (url) => {
      try {
        const fileUrl = url;
    
      
     
    
        // Ensure Cloudinary link uses fl_attachment (if applicable)
        const isCloudinary = fileUrl.includes('res.cloudinary.com');
        const cleanUrl = isCloudinary
          ? fileUrl.replace('/upload/', '/upload/fl_attachment/')
          : fileUrl;
    
        const options = [
          {
            name: 'Direct Download',
            handler: async () => {
              const supported = await Linking.canOpenURL(cleanUrl);
              if (supported) {
                await Linking.openURL(cleanUrl);
              } else {
                throw new Error('Cannot open direct URL');
              }
            }
          },
          {
            name: 'Google Docs Viewer',
            handler: async () => {
              const url = `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(cleanUrl)}`;
              await WebBrowser.openBrowserAsync(url);
            }
          }
        ];
    
        Alert.alert(
          'Open Resume',
          'Choose how you would like to view the resume:',
          [
            ...options.map(option => ({
              text: option.name,
              onPress: async () => {
                try {
                  await option.handler();
                } catch (error) {
                  console.error(`Error with ${option.name}:`, error);
                  Alert.alert(
                    'Failed to Open',
                    `Could not open with ${option.name}. Try direct download instead?`,
                    [
                      {
                        text: 'Download',
                        onPress: async () => {
                          try {
                            await Linking.openURL(cleanUrl);
                          } catch (e) {
                            Alert.alert('Error', 'Failed to download file.');
                          }
                        }
                      },
                      { text: 'Cancel', style: 'cancel' }
                    ]
                  );
                }
              }
            })),
            { text: 'Cancel', style: 'cancel' }
          ]
        );
      } catch (error) {
        console.error('Resume open error:', error);
        Alert.alert('Error', 'Failed to open resume.');
      } finally {
       
      }
    };
    

  const formatDate = (date: string) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const renderStatusBadge = () => {
    const getStatusColor = () => {
      switch (application.status.toLowerCase()) {
        case 'shortlisted': return '#1dbf73';
        case 'rejected': return '#ff3b30';
        default: return '#ff9500';
      }
    };

    return (
      <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
        <Text style={styles.statusText}>{application.status}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.jobTitle}>{application.jobDetails.title}</Text>
        {renderStatusBadge()}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Details</Text>
        <View style={styles.detailRow}>
          <Ionicons name="business" size={20} color="#666" />
          <Text style={styles.detailText}>{application.companyDetails.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="location" size={20} color="#666" />
          <Text style={styles.detailText}>{application.jobDetails.location}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar" size={20} color="#666" />
          <Text style={styles.detailText}>Applied on {formatDate(application.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Applicant Details</Text>
        <View style={styles.detailRow}>
          <Ionicons name="person" size={20} color="#666" />
          <Text style={styles.detailText}>{application.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="mail" size={20} color="#666" />
          <Text style={styles.detailText}>{application.email}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="currency-inr" size={20} color="#666" />
          <Text style={styles.detailText}>
            {`${(application.currentCTC / 100000).toFixed(1)}L → ${(application.expectedCTC / 100000).toFixed(1)}L`}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="hourglass" size={20} color="#666" />
          <Text style={styles.detailText}>{application.noticePeriod} days notice period</Text>
        </View>
      </View>

      {application.experience && application.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {application.experience.map((exp, index) => (
            <View key={exp._id || index} style={styles.experienceItem}>
              <Text style={styles.companyName}>{exp.company}</Text>
              <Text style={styles.jobRole}>{exp.title}</Text>
              <Text style={styles.duration}>
                {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
              </Text>
              <Text style={styles.description}>{exp.description}</Text>
            </View>
          ))}
        </View>
      )}

      {application.education && application.education.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {application.education.map((edu, index) => (
            <View key={edu._id || index} style={styles.educationItem}>
              <Text style={styles.degree}>{edu.degree}</Text>
              <Text style={styles.institution}>{edu.institution}</Text>
              <Text style={styles.duration}>
                {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resume</Text>
        <TouchableOpacity 
          style={styles.resumeButton}
          onPress={() => handleOpenResume(application.resume.url)}
        >
          <Ionicons name="document-text" size={20} color="#fff" />
          <Text style={styles.resumeButtonText}>View Resume</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    fontSize: 15,
    color: '#444',
  },
  experienceItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  companyName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  jobRole: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  duration: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    lineHeight: 20,
  },
  educationItem: {
    marginBottom: 16,
  },
  degree: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  institution: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  resumeButton: {
    backgroundColor: '#1dbf73',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  resumeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});