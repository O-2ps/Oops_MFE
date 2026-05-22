import React from 'react';
import { Animated, Dimensions, View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as S from './style';
import MaskSvg from '../../assets/icons/mask.svg';
import BG from '../../assets/icons/BG.svg';
import StrokedText from '../components/StrokedText';
import { useHomeAnimations } from '../hooks/useHomeAnimations';
import { RootStackParamList } from '../types/navigation';
import { COLORS, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Skin'>;

export default function SkinScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { floatAnim } = useHomeAnimations();

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
          <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2.5} style={styles.stepText}>
            2.
          </StrokedText>
          <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2.5} style={styles.titleText}>
            피부 타입 분석하기
          </StrokedText>
        </S.Header>

        <S.WheelSection>
          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <MaskSvg width={width * 0.7} height={width * 0.7} />
          </Animated.View>
        </S.WheelSection>

        <S.FooterAction onPress={handleStartAnalysis}>
          <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.footerText}>
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
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
    marginBottom: 25,
  },
  titleText: {
    fontSize: 24,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
  },
  footerText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
  },
});
