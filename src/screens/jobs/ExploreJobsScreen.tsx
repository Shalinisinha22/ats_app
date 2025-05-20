import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useAppSelector, useAppDispatch } from "../../redux/store";
import JobCard from "../../components/JobCard";
import { exploreAllJobs } from "../../redux/jobsSlice";
import { NavigationProp } from "@react-navigation/native";
import { DrawerParamList } from "../../navigation/types";

interface Props {
  navigation: NavigationProp<DrawerParamList>;
}

export default function ExploreJobsScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const {
    exploreJobs = [],
    isLoading,
    error,
    pagination,
  } = useAppSelector((state) => state.jobs);

  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    dispatch(exploreAllJobs({ page, limit: 10 }));
  }, [dispatch, page]);

  const handleJobPress = (job: Job) => {
    navigation.navigate("JobDetails", { job });
  };

  const handleApplyPress = (job: Job) => {
    navigation.navigate("JobApplication", { job });
  };

  const loadMoreJobs = () => {
    if (pagination && page < pagination.pages && !isFetchingMore) {
      setIsFetchingMore(true);
      setPage((prevPage) => prevPage + 1);
      setIsFetchingMore(false);
    }
  };

  const renderFooter = () => {
    if (!isFetchingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#1dbf73" />
      </View>
    );
  };

  // if (isLoading && page === 1) {
  //   return (
  //     <View style={[styles.container, styles.centerContent]}>
  //       <ActivityIndicator size="large" color="#1dbf73" />
  //     </View>
  //   );
  // }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={exploreJobs}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <JobCard
            key={item._id}
            job={item}
            showSaveButton={true}
            showApplyButton={true}
            showBadge={false}
          />
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMoreJobs}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  footer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    padding: 20,
  },
});
