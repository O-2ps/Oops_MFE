import React from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import DownloadSvg from '../../assets/icons/download.svg';
import SpringWarmBrightSvg from '../../assets/personal/spring warm bright.svg';
import StrokedText from '../components/StrokedText';
import { COLORS } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;

export default function ResultScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>
      
      
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 30 }}>
        <View style={styles.topAction}>
          <TouchableOpacity style={{ padding: 5 }}>
            <DownloadSvg width={18} height={18} fill="#666666" />
          </TouchableOpacity>
        </View>

        <S.ResultImageContainer style={styles.imageContainer}>
          <SpringWarmBrightSvg width="100%" height="100%" />
        </S.ResultImageContainer>

        <View style={{ marginTop: 25, marginBottom: 10 }}>
          <StrokedText strokeColor="#ffffff" strokeWidth={5} style={styles.title}>
            [ 봄 웜 라이트 ]
          </StrokedText>
        </View>

        <View style={{ marginBottom: 25 }}>
          <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.description}>
            고명도, 저채도의 밝고 따뜻한 파스텔톤이{"\n"}가장 잘 어울리는 유형입니다.
          </StrokedText>
        </View>

        <S.StatContainer style={{ marginTop: 10, paddingHorizontal: 40 }}>
          <S.StatItem>
            <StrokedText strokeColor="#ffffff" strokeWidth={3} style={styles.statValue}>64%</StrokedText>
            <StrokedText strokeColor="#ffffff" strokeWidth={1.5} style={styles.statLabel}>웜톤</StrokedText>
          </S.StatItem>
          <View style={styles.statDivider} />
          <S.StatItem>
            <StrokedText strokeColor="#ffffff" strokeWidth={3} style={styles.statValue}>71%</StrokedText>
            <StrokedText strokeColor="#ffffff" strokeWidth={1.5} style={styles.statLabel}>봄</StrokedText>
          </S.StatItem>
          <View style={styles.statDivider} />
          <S.StatItem>
            <StrokedText strokeColor="#ffffff" strokeWidth={3} style={styles.statValue}>88%</StrokedText>
            <StrokedText strokeColor="#ffffff" strokeWidth={1.5} style={styles.statLabel}>라이트</StrokedText>
          </S.StatItem>
        </S.StatContainer>

        <S.ComparisonContainer style={{ marginTop: 30 }}>
          <S.ComparisonRow style={{ marginBottom: 10 }}>
            <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.barSideLabel}>웜</StrokedText>
            <S.BarContainer style={styles.barContainerWithBorder}>
              <S.BarFill $color="#FFD700" $flex={0.64} />
              <View style={{ width: 4, backgroundColor: '#ffffff' }} />
              <S.BarFill $color="#C1FFF0" $flex={0.36} />
            </S.BarContainer>
            <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.barSideLabel}>쿨</StrokedText>
          </S.ComparisonRow>

          <S.ComparisonRow style={{ marginBottom: 10 }}>
            <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.barSideLabel}>봄</StrokedText>
            <S.BarContainer style={styles.barContainerWithBorder}>
              <S.BarFill $color="#FF9800" $flex={0.71} />
              <View style={{ width: 4, backgroundColor: '#ffffff' }} />
              <S.BarFill $color="#A1887F" $flex={0.29} />
            </S.BarContainer>
            <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.barSideLabel}>가을</StrokedText>
          </S.ComparisonRow>

          <S.ComparisonRow>
            <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.barSideLabel}>라이트</StrokedText>
            <S.BarContainer style={styles.barContainerWithBorder}>
              <View style={{ width: 10, height: '100%', backgroundColor: '#FFD54F', borderRadius: 2 }} />
              <View style={{ width: 4, backgroundColor: '#ffffff' }} />
              <S.BarFill $color="#FFD54F" $flex={0.78} />
              <View style={{ width: 4, backgroundColor: '#ffffff' }} />
              <S.BarFill $color="#FF4081" $flex={0.12} />
            </S.BarContainer>
            <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.barSideLabel}>딥</StrokedText>
          </S.ComparisonRow>
        </S.ComparisonContainer>

        <View style={{ marginTop: 40, alignItems: 'center' }}>
          <S.FooterAction style={{ marginBottom: 15 }}>
            <StrokedText strokeColor="#ffffff" strokeWidth={5} style={styles.footerText}>
              [ 어울리는 화장품 보러가기 ]
            </StrokedText>
          </S.FooterAction>

          <TouchableOpacity onPress={handleBack}>
            <S.BackButtonText style={styles.backButtonText}>뒤로가기</S.BackButtonText>
          </TouchableOpacity>
        </View>
      </View>

    </S.Container>
  );
}

const styles = StyleSheet.create({
  topAction: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  imageContainer: {
    marginTop: 0,
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#ffffff',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    width: width * 0.65,
    height: width * 0.45,
  },
  title: {
    fontSize: 26,
    color: COLORS.PRIMARY,
    fontFamily: 'DOSIyagiBoldface',
  },
  description: {
    fontSize: 15,
    color: '#A0A0A0',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'DOSIyagiBoldface',
  },
  statValue: {
    fontSize: 28,
    color: '#000000',
    fontFamily: 'DOSIyagiBoldface',
  },
  statLabel: {
    fontSize: 17,
    color: '#A0A0A0',
    fontFamily: 'DOSIyagiBoldface',
    marginTop: 10,
  },
  barSideLabel: {
    fontSize: 12,
    color: '#A0A0A0',
    fontFamily: 'DOSIyagiBoldface',
    width: 45,
    textAlign: 'center',
  },
  barContainerWithBorder: {
    borderWidth: 3,
    borderColor: '#ffffff',
    padding: 1,
    height: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 10,
  },
  statDivider: {
    width: 1.5,
    height: '40%',
    backgroundColor: '#EEEEEE',
    alignSelf: 'center',
    marginHorizontal: 10,
  },
  footerText: {
    fontSize: 22,
    color: COLORS.PRIMARY,
    fontFamily: 'DOSIyagiBoldface',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'DOSIyagiBoldface',
    opacity: 0.9,
  }
});
