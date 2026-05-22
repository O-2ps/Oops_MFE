import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Dimensions, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import Logo from '../../assets/icons/logo.svg';
import Star from '../../assets/icons/star.svg';
import StrokedText from '../components/StrokedText';
import { loginWithKakao } from '../api/kakaoAuth';
import { saveToken } from '../utils/tokenStorage';
import { RootStackParamList } from '../types/navigation';
import { COLORS, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

interface StarItemProps {
  top: number;
  right: number;
  size: number;
  rotate: string;
  delay: number;
  duration?: number;
}

function AnimatedStar({ top, right, size, rotate, delay, duration = 6000 }: StarItemProps) {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [floatAnim, delay, duration]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <S.StarContainer
      $top={top}
      $right={right}
      $size={size}
      $rotate={rotate}
      as={Animated.View}
      style={{ transform: [{ translateY }, { rotate }] }}
      pointerEvents="none"
    >
      <Star width={size} height={size} fill="#FFD1E3" />
    </S.StarContainer>
  );
}

export default function LandingScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleKakaoLogin = async () => {
    try {
      const result = await loginWithKakao();
      if (result) {
        const token = result.user?.token ?? result.user?.accessToken ?? result.user?.data?.token;
        if (token) {
          await saveToken(token);
        }
        navigation.navigate('Home');
      }
    } catch {
      Alert.alert('로그인 실패', '카카오 로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleGuestLogin = () => {
    navigation.navigate('Home');
  };

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>
      <S.MainContent>
        <AnimatedStar top={-height * 0.18} right={width * 0.78} size={width * 1.0} rotate="18deg" delay={0} duration={8200} />
        <AnimatedStar top={height * 0.12} right={width * 0.38} size={width * 0.55} rotate="-6deg" delay={900} duration={7600} />
        <AnimatedStar top={height * 0.32} right={width * 0.82} size={width * 0.7} rotate="10deg" delay={1800} duration={8800} />
        <AnimatedStar top={height * 0.48} right={width * 0.45} size={width * 0.6} rotate="0deg" delay={2700} duration={7900} />
        <AnimatedStar top={height * 0.64} right={width * 0.18} size={width * 0.85} rotate="-14deg" delay={3600} duration={9100} />
        <AnimatedStar top={height * 0.84} right={-width * 0.08} size={width * 1.05} rotate="14deg" delay={4500} duration={8600} />

        <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1.5} style={styles.noticeText}>
          마이페이지는 로그인 후 이용 가능합니다.
        </StrokedText>

        <S.CenterSection>
          <View style={styles.logoContainer}>
            <Logo width={width * 0.6} height={(width * 0.6) * (122 / 245)} />
          </View>
          <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2.5} style={styles.subTitleText}>
            {'내 피부를 위한\n가장 정교한 선택'}
          </StrokedText>
        </S.CenterSection>

        <S.ButtonSection>
          <S.LoginButton onPress={handleKakaoLogin}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.buttonText}>
              [ 카카오톡 로그인 ]
            </StrokedText>
          </S.LoginButton>
          <S.LoginButton onPress={handleGuestLogin}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.buttonText}>
              [ 비회원 로그인 ]
            </StrokedText>
          </S.LoginButton>
        </S.ButtonSection>
      </S.MainContent>
    </S.Container>
  );
}

const styles = StyleSheet.create({
  noticeText: {
    marginTop: 90,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
    zIndex: 10,
  },
  logoContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  subTitleText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    lineHeight: 32,
    textAlign: 'center',
    fontFamily: FONTS.PIXEL,
  },
  buttonText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
  },
});
