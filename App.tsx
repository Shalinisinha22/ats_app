import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useSelector } from 'react-redux';
import { store } from './src/redux/store';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { MainNavigator } from './src/navigation/MainNavigator';
import { RootState } from './src/redux/store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchUserProfile, loginUser, updateProfile } from './src/redux/authSlice';
import { loadSavedJobs, loadAppliedJobs, fetchAppliedJobs,fetchSavedJobs } from './src/redux/jobsSlice';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet,StatusBar } from 'react-native';
import { useAppDispatch } from './src/redux/store'; 
import Toast from 'react-native-toast-message';

function AppContent() {

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch(); // Now using the custom hook

  useEffect(() => {
    const initializeApp = async () => {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        // console.log(user,
        //   "appp"
        // )
        if (user.email && user.password) {
          dispatch(loginUser({ email: user.email, password: user.password }));
        
        }
      

      }
      dispatch(fetchSavedJobs());
      dispatch(fetchAppliedJobs());
    };

    initializeApp();
  }, [dispatch]);

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
