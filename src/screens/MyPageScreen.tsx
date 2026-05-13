import React, { useState, useRef, useEffect } from 'react';
import { Dimensions, StyleSheet, View, ScrollView, TouchableOpacity, Image, Animated, Easing } from 'react-native';
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

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyPage'>;

const RECENT_RESULTS = [
  { date: '3월 12일', title: '퍼스널 컬러 검사 결과' },
  { date: '3월 26일', title: '퍼스널 컬러 검사 결과' },
  { date: '3월 27일', title: '스킨 타입 검사 결과' },
  { date: '3월 29일', title: '스킨 타입 검사 결과' },
];

const WISH_LIST = [
  {
    id: 1,
    title: '[화잘먹수분선] 웰라쥬 리얼 히알루로닉 블루 선크림 50ml 1+1 기획',
    price: '29,300원',
    store: '올리브영',
    image: require('../../assets/images/wellage_sunscreen.png'),
  },
  {
    id: 2,
    title: '[화잘먹수분선] 웰라쥬 리얼 히알루로닉 블루 선크림 50ml 1+1 기획',
    price: '29,300원',
    store: '올리브영',
    image: require('../../assets/images/wellage_sunscreen.png'),
  },
];

export default function MyPageScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [isEntered, setIsEntered] = useState(false);
  const [nickname, setNickname] = useState('로그인 해주세요');
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getKakaoProfile();
      if (profile && profile.nickname) {
        setNickname(profile.nickname);
      }
    };
    fetchProfile();
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

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>

      {!isEntered ? (
        <S.MainContent>
          <S.Header>
            <StrokedText strokeColor="#ffffff" strokeWidth={2.5} style={styles.stepText}>
              3.
            </StrokedText>
            <StrokedText strokeColor="#ffffff" strokeWidth={2.5} style={styles.introTitleText}>
              마이페이지
            </StrokedText>
          </S.Header>

          <S.WheelSection>
            <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
              <MyPageSvg width={width * 0.7} height={width * 0.7} />
            </Animated.View>
          </S.WheelSection>

          <S.FooterAction onPress={handleEnter}>
            <StrokedText strokeColor="#ffffff" strokeWidth={2} style={styles.introFooterText}>
              [ 들어가기 ]
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
            <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.greetText}>
              안녕하세요
            </StrokedText>
            <View style={styles.nicknameRow}>
              <StrokedText strokeColor="#ffffff" strokeWidth={4} style={styles.nicknameSticker}>
                [ {nickname} ]
              </StrokedText>
              <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.greetText}>
                {' '}님
              </StrokedText>
            </View>
          </View>

          <View style={styles.section}>
            <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.sectionTitle}>
              최근 검사 결과 조회
            </StrokedText>
            <View style={styles.listContainer}>
              {RECENT_RESULTS.map((item, idx) => (
                <TouchableOpacity key={idx} style={styles.listItem}>
                  <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.listItemText}>
                    {item.date} {item.title}  {'>'}
                  </StrokedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.sectionTitle}>
              찜 해둔 상품
            </StrokedText>
            <View style={styles.productGrid}>
              {WISH_LIST.map((item) => (
                <View key={item.id} style={styles.productCard}>
                  <View style={styles.productImageContainer}>
                    <Image source={item.image} style={styles.productImage} resizeMode="cover" />
                  </View>
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
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 52) / 2,
    marginBottom: 15,
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#3F44FF',
    overflow: 'hidden',
    marginBottom: 8,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productTitle: {
    fontSize: 12,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
    lineHeight: 16,
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
  },
  priceTag: {
    backgroundColor: '#D9D3B4',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  storeTag: {
    backgroundColor: '#D9D3B4',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
  },
});
