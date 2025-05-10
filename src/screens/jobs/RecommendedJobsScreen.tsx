import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useAppSelector } from '../../redux/store';
import JobCard from '../../components/JobCard';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DrawerParamList } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';

export default function RecommendedJobsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<DrawerParamList>>();
  const allJobs = useAppSelector(state => state.jobs.allJobs);
  const user = useAppSelector(state => state.auth.user);
  const [refreshing, setRefreshing] = React.useState(false);

  // Enhanced recommendation algorithm
  const getRecommendedJobs = () => {
    if (!user?.skills?.length) {
      return allJobs.slice(0, 5);
    }

    return allJobs
      .map(job => {
        const matchScore = user.skills.reduce((score, skill) => {
          const skillLower = skill.toLowerCase();
          let points = 0;
          
          // Title match has highest weight
          if (job.title.toLowerCase().includes(skillLower)) {
            points += 3;
          }
          
          // Description match has medium weight
          if (job.description.toLowerCase().includes(skillLower)) {
            points += 2;
          }
          
          // Category match has lowest weight
          if (job.category.toLowerCase().includes(skillLower)) {
            points += 1;
          }
          
          return score + points;
        }, 0);

        return { ...job, matchScore };
      })
      .filter(job => job.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const recommendedJobs = getRecommendedJobs();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      {recommendedJobs.length > 0 ? (
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>Recommended For You</Text>
            <Text style={styles.subText}>
              {user?.skills?.length 
                ? 'Based on your skills and preferences'
                : 'Add skills to your profile for personalized recommendations'}
            </Text>
          </View>
          
          <View style={styles.jobList}>
            {recommendedJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                showSaveButton={true}
                showApplyButton={true}
                onPress={() => navigation.navigate('JobDetails', { jobId: job.id })}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="briefcase-outline" size={60} color="#666" />
          <Text style={styles.emptyTitle}>No Recommendations Yet</Text>
          <Text style={styles.emptyMessage}>
            Add your skills in profile to get personalized job recommendations
          </Text>
        </View>
      )}
    </View>
  );
}

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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  jobList: {
    padding: 16,
    gap: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
});