import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredNotification } from '../types/notification';

// Configure notification handler with enhanced settings
Notifications.setNotificationHandler({
  handleNotification: async () => {
    console.log('[Notification] Handling incoming notification');
    return {
      shouldShowAlert: true,  // Force alert to show
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidImportance.HIGH,
      presentation: {  // iOS specific
        alert: true,
        badge: true,
        sound: true
      }
    };
  },
});

// Create Android notification channel
const createNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1dbf73',
      sound: true,
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });
  }
};

class NotificationService {
  private static instance: NotificationService;
  private messageSubscription: Notifications.Subscription | null = null;
  private responseSubscription: Notifications.Subscription | null = null;
  private static readonly STORAGE_KEY = '@notifications';
  private notifications: StoredNotification[] = [];
  private readListeners: Set<() => void> = new Set();

  constructor() {
    this.loadStoredNotifications();
  }

  // Implement singleton pattern
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async loadStoredNotifications() {
    try {
      const stored = await AsyncStorage.getItem(NotificationService.STORAGE_KEY);
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    } catch (error) {
      console.error('[Notification] Failed to load stored notifications:', error);
    }
  }

  private async saveNotifications() {
    try {
      await AsyncStorage.setItem(
        NotificationService.STORAGE_KEY,
        JSON.stringify(this.notifications)
      );
    } catch (error) {
      console.error('[Notification] Failed to save notifications:', error);
    }
  }

  async getNotifications(): Promise<StoredNotification[]> {
    return this.notifications;
  }

  async markAsRead(id: string) {
    this.notifications = this.notifications.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    );
    await this.saveNotifications();
    this.notifyReadListeners();
  }

  async markAllAsRead() {
    this.notifications = this.notifications.map(notification => ({
      ...notification,
      read: true
    }));
    await this.saveNotifications();
    this.notifyReadListeners();
  }

  onNotificationsRead(callback: () => void) {
    this.readListeners.add(callback);
    return () => {
      this.readListeners.delete(callback);
    };
  }

  private notifyReadListeners() {
    this.readListeners.forEach(listener => listener());
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  async clearNotifications() {
    this.notifications = [];
    await this.saveNotifications();
  }

  async requestPermissions() {
    try {
      if (!Device.isDevice) {
        Alert.alert('Physical device required', 'Notifications require a physical device.');
        return false;
      }

      // Set up Android channel
      await createNotificationChannel();

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission required', 'Please enable notifications to receive updates.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('[Notification] Permission request failed:', error);
      return false;
    }
  }

  onMessageReceived(callback: (notification: Notifications.Notification) => void) {
    // Remove existing subscription if any
    if (this.messageSubscription) {
      this.messageSubscription.remove();
    }

    this.messageSubscription = Notifications.addNotificationReceivedListener(async (notification) => {
      console.log('[Notification] Received:', notification);
      
      // Store the notification
      const storedNotification: StoredNotification = {
        id: notification.request.identifier,
        title: notification.request.content.title || '',
        body: notification.request.content.body || '',
        data: notification.request.content.data,
        timestamp: notification.date,
        read: false
      };

      this.notifications.unshift(storedNotification);
      await this.saveNotifications();
      
      callback(notification);
    });

    return () => {
      if (this.messageSubscription) {
        this.messageSubscription.remove();
      }
    };
  }

  onNotificationTapped(callback: (response: Notifications.NotificationResponse) => void) {
    // Remove existing subscription if any
    if (this.responseSubscription) {
      this.responseSubscription.remove();
    }

    this.responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[Notification] Tapped:', response);
      callback(response);
    });

    return () => {
      if (this.responseSubscription) {
        this.responseSubscription.remove();
      }
    };
  }

  async sendLocalNotification(title: string, body: string, data = {}) {
    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // null means show immediately
      });
      console.log('[Notification] Scheduled with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('[Notification] Failed to schedule:', error);
      return null;
    }
  }

  // Clean up method
  cleanup() {
    if (this.messageSubscription) {
      this.messageSubscription.remove();
    }
    if (this.responseSubscription) {
      this.responseSubscription.remove();
    }
  }
}

// Call this when your app starts
createNotificationChannel();

export default NotificationService.getInstance();