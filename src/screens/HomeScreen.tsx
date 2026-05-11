import React from 'react';
import { Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as S from './style';
import ColorsSvg from '../../assets/icons/colors.svg';
import StrokedText from '../components/StrokedText';
import { useHomeAnimations } from '../hooks/useHomeAnimations';
import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { floatAnim, spin } = useHomeAnimations();

  const handleStartAnalysis = () => {
    navigation.navigate('LastCheck', { from: 'color' });
  };

  return (
    <S.Container>
      <S.MainContent>
        <S.Header>
          <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2.5} style={{ fontSize: 20, color: COLORS.PRIMARY, marginBottom: 25 }}>
            1.
          </StrokedText>
          <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2.5} style={{ fontSize: 24, color: COLORS.PRIMARY }}>
            퍼스널 컬러 분석하기
          </StrokedText>
        </S.Header>

        <S.WheelSection>
          <Animated.View style={{ transform: [{ translateY: floatAnim }, { rotate: spin }] }}>
            <ColorsSvg width={width * 0.7} height={width * 0.7} />
          </Animated.View>
        </S.WheelSection>

        <S.FooterAction onPress={handleStartAnalysis}>
          <StrokedText strokeColor={COLORS.WHITE} strokeWidth={2} style={{ fontSize: 20, color: COLORS.PRIMARY }}>
            [ 분석 시작하기 ]
          </StrokedText>
        </S.FooterAction>
      </S.MainContent>
    </S.Container >
  );
}