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
import {useDispatch, useSelector} from 'react-redux';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import {sendOTP} from '../../store/slices/authSlice';

const LoginScreen = ({navigation}) => {
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState({});

  const dispatch = useDispatch();
  const {loading, error} = useSelector(state => state.auth);

  const validatePhone = phoneNumber => {
    const phoneRegex = /^[+]?[1-9]?\d{9,15}$/;
    return phoneRegex.test(phoneNumber.replace(/\s+/g, ''));
  };

  const handleSendOTP = async () => {
    setErrors({});

    // if (!phone.trim()) {
    //   setErrors({phone: 'Phone number is required'});
    //   return;
    // }

    // if (!validatePhone(phone)) {
    //   setErrors({phone: 'Please enter a valid phone number'});
    //   return;
    // }

    try {
      // await dispatch(sendOTP(phone)).unwrap();
      navigation.navigate('OTP', {phone});
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to send OTP');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>
            Enter your phone number to get started
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
            error={errors.phone}
            autoFocus
          />

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Button
            title="Send OTP"
            onPress={handleSendOTP}
            loading={loading}
            style={styles.sendButton}
            size="large"
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            title="Continue with Google"
            variant="outline"
            size="large"
            style={styles.socialButton}
            onPress={() => Alert.alert('Coming Soon', 'Social login will be available soon!')}
          />

          <Button
            title="Continue with Apple"
            variant="outline"
            size="large"
            style={styles.socialButton}
            onPress={() => Alert.alert('Coming Soon', 'Social login will be available soon!')}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
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
  sendButton: {
    marginTop: 24,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#6b7280',
    fontSize: 14,
  },
  socialButton: {
    marginBottom: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  footer: {
    paddingBottom: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  linkText: {
    color: '#6366f1',
    fontWeight: '500',
  },
});

export default LoginScreen;