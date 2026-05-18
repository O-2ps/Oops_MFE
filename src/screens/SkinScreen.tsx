import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Dimensions, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as S from './style';
import MaskSvg from '../../assets/icons/mask.svg';
import BG from '../../assets/icons/BG.svg';
import StrokedText from '../components/StrokedText';

const { width, height } = Dimensions.get('window');

import { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Skin'>;

export default function SkinScreen() {
  const navigation = useNavigation<NavigationProp>();
  const floatAnim = useRef(new Animated.Value(0)).current;

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
  }, [floatAnim]);

  const handleStartAnalysis = () => {
    navigation.navigate('LastCheck', { from: 'skin' });
  };

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>
      <S.MainContent>
        <S.Header>
          <StrokedText strokeColor="#fafafa" strokeWidth={2.5} style={styles.stepText}>
            2.
          </StrokedText>
          <StrokedText strokeColor="#fafafa" strokeWidth={2.5} style={styles.titleText}>
            피부 타입 분석하기
          </StrokedText>
        </S.Header>

        <S.WheelSection>
          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <MaskSvg width={width * 0.7} height={width * 0.7} />
          </Animated.View>
        </S.WheelSection>

        <S.FooterAction onPress={handleStartAnalysis}>
          <StrokedText strokeColor="#fafafa" strokeWidth={2} style={styles.footerText}>
            [ 분석 시작하기 ]
          </StrokedText>
        </S.FooterAction>
      </S.MainContent>
    </S.Container>
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
