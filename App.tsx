import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useSelector } from 'react-redux';
import { store } from './src/redux/store';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { MainNavigator } from './src/navigation/MainNavigator';
import { RootState } from './src/redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfile, loginUser, updateProfile } from './src/redux/authSlice';
import { loadSavedJobs, loadAppliedJobs, fetchAppliedJobs, fetchSavedJobs } from './src/redux/jobsSlice';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, StatusBar } from 'react-native';
import { useAppDispatch } from './src/redux/store';
import Toast from 'react-native-toast-message';

function AppContent() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();

  // Handle initial authentication
  useEffect(() => {
    const initializeAuth = async () => {
      const storedUser = await AsyncStorage.getItem('user');
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
    if (isAuthenticated && user?.token) {
      const fetchJobsData = async () => {
        try {
          await Promise.all([
            dispatch(fetchSavedJobs()),
            dispatch(fetchAppliedJobs())
          ]);
        } catch (error) {
          console.error('Error fetching jobs data:', error);
        }
      };

      fetchJobsData();
    }
  }, [isAuthenticated, user?.token, dispatch]);

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
