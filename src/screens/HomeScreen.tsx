import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Dimensions, View, Text, StyleSheet, StyleProp, TextStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as S from './style';
import ColorsSvg from '../../assets/icons/colors.svg';
import BG from '../../assets/icons/BG.svg';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Landing: undefined;
  Home: undefined;
  LastCheck: { from: string };
  MyPage: undefined;
  Skin: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

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

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -15,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 40000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, [floatAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleStartAnalysis = () => {
    // Navigate to LastCheck screen
    navigation.navigate('LastCheck', { from: 'color' });
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
        <S.Header>
          <StrokedText strokeColor="#ffffff" strokeWidth={2.5} style={styles.stepText}>
            1.
          </StrokedText>
          <StrokedText strokeColor="#ffffff" strokeWidth={2.5} style={[styles.titleText]}>
            퍼스널 컬러 분석하기
          </StrokedText>
        </S.Header>

        <S.WheelSection>
          <S.ArrowButton onPress={() => navigation.navigate('MyPage')}>
            <StrokedText strokeColor="#ffffff" strokeWidth={2.5} style={styles.arrowText}>
              &lt;
            </StrokedText>
          </S.ArrowButton>

          <Animated.View style={{ transform: [{ translateY: floatAnim }, { rotate: spin }] }}>
            <ColorsSvg width={width * 0.72} height={width * 0.72} />
          </Animated.View>

          <S.ArrowButton onPress={() => navigation.navigate('Skin')}>
            <StrokedText strokeColor="#ffffff" strokeWidth={2.5} style={styles.arrowText}>
              &gt;
            </StrokedText>
          </S.ArrowButton>
        </S.WheelSection>

        <S.FooterAction onPress={handleStartAnalysis}>
          <StrokedText strokeColor="#ffffff" strokeWidth={2} style={styles.footerText}>
            [ 분석 시작하기 ]
          </StrokedText>
        </S.FooterAction>
      </S.MainContent>
      <S.GreenBox />
    </S.Container >
  );
}

const styles = StyleSheet.create({
  stepText: {
    fontSize: 20,
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
    marginBottom: 25,
  },
  titleText: {
    fontSize: 24,
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
    marginBottom: 40,
  },
  arrowText: {
    fontSize: 30,
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
  },
  footerText: {
    fontSize: 20,
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
  }
});