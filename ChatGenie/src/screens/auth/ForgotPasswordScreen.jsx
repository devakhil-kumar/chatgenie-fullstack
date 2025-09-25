import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ForgotPasswordScreen = ({navigation}) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        'Reset Link Sent',
        'Password reset instructions have been sent to your phone number.',
        [
          {text: 'OK', onPress: () => navigation.navigate('Login')},
        ]
      );
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your phone number and we'll send you instructions to reset your password
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon="call"
          />

          <Button
            title="Send Reset Instructions"
            onPress={handleResetPassword}
            loading={loading}
            style={styles.resetButton}
            size="large"
          />

          <Button
            title="Back to Login"
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
            style={styles.backButton}
          />
        </View>
      </KeyboardAvoidingView>
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
  },
  header: {
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  resetButton: {
    marginTop: 24,
  },
  backButton: {
    marginTop: 16,
  },
});

export default ForgotPasswordScreen;