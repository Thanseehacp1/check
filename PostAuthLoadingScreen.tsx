// src/screens/PostAuthLoadingScreen.tsx
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useContext } from 'react';
import {
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
  StyleSheet,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
// Note: Use NativeStackNavigationProp to properly type .replace()
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FastImage from '@d11/react-native-fast-image';
import DeviceInfo from 'react-native-device-info'; // <-- 1. Import DeviceInfo
import { RootStackParamList } from '../navigation/RootStack';
import { ThemeContext } from '../components/ThemeContext';

const { width: screenWidth } = Dimensions.get('window');
const GIF_DISPLAY_DURATION = 3000; // 3 seconds

type PostAuthLoadingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PostAuthLoadingScreen = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<PostAuthLoadingScreenNavigationProp>();

  // 2. Determine if the device is a tablet
  const isDeviceTablet = DeviceInfo.isTablet() || screenWidth >= 700;

  useEffect(() => {
    const timer = setTimeout(() => {
      // 3. Conditionally navigate based on device type
      if (isDeviceTablet) {
        navigation.replace('TabletFlow', {
          screen: 'Home', // Matches TabletStackParamList -> Home
          params: {
            screen: 'HomeTabletScreen',
            params: { fromLogin: true },
          },
        });
      } else {
        navigation.replace('MainTabs', {
          screen: 'Home', // Matches RootTabParamList -> Home
          params: {
            screen: 'HomeScreen',
            params: { fromLogin: true },
          },
        });
      }
    }, GIF_DISPLAY_DURATION);

    return () => clearTimeout(timer);
  }, [navigation, isDeviceTablet]);

  const styles = StyleSheet.create({
    gradient: {
      flex: 1,
    },
    safeArea: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    fastImage: {
      width: screenWidth * 0.5,
      height: screenWidth * 0.5,
    },
  });

  return (
    <LinearGradient
      colors={[colors.background, colors.card]}
      style={styles.gradient}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <SafeAreaView style={styles.safeArea}>
        <FastImage
          source={require('../assets/icons/loading.gif')}
          style={styles.fastImage}
          resizeMode={FastImage.resizeMode.contain}
        />
      </SafeAreaView>
    </LinearGradient>
  );
};

export default PostAuthLoadingScreen;
