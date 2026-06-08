import React from 'react';
import { Alert, Dimensions, View, StyleSheet } from 'react-native';
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
}

function StaticStar({ top, right, size, rotate }: StarItemProps) {
  return (
    <S.StarContainer
      $top={top}
      $right={right}
      $size={size}
      $rotate={rotate}
      style={{ transform: [{ rotate }] }}
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
        navigation.navigate('MainCarousel');
      }
    } catch (err: any) {
      console.error('[KakaoLogin] 오류:', err?.code, err?.message, err);
      Alert.alert('로그인 실패', `카카오 로그인 중 오류가 발생했습니다.\n(${err?.code ?? err?.message ?? '알 수 없는 오류'})`);
    }
  };

  const handleGuestLogin = () => {
    navigation.navigate('MainCarousel');
  };

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>
      <S.MainContent>
        <StaticStar top={-height * 0.18} right={width * 0.78} size={width * 1.0} rotate="18deg" />
        <StaticStar top={height * 0.12} right={width * 0.38} size={width * 0.55} rotate="-6deg" />
        <StaticStar top={height * 0.32} right={width * 0.82} size={width * 0.7} rotate="10deg" />
        <StaticStar top={height * 0.48} right={width * 0.45} size={width * 0.6} rotate="0deg" />
        <StaticStar top={height * 0.64} right={width * 0.18} size={width * 0.85} rotate="-14deg" />
        <StaticStar top={height * 0.84} right={-width * 0.08} size={width * 1.05} rotate="14deg" />

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

        <S.ButtonSection style={{ paddingBottom: 40 }}>
          <S.LoginButton onPress={handleKakaoLogin}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.buttonText} numberOfLines={1}>
              [ 카카오톡 로그인 ]
            </StrokedText>
          </S.LoginButton>
          <S.LoginButton onPress={handleGuestLogin}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.buttonText} numberOfLines={1}>
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
    paddingHorizontal: 20,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
    zIndex: 10,
    marginTop: 20,
    marginBottom: 10,
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
