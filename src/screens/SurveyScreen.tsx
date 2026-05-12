import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import YesSvg from '../../assets/icons/yes.svg';
import NoSvg from '../../assets/icons/no.svg';
import StrokedText from '../components/StrokedText';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Survey'>;

const QUESTIONS = [
  '세안을 하고 아무것도\n바르지 않으면 건조하다.',
  '시간이 지나면',
  '얼굴이 번들거린다.',
  '코나 이마만\n번들거린다.',
  '새 화장품을 사용하면\n피부가 쉽게 붉어진다.'
];

export default function SurveyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [currentStep, setCurrentStep] = useState(0);

  const handleSelect = () => {
    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Finished all questions
      navigation.navigate('Home');
    }
  };

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 150 }}>
        <View style={{ marginBottom: 40 }}>
          <StrokedText strokeColor="#ffffff" strokeWidth={2.5} style={styles.qNumber}>
            Q{currentStep + 1}.
          </StrokedText>
        </View>

        <View style={{ marginBottom: 60, height: 80, justifyContent: 'center' }}>
          <StrokedText strokeColor="#ffffff" strokeWidth={2} style={styles.questionText}>
            {QUESTIONS[currentStep]}
          </StrokedText>
        </View>

        <View style={styles.cardContainer}>
          <TouchableOpacity style={styles.card} onPress={handleSelect}>
            <View style={styles.iconWrapper}>
              <NoSvg width={80} height={80} />
            </View>
            <StrokedText strokeColor="#ffffff" strokeWidth={1.5} style={styles.cardText}>
              아니요
            </StrokedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={handleSelect}>
            <View style={styles.iconWrapper}>
              <YesSvg width={80} height={80} />
            </View>
            <StrokedText strokeColor="#ffffff" strokeWidth={1.5} style={styles.cardText}>
              네
            </StrokedText>
          </TouchableOpacity>
        </View>
      </View>
    </S.Container>
  );
}

const styles = StyleSheet.create({
  qNumber: {
    fontSize: 28,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
  },
  questionText: {
    fontSize: 20,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
    textAlign: 'center',
    lineHeight: 28,
  },
  cardContainer: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 20,
  },
  card: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 15,
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  iconWrapper: {
    marginBottom: 20,
  },
  cardText: {
    fontSize: 18,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
  }
});
