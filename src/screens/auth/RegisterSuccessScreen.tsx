import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/types';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'RegisterSuccess'>;
  route: RouteProp<AuthStackParamList, 'RegisterSuccess'>;
};

export default function RegisterSuccessScreen({ navigation, route }: Props) {
  const { loginId, password } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registration Successful! 🎉</Text>
      
      <View style={styles.credentialsContainer}>
        <Text style={styles.subtitle}>Your Login Credentials</Text>
        
        <View style={styles.credentialBox}>
          <Text style={styles.label}>Login ID:</Text>
          <Text style={styles.value}>{loginId}</Text>
        </View>
        
        <View style={styles.credentialBox}>
          <Text style={styles.label}>Password:</Text>
          <Text style={styles.value}>{password}</Text>
        </View>

        <Text style={styles.warning}>
          Please save these credentials. You'll need them to login.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Login')}
      >
        <Text style={styles.buttonText}>Continue to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  credentialsContainer: {
    backgroundColor: '#f5f5f5',
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  credentialBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  warning: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});