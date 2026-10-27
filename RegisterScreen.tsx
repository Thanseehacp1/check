/* eslint-disable react-native/no-inline-styles */
import React, { useState, useRef, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform, // Import Platform
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';
import { useDispatch } from 'react-redux';
import { registerAndCheckForCases, registerStudent } from '../redux/authSlice';
import { AppDispatch } from '../redux/store';
import { HighCourt } from '../components/SelectCourtModal';
import { NODE_API_ENDPOINT } from '../utils/util';
import Toast from 'react-native-toast-message';
import { ThemeContext } from '../components/ThemeContext';

import { getFCMToken } from '../utils/pushNotificationHelper';

import DeviceInfo from 'react-native-device-info';
import TermsModal from '../components/TermsModal';

const courtOptions = [
  { label: 'District Court', value: 'District Court' },
  { label: 'State High Court', value: 'State High Court' },
  { label: 'Supreme Court of India', value: 'Supreme Court of India' },
];
const languageOptions = [
  'Assamese',
  'Bengali',
  'Bodo',
  'Dogri',
  'English',
  'Gujarati',
  'Hindi',
  'Kannada',
  'Kashmiri',
  'Konkani',
  'Maithili',
  'Malayalam',
  'Manipuri (Meitei)',
  'Marathi',
  'Nepali',
  'Odia',
  'Punjabi',
  'Sanskrit',
  'Santali',
  'Sindhi',
  'Tamil',
  'Telugu',
  'Urdu',
].map(lang => ({
  label: lang,
  value: lang,
}));

const STATE_JSON_MAP: { [key: string]: any } = {
  'Andhra Pradesh': require('../utils/Andhra Pradesh.json'),
  Maharashtra: require('../utils/Maharashtra.json'),
  'Uttar Pradesh': require('../utils/Uttar Pradesh.json'),
  Delhi: require('../utils/Delhi.json'),
  Karnataka: require('../utils/Karnataka.json'),
  'Tamil Nadu': require('../utils/Tamil Nadu.json'),
  Telangana: require('../utils/Telangana.json'),
  Gujarat: require('../utils/Gujarat.json'),
  Rajasthan: require('../utils/Rajasthan.json'),
  'West Bengal': require('../utils/West Bengal.json'),
  Bihar: require('../utils/Bihar.json'),
  Punjab: require('../utils/Punjab.json'),
  Haryana: require('../utils/Haryana.json'),
  Kerala: require('../utils/Kerala.json'),
  Odisha: require('../utils/Odisha.json'),
  'Madhya Pradesh': require('../utils/Madhya Pradesh.json'),
  Chhattisgarh: require('../utils/Chhattisgarh.json'),
  Assam: require('../utils/Assam.json'),
  Jharkhand: require('../utils/Jharkhand.json'),
  'Himachal Pradesh': require('../utils/Himachal Pradesh.json'),
  'Jammu and Kashmir': require('../utils/Jammu and Kashmir.json'),
  Uttarakhand: require('../utils/Uttarakhand.json'),
  Tripura: require('../utils/Tripura.json'),
  Manipur: require('../utils/Manipur.json'),
  Meghalaya: require('../utils/Meghalaya.json'),
  Sikkim: require('../utils/Sikkim.json'),
  Nagaland: require('../utils/Nagaland.json'),
  'Arunachal Pradesh': require('../utils/Arunachal Pradesh.json'),
  Goa: require('../utils/Goa.json'),
  Mizoram: require('../utils/Mizoram.json'),
  Lakshadweep: require('../utils/Lakshadweep.json'),
  Puducherry: require('../utils/Puducherry.json'),
  Chandigarh: require('../utils/Chandigarh.json'),
};

const STATE_CODE_LIST: HighCourt[] = [
  { name: 'Andaman and Nicobar', code: 28 },
  { name: 'Andhra Pradesh', code: 2 },
  { name: 'Arunachal Pradesh', code: 36 },
  { name: 'Assam', code: 6 },
  { name: 'Bihar', code: 8 },
  { name: 'Chandigarh', code: 27 },
  { name: 'Chhattisgarh', code: 18 },
  { name: 'Delhi', code: 26 },
  { name: 'Goa', code: 30 },
  { name: 'Gujarat', code: 17 },
  { name: 'Haryana', code: 14 },
  { name: 'Himachal Pradesh', code: 5 },
  { name: 'Jammu and Kashmir', code: 12 },
  { name: 'Jharkhand', code: 7 },
  { name: 'Karnataka', code: 3 },
  { name: 'Kerala', code: 4 },
  { name: 'Ladakh', code: 33 },
  { name: 'Lakshadweep', code: 37 },
  { name: 'Madhya Pradesh', code: 23 },
  { name: 'Maharashtra', code: 1 },
  { name: 'Manipur', code: 25 },
  { name: 'Meghalaya', code: 21 },
  { name: 'Mizoram', code: 19 },
  { name: 'Nagaland', code: 34 },
  { name: 'Odisha', code: 11 },
  { name: 'Puducherry', code: 35 },
  { name: 'Punjab', code: 22 },
  { name: 'Rajasthan', code: 9 },
  { name: 'Sikkim', code: 24 },
  { name: 'Tamil Nadu', code: 10 },
  { name: 'Telangana', code: 29 },
  { name: 'The Dadra And Nagar Haveli And Daman And Diu', code: 38 },
  { name: 'Tripura', code: 20 },
  { name: 'Uttar Pradesh', code: 13 },
  { name: 'Uttarakhand', code: 15 },
  { name: 'West Bengal', code: 16 },
];

const stateOptions = Object.keys(STATE_JSON_MAP).map(stateName => ({
  label: stateName,
  value: stateName,
}));

const getDistrictsForState = (stateName: string) => {
  if (!stateName || !STATE_JSON_MAP[stateName]) {
    return [];
  }
  try {
    const districtsObj = STATE_JSON_MAP[stateName][stateName]?.Districts || {};
    return Object.keys(districtsObj).map(districtName => ({
      label: districtName,
      value: districtName,
      code: districtsObj[districtName].Code + '',
    }));
  } catch (error) {
    console.error(
      'Error processing district JSON for state:',
      stateName,
      error,
    );
    return [];
  }
};

const RegisterScreen = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<any>();
  // State for role selection
  const [selectedRole, setSelectedRole] = useState<'firmOwner' | 'student'>(
    'firmOwner',
  );
  const [selectedCourt, setSelectedCourt] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [selectedState, setSelectedState] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [isStatePickerVisible, setStatePickerVisible] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState<{
    label: string;
    value: string;
    code?: string;
  } | null>(null);
  const [isDistrictPickerVisible, setDistrictPickerVisible] = useState(false);
  const [districtOptions, setDistrictOptions] = useState<
    { label: string; value: string; code: string }[]
  >([]);
  const [approachedBy, setApproachedBy] = useState('');
  const [otherApproachedBy, setOtherApproachedBy] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [aorCode, setaorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBarcodeModalVisible, setBarcodeModalVisible] = useState(false);
  // const [barCode, setBarCode] = useState('');

  const [isPhoneVerified, setIsPhoneVerified] = useState<string>('');
  const [isEmailVerified, setIsEmailVerified] = useState<string>('');
  const [isPhoneOtpModalVisible, setPhoneOtpModalVisible] = useState(false);
  const [isEmailOtpModalVisible, setEmailOtpModalVisible] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isTermsModalVisible, setTermsModalVisible] = useState(false);

  const [phoneOtp, setPhoneOtp] = useState('');
  const [emailOtp, setEmailOtp] = useState('');

  const [phoneVerificationToken, setPhoneVerificationToken] = useState(null);
  const [emailVerificationToken, setEmailVerificationToken] = useState(null);

  const [phoneResendTimer, setPhoneResendTimer] = useState(0);
  const [emailResendTimer, setEmailResendTimer] = useState(0);

  const [isSendingPhoneOtp, setIsSendingPhoneOtp] = useState(false);
  const [isSendingEmailOtp, setIsSendingEmailOtp] = useState(false);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isResendingPhoneOtp, setIsResendingPhoneOtp] = useState(false);
  const [isResendingEmailOtp, setIsResendingEmailOtp] = useState(false);

  const [barStateCode, setBarStateCode] = useState('');
  const [barId, setBarId] = useState('');
  const [barYear, setBarYear] = useState('');
  const [aorName, setAorName] = useState(''); // New state for AOR Name

  const [isLengthValid, setIsLengthValid] = useState(false);
  const [hasLettersAndNumbers, setHasLettersAndNumbers] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [isLanguagePickerVisible, setLanguagePickerVisible] = useState(false);

  const dispatch = useDispatch<AppDispatch>();

  console.log(isLengthValid);
  console.log(hasLettersAndNumbers);
  console.log(hasSpecialChar);
  console.log(passwordsMatch);

  useEffect(() => {
    setIsLengthValid(password.length >= 8);
    setHasLettersAndNumbers(/[a-zA-Z]/.test(password) && /\d/.test(password));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
  }, [password]);

  useEffect(() => {
    if (confirmPassword && password === confirmPassword) {
      setPasswordsMatch(true);
    } else {
      setPasswordsMatch(false);
    }
  }, [password, confirmPassword]);

  useEffect(() => {
    let interval;
    if (phoneResendTimer > 0) {
      interval = setInterval(() => {
        setPhoneResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [phoneResendTimer]);

  useEffect(() => {
    let interval;
    if (emailResendTimer > 0) {
      interval = setInterval(() => {
        setEmailResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [emailResendTimer]);

  useEffect(() => {
    if (selectedState) {
      const newDistricts = getDistrictsForState(selectedState.value);
      setDistrictOptions(newDistricts);
      setSelectedDistrict(null);
    } else {
      setDistrictOptions([]);
      setSelectedDistrict(null);
    }
  }, [selectedState]);

  const handleSelectCourt = (court: { label: string; value: string }) => {
    setSelectedCourt(court);
    setPickerVisible(false);
  };

  const handleSelectState = (state: { label: string; value: string }) => {
    setSelectedState(state);
    setStatePickerVisible(false);
  };

  const handleSelectDistrict = (district: {
    label: string;
    value: string;
    code: string;
  }) => {
    setSelectedDistrict(district);
    setDistrictPickerVisible(false);
  };
  const handleSelectLanguage = (language: { label: string; value: string }) => {
    setSelectedLanguage(language);
    setLanguagePickerVisible(false);
  };

  const performFirmOwnerRegistration = async () => {
    setLoading(true);
    try {
      const fcmToken = await getFCMToken();

      const os = Platform.OS;
      const model = DeviceInfo.getModel();
      const brand = DeviceInfo.getBrand();
      const version = DeviceInfo.getSystemVersion();
      const deviceType = `${os} - ${brand} ${model} - v${version}`;

      const payload: any = {
        name,
        email,
        phoneNumber: phone,
        advocateBarCode: `${barStateCode}/${barId}/${barYear}`,
        AOR_Name: aorName,
        AOR_Name_Code: aorCode,
        password,
        courtOfPractice: selectedCourt!.value,
        state: selectedState!.value,
        stateCode: STATE_CODE_LIST.find(
          state => state.name === selectedState!.value,
        )?.code,
        onboardedBy: otherApproachedBy,
        isPhoneVerified: isPhoneVerified,
        isEmailVerified: isEmailVerified,
        isBarcodeVerified: false,
        fcmToken,
        deviceType,
      };

      if (referralCode) {
        payload.referralCode = referralCode;
      }

      if (selectedCourt!.value === 'District Court') {
        payload.district = selectedDistrict?.value;
        payload.districtCode = selectedDistrict?.code;
      }

      await dispatch(registerAndCheckForCases(payload)).unwrap();
      navigation.replace('PostAuthLoadingScreen');
    } catch (error: any) {
      Alert.alert('Registration Failed', error || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const performStudentRegistration = async () => {
    if (!selectedLanguage) {
      Alert.alert('Incomplete Form', 'Please select your preferred language.');
      return;
    }
    setLoading(true);
    try {
      const fcmToken = await getFCMToken();

      // Get and concatenate device information
      const os = Platform.OS;
      const model = DeviceInfo.getModel();
      const brand = DeviceInfo.getBrand();
      const version = DeviceInfo.getSystemVersion();
      const deviceType = `${os} - ${brand} ${model} - v${version}`;

      const payload = {
        name,
        email,
        phoneNumber: phone,
        password,
        isPhoneVerified,
        isEmailVerified,
        language: selectedLanguage.value,
        fcmToken,
        deviceType,
      };

      await dispatch(registerStudent(payload)).unwrap();
      navigation.replace('PostAuthLoadingScreen');
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Registration Failed',
        text2: error || 'An unknown error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };
  // const verifyBarCode = async (): Promise<boolean> => {
  //   if (selectedCourt?.value === 'Supreme Court of India') {
  //     return true;
  //   }

  //   setLoading(true);
  //   try {
  //     const barInputParts = barCode.trim().split('/');
  //     if (barInputParts.length !== 3) {
  //       Alert.alert(
  //         'Invalid Bar ID Format',
  //         'Please enter the Bar ID in the format: State/ID/Year.',
  //       );
  //       return false;
  //     }

  //     let payload;
  //     const [advocateBarStateCode, barId, registrationYear] = barInputParts;

  //     if (selectedCourt?.value === 'State High Court') {
  //       const stateCode = STATE_CODE_LIST.find(
  //         s => s.name === selectedState!.value,
  //       )?.code;
  //       if (!stateCode) {
  //         Alert.alert('System Error', 'Could not find a valid state code.');
  //         return false;
  //       }
  //       payload = {
  //         caseType: 'HC',
  //         advocateNameData: {
  //           state_code: stateCode.toString(),
  //           adv_bar_state: barCode.trim(),
  //         },
  //       };
  //     } else if (selectedCourt?.value === 'District Court') {
  //       const stateCode = STATE_CODE_LIST.find(
  //         s => s.name === selectedState!.value,
  //       )?.code;
  //       payload = {
  //         caseType: 'DC',
  //         advocateNameData: {
  //           adv_bar_state: advocateBarStateCode.trim(),
  //           adv_bar_code: barId.trim(),
  //           adv_bar_year: registrationYear.trim(),
  //           state_code: stateCode?.toString(),
  //           dist_code: selectedDistrict!.code,
  //           court_complex_code: '0', // Default value
  //           est_code: '0', // Default value
  //         },
  //       };
  //     }

  //     const response = await fetch(
  //       `${NODE_API_ENDPOINT}/case/caseFind/advocateBarCode`,
  //       {
  //         method: 'POST',
  //         headers: {'Content-Type': 'application/json'},
  //         body: JSON.stringify(payload),
  //       },
  //     );
  //     console.log('Bar Id verification', response);

  //     const data = await response.json();
  //     console.log(data);

  //     if (!response.ok) {
  //       throw new Error(data.message || 'Failed to verify Bar ID.');
  //     }

  //     if (
  //       selectedCourt?.value === 'State High Court' &&
  //       data?.case?.body?.results?.[0]?.body_html?.[0]?.length > 0
  //     ) {
  //       return true;
  //     } else if (
  //       selectedCourt?.value === 'District Court' &&
  //       data?.case?.body?.cases?.length > 0
  //     ) {
  //       return true;
  //     }

  //     Alert.alert(
  //       'Verification Failed',
  //       'We could not find any cases associated with this Bar ID for the selected court. Please check your details.',
  //     );
  //     return false;
  //   } catch (error: any) {
  //     console.error('Bar ID verification error:', error);
  //     Alert.alert(
  //       'Verification Error',
  //       error.message ||
  //         'An error occurred while verifying your Bar ID. Please try again.',
  //     );
  //     return false;
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const OTP_TIMER_DURATION = 300;

  const handleSendPhoneOtp = async () => {
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Phone Number',
        text2: 'Please enter a valid 10-digit number.',
      });
      return;
    }
    setIsSendingPhoneOtp(true);
    try {
      const response = await fetch(
        `${NODE_API_ENDPOINT}/${selectedRole === 'firmOwner' ? 'auth' : 'student'
        }/send-phone-otp-for-verification`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: `91${phone}`, name: name || 'User' }),
        },
      );
      console.log('send phone', response);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send OTP.');

      setPhoneVerificationToken(data.token);
      setPhoneOtpModalVisible(true);
      setPhoneResendTimer(OTP_TIMER_DURATION);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Please check your phone for the verification code.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Could Not Send OTP',
        text2: error.message,
      });
    } finally {
      setIsSendingPhoneOtp(false);
    }
  };

  const handleResendPhoneOtp = async () => {
    setIsResendingPhoneOtp(true);
    try {
      const response = await fetch(
        `${NODE_API_ENDPOINT}/${selectedRole === 'firmOwner' ? 'auth' : 'student'
        }/resend-phone-otp`,
        {
          method: 'GET',
          headers: { 'x-token': phoneVerificationToken },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.message || 'Failed to resend OTP.');
        error.status = response.status;
        throw error;
      }
      setPhoneVerificationToken(data.token);
      setPhoneResendTimer(OTP_TIMER_DURATION);
      setPhoneOtp('');
      Toast.show({
        type: 'info',
        text1: 'OTP Re-sent',
        text2: 'A new OTP has been sent to your phone.',
      });
    } catch (error) {
      if (error.status === 401) {
        await handleSendPhoneOtp();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: error.message });
      }
    } finally {
      setIsResendingPhoneOtp(false);
    }
  };

  const handleVerifyPhoneOtp = async () => {
    if (phoneOtp.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter the 6-digit OTP.',
      });
      return;
    }
    setIsVerifyingPhone(true);
    try {
      const response = await fetch(
        `${NODE_API_ENDPOINT}/${selectedRole === 'firmOwner' ? 'auth' : 'student'
        }/verify-phone-otp-signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-token': phoneVerificationToken,
          },
          body: JSON.stringify({ otp: phoneOtp }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Phone verification failed.');
      }

      setIsPhoneVerified(data.token);
      setPhoneOtpModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Phone number verified successfully.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.message,
      });
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleSendEmailOtp = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Email',
        text2: 'Please enter a valid email address.',
      });
      return;
    }
    setIsSendingEmailOtp(true);
    try {
      const response = await fetch(
        `${NODE_API_ENDPOINT}/${selectedRole === 'firmOwner' ? 'auth' : 'student'
        }/send-email-otp-for-verification`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send OTP.');

      setEmailVerificationToken(data.token);
      setEmailOtpModalVisible(true);
      setEmailResendTimer(OTP_TIMER_DURATION);
      Toast.show({
        type: 'success',
        text1: 'OTP Sent',
        text2: 'Please check your email for the verification code.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Could Not Send OTP',
        text2: error.message,
      });
    } finally {
      setIsSendingEmailOtp(false);
    }
  };

  const handleResendEmailOtp = async () => {
    setIsResendingEmailOtp(true);
    try {
      const response = await fetch(
        `${NODE_API_ENDPOINT}/${selectedRole === 'firmOwner' ? 'auth' : 'student'
        }/resend-email-otp`,
        {
          method: 'GET',
          headers: { 'x-token': emailVerificationToken },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.message || 'Failed to resend OTP.');
        error.status = response.status;
        throw error;
      }
      setEmailVerificationToken(data.token);
      setEmailResendTimer(OTP_TIMER_DURATION);
      setEmailOtp('');
      Toast.show({
        type: 'info',
        text1: 'OTP Re-sent',
        text2: 'A new OTP has been sent to your email.',
      });
    } catch (error) {
      if (error.status === 401) {
        await handleSendEmailOtp();
      } else {
        Toast.show({ type: 'error', text1: 'Error', text2: error.message });
      }
    } finally {
      setIsResendingEmailOtp(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      Toast.show({
        type: 'error',
        text1: 'Invalid OTP',
        text2: 'Please enter the 6-digit OTP.',
      });
      return;
    }
    setIsVerifyingEmail(true);
    try {
      const response = await fetch(
        `${NODE_API_ENDPOINT}/${selectedRole === 'firmOwner' ? 'auth' : 'student'
        }/verify-email-otp-signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-token': emailVerificationToken,
          },
          body: JSON.stringify({ otp: emailOtp }),
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired OTP.');
      }
      setIsEmailVerified(data.token);
      setEmailOtpModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Success!',
        text2: 'Email verified successfully.',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: error.message,
      });
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const handleRegister = async () => {
    // Common validations for all roles
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Incomplete Form', 'Please fill all the required fields.');
      return;
    }
    if (email && !emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    if (phone && !phoneRegex.test(phone)) {
      Alert.alert(
        'Invalid Phone Number',
        'Please enter a valid 10-digit mobile number not starting with 0, 1, 2, 3, 4, or 5.',
      );
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!isLengthValid || !hasLettersAndNumbers || !hasSpecialChar) {
      let errorMessage =
        'Your password must meet the following requirements:\n\n';
      if (!isLengthValid) errorMessage += '• At least 8 characters long\n';
      if (!hasLettersAndNumbers)
        errorMessage += '• Contain both letters and numbers\n';
      if (!hasSpecialChar)
        errorMessage +=
          '• Include at least one special character (e.g., !, @, #, $)\n';
      Alert.alert('Weak Password', errorMessage);
      return;
    }
    if (!passwordsMatch) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (isPhoneVerified === '' && isEmailVerified === '') {
      Alert.alert(
        'Verification Required',
        'Please verify your email or phone number to register.',
      );
      return;
    }

    if (!isTermsAccepted) {
      Alert.alert(
        'Terms & Conditions',
        'Please accept the Terms & Conditions to proceed.',
      );
      return;
    }

    // Role-specific logic and validation
    if (selectedRole === 'firmOwner') {
      if (
        !selectedCourt ||
        !selectedState ||
        (selectedCourt.value === 'District Court' && !selectedDistrict) ||
        !aorName
      ) {
        Alert.alert(
          'Incomplete Form',
          'Please fill all required fields including court, state, Bar Code, and AOR Name.',
        );
        return;
      }
      if (barYear.length !== 4) {
        Alert.alert(
          'Invalid Bar Year',
          'Please enter a valid 4-digit bar year.',
        );
        return;
      }
      await performFirmOwnerRegistration();
    } else {
      // Logic for student
      await performStudentRegistration();
    }
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollView: {
      flexGrow: 1,
      paddingHorizontal: 24,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 48,
      paddingBottom: 24,
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
    },
    subtitle: {
      color: colors.secondaryText,
      marginBottom: 24,
      textAlign: 'center',
    },
    // Styles for the new role selector
    roleSelectorContainer: {
      flexDirection: 'row',
      width: '100%',
      height: 48,
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 24,
      overflow: 'hidden',
    },
    roleButton: {
      flex: 1,
      height: '100%',
      borderRadius: 8,
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
      fontSize: 14,
      fontWeight: '500',
    },
    textInput: {
      width: '100%',
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      marginBottom: 12,
      color: colors.text,
      fontSize: 14,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    passwordInput: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      height: '100%',
    },
    dropdownTouchable: {
      width: '100%',
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      marginBottom: 12,
      justifyContent: 'center',
    },
    dropdownText: {
      fontSize: 14,
      color: colors.text,
    },
    disabled: {
      backgroundColor: colors.disabled,
      borderColor: colors.border,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.modalBackground,
    },
    barmodalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.modalBackground,
    },
    modalContent: {
      backgroundColor: colors.modalContent,
      width: '80%',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 10,
      maxHeight: '70%',
    },
    modalOption: {
      paddingVertical: 12,
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: `${colors.primary}33`,
    },
    modalOptionText: {
      color: colors.text,
      fontSize: 16,
    },
    barmodalContent: {
      backgroundColor: colors.card,
      width: '85%',
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      borderColor: colors.border,
      padding: 10,
    },
    barmodalOptionText: {
      color: colors.primary,
      fontSize: 15,
      fontFamily: 'SpaceGrotesk-SemiBold',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      marginBottom: 12,
    },
    textInputWithButton: {
      flex: 1,
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
      paddingHorizontal: 16,
      color: colors.text,
      fontSize: 14,
    },
    verifyButton: {
      height: 48,
      paddingHorizontal: 12,
      justifyContent: 'center',
      alignItems: 'center',
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
    verifyButtonText: {
      color: colors.textOnGradient,
      fontWeight: 'bold',
    },
    verifiedTick: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      borderTopRightRadius: 8,
      borderBottomRightRadius: 8,
    },
    otpModalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.modalBackground,
    },
    otpModalContent: {
      width: '85%',
      backgroundColor: colors.modalContent,
      borderRadius: 10,
      padding: 20,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    otpModalTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    otpModalSubtitle: {
      color: colors.secondaryText,
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 20,
    },
    otpInputContainer: {
      width: '100%',
      marginBottom: 20,
    },
    otpInput: {
      width: '100%',
      height: 50,
      color: colors.text,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      textAlign: 'center',
      fontSize: 24,
    },
    otpVerifyButton: {
      width: '100%',
      backgroundColor: colors.primary,
      padding: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    otpVerifyButtonText: {
      color: colors.textOnGradient,
      fontSize: 16,
      fontWeight: 'bold',
    },
    resendContainer: {
      marginTop: 20,
    },
    resendTimerText: {
      color: colors.secondaryText,
    },
    resendButtonText: {
      color: colors.primary,
      fontWeight: 'bold',
    },
    closeModalButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      padding: 5,
      zIndex: 1,
    },
    dottedTextInput: {
      width: '100%',
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      marginBottom: 12,
      color: colors.text,
      fontSize: 14,
      borderStyle: 'dashed',
    },
    barCodeWrapper: {
      width: '100%',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 16,
      marginBottom: 12,
    },
    barCodeTitle: {
      color: colors.text,
      fontSize: 14,
      marginBottom: 12,
    },
    barCodeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      gap: 8, // Add gap between inputs
    },
    barCodeInput: {
      flex: 1, // Use flex instead of fixed width
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 8, // Reduce horizontal padding
      color: colors.text,
      fontSize: 14,
      textAlign: 'center',
    },

    passwordRequirementsContainer: {
      width: '100%',
      padding: 10,
      marginBottom: 12,
    },
    invalidRequirement: {
      color: colors.secondaryText,
      fontSize: 12,
    },
    validRequirement: {
      color: colors.primary,
      fontSize: 12,
    },
    matchText: {
      color: colors.primary,
      fontSize: 12,
      marginTop: -8,
      marginBottom: 12,
      width: '100%',
      paddingHorizontal: 4,
    },
    noMatchText: {
      color: '#EF4444',
      fontSize: 12,
      marginTop: -8,
      marginBottom: 12,
      width: '100%',
      paddingHorizontal: 4,
    },
    bottomContainer: {
      paddingHorizontal: 24,
      paddingBottom: 32,
    },
    bottomButton: {
      width: '100%',
      borderRadius: 8,
      overflow: 'hidden',
    },
    bottomGradient: {
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    bottomText: {
      color: colors.textOnGradient,
      fontWeight: '600',
      fontSize: 16,
    },
    footerLinkContainer: {
      marginTop: 24,
    },
    footerText: {
      color: colors.secondaryText,
      textAlign: 'center',
    },
    footerLink: {
      color: colors.primary,
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scrollView}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../assets/LogoLogin.png')}
                style={styles.logo}
              />
            </View>

            <Text style={styles.title}>Step Into Legal Tech</Text>
            <Text style={styles.subtitle}>
              Future-Proof Your Practice With Smart Automation
            </Text>

            <View style={styles.roleSelectorContainer}>
              {(['firmOwner', 'student'] as const).map(role => {
                const isSelected = selectedRole === role;
                const button = (
                  <View style={styles.roleButtonInner}>
                    <Text
                      style={[
                        styles.roleButtonText,
                        !isSelected && { color: colors.text },
                      ]}>
                      {role === 'firmOwner' ? 'Firm Owner ' : 'Law Student'}
                    </Text>
                  </View>
                );

                return (
                  <TouchableOpacity
                    key={role}
                    onPress={() => setSelectedRole(role)}
                    style={{ flex: 1 }}>
                    {isSelected ? (
                      <LinearGradient
                        colors={colors.buttonGradient}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
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

            <TextInput
              placeholder="Enter Your Name"
              placeholderTextColor={colors.secondaryText}
              style={styles.textInput}
              value={name}
              onChangeText={setName}
            />
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter Your Email ID"
                placeholderTextColor={colors.secondaryText}
                style={styles.textInputWithButton}
                value={email}
                onChangeText={t => {
                  setIsEmailVerified('');
                  setEmail(t);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {isEmailVerified ? (
                <LinearGradient
                  colors={colors.buttonGradient}
                  style={styles.verifiedTick}>
                  <Icon name="check" size={20} color={colors.textOnGradient} />
                </LinearGradient>
              ) : (
                <TouchableOpacity
                  onPress={handleSendEmailOtp}
                  disabled={isSendingEmailOtp}>
                  <LinearGradient
                    colors={colors.buttonGradient}
                    style={styles.verifyButton}>
                    {isSendingEmailOtp ? (
                      <ActivityIndicator color={colors.textOnGradient} />
                    ) : (
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter Your Contact No"
                placeholderTextColor={colors.secondaryText}
                style={styles.textInputWithButton}
                value={phone}
                onChangeText={t => {
                  setIsPhoneVerified('');
                  setPhone(t);
                }}
                keyboardType="phone-pad"
                maxLength={10}
              />
              {isPhoneVerified ? (
                <LinearGradient
                  colors={colors.buttonGradient}
                  style={styles.verifiedTick}>
                  <Icon name="check" size={20} color={colors.textOnGradient} />
                </LinearGradient>
              ) : (
                <TouchableOpacity
                  onPress={handleSendPhoneOtp}
                  disabled={isSendingPhoneOtp}>
                  <LinearGradient
                    colors={colors.buttonGradient}
                    style={styles.verifyButton}>
                    {isSendingPhoneOtp ? (
                      <ActivityIndicator color={colors.textOnGradient} />
                    ) : (
                      <Text style={styles.verifyButtonText}>Verify</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </View>
            <TermsModal
              isVisible={isTermsModalVisible}
              onClose={() => setTermsModalVisible(false)}
            />

            {/* OTP Modals remain the same */}
            <Modal
              transparent={true}
              visible={isPhoneOtpModalVisible}
              onRequestClose={() => setPhoneOtpModalVisible(false)}>
              {/* ... Phone OTP Modal Content ... */}
              <View style={styles.otpModalOverlay}>
                <View style={styles.otpModalContent}>
                  <Pressable
                    style={styles.closeModalButton}
                    onPress={() => setPhoneOtpModalVisible(false)}>
                    <Icon name="x" size={24} color={colors.secondaryText} />
                  </Pressable>
                  <Text style={styles.otpModalTitle}>Verify Phone Number</Text>
                  <Text style={styles.otpModalSubtitle}>
                    Enter the 6-digit OTP sent to your phone.
                  </Text>
                  <View style={styles.otpInputContainer}>
                    <TextInput
                      style={styles.otpInput}
                      maxLength={6}
                      keyboardType="numeric"
                      value={phoneOtp}
                      onChangeText={setPhoneOtp}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleVerifyPhoneOtp}
                    disabled={isVerifyingPhone}
                    style={styles.otpVerifyButton}>
                    {isVerifyingPhone ? (
                      <ActivityIndicator color={colors.textOnGradient} />
                    ) : (
                      <Text style={styles.otpVerifyButtonText}>Verify OTP</Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.resendContainer}>
                    {phoneResendTimer > 0 ? (
                      <Text style={styles.resendTimerText}>
                        Resend OTP in {formatTime(phoneResendTimer)}
                      </Text>
                    ) : (
                      <TouchableOpacity
                        onPress={handleResendPhoneOtp}
                        disabled={isResendingPhoneOtp}>
                        {isResendingPhoneOtp ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.primary}
                          />
                        ) : (
                          <Text style={styles.resendButtonText}>
                            Resend OTP
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </Modal>
            <Modal
              transparent={true}
              visible={isEmailOtpModalVisible}
              onRequestClose={() => setEmailOtpModalVisible(false)}>
              {/* ... Email OTP Modal Content ... */}
              <View style={styles.otpModalOverlay}>
                <View style={styles.otpModalContent}>
                  <Pressable
                    style={styles.closeModalButton}
                    onPress={() => setEmailOtpModalVisible(false)}>
                    <Icon name="x" size={24} color={colors.secondaryText} />
                  </Pressable>
                  <Text style={styles.otpModalTitle}>Verify Email Address</Text>
                  <Text style={styles.otpModalSubtitle}>
                    Enter the 6-digit OTP sent to your email.
                  </Text>
                  <View style={styles.otpInputContainer}>
                    <TextInput
                      style={styles.otpInput}
                      maxLength={6}
                      keyboardType="numeric"
                      value={emailOtp}
                      onChangeText={setEmailOtp}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={handleVerifyEmailOtp}
                    disabled={isVerifyingEmail}
                    style={styles.otpVerifyButton}>
                    {isVerifyingEmail ? (
                      <ActivityIndicator color={colors.textOnGradient} />
                    ) : (
                      <Text style={styles.otpVerifyButtonText}>Verify OTP</Text>
                    )}
                  </TouchableOpacity>
                  <View style={styles.resendContainer}>
                    {emailResendTimer > 0 ? (
                      <Text style={styles.resendTimerText}>
                        Resend OTP in {formatTime(emailResendTimer)}
                      </Text>
                    ) : (
                      <TouchableOpacity
                        onPress={handleResendEmailOtp}
                        disabled={isResendingEmailOtp}>
                        {isResendingEmailOtp ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.primary}
                          />
                        ) : (
                          <Text style={styles.resendButtonText}>
                            Resend OTP
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            </Modal>

            {/* Conditional Fields for Firm Owner / Advocate */}
            {selectedRole === 'firmOwner' && (
              <>
                <View style={styles.barCodeWrapper}>
                  <Text style={styles.barCodeTitle}>
                    Enter Your Advocate Bar Code
                  </Text>
                  <View style={styles.barCodeContainer}>
                    <TextInput
                      placeholder="State Code"
                      placeholderTextColor={colors.secondaryText}
                      style={styles.barCodeInput}
                      value={barStateCode}
                      maxLength={4}
                      onChangeText={setBarStateCode}
                    />
                    <TextInput
                      placeholder="Bar Code"
                      placeholderTextColor={colors.secondaryText}
                      style={styles.barCodeInput}
                      value={barId}
                      onChangeText={setBarId}
                      maxLength={6}
                      keyboardType="numeric"
                    />
                    <TextInput
                      placeholder="Year"
                      placeholderTextColor={colors.secondaryText}
                      style={styles.barCodeInput}
                      value={barYear}
                      onChangeText={setBarYear}
                      keyboardType="numeric"
                      maxLength={4}
                    />
                  </View>
                </View>
                <TextInput
                  placeholder="AOR Name"
                  placeholderTextColor={colors.secondaryText}
                  style={styles.textInput}
                  value={aorName}
                  onChangeText={setAorName}
                />
                <TextInput
                  placeholder="AOR Name Code (Optional)"
                  placeholderTextColor={colors.secondaryText}
                  style={styles.dottedTextInput}
                  value={aorCode}
                  onChangeText={setaorCode}
                />
                <TextInput
                  placeholder="Referral Code (Optional)"
                  placeholderTextColor={colors.secondaryText}
                  style={styles.dottedTextInput}
                  value={referralCode}
                  onChangeText={setReferralCode}
                />

                <TouchableOpacity
                  onPress={() => setPickerVisible(true)}
                  style={styles.dropdownTouchable}>
                  <Text
                    style={[
                      styles.dropdownText,
                      !selectedCourt && { color: colors.secondaryText },
                    ]}>
                    {selectedCourt ? selectedCourt.label : 'Court Of Practice'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setStatePickerVisible(true)}
                  style={styles.dropdownTouchable}>
                  <Text
                    style={[
                      styles.dropdownText,
                      !selectedState && { color: colors.secondaryText },
                    ]}>
                    {selectedState ? selectedState.label : 'Select Your State'}
                  </Text>
                </TouchableOpacity>

                {selectedCourt?.value === 'District Court' && (
                  <TouchableOpacity
                    onPress={() => {
                      if (selectedState) {
                        setDistrictPickerVisible(true);
                      } else {
                        Alert.alert('Notice', 'Please select a state first.');
                      }
                    }}
                    style={[
                      styles.dropdownTouchable,
                      !selectedState && styles.disabled,
                    ]}>
                    <Text
                      style={[
                        styles.dropdownText,
                        !selectedDistrict && { color: colors.secondaryText },
                      ]}>
                      {selectedDistrict
                        ? selectedDistrict.label
                        : 'Select District'}
                    </Text>
                  </TouchableOpacity>
                )}

                <View
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    marginBottom: 12,
                    width: '100%',
                  }}>
                  <Text style={{ color: colors.text, marginBottom: 8 }}>
                    Approached / Onboarded By :
                  </Text>
                  <TextInput
                    placeholder="Approached / Onboarded By"
                    placeholderTextColor={colors.secondaryText}
                    style={[styles.textInput, { marginTop: 8, marginBottom: 0 }]}
                    value={otherApproachedBy}
                    onChangeText={setOtherApproachedBy}
                  />
                </View>
              </>
            )}
            {selectedRole === 'student' && (
              <TouchableOpacity
                onPress={() => setLanguagePickerVisible(true)}
                style={styles.dropdownTouchable}>
                <Text
                  style={[
                    styles.dropdownText,
                    !selectedLanguage && { color: colors.secondaryText },
                  ]}>
                  {selectedLanguage
                    ? selectedLanguage.label
                    : 'Select Your Language'}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Enter Your Password"
                placeholderTextColor={colors.secondaryText}
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={setPassword}
                style={styles.passwordInput}
              />
              <TouchableOpacity
                onPress={() => setPasswordVisible(!passwordVisible)}>
                <Icon
                  name={passwordVisible ? 'eye' : 'eye-off'}
                  size={20}
                  color={colors.secondaryText}
                />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Confirm Password"
              placeholderTextColor={colors.secondaryText}
              style={styles.textInput}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {confirmPassword.length > 0 && (
              <Text
                style={passwordsMatch ? styles.matchText : styles.noMatchText}>
                {passwordsMatch
                  ? '✓ Passwords match'
                  : '✗ Passwords do not match'}
              </Text>
            )}

            <View style={styles.passwordRequirementsContainer}>
              <Text
                style={
                  isLengthValid
                    ? styles.validRequirement
                    : styles.invalidRequirement
                }>
                • Must be at least 8 characters long
              </Text>
              <Text
                style={
                  hasLettersAndNumbers
                    ? styles.validRequirement
                    : styles.invalidRequirement
                }>
                • Must contain both letters and numbers
              </Text>
              <Text
                style={
                  hasSpecialChar
                    ? styles.validRequirement
                    : styles.invalidRequirement
                }>
                • Must include at least one special character (e.g., !, @, #, $)
              </Text>
            </View>
          </View>
        </ScrollView>
        {/* Picker Modals remain the same */}
        <Modal
          transparent={true}
          visible={isPickerVisible}
          animationType="fade"
          onRequestClose={() => setPickerVisible(false)}>
          {/* ... Court Picker Modal Content ... */}
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setPickerVisible(false)}>
            <View style={styles.modalContent}>
              <ScrollView>
                {courtOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.modalOption}
                    onPress={() => handleSelectCourt(option)}>
                    <Text style={styles.modalOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
        <Modal
          transparent={true}
          visible={isStatePickerVisible}
          animationType="fade"
          onRequestClose={() => setStatePickerVisible(false)}>
          {/* ... State Picker Modal Content ... */}
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setStatePickerVisible(false)}>
            <View style={[styles.modalContent]}>
              <ScrollView>
                {stateOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.modalOption}
                    onPress={() => handleSelectState(option)}>
                    <Text style={styles.modalOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
        <Modal
          transparent={true}
          visible={isDistrictPickerVisible}
          animationType="fade"
          onRequestClose={() => setDistrictPickerVisible(false)}>
          {/* ... District Picker Modal Content ... */}
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setDistrictPickerVisible(false)}>
            <View style={styles.modalContent}>
              <ScrollView>
                {districtOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.modalOption}
                    onPress={() => handleSelectDistrict(option)}>
                    <Text style={styles.modalOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
        <Modal
          transparent={true}
          visible={isLanguagePickerVisible}
          animationType="fade"
          onRequestClose={() => setLanguagePickerVisible(false)}>
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setLanguagePickerVisible(false)}>
            <View style={styles.modalContent}>
              <ScrollView>
                {languageOptions.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.modalOption}
                    onPress={() => handleSelectLanguage(option)}>
                    <Text style={styles.modalOptionText}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </Pressable>
        </Modal>
        {/* Terms and Conditions Checkbox */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 4,
            marginBottom: 20,
            width: '100%',
          }}>
          <TouchableOpacity
            onPress={() => setIsTermsAccepted(!isTermsAccepted)}
            style={{
              width: 22,
              height: 22,
              borderRadius: 4,
              borderWidth: 2,
              borderColor: colors.primary,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 10,
              marginLeft: 20,
              backgroundColor: isTermsAccepted ? colors.primary : 'transparent',
            }}>
            {isTermsAccepted && <Icon name="check" size={16} color="#fff" />}
          </TouchableOpacity>

          <Text style={{ color: colors.text, fontSize: 14, flex: 1 }}>
            I agree to the{' '}
            <Text
              style={{
                color: colors.primary,
                fontWeight: 'bold',
                textDecorationLine: 'underline',
              }}
              onPress={() => setTermsModalVisible(true)}>
              Terms & Conditions
            </Text>
          </Text>
        </View>
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={handleRegister}
            disabled={loading}
            style={styles.bottomButton}>
            <LinearGradient
              colors={colors.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.bottomGradient}>
              {loading ? (
                <ActivityIndicator color={colors.textOnGradient} size="small" />
              ) : (
                <Text style={styles.bottomText}>Register Now</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('LoginScreen')}
            style={styles.footerLinkContainer}>
            <Text style={styles.footerText}>
              Already Registered? <Text style={styles.footerLink}>Log In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
export default RegisterScreen;
