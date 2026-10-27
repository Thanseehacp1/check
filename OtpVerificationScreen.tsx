/* eslint-disable react-native/no-inline-styles */
import React, {useState, useRef, useEffect, useContext} from 'react'; // Import useContext
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {NODE_API_ENDPOINT} from '../utils/util';
import {ThemeContext} from '../components/ThemeContext'; // Adjust path if necessary

const OtpVerificationScreen = () => {
  const {colors} = useContext(ThemeContext); // Use theme colors
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [timer, setTimer] = useState(300);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string>('');

  const otpInputs = useRef<TextInput[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  const handleSendOtp = async () => {
    if (email.trim() === '' || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Please enter a valid email address.');
      return;
    }
    try {
      setLoading(true);
      const resp = await fetch(`${NODE_API_ENDPOINT}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email}),
      });
      console.log('forget', resp);
      if (!resp.ok) {
        setLoading(false);
        const errorData = await resp.json();
        Alert.alert('Error', errorData.message || 'Failed to send OTP');
        return;
      }
      setLoading(false);
      const data = await resp.json();
      console.log(data);
      setToken(data.token);
      Alert.alert('Success', 'OTP sent to your email successfully');
      setOtpSent(true);
      setIsTimerActive(true);
      setTimer(30);
    } catch (error) {
      setLoading(false);
      console.error('Error sending OTP:', error);
      Alert.alert('Error', 'Failed to send OTP');
    }
    setOtpSent(true);
    setIsTimerActive(true);
    setTimer(300);
  };

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes < 10 ? `0${minutes}` : minutes}:${
      seconds < 10 ? `0${seconds}` : seconds
    }`;
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    if (otpString.length < 6) {
      Alert.alert('Please enter a complete OTP.');
      return;
    }
    try {
      setLoading(true);
      const resp = await fetch(`${NODE_API_ENDPOINT}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': token,
        },
        body: JSON.stringify({otp: otpString}),
      });
      console.log('verify', resp);
      if (!resp.ok) {
        setLoading(false);
        const errorData = await resp.json();
        Alert.alert('Error', errorData.message || 'Failed to verify OTP');
        return;
      }
      setLoading(false);
      const data = await resp.json();
      console.log(data);

      Alert.alert('Success', 'OTP verified successfully');
      navigation.navigate('ResetPasswordScreen', {
        token: data.token,
      });
    } catch (error) {
      setLoading(false);
      console.error('Error verifying OTP:', error);
      Alert.alert('Error', 'Failed to verify OTP');
    }
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setIsTimerActive(false);
    setOtp(Array(6).fill(''));
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const isRetryEnabled = timer === 0;

  // Create styles inside the component to access theme colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    logoContainer: {
      marginBottom: 40,
    },
    logo: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 22,
      color: colors.primary,
      fontWeight: 'bold',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      color: colors.secondaryText,
      marginBottom: 24,
      textAlign: 'center',
    },
    textInput: {
      width: '100%',
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      color: colors.text,
      fontSize: 14,
    },
    otpInput: {
      width: 40,
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      textAlign: 'center',
      color: colors.text,
      fontSize: 18,
    },
    buttonContainer: {
      width: '100%',
      borderRadius: 8,
      overflow: 'hidden',
    },
    buttonGradient: {
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.textOnGradient,
      fontWeight: '600',
      fontSize: 16,
    },
    retryButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
    },
    retryText: {
      color: colors.textOnGradient,
      fontSize: 14,
      fontWeight: '600',
    },
    disabledRetryText: {
      color: colors.disabled,
    },
    timerText: {
      color: colors.secondaryText,
      marginRight: 8,
    },
    footerText: {
      color: colors.secondaryText,
      textAlign: 'center',
    },
    linkText: {
      color: colors.primary,
    },
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={{alignItems: 'center'}}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/LogoLogin.png')}
              style={styles.logo}
            />
          </View>

          <Text style={styles.title}>Forget Password</Text>
          <Text style={styles.subtitle}>
            {otpSent
              ? `We've Sent A 6-Digit Code To ${email}`
              : 'Enter your email to receive an OTP'}
          </Text>

          {/* Email Input */}
          <TextInput
            placeholder="Enter Your Email ID"
            placeholderTextColor={colors.secondaryText}
            style={[styles.textInput, {marginBottom: otpSent ? 16 : 0}]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!otpSent}
          />

          {/* OTP Section */}
          {otpSent && (
            <View style={{width: '100%', alignItems: 'center'}}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  gap: 8,
                  marginBottom: 16,
                }}>
                {Array(6)
                  .fill(null)
                  .map((_, i) => (
                    <TextInput
                      key={i}
                      ref={ref => (otpInputs.current[i] = ref as TextInput)}
                      style={styles.otpInput}
                      maxLength={1}
                      keyboardType="numeric"
                      onChangeText={text => handleOtpChange(text, i)}
                      onKeyPress={e => handleBackspace(e, i)}
                      value={otp[i]}
                    />
                  ))}
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  width: '100%',
                  alignItems: 'center',
                }}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Text style={styles.timerText}>
                    {isTimerActive && formatTime()}
                  </Text>
                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={!isRetryEnabled}>
                    {isRetryEnabled ? (
                      <LinearGradient
                        colors={colors.buttonGradient}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={styles.retryButton}>
                        <Text style={styles.retryText}>Retry</Text>
                      </LinearGradient>
                    ) : (
                      <Text style={styles.disabledRetryText}>Retry</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={{paddingHorizontal: 24, paddingBottom: 32}}>
        <TouchableOpacity
          onPress={otpSent ? handleVerifyOtp : handleSendOtp}
          style={styles.buttonContainer}>
          <LinearGradient
            colors={colors.buttonGradient}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 0}}
            style={styles.buttonGradient}>
            {loading ? (
              <ActivityIndicator size="small" color={colors.textOnGradient} />
            ) : (
              <Text style={styles.buttonText}>
                {otpSent ? 'Verify OTP' : 'Send OTP'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={otpSent ? handleChangeEmail : () => navigation.goBack()}
          style={{marginTop: 24}}>
          <Text style={styles.footerText}>
            {otpSent ? 'Wrong Email ID? ' : ''}
            <Text style={styles.linkText}>
              {otpSent ? 'Re-enter Email' : 'Go back to Login'}
            </Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default OtpVerificationScreen;