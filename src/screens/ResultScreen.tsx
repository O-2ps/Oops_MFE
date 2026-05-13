import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, ScrollView, Image, Text } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import DownloadSvg from '../../assets/icons/download.svg';
import HomeSvg from '../../assets/icons/home.svg';
import RepeatSvg from '../../assets/icons/Repeat.svg';
import SpringWarmBrightSvg from '../../assets/personal/spring warm bright.svg';
import SummerCoolTrueSvg from '../../assets/personal/summer cool true.svg';
import AutumnWarmMuteSvg from '../../assets/personal/autumn warm mute.svg';
import WinterCoolTrueSvg from '../../assets/personal/winter cool true.svg';
import StrokedText from '../components/StrokedText';
import { COLORS } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { fetchSeasons, SeasonInfo } from '../api/personalColor';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;

const SKIN_PRODUCTS = [
  {
    id: 1,
    title: '[화잘먹수분선] 웰라쥬 리얼 히알루로닉 블루 선크림 50ml 1+1 기획',
    price: '29,300원',
    store: '올리브영',
    color: '#E3F2FD',
  },
  {
    id: 2,
    title: '[전문가추천/SNS대란템] 로벡틴 히알루론산 에센스 180ml 리필기획(+리필 120ml)',
    price: '18,820원',
    store: '올리브영',
    color: '#BBDEFB',
  },
  {
    id: 3,
    title: '[경품증정]바이오더마 센시비오 디펜시브 세럼 30ml 기획(+센시비오 디펜시브 40ml 증정)',
    price: '22,900원',
    store: '올리브영',
    color: '#FFEBEE',
  },
  {
    id: 4,
    title: '[워터젤리/수분에센스]닥터자르트 바이탈 하이드라 솔루션 하이드로 플럼프 트리트먼트 에센스 150ml',
    price: '15,120원',
    store: '올리브영',
    color: '#E1F5FE',
  },
  {
    id: 5,
    title: '[수분폭탄] 토리든 다이브인 저분자 히알루론산 세럼',
    price: '18,000원',
    store: '올리브영',
    color: '#E0F7FA',
  },
  {
    id: 6,
    title: '[민감진정] 아누아 어성초 77 수딩 토너',
    price: '21,000원',
    store: '올리브영',
    color: '#F1F8E9',
  },
];

const PERSONAL_PRODUCTS = [
  {
    id: 1,
    title: '[스테디셀러특가/NEW한정기획] 홀리카홀리카 마이페이브 무드 아이 팔레트',
    price: '29,300원',
    store: '올리브영',
    color: '#FFCDD2',
  },
  {
    id: 2,
    title: '[브러쉬 기획 NEW] 페리페라 올테이크 무드 팔레트',
    price: '17,300원',
    store: '올리브영',
    color: '#F8BBD0',
  },
  {
    id: 3,
    title: '어뮤즈 아이 컬러 팔레트 5colors',
    price: '21,420원',
    store: '올리브영',
    color: '#E1BEE7',
  },
  {
    id: 4,
    title: '[3월 올영픽/오트라떼] 에스쁘아 아이 코어 팔레트 10 colors',
    price: '23,500원',
    store: '올리브영',
    color: '#D1C4E9',
  },
  {
    id: 5,
    title: '[단독기획] 롬앤 베러 댄 팔레트',
    price: '21,900원',
    store: '올리브영',
    color: '#C5CAE9',
  },
  {
    id: 6,
    title: '[NEW] 클리오 프로 아이 패널',
    price: '25,900원',
    store: '올리브영',
    color: '#BBDEFB',
  },
  {
    id: 7,
    title: '웨이크메이크 소프트 블러링 아이 팔레트',
    price: '24,000원',
    store: '올리브영',
    color: '#B3E5FC',
  },
  {
    id: 8,
    title: '[한정수량] 데이지크 섀도우 팔레트',
    price: '27,000원',
    store: '올리브영',
    color: '#B2EBF2',
  },
];

