/* eslint-disable react-native/no-inline-styles */
import React, {useContext} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import LinearGradient from 'react-native-linear-gradient';
import {MainStackParamList} from '../stacks/MainStack';
import {ThemeContext} from '../components/ThemeContext'; // Import ThemeContext

type RegSuccessScreenNavigationProp = NativeStackNavigationProp<
  MainStackParamList,
  'RegistrationSuccessScreen'
>;

const RegistrationSuccessScreen = () => {
  const {colors} = useContext(ThemeContext);
  const navigation = useNavigation<RegSuccessScreenNavigationProp>();

  const handleKnowMoreOrContinue = () => {
    navigation.replace('PostAuthLoadingScreen');
  };

  const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    contentContainer: {
      alignItems: 'center',
    },
    imageContainer: {
      marginBottom: 40,
    },
    image: {
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
      marginBottom: 40,
      textAlign: 'center',
      fontSize: 14,
    },
    bottomContainer: {
      paddingHorizontal: 24,
      paddingBottom: 32,
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
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled">
          <View style={styles.contentContainer}>
            <View style={styles.imageContainer}>
              <Image
                source={require('../assets/LogoLogin.png')}
                style={styles.image}
              />
            </View>

            <Text style={styles.title}>Registration Successful</Text>
            <Text style={styles.subtitle}>
              Your Details Have Been Sent. Keep An Eye On Your Email For
              Onboarding Process
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('OtpVerificationScreen')}
            style={styles.buttonWrapper}>
            <LinearGradient
              colors={colors.buttonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Know More</Text>
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

export default RegistrationSuccessScreen;