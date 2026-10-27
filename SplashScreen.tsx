/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, {useCallback, useRef, useContext} from 'react';
import {View, Text, Animated, Easing, StyleSheet} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {ThemeContext} from '../components/ThemeContext'; // Import ThemeContext

type SplashScreenProps = {
  isGlobalLoader?: boolean;
};

const SplashScreen = ({isGlobalLoader = false}: SplashScreenProps) => {
  const {colors} = useContext(ThemeContext); // Use theme colors
  const navigation = useNavigation<any>();
  const fillAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fillAnim.setValue(0);

      const animation = Animated.timing(fillAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      });

      animation.start(() => {
        if (!isGlobalLoader) {
          navigation.replace('StartScreen');
        }
      });

      return () => {
        animation.stop();
      };
    }, [fillAnim, isGlobalLoader, navigation]),
  );

  const animatedFill = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const subtitleOpacity = fillAnim.interpolate({
    inputRange: [0.2, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const subtitleTranslateX = fillAnim.interpolate({
    inputRange: [0.2, 1],
    outputRange: [-20, 0],
    extrapolate: 'clamp',
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    titleContainer: {
      position: 'relative',
      overflow: 'hidden',
    },
    titleBase: {
      fontSize: 48,
      fontWeight: 'bold',
      letterSpacing: 1.5,
      color: colors.background,
      textShadowColor: colors.text,
      textShadowRadius: 2,
    },
    animatedFillView: {
      position: 'absolute',
      top: 0,
      left: 0,
      overflow: 'hidden',
      width: animatedFill,
    },
    titleFilled: {
      fontSize: 48,
      fontWeight: 'bold',
      letterSpacing: 1.5,
      color: colors.text,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: {width: 1, height: 1},
      textShadowRadius: 1,
    },
    subtitle: {
      marginTop: 12,
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
      opacity: subtitleOpacity,
      transform: [{translateX: subtitleTranslateX}],
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleBase}>CLAW</Text>
        <Animated.View style={styles.animatedFillView}>
          <Text style={styles.titleFilled}>CLAW</Text>
        </Animated.View>
      </View>
      <Animated.Text style={styles.subtitle}>Legal Automation</Animated.Text>
    </View>
  );
};

export default SplashScreen;