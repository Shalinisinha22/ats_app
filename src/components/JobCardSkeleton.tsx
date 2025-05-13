import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export const JobCardSkeleton = () => {
  return (
    <View style={styles.skeletonCard}>
      <View style={styles.header}>
        <View style={styles.logoSkeleton} />
        <View style={styles.titleContainer}>
          <View style={styles.titleSkeleton} />
          <View style={styles.companySkeleton} />
        </View>
      </View>
      <View style={styles.detailsContainer}>
        <View style={styles.detailSkeleton} />
        <View style={styles.detailSkeleton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoSkeleton: {
    width: 50,
    height: 50,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
  },
  titleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  titleSkeleton: {
    height: 20,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '80%',
    marginBottom: 8,
  },
  companySkeleton: {
    height: 16,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '60%',
  },
  detailsContainer: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailSkeleton: {
    height: 14,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    width: '30%',
  },
});