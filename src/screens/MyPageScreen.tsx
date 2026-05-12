import React from 'react';
import { Dimensions, StyleSheet, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as S from './style';
import HomeSvg from '../../assets/icons/home.svg';
import BG from '../../assets/icons/BG.svg';
import StrokedText from '../components/StrokedText';
import { RootStackParamList } from '../types/navigation';
import { COLORS } from '../constants/theme';

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

  const handleHome = () => {
    navigation.navigate('Home');
  };

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>
      
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
              [ 감자를 캐자 ]
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
    </S.Container>
  );
}

const styles = StyleSheet.create({
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
