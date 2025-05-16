import React, { useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Modal,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import NotificationService from '../../services/NotificationService';
import { StoredNotification } from '../../types/notification';
import { format } from 'date-fns';

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  useEffect(() => {
    checkAndRequestPermissions();
  }, []);

  useEffect(() => {
    // Mark all as read when screen is focused
    const unsubscribeFocus = navigation.addListener('focus', () => {
      NotificationService.markAllAsRead();
    });

    loadNotifications();

    return () => {
      unsubscribeFocus();
    };
  }, [navigation]);

  const checkAndRequestPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus !== 'granted') {
      setShowPermissionModal(true);
    } else {
      await setupNotifications();
    }
  };

  const handleAllowNotifications = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setShowPermissionModal(false);

    if (status === 'granted') {
      await setupNotifications();
    } else {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive updates.',
        [{ text: 'OK' }]
      );
    }
  };

  const setupNotifications = async () => {
    try {
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#1dbf73',
        });
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId ?? null,
      });
      console.log('Push token:', token);

      // Store token in your backend here if needed
      
      const subscription = Notifications.addNotificationReceivedListener(notification => {
        console.log('Received notification:', notification);
        loadNotifications();
      });

      return () => subscription.remove();
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }
  };

  const loadNotifications = async () => {
    const storedNotifications = await NotificationService.getNotifications();
    setNotifications(storedNotifications);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: StoredNotification) => {
    if (!notification.read) {
      await NotificationService.markAsRead(notification.id);
      loadNotifications();
    }
  };

  const renderNotification = ({ item }: { item: StoredNotification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadItem]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={[styles.notificationIcon, { backgroundColor: '#1dbf73' }]}>
        <Ionicons name="notifications-outline" size={20} color="#fff" />
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.body} numberOfLines={2}>
          {item.body}
        </Text>
        <Text style={styles.timestamp}>
          {format(new Date(item.timestamp), 'MMM dd, yyyy HH:mm')}
        </Text>
      </View>
      {!item.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  const renderPermissionModal = () => (
    <Modal
      visible={showPermissionModal}
      transparent
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Ionicons name="notifications-outline" size={50} color="#1dbf73" />
          <Text style={styles.modalTitle}>Enable Notifications</Text>
          <Text style={styles.modalText}>
            Stay updated with job matches, application status, and important updates.
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity 
              style={[styles.modalButton, styles.laterButton]}
              onPress={() => setShowPermissionModal(false)}
            >
              <Text style={styles.laterButtonText}>Later</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modalButton, styles.allowButton]}
              onPress={handleAllowNotifications}
            >
              <Text style={styles.allowButtonText}>Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        )}
      />
      {renderPermissionModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center'
  },
  unreadItem: {
    backgroundColor: '#f0f9ff'
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  notificationContent: {
    flex: 1
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4
  },
  body: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 4
  },
  timestamp: {
    fontSize: 12,
    color: '#6c757d'
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1dbf73',
    marginLeft: 8
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  emptyText: {
    fontSize: 16,
    color: '#6c757d'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  modalText: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  allowButton: {
    backgroundColor: '#1dbf73',
  },
  laterButton: {
    backgroundColor: '#f0f0f0',
  },
  allowButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  laterButtonText: {
    color: '#666',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default NotificationsScreen;