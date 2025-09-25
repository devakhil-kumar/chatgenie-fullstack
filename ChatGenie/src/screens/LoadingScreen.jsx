import React from 'react';
import {View, StyleSheet} from 'react-native';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <LoadingSpinner text="Loading ChatGenie..." />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default LoadingScreen;