export default function ResultScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const { type, analysisData } = route.params || { type: 'spring', analysisData: null };
  const [showProducts, setShowProducts] = useState(false);
  const [seasonInfo, setSeasonInfo] = useState<SeasonInfo | null>(null);

  useEffect(() => {
    if (type !== 'skin') {
      fetchSeasons()
        .then(seasons => {
          const found = seasons.find(s => s.season === type);
          if (found) setSeasonInfo(found);
        })
        .catch(err => {
          console.error('ResultScreen fetchSeasons error:', err);
        });
    }
  }, [type]);

  const isSkin = type === 'skin';
  const currentProducts = isSkin ? SKIN_PRODUCTS : PERSONAL_PRODUCTS;

  const analysisTitle = isSkin ? '건성 피부' : (seasonInfo?.description?.split(' (')[0] || '봄 웜 라이트');
  const highlightColor = isSkin ? '#81D4FA' : '#FF8A65';

  const buttonText = isSkin ? '[ 어울리는 피부 화장품 추천 ]' : '[ 어울리는 화장품 보러가기 ]';
  const recommendMessage = isSkin ? '피부 화장품 추천' : '제품을 추천합니다.';

  const warmScore = analysisData?.matchScore?.warm || 64;
  const springScore = analysisData?.matchScore?.spring || 71;
  const lightScore = analysisData?.matchScore?.light || 88;

  const handleBack = () => {
    if (showProducts) {
      setShowProducts(false);
    } else {
      navigation.navigate('Home');
    }
  };

  const handleHome = () => {
    navigation.navigate('Home');
  };

  const handleShowProducts = () => {
    setShowProducts(true);
  };

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>

      {showProducts ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
          <View style={styles.productHeader}>
            <TouchableOpacity onPress={handleHome}>
              <HomeSvg width={28} height={28} fill="#333333" />
            </TouchableOpacity>
            <TouchableOpacity>
              <RepeatSvg width={28} height={28} fill="#333333" />
            </TouchableOpacity>
          </View>

          <View style={styles.recommendationTitleContainer}>
            <View style={styles.recommendTitleRow}>
              <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.recommendTitleBracket}>[ </StrokedText>
              <StrokedText strokeColor="#ffffff" strokeWidth={1} style={[styles.recommendTitleHighlight, { color: highlightColor }]}>{analysisTitle}</StrokedText>
              <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.recommendTitleBracket}> ] </StrokedText>
              <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.recommendTitleMain}>에 어울리는</StrokedText>
            </View>
            <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.recommendTitleMain}>{recommendMessage}</StrokedText>
          </View>

          <View style={styles.productGrid}>
            {currentProducts.map((item) => (
              <View key={item.id} style={styles.productCard}>
                <View style={[styles.productImageContainer, { backgroundColor: item.color }]} />
                <StrokedText strokeColor="#ffffff" strokeWidth={0.5} style={styles.productTitle} numberOfLines={3}>
                  {item.title}
                </StrokedText>
                <View style={styles.tagRow}>
                  <View style={styles.priceTag}>
                    <StrokedText strokeColor="#ffffff" strokeWidth={0.5} style={styles.tagText}>{item.price}</StrokedText>
                  </View>
                  <View style={styles.storeTag}>
                    <StrokedText strokeColor="#ffffff" strokeWidth={0.5} style={styles.tagText}>{item.store}</StrokedText>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 10 }}>
            {isSkin && (
              <View style={styles.skinHeader}>
                <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.saveInfoText}>
                  * 결과는 마이페이지에 저장됩니다.
                </StrokedText>
              </View>
            )}

            <View style={styles.topAction}>
              <TouchableOpacity style={{ padding: 5 }}>
                <DownloadSvg width={18} height={18} fill="#666666" />
              </TouchableOpacity>
            </View>

            {!isSkin && (
              <S.ResultImageContainer style={styles.imageContainer}>
                {type === 'summer' ? <SummerCoolTrueSvg width="100%" height="100%" /> :
                  type === 'autumn' ? <AutumnWarmMuteSvg width="100%" height="100%" /> :
                    type === 'winter' ? <WinterCoolTrueSvg width="100%" height="100%" /> :
                      <SpringWarmBrightSvg width="100%" height="100%" />}
              </S.ResultImageContainer>
            )}

            <View style={{ marginTop: isSkin ? 60 : 20, marginBottom: 20 }}>
              <StrokedText strokeColor="#ffffff" strokeWidth={5} style={[styles.title, isSkin && { color: '#333333' }]}>
                {isSkin ? '[ 건성 피부 ]' : `[ ${seasonInfo?.description?.split(' (')[0] || '봄 웜 라이트'} ]`}
              </StrokedText>
            </View>

            <View style={{ marginBottom: isSkin ? 40 : 20 }}>
              {isSkin ? (
                <View style={{ alignItems: 'center' }}>
                  <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.description}>
                    당신의 피부 나이는
                  </StrokedText>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5 }}>
                    <StrokedText strokeColor="#ffffff" strokeWidth={2} style={styles.skinAgeText}>
                      [ 27살 ]
                    </StrokedText>
                    <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.description}>
                      {' '}입니다.
                    </StrokedText>
                  </View>
                </View>
              ) : (
                <View style={{ alignItems: 'center', paddingHorizontal: 20 }}>
                  <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.description}>
                    {seasonInfo?.characteristics?.join(' · ') || '밝고 선명한 따뜻한 색조'}
                  </StrokedText>
                </View>
              )}
            </View>

            {!isSkin && (
              <S.StatContainer style={{ marginTop: 10, paddingHorizontal: 40 }}>
                <S.StatItem>
                  <StrokedText strokeColor="#ffffff" strokeWidth={3.5} style={styles.statValue}>
                    {analysisData?.analysis?.isWarm ? '78%' : '22%'}
                  </StrokedText>
                  <StrokedText strokeColor="#ffffff" strokeWidth={1.5} style={styles.statLabel}>
                    {analysisData?.analysis?.isWarm ? '웜톤' : '쿨톤'}
                  </StrokedText>
                </S.StatItem>
                <View style={styles.statDivider} />
                <S.StatItem>
                  <StrokedText strokeColor="#ffffff" strokeWidth={3.5} style={styles.statValue}>
                    {analysisData?.analysis?.isBright ? '82%' : '18%'}
                  </StrokedText>
                  <StrokedText strokeColor="#ffffff" strokeWidth={1.5} style={styles.statLabel}>
                    {analysisData?.analysis?.isBright ? '라이트' : '뮤트'}
                  </StrokedText>
                </S.StatItem>
                <View style={styles.statDivider} />
                <S.StatItem>
                  <StrokedText strokeColor="#ffffff" strokeWidth={3.5} style={styles.statValue}>91%</StrokedText>
                  <StrokedText strokeColor="#ffffff" strokeWidth={1.5} style={styles.statLabel}>일치도</StrokedText>
                </S.StatItem>
              </S.StatContainer>
            )}

            <S.ComparisonContainer style={{ marginTop: isSkin ? 0 : 30 }}>
              {isSkin ? (
                <>
                  {[
                    { label: '모공', left: '많다', right: '적다', flex: 0.7, color: '#90FDFF' },
                    { label: '수분', left: '많다', right: '적다', flex: 0.9, color: '#90FDFF' },
                    { label: '유분', left: '많다', right: '적다', flex: 0.8, color: '#90FDFF' },
                    { label: '트러블', left: '많다', right: '적다', flex: 0.4, color: '#90FDFF' }
                  ].map((item, idx) => (
                    <View key={idx} style={{ marginBottom: 12, width: width - 40, alignItems: 'flex-start' }}>
                      <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.indicatorLabel}>{item.label}</StrokedText>
                      <S.ComparisonRow style={{ marginTop: 2 }}>
                        <StrokedText strokeColor="#ffffff" strokeWidth={0.5} style={styles.barSideLabel}>{item.left}</StrokedText>
                        <S.BarContainer style={styles.barContainerWithBorder}>
                          <LinearGradient
                            colors={['#FFD54F', item.color]}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                            style={{ flex: item.flex, height: '100%' }}
                          />
                          <View style={{ width: 10, height: '100%', backgroundColor: '#ffffff' }} />
                          <View style={{ flex: 1 - item.flex, height: '100%', backgroundColor: '#E0E0E0' }} />
                        </S.BarContainer>
                        <StrokedText strokeColor="#ffffff" strokeWidth={0.5} style={styles.barSideLabel}>{item.right}</StrokedText>
                      </S.ComparisonRow>
                    </View>
                  ))}
                </>
              ) : (
                <>
                  <S.ComparisonRow style={{ marginBottom: 12 }}>
                    <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.barSideLabel}>웜</StrokedText>
                    <S.BarContainer style={styles.barContainerWithBorder}>
                      <LinearGradient
                        colors={['#FFD54F', '#FFB74D']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{ flex: 0.64, height: '100%' }}
                      />
                      <View style={{ width: 10, height: '100%', backgroundColor: '#ffffff' }} />
                      <View style={{ flex: 0.36, height: '100%', backgroundColor: '#E0E0E0' }} />
                    </S.BarContainer>
                    <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.barSideLabel}>쿨</StrokedText>
                  </S.ComparisonRow>
                  <S.ComparisonRow style={{ marginBottom: 12 }}>
                    <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.barSideLabel}>봄</StrokedText>
                    <S.BarContainer style={styles.barContainerWithBorder}>
                      <LinearGradient
                        colors={['#FFB74D', '#F57C00']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{ flex: 0.71, height: '100%' }}
                      />
                      <View style={{ width: 10, height: '100%', backgroundColor: '#ffffff' }} />
                      <View style={{ flex: 0.29, height: '100%', backgroundColor: '#E0E0E0' }} />
                    </S.BarContainer>
                    <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.barSideLabel}>가을</StrokedText>
                  </S.ComparisonRow>
                  <S.ComparisonRow>
                    <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.barSideLabel}>라이트</StrokedText>
                    <S.BarContainer style={styles.barContainerWithBorder}>
                      <LinearGradient
                        colors={['#FFF176', '#FFD54F']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={{ flex: 0.88, height: '100%' }}
                      />
                      <View style={{ width: 10, height: '100%', backgroundColor: '#ffffff' }} />
                      <View style={{ flex: 0.12, height: '100%', backgroundColor: '#E0E0E0' }} />
                    </S.BarContainer>
                    <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.barSideLabel}>딥</StrokedText>
                  </S.ComparisonRow>
                </>
              )}
            </S.ComparisonContainer>

            <View style={{ marginTop: isSkin ? 20 : 30, alignItems: 'center', width: '100%', paddingBottom: 40, zIndex: 9999 }}>
              <TouchableOpacity
                onPress={() => {
                  console.log('--- SHOW PRODUCTS CLICKED ---');
                  handleShowProducts();
                }}
                style={{ marginBottom: 15, width: '90%', alignItems: 'center', zIndex: 10000 }}
                activeOpacity={0.6}
                hitSlop={{ top: 20, bottom: 20, left: 30, right: 30 }}
              >
                <View pointerEvents="none" style={{ alignItems: 'center', width: '100%' }}>
                  <S.FooterAction>
                    <StrokedText strokeColor="#ffffff" strokeWidth={5} style={styles.footerText}>
                      {buttonText}
                    </StrokedText>
                  </S.FooterAction>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleBack}
                hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}
                style={{ zIndex: 10000 }}
              >
                <S.BackButtonText style={styles.backButtonText}>뒤로가기</S.BackButtonText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      )}
    </S.Container>
  );
}

