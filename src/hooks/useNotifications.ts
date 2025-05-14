import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import NotificationService from '../services/NotificationService';

export const useNotifications = (onNotificationReceived?: (notification: Notifications.Notification) => void) => {
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    const initializeNotifications = async () => {
      const hasPermission = await NotificationService.requestUserPermission();
      if (hasPermission) {
        const token = await NotificationService.getExpoPushToken();
        // Store token in your backend or Redux store
      }
    };

    initializeNotifications();

    // Listen for notifications when app is in foreground
    notificationListener.current = NotificationService.addNotificationReceivedListener(
      notification => {
        if (onNotificationReceived) {
          onNotificationReceived(notification);
        }
      }
    );

    // Listen for user interaction with notifications
    responseListener.current = NotificationService.addNotificationResponseReceivedListener(
      response => {
        const data = response.notification.request.content.data;
        // Handle notification tap
        console.log('Notification tapped:', data);
      }
    );

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [onNotificationReceived]);

  return {
    scheduleLocalNotification: NotificationService.scheduleLocalNotification,
    getBadgeCount: NotificationService.getBadgeCount,
    setBadgeCount: NotificationService.setBadgeCount,
  };
};