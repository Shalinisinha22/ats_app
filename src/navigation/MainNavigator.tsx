import React, { useEffect, useState } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, Dimensions, Modal, ScrollView, Platform, Alert } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerContentComponentProps } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { DrawerParamList } from './types';
import BrowseJobsScreen from '../screens/jobs/BrowseJobsScreen';
import SavedJobsScreen from '../screens/jobs/SavedJobsScreen';
import AppliedJobsScreen from '../screens/jobs/AppliedJobsScreen';
import RecommendedJobsScreen from '../screens/jobs/RecommendedJobsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import JobApplicationScreen from '../screens/jobs/JobApplicationScreen';
import JobDetailsScreen from '../screens/jobs/JobDetailsScreen';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import { useAppDispatch } from '../redux/store';
import { logout } from '../redux/authSlice';
import NotificationService from '../services/NotificationService';
import ApplicationDetails from '../screens/jobs/ApplicationDetails';

const Drawer = createDrawerNavigator<DrawerParamList>();
const Tab = createBottomTabNavigator<DrawerParamList>();
const Stack = createNativeStackNavigator<DrawerParamList>();

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => dispatch(logout())
        }
      ]
    );
  };
  return (
    <DrawerContentScrollView {...props}>
      <LinearGradient
        colors={['#1dbf73', '#19a864']}
        style={styles.drawerHeader}
      >
        <View style={styles.userInfo}>
          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'G'}
              </Text>
            </View>
            <View style={styles.userTextContainer}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name || 'Guest User'}
              </Text>
              <Text style={styles.userEmail} numberOfLines={1}>
                {user?.email || 'guest@example.com'}
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.drawerContent}>
        <DrawerItemList {...props} />
      </View>
      <TouchableOpacity
        style={styles.drawerButton}
        onPress={handleLogout}
      >
        <View style={[styles.drawerIcon, { borderColor: '#ff3b30' }]}>
          <Ionicons name="log-out-outline" size={22} color="#ff3b30" />
        </View>
        <Text style={[styles.drawerButtonText, { color: '#ff3b30' }]}>Logout</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
};

const HeaderLeft = () => (
  <View style={styles.headerLeft}>
    <Image
      source={require('../../assets/logos.png')}
      style={styles.logo}
      resizeMode="contain"
    />
  </View>
);

