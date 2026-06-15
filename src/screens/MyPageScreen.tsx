import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Animated, Dimensions, StyleSheet, View, ScrollView, TouchableOpacity, Image, Text, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as S from './style';
import HomeSvg from '../../assets/icons/home.svg';
import MyPageSvg from '../../assets/icons/mypage.svg';
import StrokedText from '../components/StrokedText';
import { useHomeAnimations } from '../hooks/useHomeAnimations';
import { RootStackParamList } from '../types/navigation';
import { COLORS, FONTS } from '../constants/theme';
import { getKakaoProfile } from '../api/kakaoAuth';
import { getToken } from '../utils/tokenStorage';
import { getUserHistory, HistoryItem } from '../api/userApi';
import { getLocalHistory, LocalHistoryItem } from '../utils/analysisStorage';
import { CrawledProduct } from '../utils/productRecommend';
import { getWishlist, removeFromWishlist } from '../utils/wishlistStorage';
import { carouselRef } from '../utils/carouselRef';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyPage'>;

function formatDate(iso: string): string {
  const d = new Date(iso);
  const yy = String(d.getFullYear()).slice(2);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}.${mm}.${dd}.`;
}


export default function MyPageScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [isEntered, setIsEntered] = useState(false);
  const [nickname, setNickname] = useState('김예빈');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [history, setHistory] = useState<(HistoryItem | LocalHistoryItem)[]>([]);
  const [wishlist, setWishlist] = useState<CrawledProduct[]>([]);
  const { floatAnim } = useHomeAnimations();

  useEffect(() => {
    const checkLoginStatus = async () => {
      // 로그인 여부와 무관하게 로컬 히스토리 먼저 로드
      const localItems = await getLocalHistory();
      if (localItems.length > 0) setHistory(localItems);

      const token = await getToken();
      if (token) {
        setIsLoggedIn(true);
        const profile = await getKakaoProfile();
        if (profile && profile.nickname) {
          setNickname(profile.nickname);
        }
        try {
          const serverItems = await getUserHistory();
          setHistory(serverItems); // 로그인 시 서버 데이터로 교체
        } catch {
          // 서버 실패 시 로컬 데이터 유지
        }
      }
    };
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isEntered) {
      getWishlist().then(setWishlist);
    }
  }, [isEntered]);

  const handleRemoveWishlist = useCallback(async (goodsNo: string) => {
    await removeFromWishlist(goodsNo);
    setWishlist(prev => prev.filter(p => p.goodsNo !== goodsNo));
  }, []);

  const handleHome = () => {
    setIsEntered(false);
    carouselRef.navigate?.(0, 'prev');
  };

  useEffect(() => {
    navigation.setParams({ hideArrows: isEntered } as any);
  }, [isEntered, navigation]);

  const handleEnter = () => {
    setIsEntered(true);
  };

  const sortedHistory = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [history]);

  const handleHistoryPress = useCallback((item: HistoryItem) => {
    if (item.type === 'skin') {
      navigation.navigate('Result', {
        type: 'skin',
        analysisData: { skinType: item.skinType, skinTypeLabel: item.label, skinAge: item.skinAge },
      });
    } else {
      navigation.navigate('Result', {
        type: item.personalType ?? 'spring',
        subType: item.subType,
      });
    }
  }, [navigation]);

  return (
    <S.Container style={{ backgroundColor: 'transparent' }}>
      {!isEntered ? (
        <S.MainContent>
          <S.Header>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2.5} style={styles.stepText}>
              3.
            </StrokedText>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2.5} style={styles.introTitleText}>
              마이페이지
            </StrokedText>
          </S.Header>

          <S.WheelSection>
            <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
              <MyPageSvg width={width * 0.7} height={width * 0.7} />
            </Animated.View>
          </S.WheelSection>

          <S.FooterAction onPress={handleEnter}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.introFooterText} numberOfLines={1}>
              [ 들어가기 ]
            </StrokedText>
          </S.FooterAction>
        </S.MainContent>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100, alignItems: 'center' }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleHome}>
              <HomeSvg width={28} height={28} fill="#333333" />
            </TouchableOpacity>
          </View>

          <View style={styles.greetingSection}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.greetText}>
              안녕하세요
            </StrokedText>
            <View style={styles.nicknameRow}>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={4} style={styles.nicknameSticker}>
                [ {nickname} ]
              </StrokedText>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.greetText}>
                {' '}님
              </StrokedText>
            </View>
          </View>

          <View style={styles.section}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.sectionTitle}>
              스마트 도구
            </StrokedText>
            <View style={styles.toolsRow}>
              <TouchableOpacity
                style={styles.toolCard}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('ColorMatch')}
              >
                <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.toolEmoji}>🎨</StrokedText>
                <View style={styles.toolTextContainer}>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.toolTitle} numberOfLines={1}>컬러 매칭 스캐너</StrokedText>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.3} style={styles.toolDesc}>
                    아이템 사진으로 내 퍼스널컬러 매칭
                  </StrokedText>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toolCard, { borderColor: 'rgba(198,235,141,0.6)' }]}
                activeOpacity={0.75}
                onPress={() => navigation.navigate('WeatherBeauty')}
              >
                <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.toolEmoji}>🌤️</StrokedText>
                <View style={styles.toolTextContainer}>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.toolTitle} numberOfLines={1}>날씨 맞춤 뷰티 루틴</StrokedText>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.3} style={styles.toolDesc}>
                    오늘 날씨로 맞춤 뷰티 팁
                  </StrokedText>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.sectionTitle}>
              최근 검사 결과 조회
            </StrokedText>
            <View style={styles.listContainer}>
              {sortedHistory.length > 0 ? sortedHistory.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.listItem}
                  onPress={() => handleHistoryPress(item)}
                >
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.listItemText}>
                    {formatDate(item.created_at)}{'  '}[{item.label}] 진단 결과{'  '}{'>'}
                  </StrokedText>
                </TouchableOpacity>
              )) : (
                <View style={styles.listItem}>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.listItemText}>
                    최근 검사 결과가 없습니다.
                  </StrokedText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.sectionTitle}>
              찜한 화장품
            </StrokedText>
            {wishlist.length > 0 ? (
              <View style={styles.wishlistGrid}>
                {wishlist.map((item) => (
                  <View key={item.goodsNo} style={styles.wishlistCard}>
                    <TouchableOpacity
                      onPress={() => Linking.openURL(
                        `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${item.goodsNo}`
                      )}
                      activeOpacity={0.8}
                    >
                      <Image source={{ uri: item.imageUrl }} style={styles.wishlistImage} resizeMode="cover" />
                    </TouchableOpacity>
                    <View style={styles.wishlistInfo}>
                      <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.wishlistBrand} numberOfLines={1}>
                        {item.brand}
                      </StrokedText>
                      <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.wishlistName} numberOfLines={2}>
                        {item.name}
                      </StrokedText>
                      <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.wishlistPrice}>
                        {item.price}
                      </StrokedText>
                    </View>
                    <TouchableOpacity
                      style={styles.wishlistRemove}
                      onPress={() => handleRemoveWishlist(item.goodsNo)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.wishlistRemoveText}>♥</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.listItem}>
                <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.listItemText}>
                  찜한 화장품이 없습니다.
                </StrokedText>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </S.Container>
  );
}

const styles = StyleSheet.create({
  stepText: {
    fontSize: 20,
    color: '#FF8CB6',
    fontFamily: FONTS.PIXEL,
    marginBottom: 25,
  },
  loginPromptContainer: {
    position: 'absolute',
    top: 50,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  loginPromptText: {
    fontSize: 14,
    color: '#FF8CB6',
    fontFamily: FONTS.PIXEL,
  },
  introTitleText: {
    fontSize: 24,
    color: '#FF8CB6',
    fontFamily: FONTS.PIXEL,
  },
  introFooterText: {
    fontSize: 20,
    color: '#FF8CB6',
    fontFamily: FONTS.PIXEL,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  greetingSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
    alignItems: 'center',
    width: '100%',
  },
  greetText: {
    fontSize: 22,
    color: '#333333',
    fontFamily: FONTS.PIXEL,
    textAlign: 'center',
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  nicknameSticker: {
    fontSize: 26,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#333333',
    fontFamily: FONTS.PIXEL,
    marginBottom: 12,
    textAlign: 'center',
  },
  listContainer: {
    gap: 8,
    width: '100%',
  },
  listItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    width: '100%',
  },
  listItemText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: FONTS.PIXEL,
    textAlign: 'center',
  },
  wishlistGrid: {
    gap: 10,
    width: '100%',
    alignItems: 'center',
  },
  wishlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 8,
    padding: 10,
    gap: 12,
  },
  wishlistImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#3F44FF',
  },
  wishlistInfo: {
    flex: 1,
    gap: 3,
  },
  wishlistBrand: {
    fontSize: 10,
    color: '#888888',
    fontFamily: FONTS.PIXEL,
  },
  wishlistName: {
    fontSize: 12,
    color: '#333333',
    fontFamily: FONTS.PIXEL,
    lineHeight: 16,
  },
  wishlistPrice: {
    fontSize: 11,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
  },
  wishlistRemove: {
    padding: 4,
  },
  wishlistRemoveText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
  },
  toolsRow: {
    flexDirection: 'column',
    gap: 12,
  },
  toolCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,140,182,0.4)',
  },
  toolTextContainer: {
    flex: 1,
  },
  toolEmoji: {
    fontSize: 30,
  },
  toolTitle: {
    fontSize: 14,
    color: '#333333',
    fontFamily: FONTS.PIXEL,
    marginBottom: 3,
  },
  toolDesc: {
    fontSize: 11,
    color: '#888888',
    fontFamily: FONTS.PIXEL,
    lineHeight: 16,
  },
});
