import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, View, Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
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

interface StrokedTextProps {
  children: React.ReactNode;
  strokeColor: string;
  strokeWidth: number;
  style?: StyleProp<TextStyle>;
}

function StrokedText({ children, strokeColor, strokeWidth, style }: StrokedTextProps) {
  const createShadow = (dx: number, dy: number): TextStyle => ({
    position: 'absolute',
    top: dy,
    left: dx,
    color: strokeColor,
    textShadowColor: strokeColor,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  });

  return (
    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Text style={[style, createShadow(strokeWidth, 0)]}>{children}</Text>
      <Text style={[style, createShadow(-strokeWidth, 0)]}>{children}</Text>
      <Text style={[style, createShadow(0, strokeWidth)]}>{children}</Text>
      <Text style={[style, createShadow(0, -strokeWidth)]}>{children}</Text>
      <Text style={[style, createShadow(strokeWidth, strokeWidth)]}>{children}</Text>
      <Text style={[style, createShadow(-strokeWidth, -strokeWidth)]}>{children}</Text>
      <Text style={[style, createShadow(strokeWidth, -strokeWidth)]}>{children}</Text>
      <Text style={[style, createShadow(-strokeWidth, strokeWidth)]}>{children}</Text>
      <Text style={style}>{children}</Text>
    </View>
  );
}

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

  const handleGuestLogin = () => {
    navigation.navigate('Home');
  };

  return (
    <S.Container>
      <S.MainContent>
        <AnimatedStar
          top={-height * 0.15}
          right={-width * 0.1}
          size={width * 1.2}
          rotate="24deg"
          delay={0}
          duration={8000}
        />
        <AnimatedStar
          top={height * 0.25}
          right={width * 0.1}
          size={width * 0.6}
          rotate="0deg"
          delay={1000}
          duration={7000}
        />
        <AnimatedStar
          top={height * 0.55}
          right={width * 0.4}
          size={width * 1.1}
          rotate="-10deg"
          delay={2000}
          duration={9000}
        />

        <StrokedText strokeColor="#ffffff" strokeWidth={1.5} style={styles.noticeText}>
          마이페이지는 로그인 후 이용 가능합니다.
        </StrokedText>

        <S.CenterSection>
          <View style={{ marginBottom: 25, alignItems: 'center' }}>
            <Logo width={width * 0.6} height={(width * 0.6) * (122 / 245)} />
          </View>

          <StrokedText strokeColor="#ffffff" strokeWidth={2.5} style={styles.subTitleText}>
            {'내 피부를 위한\n가장 정교한 선택'}
          </StrokedText>
        </S.CenterSection>

        <S.ButtonSection>
          <S.LoginButton>
            <StrokedText strokeColor="#ffffff" strokeWidth={2} style={styles.buttonText}>
              [ 카카오톡 로그인 ]
            </StrokedText>
          </S.LoginButton>
          <S.LoginButton onPress={handleGuestLogin}>
            <StrokedText strokeColor="#ffffff" strokeWidth={2} style={styles.buttonText}>
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
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
    zIndex: 10,
  },
  subTitleText: {
    fontSize: 20,
    color: '#FF8CB6',
    lineHeight: 32,
    textAlign: 'center',
    fontFamily: 'DOSIyagiBoldface',
  },
  buttonText: {
    fontSize: 20,
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
  }
});
