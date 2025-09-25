import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {useSelector} from 'react-redux';
import Button from '../../components/ui/Button';
import Logo from '../../components/ui/Logo';

const PendingScreen = ({navigation, route}) => {
  const {loading} = useSelector(state => state.auth);
  const {
    title = 'Processing...',
    message = 'Please wait while we process your request',
    showRetryButton = false,
    onRetry,
    showCancelButton = false,
    onCancel,
  } = route.params || {};

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Logo size="large" />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>

        <View style={styles.buttonContainer}>
          {showRetryButton && (
            <Button
              title="Retry"
              onPress={handleRetry}
              style={styles.retryButton}
              size="large"
              disabled={loading}
            />
          )}

          {showCancelButton && (
            <Button
              title="Cancel"
              variant="ghost"
              onPress={handleCancel}
              style={styles.cancelButton}
              disabled={loading}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  loadingContainer: {
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  retryButton: {
    marginBottom: 16,
    width: '100%',
  },
  cancelButton: {
    width: '100%',
  },
});

export default PendingScreen;