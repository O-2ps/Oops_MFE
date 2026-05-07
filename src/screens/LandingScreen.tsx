import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import BG from '../../assets/icons/BG.svg';
import Logo from '../../assets/icons/logo.svg';
import Star from '../../assets/icons/star.svg';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Landing: undefined;
  Home: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

interface StarItemProps {
  top: number;
  right: number;
  size: number;
  rotate: string;
  delay: number;
}

function AnimatedStar({ top, right, size, rotate, delay }: StarItemProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [floatAnim, delay]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  return (
    <Animated.View
      style={[
        styles.starWrapper,
        {
          top,
          right,
          width: size,
          height: size,
          transform: [{ translateY }, { rotate }],
        },
      ]}
    >
      <Star width={size} height={size} />
    </Animated.View>
  );
}

export default function LandingScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleGuestLogin = () => {
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {/* BG SVG as full-screen background */}
      <BG
        width={width}
        height={height}
        style={StyleSheet.absoluteFill}
        preserveAspectRatio="xMidYMid slice"
      />

      {/* Notice */}
      <View style={styles.noticeContainer}>
        <Text style={styles.noticeText}>마이페이지는 로그인 후 이용 가능합니다.</Text>
      </View>

      {/* Floating Stars */}
      <AnimatedStar top={-60} right={-10} size={120} rotate="24deg" delay={0} />
      <AnimatedStar top={200} right={12} size={65} rotate="0deg" delay={500} />
      <AnimatedStar top={390} right={60} size={130} rotate="-10deg" delay={1000} />

      {/* Center: Logo + Subtitle */}
      <View style={styles.centerSection}>
        <Logo width={160} height={60} />
        <Text style={styles.subtitle}>
          내 피부를 위한{'\n'}가장 정교한 선택
        </Text>
      </View>

      {/* Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginButtonText}>[ 카카오톡 로그인 ]</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.loginButton} onPress={handleGuestLogin}>
          <Text style={styles.loginButtonText}>[ 비회원 로그인 ]</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  noticeContainer: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  noticeText: {
    fontSize: 11,
    color: '#999',
    letterSpacing: 0.2,
  },
  starWrapper: {
    position: 'absolute',
    zIndex: 5,
  },
  centerSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 36,
    paddingTop: 40,
    gap: 16,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    lineHeight: 32,
    letterSpacing: -0.5,
    marginTop: 12,
  },
  buttonSection: {
    paddingHorizontal: 32,
    paddingBottom: 56,
    gap: 12,
  },
  loginButton: {
    borderWidth: 1.5,
    borderColor: '#333',
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  loginButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    letterSpacing: 1,
  },
});