const HeaderRight = ({ navigation }: { navigation: any }) => {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    const storedNotifications = await NotificationService.getNotifications();
    setNotifications(storedNotifications);
    setUnreadCount(storedNotifications.filter(n => !n.read).length);
  };

  useEffect(() => {
    loadNotifications();

    // Listen for new notifications
    const messageSubscription = NotificationService.onMessageReceived((notification) => {
      console.log('New notification received:', notification);
      loadNotifications();
    });

    // Listen for notification read status changes
    const readSubscription = NotificationService.onNotificationsRead(() => {
      loadNotifications();
    });

    // Focus listener to update badge when screen comes into focus
    const unsubscribeFocus = navigation.addListener('focus', () => {
      loadNotifications();
    });

    return () => {
      messageSubscription();
      readSubscription();
      unsubscribeFocus();
    };
  }, [navigation]);

  const handleNotificationPress = async () => {
    // Mark all notifications as read when opening notifications screen
    await NotificationService.markAllAsRead();
    setUnreadCount(0);
    navigation.navigate('Notifications');
  };

  return (
    <View style={styles.headerRight}>
      <TouchableOpacity 
        onPress={handleNotificationPress}
        style={styles.headerButton}
      >
        {unreadCount > 0 && (
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
        <Ionicons name="notifications-outline" size={24} color="#fff" />
      </TouchableOpacity>
      <TouchableOpacity 
        onPress={() => navigation.openDrawer()}
        style={styles.headerButton}
      >
        <Ionicons name="menu" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => ({
        headerStyle: {
          backgroundColor: '#1dbf73',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        headerTitle: '',
        headerTintColor: '#fff',
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight navigation={navigation} />,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'BrowseJobs') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'SavedJobs') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'AppliedJobs') {
            iconName = focused ? 'briefcase' : 'briefcase-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return (
            <View style={[styles.tabIconContainer, focused && styles.tabIconContainerActive]}>
              <Ionicons name={iconName as any} size={22} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: '#1dbf73',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 60,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 8,
          marginBottom: 0,
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          elevation: Platform.OS === 'android' ? 8 : 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginTop: 2,
          marginBottom: Platform.OS === 'ios' ? 0 : 4,
          fontWeight: '500',
        },
      })}
      safeAreaInsets={{ bottom: 0 }}
    >
      <Tab.Screen name="BrowseJobs" component={BrowseJobsScreen} options={{ 
        title: '', 
        tabBarLabel: 'Home'  
      }} />
      <Tab.Screen name="SavedJobs" component={SavedJobsScreen} options={{ title: 'Saved' }} />
      <Tab.Screen name="AppliedJobs" component={AppliedJobsScreen} options={{ title: 'Applied' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

const MainStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false  // Hide the stack navigator header
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator}
      />
      <Stack.Screen
        name="JobDetails"
        component={JobDetailsScreen}
        options={{
          headerShown: true,  // Keep header for job details
          title: 'Job Details',
          headerStyle: {
            backgroundColor: '#1dbf73',
          },
          headerTintColor: '#fff',
        }}
      />
      <Stack.Screen
        name="JobApplication"
        component={JobApplicationScreen}
        options={{
          headerShown: true,  // Keep header for job application
          title: 'Job Application',
          headerStyle: {
            backgroundColor: '#1dbf73',
          },
          headerTintColor: '#fff',
        }}
      />
        <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: true,  // Keep header for job application
          title: 'Notifications',
          headerStyle: {
            backgroundColor: '#1dbf73',
          },
          headerTintColor: '#fff',
        }}
      />
       <Stack.Screen
        name="ApplicationDetails"
        component={ApplicationDetails}

        options={{
          headerShown: true,  // Keep header for job application
          title: 'Application Details',
          headerStyle: {
            backgroundColor: '#1dbf73',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

export const MainNavigator = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await NotificationService.requestUserPermission();
      
      if (hasPermission) {
        const token = await NotificationService.getFCMToken();
        // Send token to your backend
        if (token) {
          // Store token in your backend/redux
          console.log('FCM Token:', token);
        }

        // Handle foreground messages
        const unsubscribeMessage = await NotificationService.onMessageReceived(
          (remoteMessage) => {
            console.log('Received foreground message:', remoteMessage);
            // Update notification badge count
            // You can dispatch an action to update your redux store
          }
        );

        // Handle notification taps
        const unsubscribeNotificationTap = await NotificationService.onNotificationTap(
          (remoteMessage) => {
            console.log('Notification tapped:', remoteMessage);
            // Navigate to appropriate screen based on notification data
            if (remoteMessage.data?.screen) {
              navigation.navigate(remoteMessage.data.screen, remoteMessage.data.params);
            }
          }
        );

        return () => {
          unsubscribeMessage();
          unsubscribeNotificationTap();
        };
      }
    };

    setupNotifications();
  }, []);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: true, // Show header for all drawer screens
        headerStyle: {
          backgroundColor: '#1dbf73',
          elevation: 5,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        headerTitle: '',
        headerTintColor: '#fff',
        headerLeft: () => <HeaderLeft />,
        headerRight: () => <HeaderRight navigation={navigation} />,
        drawerActiveTintColor: '#1dbf73',
        drawerInactiveTintColor: '#666',
        drawerActiveBackgroundColor: '#e6f8ef',
        drawerLabelStyle: {
          marginLeft: -4, // Reduced from 0
          fontSize: 14, // Reduced from 15
          fontWeight: '500',
        },
        drawerItemStyle: {
          borderRadius: 6, // Reduced from 8
          marginHorizontal: 6, // Reduced from 8
          marginVertical: 2, // Reduced from 4
          paddingHorizontal: 2, // Reduced from 4
          paddingVertical: 6, // Reduced from 8
        },
        drawerStyle: {
          width: Math.min(Dimensions.get('window').width * 0.85, 350),
          backgroundColor: '#fff',
        },
      })}
    >
      <Drawer.Screen 
        name="MainStack" 
        component={MainStack}
        options={{ 
          headerShown: false,
          title: "",
          drawerLabel: "Home",
          drawerIcon: ({ color }) => (
            <View style={[styles.drawerIcon, { borderColor: color }]}> 
              <Ionicons name="home-outline" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'My Profile',
          drawerIcon: ({ color }) => (
            <View style={[styles.drawerIcon, { borderColor: color }]}> 
              <Ionicons name="person-outline" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen 
        name="AppliedJobs" 
        component={AppliedJobsScreen}
        options={{
          title: 'Applied Jobs',
          drawerIcon: ({ color }) => (
            <View style={[styles.drawerIcon, { borderColor: color }]}> 
              <Ionicons name="briefcase-outline" size={22} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen 
        name="SavedJobs" 
        component={SavedJobsScreen}
        options={{
          title: 'Saved Jobs',
          drawerIcon: ({ color }) => (
            <View style={[styles.drawerIcon, { borderColor: color }]}> 
              <Ionicons name="bookmark-outline" size={22} color={color} />
            </View>
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  headerLeft: {
    marginLeft: -16, // Changed to negative margin to pull it more to the left
    justifyContent: 'flex-start',
    paddingLeft: 0, // Removed padding completely
  },
  logo: {
    width: 180, // Increased from 120
    height: 140, // Increased from 30
    tintColor: '#fff',
  },
  menuButton: {
    marginRight: 25,
    padding: 4,
  },
  drawerHeader: {
    padding: 12, // Reduced from 16
    paddingTop: 24, // Reduced from 32
  },
  userInfo: {
    paddingVertical: 2, // Reduced from 4
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Reduced from 8
  },
  avatarContainer: {
    width: 40, // Reduced from 48
    height: 40, // Reduced from 48
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Reduced shadow
    shadowOpacity: 0.1,
    shadowRadius: 2, // Reduced from 4
    elevation: 2, // Reduced from 3
  },
  avatarText: {
    fontSize: 16, // Reduced from 20
    fontWeight: 'bold',
    color: '#1dbf73',
  },
  userTextContainer: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 14, // Reduced from 16
    fontWeight: 'bold',
    marginBottom: 1, // Reduced from 2
  },
  userEmail: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11, // Reduced from 12
  },
  drawerContent: {
    flex: 1,
    paddingTop: 4, // Reduced from 8
  },
  drawerIcon: {
    width: 32, // Reduced from 36
    height: 32, // Reduced from 36
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 6, // Reduced from 8
    backgroundColor: 'rgba(29, 191, 115, 0.1)',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  notificationBadge: {
    position: 'absolute',
    right: -2,
    top: -2,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  notificationModal: {
    backgroundColor: '#fff',
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    marginTop: 60,
    marginRight: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  notificationList: {
    maxHeight: 400,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
  viewAllButton: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  viewAllText: {
    color: '#1dbf73',
    fontSize: 16,
    fontWeight: '600',
  },
  tabIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 35,
    height: 30,
    borderRadius: 10,
    backgroundColor: 'transparent',
  },
  tabIconContainerActive: {
    backgroundColor: 'rgba(29, 191, 115, 0.1)',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginTop: 'auto',
    marginHorizontal: 6,
    marginBottom: 16,
    borderRadius: 6,
  },
  logoutText: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  drawerButtonsContainer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 8,
  },
  drawerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 6,
    marginVertical: 4,
    borderRadius: 6,
  },
  drawerButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
});