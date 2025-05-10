import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Splash'>;
};

export default function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2500));
        const hasCompletedOnboarding = await AsyncStorage.getItem('hasCompletedOnboarding');
        if (hasCompletedOnboarding === 'true') {
          navigation.replace('Login');
        } else {
          navigation.replace('Onboarding');
        }
      } catch (error) {
        console.error('Error checking first-time user:', error);
        navigation.replace('Login');
      }
    };
    checkFirstTimeUser();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logos.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.appName}></Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1dbf73',
  },
  logo: {
    width: 300,  // Increased from 240
    height: 300, // Increased from 240
    tintColor: '#fff',
  },
  appName: {
    marginTop: 15, // Reduced from 20
    fontSize: 32, // Increased from 28
    fontWeight: 'bold',
    color: '#fff',
  },
});