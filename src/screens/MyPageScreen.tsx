import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Dimensions, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as S from './style';
import MyPageSvg from '../../assets/icons/mypage.svg';
import StrokedText from '../components/StrokedText';

const { width } = Dimensions.get('window');

type RootStackParamList = {
  Landing: undefined;
  Home: undefined;
  LastCheck: { from: string };
  MyPage: undefined;
  Skin: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MyPage'>;

export default function MyPageScreen() {
  const navigation = useNavigation<NavigationProp>();
  const floatAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <S.Container>
      <S.MainContent>
        <S.Header>
          <StrokedText strokeColor="#ffffff" strokeWidth={2.5} style={styles.stepText}>
            3.
          </StrokedText>
          <StrokedText strokeColor="#ffffff" strokeWidth={2.5} style={styles.titleText}>
            마이페이지
          </StrokedText>
        </S.Header>

        <S.WheelSection>
          <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
            <MyPageSvg width={width * 0.7} height={width * 0.7} />
          </Animated.View>
        </S.WheelSection>

        <S.FooterAction onPress={() => {}}>
          <StrokedText strokeColor="#ffffff" strokeWidth={2} style={styles.footerText}>
            [ 들어가기 ]
          </StrokedText>
        </S.FooterAction>
      </S.MainContent>
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
  titleText: {
    fontSize: 24,
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
  },
  arrowText: {
    fontSize: 30,
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
  },
  footerText: {
    fontSize: 20,
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
  }
});
