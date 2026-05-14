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
import { getToken } from '../utils/tokenStorage';
import { getSkinResult } from '../api/skinApi';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyPage'>;

interface RecentResult {
  id: string;
  date: string;
  title: string;
  data: any;
}


export default function MyPageScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [isEntered, setIsEntered] = useState(false);
  const [nickname, setNickname] = useState('로그인 해주세요');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [recentResults, setRecentResults] = useState<RecentResult[]>([]);
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
          const skinRes = await getSkinResult();
          if (skinRes) {
            const d = new Date(skinRes.created_at || skinRes.diagnosedAt || new Date());
            const yy = String(d.getFullYear()).slice(2);
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const dateStr = `${yy}.${mm}.${dd}.`;
            const title = skinRes.skinTypeLabel ? `[${skinRes.skinTypeLabel}] 진단 결과` : '피부 진단 결과';
            setRecentResults([{ id: '1', date: dateStr, title, data: skinRes }]);
          }
        } catch (e) {
          console.log('No recent results or error:', e);
        }
      } else {
        setIsLoggedIn(false);
      }
    };
    checkLoginStatus();
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
          {!isLoggedIn && (
            <View style={styles.loginPromptContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('Landing')}>
                <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.loginPromptText}>
                  * 로그인 페이지로 이동하기
                </StrokedText>
              </TouchableOpacity>
            </View>
          )}
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

          <S.FooterAction onPress={isLoggedIn ? handleEnter : undefined}>
            <StrokedText strokeColor="#ffffff" strokeWidth={2} style={styles.introFooterText}>
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
              {recentResults.length > 0 ? recentResults.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.listItem}
                  onPress={() => navigation.navigate('Result', { type: 'skin', analysisData: { data: item.data } })}
                >
                  <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.listItemText}>
                    {item.date} {item.title}  {'>'}
                  </StrokedText>
                </TouchableOpacity>
              )) : (
                <View style={styles.listItem}>
                  <StrokedText strokeColor="#ffffff" strokeWidth={1} style={styles.listItemText}>
                    최근 검사 결과가 없습니다.
                  </StrokedText>
                </View>
              )}
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
});
