import React from 'react';
import styled from 'styled-components/native';
import { Text } from 'react-native';

const Container = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: #fff;
`;

const Title = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
`;

export default function HomeScreen() {
  return (
    <Container>
      <Title>Oops MFE</Title>
      <Text>네이티브 앱 세팅이 완료되었습니다!</Text>
    </Container>
  );
}
