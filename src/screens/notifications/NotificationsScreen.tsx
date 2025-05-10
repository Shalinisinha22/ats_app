import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'application' | 'shortlist' | 'system';
};

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Application Status Update',
    message: 'Your application for Senior Software Engineer at TechCorp India has been shortlisted.',
    timestamp: '2 hours ago',
    read: false,
    type: 'shortlist',
  },
  {
    id: '2',
    title: 'New Job Recommendation',
    message: 'We found a new job matching your profile: Full Stack Developer at Innovate Solutions',
    timestamp: '1 day ago',
    read: false,
    type: 'system',
  },
];

export default function NotificationsScreen() {
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'application':
        return 'briefcase-outline';
      case 'shortlist':
        return 'checkmark-circle-outline';
      case 'system':
        return 'notifications-outline';
      default:
        return 'notifications-outline';
    }
  };

  const getIconColor = (type: Notification['type']) => {
    switch (type) {
      case 'application':
        return '#007AFF';
      case 'shortlist':
        return '#34C759';
      case 'system':
        return '#FF9500';
      default:
        return '#666';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.notificationsList}>
        {mockNotifications.map(notification => (
          <TouchableOpacity
            key={notification.id}
            style={[
              styles.notificationCard,
              !notification.read && styles.unreadCard
            ]}
          >
            <View style={[
              styles.iconContainer,
              { backgroundColor: getIconColor(notification.type) + '15' }
            ]}>
              <Ionicons
                name={getIcon(notification.type)}
                size={24}
                color={getIconColor(notification.type)}
              />
            </View>
            <View style={styles.contentContainer}>
              <Text style={styles.title}>{notification.title}</Text>
              <Text style={styles.message}>{notification.message}</Text>
              <Text style={styles.timestamp}>{notification.timestamp}</Text>
            </View>
            {!notification.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
      </ScrollView>
      {mockNotifications.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-off-outline" size={48} color="#666" />
          <Text style={styles.emptyStateText}>No notifications yet</Text>
          <Text style={styles.emptyStateSubtext}>
            We'll notify you when there are updates about your job applications
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
  notificationsList: {
    padding: 16,
  },
  notificationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  unreadCard: {
    backgroundColor: '#fff',
    borderLeftWidth: 4,
    borderLeftColor: '#1dbf73',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1dbf73',
    marginLeft: 8,
    marginTop: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});