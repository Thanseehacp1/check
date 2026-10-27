/* eslint-disable react-native/no-inline-styles */
import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {MainStackParamList} from '../stacks/MainStack';
import WaterFillButton from '../components/WaterFillButton';
import {fetchUserCases} from '../redux/commonSlice';

import {useDispatch} from 'react-redux';
import {
  loginAndCheckForCases,
  loginAdvocateAndCheckForCases,
  loginStudent,
  loginStudentWithGoogle,
} from '../redux/authSlice';
import Toast from 'react-native-toast-message';
import {AppDispatch} from '../redux/store';
import {ThemeContext} from '../components/ThemeContext';

import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

import {getFCMToken} from '../utils/pushNotificationHelper';

import DeviceInfo from 'react-native-device-info';
import { heightPercentageToDP } from 'react-native-responsive-screen';
import { moderateScale } from 'react-native-size-matters';
import { RFValue } from 'react-native-responsive-fontsize';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'LoginScreen'
>;

type Role = 'firmAdmin' | 'advocate' | 'lawStudent';

const LoginScreen = () => {
  const {colors} = useContext(ThemeContext);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [selectedRole, setSelectedRole] = useState<Role>('firmAdmin');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '31684803971-3sgj20d4h1gpjfoqn6erqkjd92ea162f.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Toast.show({
        text1: 'Login Failed',
        text2: 'Please enter email and password',
        type: 'error',
      });
      return;
    }
    setLoading(true);
    try {
      const fcmToken = await getFCMToken();

      const os = Platform.OS;
      const model = DeviceInfo.getModel();
      const brand = DeviceInfo.getBrand();
      const version = DeviceInfo.getSystemVersion();
      const deviceType = `${os} - ${brand} ${model} - v${version}`;

      let action;
      const payload = {email, password, fcmToken, deviceType};

      if (selectedRole === 'advocate') {
        action = loginAdvocateAndCheckForCases(payload);
      } else if (selectedRole === 'firmAdmin') {
        action = loginAndCheckForCases(payload);
      } else {
        action = loginStudent(payload);
      }

      await dispatch(action).unwrap();
      dispatch(fetchUserCases());
      navigation.replace('PostAuthLoadingScreen');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Login Failed',
        text2: error?.message || 'Please check your credentials',
      });
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (googleLoading) {
      return;
    }

    try {
      setGoogleLoading(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut(); // Ensure previous sessions are cleared

      const userInfo = await GoogleSignin.signIn();
      console.log('Google Sign-In successful:', userInfo);

      const fcmToken = await getFCMToken();

      const os = Platform.OS;
      const model = DeviceInfo.getModel();
      const brand = DeviceInfo.getBrand();
      const version = DeviceInfo.getSystemVersion();
      const deviceType = `${os} - ${brand} ${model} - v${version}`;

      if (userInfo?.data?.idToken) {
        await dispatch(
          loginStudentWithGoogle({
            idToken: userInfo.data?.idToken,
            fcmToken,
            deviceType,
          }),
        ).unwrap();
        navigation.replace('PostAuthLoadingScreen');
      } else {
        setGoogleLoading(false);
        throw new Error('Google Sign-In failed to return an ID token.');
      }
    } catch (error: any) {
      if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Google Sign-In is already in progress.');
      } else if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('Google Sign-In cancelled by user.');
        setGoogleLoading(false);
      } else {
        console.error(error);
        Toast.show({
          type: 'error',
          text1: 'Google Login Failed',
          text2: 'An unexpected error occurred.',
        });
        setGoogleLoading(false);
      }
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('OtpVerificationScreen');
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'space-between',
      paddingHorizontal: heightPercentageToDP('2.8%'),
      paddingBottom: heightPercentageToDP('4.5%'),
    },
    mainContent: {
      alignItems: 'center',
      paddingTop: heightPercentageToDP('5.6%'),
    },
    logoWrapper: {
      marginBottom: heightPercentageToDP('4%'),
    },
    logoImage: {
      width: heightPercentageToDP('22%'),
      height: heightPercentageToDP('22%'),
      resizeMode: 'contain',
    },
    welcomeText: {
      fontSize: heightPercentageToDP('2.5%'),
      color: colors.primary,
      fontWeight: 'bold',
      marginBottom: moderateScale(8),
    },
    subText: {
      color: colors.secondaryText,
      fontSize: heightPercentageToDP('1.5%'),
      marginBottom: heightPercentageToDP('4%'),
      textAlign: 'center',
    },
    roleSelectorContainer: {
      flexDirection: 'row',
      width: '100%',
      height: heightPercentageToDP('5%'),
      backgroundColor: colors.card,
      borderRadius: moderateScale(8),
      marginBottom: heightPercentageToDP('3%'),
      overflow: 'hidden',
    },
    roleButton: {
      flex: 1,
      height: '100%',
      borderRadius: moderateScale(8),
    },
    roleButtonInactive: {
      backgroundColor: 'transparent',
    },
    roleButtonInner: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    roleButtonText: {
      color: colors.textOnGradient,
      fontSize: heightPercentageToDP('1.5%'),
      fontWeight: '500',
    },
    inputWrapper: {
      width: '100%',
      height: heightPercentageToDP('5.3%'),
      borderColor: colors.border,
      borderWidth: moderateScale(1),
      borderRadius: moderateScale(8),
      marginBottom: heightPercentageToDP('2%'),
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: heightPercentageToDP('1.8%'),
    },
    input: {
      flex: 1,
      height: '100%',
      color: colors.text,
      fontSize: heightPercentageToDP('1.6%'),
    },
    eyeIcon: {
      padding: moderateScale(4),
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginTop: heightPercentageToDP('0.3%'),
      marginBottom: heightPercentageToDP('3%'),
    },
    forgotPasswordText: {
      color: colors.primary,
      fontSize: RFValue(10.5),
    },
    bottomSection: {
      paddingBottom: heightPercentageToDP('4%'),
    },
    signupText: {
      color: colors.secondaryText,
      marginTop: heightPercentageToDP('3.8%'),
      textAlign: 'center',
      fontSize: RFValue(10.5),
    },
    signupLink: {
      color: colors.primary,
      fontWeight: '600',
    },
    gmailButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
     height: moderateScale(44),
      borderRadius: moderateScale(8),
      marginTop: heightPercentageToDP('1.7%'),
      borderColor: colors.border,
      borderWidth: moderateScale(1),
    },
    gmailIcon: {
      width: moderateScale(18),
      height: moderateScale(18),
      marginRight: moderateScale(12),
    },
    gmailButtonText: {
      color: '#000000',
      fontWeight: '600',
      fontSize: RFValue(12.5),
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'android' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.mainContent}>
            <View style={styles.logoWrapper}>
              <Image
                source={require('../assets/LogoLogin.png')}
                style={styles.logoImage}
              />
            </View>

            <Text style={styles.welcomeText}>Welcome Back</Text>
            <Text style={styles.subText}>
              Your Digital Legal Assistant Is Ready
            </Text>

            <View style={styles.roleSelectorContainer}>
              {['firmAdmin', 'advocate', 'lawStudent'].map(role => {
                const isSelected = selectedRole === role;
                const button = (
                  <View style={styles.roleButtonInner}>
                    <Text
                      style={[
                        styles.roleButtonText,
                        {
                          color: isSelected
                            ? colors.textOnGradient
                            : colors.text,
                        },
                      ]}>
                      {role === 'firmAdmin'
                        ? 'Firm Admin'
                        : role === 'advocate'
                        ? 'Advocate'
                        : 'Law Student'}
                    </Text>
                  </View>
                );

                return (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setSelectedRole(role as Role)}
                    style={{flex: 1}}>
                    {isSelected ? (
                      <LinearGradient
                        colors={colors.buttonGradient}
                        start={{x: 0, y: 0}}
                        end={{x: 1, y: 0}}
                        style={styles.roleButton}>
                        {button}
                      </LinearGradient>
                    ) : (
                      <View
                        style={[styles.roleButton, styles.roleButtonInactive]}>
                        {button}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Enter Your Email ID"
                placeholderTextColor={colors.secondaryText}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Enter Your Password"
                placeholderTextColor={colors.secondaryText}
                secureTextEntry={!isPasswordVisible}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                style={styles.eyeIcon}>
                <Icon
                  name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.secondaryText}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomSection}>
            <WaterFillButton
              onPress={handleLogin}
              isLoading={loading}
              title="Log In"
              loadingTitle="Logging In..."
              gradientColors={colors.buttonGradient}
              textColor={colors.textOnGradient}
            />

            {selectedRole === 'lawStudent' && (
              <TouchableOpacity
                onPress={handleGoogleLogin}
                style={styles.gmailButton}
                disabled={googleLoading}>
                {googleLoading ? (
                  <ActivityIndicator size={'small'} color={'#000000'} />
                ) : (
                  <>
                    <Image
                      source={require('../assets/google.png')}
                      style={styles.gmailIcon}
                    />
                    <Text style={styles.gmailButtonText}>
                      Login with Google
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            <Text style={styles.signupText}>
              New Here?{' '}
              <Text
                style={styles.signupLink}
                onPress={() => navigation.navigate('RegisterScreen')}>
                Create An Account
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
