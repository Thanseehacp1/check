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
import LinearGradient from 'react-native-linear-gradient';
import {ThemeContext} from '../components/ThemeContext'; // Import ThemeContext

const OtpSuccessScreen = () => {
  const {colors} = useContext(ThemeContext); // Use theme colors
  const navigation = useNavigation<any>();

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

            <Text style={styles.title}>Verification Successful</Text>
            <Text style={styles.subtitle}>
              Your Identity Has Been Confirmed. You're All Set To Continue
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('LoginScreen')}
            style={styles.buttonWrapper}>
            <LinearGradient
              colors={colors.buttonGradient}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.buttonGradient}>
              <Text style={styles.buttonText}>Continue to Login</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default OtpSuccessScreen;