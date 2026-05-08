import React from 'react';
import { StyleSheet } from 'react-native';
import * as S from './style';
import StrokedText from '../components/StrokedText';

export default function MyPageScreen() {
  return (
    <S.MainContent>
      <StrokedText strokeColor="#ffffff" strokeWidth={2} style={styles.text}>
        마이페이지 (준비 중)
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
