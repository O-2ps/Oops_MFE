import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import StrokedText from '../components/StrokedText';

const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  LastCheck: { from: string };
};

export default function LastCheckScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'LastCheck'>>();
  const { from } = route.params || { from: 'unknown' };

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>
      <S.MainContent>
        <StrokedText strokeColor="#ffffff" strokeWidth={2} style={styles.text}>
          최종 확인 ({from})
        </StrokedText>
      </S.MainContent>
    </S.Container>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
  },
});
