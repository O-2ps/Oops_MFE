import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Dimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as S from './style';
import ColorsSvg from '../../assets/icons/colors.svg';
import BG from '../../assets/icons/BG.svg';
import StrokedText from '../components/StrokedText';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Landing: undefined;
  Home: undefined;
  LastCheck: { from: string };
  MyPage: undefined;
  Skin: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

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
    navigation.navigate('LastCheck', { from: 'color' });
  };

  return (
    <S.Container>
      <S.MainContent>
        <S.Header>
          <StrokedText strokeColor="#fafafa" strokeWidth={2.5} style={styles.stepText}>
            1.
          </StrokedText>
          <StrokedText strokeColor="#fafafa" strokeWidth={2.5} style={[styles.titleText]}>
            퍼스널 컬러 분석하기
          </StrokedText>
        </S.Header>

        <S.WheelSection>
          <Animated.View style={{ transform: [{ translateY: floatAnim }, { rotate: spin }] }}>
            <ColorsSvg width={width * 0.7} height={width * 0.7} />
          </Animated.View>
        </S.WheelSection>

        <S.FooterAction onPress={handleStartAnalysis}>
          <StrokedText strokeColor="#ffffff" strokeWidth={2} style={styles.footerText}>
            [ 분석 시작하기 ]
          </StrokedText>
        </S.FooterAction>
      </S.MainContent>
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