import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import * as S from './style';
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
    outputRange: [0, -20],
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

  const handleGuestLogin = () => {
    navigation.navigate('Home');
  };

  return (
    <S.Container>
      <BG
        width={width}
        height={height}
        style={{ position: 'absolute' }}
        preserveAspectRatio="xMidYMid slice"
      />
      
      <S.GreenBox />
      
      <S.MainContent>
        <AnimatedStar
          top={-40}
          right={-100}
          size={400}
          rotate="15deg"
          delay={0}
          duration={5000}
        />
        <AnimatedStar
          top={height * 0.3}
          right={width * 0.5}
          size={250}
          rotate="-20deg"
          delay={1500}
          duration={7000}
        />
        <AnimatedStar
          top={height * 0.6}
          right={width * 0.1}
          size={350}
          rotate="10deg"
          delay={3000}
          duration={6000}
        />
        <AnimatedStar
          top={height * 0.15}
          right={width * 0.2}
          size={150}
          rotate="45deg"
          delay={1000}
          duration={8000}
        />

        <S.Notice>마이페이지는 로그인 후 이용 가능합니다.</S.Notice>

        <S.CenterSection>
          <View style={{ marginBottom: 25, alignItems: 'center' }}>
            <Logo width={width * 0.6} height={(width * 0.6) * (122 / 245)} />
          </View>
          <S.SubTitle>
            {'내 피부를 위한\n가장 정교한 선택'}
          </S.SubTitle>
        </S.CenterSection>

        <S.ButtonSection>
          <S.LoginButton>
            <S.LoginButtonText>[ 카카오톡 로그인 ]</S.LoginButtonText>
          </S.LoginButton>
          <S.LoginButton onPress={handleGuestLogin}>
            <S.LoginButtonText>[ 비회원 로그인 ]</S.LoginButtonText>
          </S.LoginButton>
        </S.ButtonSection>
      </S.MainContent>

      <S.GreenBox />
    </S.Container>
  );
}
