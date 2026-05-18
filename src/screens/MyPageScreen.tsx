import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Dimensions, StyleSheet, View, ScrollView, TouchableOpacity, Image, Animated, Easing, Text, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as S from './style';
import HomeSvg from '../../assets/icons/home.svg';
import MyPageSvg from '../../assets/icons/mypage.svg';
import BG from '../../assets/icons/BG.svg';
import StrokedText from '../components/StrokedText';
import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../constants/theme';
import { getKakaoProfile } from '../api/kakaoAuth';
import { getToken } from '../utils/tokenStorage';
import { getUserHistory, HistoryItem } from '../api/userApi';
import { CrawledProduct } from '../utils/productRecommend';
import { getWishlist, removeFromWishlist } from '../utils/wishlistStorage';

const { width, height } = Dimensions.get('window');

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
  const [nickname, setNickname] = useState('로그인 해주세요');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [wishlist, setWishlist] = useState<CrawledProduct[]>([]);
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await getToken();
      if (token) {
        setIsLoggedIn(true);
        const profile = await getKakaoProfile();
        if (profile && profile.nickname) {
          setNickname(profile.nickname);
        }
        try {
          const items = await getUserHistory();
          setHistory(items);
        } catch (e) {
          console.log('history 조회 실패:', e);
        }
      } else {
        setIsLoggedIn(false);
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

  const handleHome = () => {
    navigation.navigate('Home');
  };

  useEffect(() => {
    navigation.setParams({ hideArrows: isEntered } as any);
  }, [isEntered]);

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
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>

      {!isEntered ? (
        <S.MainContent>
          {!isLoggedIn && (
            <View style={styles.loginPromptContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
                <StrokedText strokeColor="#fafafa" strokeWidth={1} style={styles.loginPromptText}>
                  * 로그인 페이지로 이동하기
                </StrokedText>
              </TouchableOpacity>
            </View>
          )}
          <S.Header>
            <StrokedText strokeColor="#fafafa" strokeWidth={2.5} style={styles.stepText}>
              3.
            </StrokedText>
            <StrokedText strokeColor="#fafafa" strokeWidth={2.5} style={styles.introTitleText}>
              마이페이지
            </StrokedText>
          </S.Header>

          <S.WheelSection>
            <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
              <MyPageSvg width={width * 0.7} height={width * 0.7} />
            </Animated.View>
          </S.WheelSection>

          <S.FooterAction onPress={isLoggedIn ? handleEnter : undefined}>
            <StrokedText strokeColor="#fafafa" strokeWidth={2} style={styles.introFooterText}>
              {isLoggedIn ? '[ 들어가기 ]' : '[ 로그인을 하지 않았습니다. ]'}
            </StrokedText>
          </S.FooterAction>
        </S.MainContent>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleHome}>
              <HomeSvg width={28} height={28} fill="#333333" />
            </TouchableOpacity>
          </View>

          <View style={styles.greetingSection}>
            <StrokedText strokeColor="#fafafa" strokeWidth={1} style={styles.greetText}>
              안녕하세요
            </StrokedText>
            <View style={styles.nicknameRow}>
              <StrokedText strokeColor="#fafafa" strokeWidth={4} style={styles.nicknameSticker}>
                [ {nickname} ]
              </StrokedText>
              <StrokedText strokeColor="#fafafa" strokeWidth={1} style={styles.greetText}>
                {' '}님
              </StrokedText>
            </View>
          </View>

          <View style={styles.section}>
            <StrokedText strokeColor="#fafafa" strokeWidth={1} style={styles.sectionTitle}>
              최근 검사 결과 조회
            </StrokedText>
            <View style={styles.listContainer}>
              {sortedHistory.length > 0 ? sortedHistory.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.listItem}
                  onPress={() => handleHistoryPress(item)}
                >
                  <StrokedText strokeColor="#fafafa" strokeWidth={1} style={styles.listItemText}>
                    {formatDate(item.created_at)}{'  '}[{item.label}] 진단 결과{'  '}{'>'}
                  </StrokedText>
                </TouchableOpacity>
              )) : (
                <View style={styles.listItem}>
                  <StrokedText strokeColor="#fafafa" strokeWidth={1} style={styles.listItemText}>
                    최근 검사 결과가 없습니다.
                  </StrokedText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <StrokedText strokeColor="#fafafa" strokeWidth={1} style={styles.sectionTitle}>
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
                      <StrokedText strokeColor="#fafafa" strokeWidth={0.5} style={styles.wishlistBrand} numberOfLines={1}>
                        {item.brand}
                      </StrokedText>
                      <StrokedText strokeColor="#fafafa" strokeWidth={0.5} style={styles.wishlistName} numberOfLines={2}>
                        {item.name}
                      </StrokedText>
                      <StrokedText strokeColor="#fafafa" strokeWidth={0.5} style={styles.wishlistPrice}>
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
                <StrokedText strokeColor="#fafafa" strokeWidth={1} style={styles.listItemText}>
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
    fontFamily: 'DOSIyagiBoldface',
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
    fontFamily: 'DOSIyagiBoldface',
  },
  introTitleText: {
    fontSize: 24,
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
  },
  introFooterText: {
    fontSize: 20,
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 20,
  },
  greetingSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  greetText: {
    fontSize: 22,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
  },
  nicknameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  nicknameSticker: {
    fontSize: 26,
    color: COLORS.PRIMARY,
    fontFamily: 'DOSIyagiBoldface',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
    marginBottom: 12,
  },
  listContainer: {
    gap: 8,
  },
  listItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  listItemText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'DOSIyagiBoldface',
  },
  wishlistGrid: {
    gap: 10,
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
    fontFamily: 'DOSIyagiBoldface',
  },
  wishlistName: {
    fontSize: 12,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
    lineHeight: 16,
  },
  wishlistPrice: {
    fontSize: 11,
    color: COLORS.PRIMARY,
    fontFamily: 'DOSIyagiBoldface',
  },
  wishlistRemove: {
    padding: 4,
  },
  wishlistRemoveText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
  },
});
