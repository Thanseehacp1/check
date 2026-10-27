/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useContext} from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {MainStackParamList} from '../stacks/MainStack';
import {NODE_API_ENDPOINT} from '../utils/util';
import {ThemeContext} from '../components/ThemeContext'; // Import ThemeContext

type ResetPasswordScreenProp = NativeStackScreenProps<
  MainStackParamList,
  'ResetPasswordScreen'
>;

const ResetPasswordScreen = ({navigation, route}: ResetPasswordScreenProp) => {
  const {colors} = useContext(ThemeContext);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetPassword = async () => {
    if (newPassword === '' || confirmPassword === '') {
      Alert.alert('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    try {
      setLoading(true);
      const resp = await fetch(`${NODE_API_ENDPOINT}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-token': route.params.token,
        },
        body: JSON.stringify({newPassword: newPassword}),
      });
      if (!resp.ok) {
        setLoading(false);
        const errorData = await resp.json();
        Alert.alert(`Error: ${errorData.message}`);
        return;
      }
      setLoading(false);
      Alert.alert('Success', 'Password reset successfully');
      const data = await resp.json();
      navigation.replace('OtpSuccessScreen');
    } catch (error) {
      setLoading(false);
      console.error('Error resetting password:', error);
      Alert.alert(`Error: ${error?.message}`);
    }
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoidingView: {
      flex: 1,
      paddingHorizontal: 24,
    },
    mainContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    imageContainer: {
      marginBottom: 40,
      alignItems: 'center',
    },
    image: {
      width: 200,
      height: 200,
      resizeMode: 'contain',
    },
    title: {
      fontSize: 22,
      color: colors.primary,
      textAlign: 'center',
      fontWeight: 'bold',
      marginBottom: 8,
    },
    subtitle: {
      color: colors.secondaryText,
      textAlign: 'center',
      marginBottom: 24,
      fontSize: 14,
    },
    input: {
      width: '100%',
      height: 48,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 16,
      marginBottom: 16,
      color: colors.text,
    },
    bottomContainer: {
      marginBottom: 32,
    },
    buttonWrapper: {
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
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.mainContainer}>
          <View style={styles.imageContainer}>
            <Image
              source={require('../assets/LogoLogin.png')}
              style={styles.image}
            />
          </View>

          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>
            Enter A New Password To Regain Access To Your Legal Workspace
          </Text>

          <TextInput
            placeholder="Enter New Password"
            placeholderTextColor={colors.secondaryText}
            secureTextEntry={!showPassword}
            value={newPassword}
            onChangeText={setNewPassword}
            style={styles.input}
          />
          <TextInput
            placeholder="Confirm Your Password"
            placeholderTextColor={colors.secondaryText}
            secureTextEntry={!showPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={styles.input}
          />
        </View>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={resetPassword}
            style={styles.buttonWrapper}
            disabled={loading}>
            <LinearGradient
              colors={colors.buttonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.buttonGradient}>
              {loading ? (
                <ActivityIndicator color={colors.textOnGradient} />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;