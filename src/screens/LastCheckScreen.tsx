import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import LightSvg from '../../assets/icons/light.svg';
import StrokedText from '../components/StrokedText';
import { COLORS } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'LastCheck'>;

export default function LastCheckScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'LastCheck'>>();
  const { from } = route.params || { from: 'unknown' };

  const handleStart = () => {
    if (from === 'skin') {
      navigation.navigate('Survey');
    } else {
      navigation.navigate('Result', { type: 'spring' });
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>

      <S.MainContent>
        <View style={{ marginBottom: 35 }}>
          <LightSvg width={85} height={85} />
        </View>

        <View style={{ marginBottom: 35 }}>
          <StrokedText strokeColor="#ffffff" strokeWidth={2.5} style={styles.title}>
            검사 전 확인해주세요.
          </StrokedText>
        </View>

        <S.InstructionContainer>
          <StrokedText strokeColor="#ffffff" strokeWidth={1.5} style={styles.instructionItem}>
            조명이 너무 어둡거나 밝으면 안됩니다.
          </StrokedText>
          <StrokedText strokeColor="#ffffff" strokeWidth={1.5} style={styles.instructionItem}>
            메이크업을 하지 않아야합니다.
          </StrokedText>
          <StrokedText strokeColor="#ffffff" strokeWidth={1.5} style={styles.instructionItem}>
            필터가 없는 기본 카메라여야 합니다.
          </StrokedText>
        </S.InstructionContainer>

        <View style={{ marginTop: 70, alignItems: 'center' }}>
          <S.FooterAction onPress={handleStart}>
            <StrokedText strokeColor="#ffffff" strokeWidth={2} style={styles.footerText}>
              [ 분석 시작하기 ]
            </StrokedText>
          </S.FooterAction>

          <S.BackButton onPress={handleBack}>
            <S.BackButtonText style={{ color: '#ffffff', opacity: 0.8 }}>뒤로가기</S.BackButtonText>
          </S.BackButton>
        </View>
      </S.MainContent>
    </S.Container>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
  },
  instructionItem: {
    fontSize: 16,
    color: '#A0A0A0',
    fontFamily: 'DOSIyagiBoldface',
    textAlign: 'center',
  },
  footerText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontFamily: 'DOSIyagiBoldface',
  }
});
