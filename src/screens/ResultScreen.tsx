import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, ScrollView, Image, Linking, ActivityIndicator } from 'react-native';
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
import { CrawledProduct, getProductPool, sampleProducts, SEASON_COLOR_PALETTE } from '../utils/productRecommend';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Result'>;

export default function ResultScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, 'Result'>>();
  const { type, subType, analysisData } = route.params || { type: 'spring', subType: undefined, analysisData: null };
  const [showProducts, setShowProducts] = useState(false);
  const [seasonInfo, setSeasonInfo] = useState<SeasonInfo | null>(null);
  const [displayedProducts, setDisplayedProducts] = useState<CrawledProduct[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 시즌에 맞는 상품 풀 (최초 1회 계산)
  const productPool = getProductPool(type);

  const refreshProducts = useCallback(() => {
    setIsRefreshing(true);
    // 짧은 딜레이로 새로고침 피드백 제공
    setTimeout(() => {
      setDisplayedProducts(sampleProducts(productPool, 4));
      setIsRefreshing(false);
    }, 300);
  }, [productPool]);

  useEffect(() => {
    if (type !== 'skin') {
      fetchSeasons()
        .then(seasons => {
          const found = seasons.find(s => s.season === type && (!subType || s.subType === subType))
            ?? seasons.find(s => s.season === type);
          if (found) setSeasonInfo(found);
        })
        .catch(err => console.error('ResultScreen fetchSeasons error:', err));
    }
  }, [type, subType]);

  const isSkin = type === 'skin';

  // 백엔드 응답: { success, data: { skinType, skinTypeLabel, skinAge, characteristics, ... } }
  const skinData = isSkin ? (analysisData?.data ?? analysisData) : null;
  const skinTypeLabel: string  = skinData?.skinTypeLabel ?? '건성 피부';
  const skinTypeKey: string    = skinData?.skinType      ?? 'dry';
  const skinAge: number | null = skinData?.skinAge       ?? null;
  const skinChars: string[]    = skinData?.characteristics ?? [];

  const SKIN_BARS_DEFAULT: Record<string, { label: string; flex: number }[]> = {
    dry:         [{ label: '모공', flex: 0.8 }, { label: '수분', flex: 0.8 }, { label: '유분', flex: 0.8 }, { label: '트러블', flex: 0.7 }],
    oily:        [{ label: '모공', flex: 0.2 }, { label: '수분', flex: 0.3 }, { label: '유분', flex: 0.1 }, { label: '트러블', flex: 0.3 }],
    combination: [{ label: '모공', flex: 0.4 }, { label: '수분', flex: 0.6 }, { label: '유분', flex: 0.4 }, { label: '트러블', flex: 0.5 }],
    normal:      [{ label: '모공', flex: 0.6 }, { label: '수분', flex: 0.4 }, { label: '유분', flex: 0.5 }, { label: '트러블', flex: 0.8 }],
  };
  const defaultBars = SKIN_BARS_DEFAULT[skinTypeKey] ?? SKIN_BARS_DEFAULT.dry;
  
  const surveyAnswers = analysisData?.surveyAnswers;

  const mapAnswerToFlex = (val: string | undefined, invert: boolean, defaultFlex: number) => {
    if (!val) return defaultFlex;
    let score = 0.5;
    if (val === 'strongly_agree') score = 0.15;
    else if (val === 'agree') score = 0.35;
    else if (val === 'neutral') score = 0.5;
    else if (val === 'disagree') score = 0.65;
    else if (val === 'strongly_disagree') score = 0.85;
    
    return invert ? (1 - score) : score;
  };

  const skinBars = surveyAnswers ? [
    { label: '모공', flex: mapAnswerToFlex(surveyAnswers.tzone, false, defaultBars[0].flex) },
    { label: '수분', flex: mapAnswerToFlex(surveyAnswers.dryness, true, defaultBars[1].flex) },
    { label: '유분', flex: mapAnswerToFlex(surveyAnswers.oiliness, false, defaultBars[2].flex) },
    { label: '트러블', flex: mapAnswerToFlex(surveyAnswers.acne, false, defaultBars[3].flex) }
  ] : defaultBars;

  const SKIN_ICONS: Record<string, string[]> = {
    dry:         ['💧', '🌾', '🔴', '🌙'],
    oily:        ['💦', '🔵', '⚫', '🧴'],
    combination: ['⚖️', '🔀', '💧', '🌡️'],
    normal:      ['✅', '🌿', '🛡️', '☀️'],
  };
  const skinIcons = SKIN_ICONS[skinTypeKey] ?? SKIN_ICONS.dry;

  const analysisTitle = isSkin ? skinTypeLabel : (seasonInfo?.description?.split(' (')[0] || '봄 웜 라이트');
  const highlightColor = isSkin ? '#81D4FA' : '#FF8A65';
  const buttonText = isSkin ? '[ 어울리는 피부 화장품 추천 ]' : '[ 어울리는 화장품 보러가기 ]';

  const handleBack = () => {
    if (showProducts) {
      setShowProducts(false);
    } else {
      navigation.navigate('Home');
    }
  };

  const handleHome = () => navigation.navigate('Home');

  const handleShowProducts = () => {
    setDisplayedProducts(sampleProducts(productPool, 4));
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
            <TouchableOpacity onPress={refreshProducts} disabled={isRefreshing}>
              {isRefreshing
                ? <ActivityIndicator size="small" color="#333333" style={{ width: 28, height: 28 }} />
                : <RepeatSvg width={28} height={28} fill="#333333" />
              }
            </TouchableOpacity>
          </View>

          <View style={styles.recommendationTitleContainer}>
            <View style={styles.recommendTitleRow}>
              <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.recommendTitleBracket}>[ </StrokedText>
              <StrokedText strokeColor="#ffffff" strokeWidth={1} style={[styles.recommendTitleHighlight, { color: highlightColor }]}>{analysisTitle}</StrokedText>
              <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.recommendTitleBracket}> ] </StrokedText>
              <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.recommendTitleMain}>에 어울리는</StrokedText>
            </View>
            <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.recommendTitleMain}>제품을 추천합니다.</StrokedText>
          </View>

          {/* 피부 타입 특징 */}
          {isSkin && (
            <View style={styles.skinInfoSection}>
              <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.skinInfoTitle}>
                {skinTypeLabel} 특징
              </StrokedText>
              {skinChars.map((text, idx) => (
                <View key={idx} style={styles.skinInfoRow}>
                  <StrokedText strokeColor="#ffffff" strokeWidth={0} style={styles.skinInfoIcon}>
                    {skinIcons[idx] ?? '✨'}
                  </StrokedText>
                  <StrokedText strokeColor="#ffffff" strokeWidth={0.5} style={styles.skinInfoText}>
                    {text}
                  </StrokedText>
                </View>
              ))}
            </View>
          )}

          {/* 시즌별 컬러 팔레트 */}
          {!isSkin && SEASON_COLOR_PALETTE[type]?.length > 0 && (
            <View style={styles.paletteSection}>
              <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.paletteSectionTitle}>
                추천 컬러 팔레트
              </StrokedText>
              {SEASON_COLOR_PALETTE[type].map((categ) => (
                <View key={categ.label} style={styles.paletteRow}>
                  <StrokedText strokeColor="#ffffff" strokeWidth={0.5} style={styles.paletteCategoryLabel}>
                    {categ.label}
                  </StrokedText>
                  <View style={styles.chipRow}>
                    {categ.chips.map((chip) => (
                      <View key={chip.name} style={styles.chipItem}>
                        <View style={[styles.colorChip, { backgroundColor: chip.hex }]} />
                        <StrokedText strokeColor="#ffffff" strokeWidth={0.3} style={styles.chipName}>
                          {chip.name}
                        </StrokedText>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.productGrid}>
            {displayedProducts.map((item) => (
              <TouchableOpacity
                key={item.goodsNo}
                style={styles.productCard}
                activeOpacity={0.75}
                onPress={() => {
                  Linking.openURL(
                    `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${item.goodsNo}`
                  );
                }}
              >
                <View style={styles.productImageContainer}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                </View>
                <StrokedText strokeColor="#ffffff" strokeWidth={0.5} style={styles.productBrand} numberOfLines={1}>
                  {item.brand}
                </StrokedText>
                <StrokedText strokeColor="#ffffff" strokeWidth={0.5} style={styles.productTitle} numberOfLines={2}>
                  {item.name}
                </StrokedText>
                <View style={styles.tagRow}>
                  <View style={styles.priceTag}>
                    <StrokedText strokeColor="#ffffff" strokeWidth={0.5} style={styles.tagText}>{item.price}</StrokedText>
                  </View>
                  {item.orgPrice !== item.price && (
                    <View style={[styles.priceTag, styles.orgPriceTag]}>
                      <StrokedText strokeColor="#ffffff" strokeWidth={0.5} style={[styles.tagText, styles.orgPriceText]}>
                        {item.orgPrice}
                      </StrokedText>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
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
                {isSkin ? `[ ${skinTypeLabel} ]` : `[ ${seasonInfo?.description?.split(' (')[0] || '봄 웜 라이트'} ]`}
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
                      {skinAge !== null ? `[ ${skinAge}살 ]` : '-'}
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
                  {skinBars.map((bar, idx) => {
                    const item = { ...bar, left: '많다', right: '적다', color: '#90FDFF' };
                    return (
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
                  );
                  })}
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
  productBrand: {
    fontSize: 11,
    color: '#888888',
    fontFamily: 'DOSIyagiBoldface',
    marginBottom: 2,
  },
  productTitle: {
    fontSize: 13,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
    lineHeight: 17,
    marginBottom: 8,
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
  orgPriceTag: {
    backgroundColor: '#E0E0E0',
  },
  orgPriceText: {
    color: '#999999',
    textDecorationLine: 'line-through',
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
  },
  skinInfoSection: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    padding: 16,
  },
  skinInfoTitle: {
    fontSize: 14,
    color: '#555555',
    fontFamily: 'DOSIyagiBoldface',
    marginBottom: 14,
  },
  skinInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 8,
  },
  skinInfoIcon: {
    fontSize: 16,
    lineHeight: 22,
  },
  skinInfoText: {
    fontSize: 13,
    color: '#444444',
    fontFamily: 'DOSIyagiBoldface',
    lineHeight: 20,
    flex: 1,
  },
  paletteSection: {
    marginHorizontal: 20,
    marginBottom: 28,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    padding: 14,
  },
  paletteSectionTitle: {
    fontSize: 14,
    color: '#555555',
    fontFamily: 'DOSIyagiBoldface',
    marginBottom: 12,
  },
  paletteRow: {
    marginBottom: 10,
  },
  paletteCategoryLabel: {
    fontSize: 11,
    color: '#888888',
    fontFamily: 'DOSIyagiBoldface',
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  chipItem: {
    alignItems: 'center',
    gap: 4,
  },
  colorChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  chipName: {
    fontSize: 9,
    color: '#555555',
    fontFamily: 'DOSIyagiBoldface',
    textAlign: 'center',
    maxWidth: 40,
  },
});
