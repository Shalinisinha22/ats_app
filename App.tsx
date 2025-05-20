import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useSelector } from 'react-redux';
import { store } from './src/redux/store';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { MainNavigator } from './src/navigation/MainNavigator';
import { RootState } from './src/redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfile, loginUser, updateProfile } from './src/redux/authSlice';
import { loadSavedJobs, loadAppliedJobs, fetchAppliedJobs, fetchSavedJobs, exploreAllJobs } from './src/redux/jobsSlice';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, StatusBar } from 'react-native';
import { useAppDispatch } from './src/redux/store';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';
import { Platform, Alert, Linking } from 'react-native';
function AppContent() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { savedJobsLoading, appliedJobsLoading } = useSelector((state: RootState) => state.jobs);
  const dispatch = useAppDispatch();

  // State to track if jobs data has been fetched
  const [jobsDataFetched, setJobsDataFetched] = useState(false);

  async function requestUserPermission() {
    const { status } = await Notifications.getPermissionsAsync();

    if (status !== 'granted') {
      const { status: newStatus, canAskAgain } = await Notifications.requestPermissionsAsync();

      if (newStatus === 'granted') {
        console.log("Notification permission granted");
      } else if (newStatus === 'denied' && canAskAgain) {
        console.log("Notification permission denied");
      } else if (newStatus === 'denied' && !canAskAgain) {
        console.log("Notification permission denied and 'Don't ask again' selected");
        Alert.alert(
          "Permission Required",
          "Please enable notification permissions in your device settings.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
          ]
        );
      }
    } else {
      console.log("Notification permission already granted");
    }
  }

  useEffect(() => {
    requestUserPermission();
  }, []);

  // Handle initial authentication
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      console.log('Stored user:', storedUser);
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.email && userData.password) {
          await dispatch(loginUser({ email: userData.email, password: userData.password }));
        }
      }
    };

    initializeAuth();
  }, [dispatch]);

  // Fetch jobs data after authentication
  useEffect(() => {
    const fetchJobsData = async () => {
      try {
        await Promise.all([
          dispatch(fetchSavedJobs()),
          dispatch(fetchAppliedJobs()),
          // dispatch(exploreAllJobs())
        ]);
        setJobsDataFetched(true); // Mark jobs data as fetched
      } catch (error) {
        console.error('Error fetching jobs data:', error);
      }
    };

    if (isAuthenticated && user?.token && !jobsDataFetched) {
      fetchJobsData();
    }
  }, [isAuthenticated, user?.token, dispatch, jobsDataFetched]);

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Provider store={store}>
        <AppContent />
        <Toast></Toast>
      </Provider>
      <StatusBar
        backgroundColor='white'
        barStyle={"dark-content"}
        translucent={false}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
