import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Button from '../../components/ui/Button';
import {loginWithOTP, sendOTP, setPending} from '../../store/slices/authSlice';

const OTPScreen = ({navigation, route}) => {
  const {phone} = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const {loading, error} = useSelector(state => state.auth);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when OTP is complete
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (otpCode = otp.join('')) => {
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    try {
      // Set pending state and navigate to pending screen
      dispatch(setPending(true));
      navigation.navigate('Pending', {
        title: 'Verifying OTP',
        message: 'Please wait while we verify your OTP...',
        showCancelButton: true,
        onCancel: () => {
          dispatch(setPending(false));
          navigation.goBack();
        },
      });

      await dispatch(loginWithOTP({phone, otp: otpCode})).unwrap();
      dispatch(setPending(false));
      // Navigation will be handled by AppNavigator based on auth state
    } catch (err) {
      dispatch(setPending(false));
      navigation.goBack();
      Alert.alert('Error', err.message || 'Invalid OTP');
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    try {
      await dispatch(sendOTP(phone)).unwrap();
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      Alert.alert('Success', 'OTP sent successfully');
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to resend OTP');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.header}>
          <Text style={styles.title}>Verify Phone Number</Text>
          <Text style={styles.subtitle}>
            Enter the 6-digit code sent to{'\n'}
            <Text style={styles.phoneNumber}>{phone}</Text>
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                error && styles.otpInputError,
              ]}
              value={digit}
              onChangeText={value => handleOtpChange(value, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          title="Verify OTP"
          onPress={() => handleVerifyOTP()}
          loading={loading}
          style={styles.verifyButton}
          size="large"
        />

        <View style={styles.resendContainer}>
          {canResend ? (
            <Button
              title="Resend OTP"
              variant="ghost"
              onPress={handleResendOTP}
            />
          ) : (
            <Text style={styles.countdownText}>
              Resend OTP in {countdown} seconds
            </Text>
          )}
        </View>

        <Button
          title="Change Phone Number"
          variant="ghost"
          onPress={() => navigation.goBack()}
          style={styles.changeNumberButton}
        />
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
    alignItems: 'center',
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
    textAlign: 'center',
    lineHeight: 24,
  },
  phoneNumber: {
    fontWeight: '600',
    color: '#111827',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  otpInput: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: '#fff',
  },
  otpInputFilled: {
    borderColor: '#6366f1',
    backgroundColor: '#f8fafc',
  },
  otpInputError: {
    borderColor: '#ef4444',
  },
  verifyButton: {
    marginTop: 24,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  countdownText: {
    color: '#6b7280',
    fontSize: 14,
  },
  changeNumberButton: {
    marginTop: 16,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default OTPScreen;