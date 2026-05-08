import React from 'react';
import { StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import * as S from './style';
import StrokedText from '../components/StrokedText';

type RootStackParamList = {
  LastCheck: { from: string };
};

export default function LastCheckScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'LastCheck'>>();
  const { from } = route.params || { from: 'unknown' };

  return (
    <S.MainContent>
      <StrokedText strokeColor="#ffffff" strokeWidth={2} style={styles.text}>
        최종 확인 ({from})
      </StrokedText>
    </S.MainContent>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 24,
    color: '#FF8CB6',
    fontFamily: 'DOSIyagiBoldface',
  },
});
