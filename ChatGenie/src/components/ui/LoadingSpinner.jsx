import React from 'react';
import {View, ActivityIndicator, Text, StyleSheet} from 'react-native';

const LoadingSpinner = ({
  size = 'large',
  color = '#6366f1',
  text,
  style,
  overlay = false,
}) => {
  const Container = overlay ? View : React.Fragment;
  const containerProps = overlay ? {style: styles.overlay} : {};

  return (
    <Container {...containerProps}>
      <View style={[styles.container, style]}>
        <ActivityIndicator size={size} color={color} />
        {text && <Text style={styles.text}>{text}</Text>}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
  },
});

export default LoadingSpinner;