const styles = StyleSheet.create({
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 30,
    marginBottom: 20,
  },
  recommendationTitleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  recommendTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendTitleMain: {
    fontSize: 22,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
  },
  recommendTitleHighlight: {
    fontSize: 24,
    color: '#FF8A65',
    fontFamily: 'DOSIyagiBoldface',
  },
  recommendTitleBracket: {
    fontSize: 24,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 55) / 2,
    marginBottom: 25,
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#3F44FF',
    overflow: 'hidden',
    marginBottom: 10,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productTitle: {
    fontSize: 14,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
    lineHeight: 18,
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  priceTag: {
    backgroundColor: '#D9D3B4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  storeTag: {
    backgroundColor: '#D9D3B4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
  },
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
    fontSize: 34,
    color: '#000000',
    fontFamily: 'DOSIyagiBoldface',
  },
  statLabel: {
    fontSize: 19,
    color: '#A0A0A0',
    fontFamily: 'DOSIyagiBoldface',
    marginTop: 14,
  },
  barSideLabel: {
    fontSize: 11,
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
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'DOSIyagiBoldface',
    opacity: 0.9,
  },
  barGap: {
    width: 4,
    height: '100%',
    backgroundColor: '#ffffff',
  },
  skinHeader: {
    position: 'absolute',
    top: 20,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  saveInfoText: {
    fontSize: 12,
    color: COLORS.PRIMARY,
    fontFamily: 'DOSIyagiBoldface',
    opacity: 0.8,
  },
  skinAgeText: {
    fontSize: 22,
    color: COLORS.PRIMARY,
    fontFamily: 'DOSIyagiBoldface',
  },
  indicatorLabel: {
    fontSize: 13,
    color: '#666666',
    fontFamily: 'DOSIyagiBoldface',
    marginLeft: 10,
  }
});
