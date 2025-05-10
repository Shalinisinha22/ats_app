import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, Dimensions } from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Onboarding'>;
};

// Custom Next button
const NextButton = ({ ...props }) => (
  <TouchableOpacity style={styles.buttonContainer} {...props}>
    <Text style={styles.buttonText}>Next</Text>
  </TouchableOpacity>
);

// Custom Skip button
const SkipButton = ({ ...props }) => (
  <TouchableOpacity style={[styles.buttonContainer, styles.skipButton]} {...props}>
    <Text style={[styles.buttonText, styles.skipButtonText]}>Skip</Text>
  </TouchableOpacity>
);

// Custom Done button
const DoneButton = ({ ...props }) => (
  <TouchableOpacity style={[styles.buttonContainer, styles.doneButton]} {...props}>
    <Text style={styles.buttonText}>Get Started</Text>
  </TouchableOpacity>
);

// Placeholder images - in a real app, you would use actual illustrations
const DiscoverImage = () => (
  <View style={styles.illustrationContainer}>
    <Ionicons name="search" size={80} color="#1dbf73" />
  </View>
);

const SaveImage = () => (
  <View style={styles.illustrationContainer}>
    <Ionicons name="bookmark" size={80} color="#1dbf73" />
  </View>
);

const HireImage = () => (
  <View style={styles.illustrationContainer}>
    <Ionicons name="briefcase" size={80} color="#1dbf73" />
  </View>
);

export default function OnboardingScreen({ navigation }: Props) {
  const handleDone = async () => {
    try {
      // Mark onboarding as completed
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      // Navigate to Login screen
      navigation.replace('Login');
    } catch (error) {
      console.error('Error saving onboarding status:', error);
      navigation.replace('Login');
    }
  };

  return (
    <Onboarding
      onSkip={handleDone}
      onDone={handleDone}
      NextButtonComponent={NextButton}
      SkipButtonComponent={SkipButton}
      DoneButtonComponent={DoneButton}
      containerStyles={styles.container}
      pages={[
        {
          backgroundColor: '#fff',
          image: <DiscoverImage />,
          title: 'Discover Jobs Easily',
          subtitle: 'Find jobs that match your skills and interests.',
          titleStyles: styles.title,
          subTitleStyles: styles.subtitle,
        },
        {
          backgroundColor: '#fff',
          image: <SaveImage />,
          title: 'Save & Apply Fast',
          subtitle: 'Bookmark jobs and apply with one click.',
          titleStyles: styles.title,
          subTitleStyles: styles.subtitle,
        },
        {
          backgroundColor: '#fff',
          image: <HireImage />,
          title: 'Get Hired Smarter',
          subtitle: 'Let the right job find you.',
          titleStyles: styles.title,
          subTitleStyles: styles.subtitle,
        },
      ]}
    />
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  illustrationContainer: {
    width: width * 0.7,
    height: width * 0.7,
    backgroundColor: '#f0f9ff',
    borderRadius: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
    backgroundColor: '#1dbf73',
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  skipButton: {
    backgroundColor: 'transparent',
  },
  skipButtonText: {
    color: '#666',
  },
  doneButton: {
    minWidth: 150,
  },
});