import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet, View, Dimensions, TouchableOpacity,
  Animated, ActivityIndicator, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import StrokedText from '../components/StrokedText';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getSkinQuestions, diagnoseSkin, SkinQuestion } from '../api/skinApi';
import { COLORS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Survey'>;

const QUESTION_IDS = ['elasticity', 'moisture', 'pigmentation', 'oiliness', 'sensitivity'];

// API가 내려주는 선택지와 동일한 순서/값으로 고정
const OPTIONS = [
  { value: 'strongly_agree', label: '매우 그렇다', score: 4, color: '#FF8CB6' },
  { value: 'agree', label: '그렇다', score: 3, color: '#FFB3CC' },
  { value: 'neutral', label: '보통', score: 2, color: '#D9D3B4' },
  { value: 'disagree', label: '아니다', score: 1, color: '#B3C8FF' },
  { value: 'strongly_disagree', label: '전혀 아니다', score: 0, color: '#7B9FFF' },
];

// 나이 선택용 (진단 첫 화면)
const AGE_OPTIONS = [10, 20, 30, 40, 50];

export default function SurveyScreen() {
  const navigation = useNavigation<NavigationProp>();

  // 0~4: 문항 단계
  const [step, setStep] = useState(0);
  const [age, setAge] = useState<number | null>(null);
  const [questions, setQuestions] = useState<SkinQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // 문항 로드
  useEffect(() => {
    getSkinQuestions()
      .then(setQuestions)
      .catch(() => {
        // API 실패 시 하드코딩 폴백
        setQuestions(QUESTION_IDS.map((id, i) => ({
          id,
          question: [
            '피부가 처지거나\n잔주름이 느껴진다.',
            '세안 후 아무것도\n바르지 않으면 건조하고 푸석하다.',
            '잡티나 칙칙한\n피부톤이 신경 쓰인다.',
            '시간이 지나면\n얼굴이 번들거린다.',
            '새 화장품을 사용하면\n피부가 쉽게 붉어진다.',
          ][i],
          options: OPTIONS,
        })));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const animateTransition = useCallback((callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -18, duration: 180, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(18);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 260, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
      ]).start();
    });
  }, [fadeAnim, slideAnim]);


  const handleOptionSelect = async (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      // 아직 문항이 남아 있으면 다음 단계로
      animateTransition(() => setStep(step + 1));
    } else {
      // 마지막 문항 완료 → 진단 요청
      setIsSubmitting(true);
      try {
        const result = await diagnoseSkin({
          age: age ?? 20,
          answers: newAnswers,
        });
        navigation.navigate('Result', {
          type: 'skin',
          analysisData: result,
        });
      } catch (err) {
        Alert.alert('진단 오류', '피부 진단 중 오류가 발생했습니다. 다시 시도해주세요.');
        console.error('[SurveyScreen] diagnoseSkin error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // 로딩 / 분석 중 화면
  if (isLoading || isSubmitting) {
    return (
      <S.Container>
        <View style={StyleSheet.absoluteFill}>
          <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <StrokedText strokeColor="#fafafa" strokeWidth={2} style={styles.loadingText}>
            {isSubmitting ? '피부 타입 분석 중...' : '문항을 불러오는 중...'}
          </StrokedText>
        </View>
      </S.Container>
    );
  }

  // 문항 단계
  const currentQ = questions[step];
  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>

      {/* 진행 바 */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${((step + 1) / questions.length) * 100}%` }]} />
      </View>

      <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* 문항 번호 */}
        <View style={{ marginBottom: 10 }}>
          <StrokedText strokeColor="#fafafa" strokeWidth={2.5} style={styles.qNumber}>
            Q{step + 1} / {questions.length}
          </StrokedText>
        </View>

        {/* 질문 */}
        <View style={styles.questionBox}>
          <StrokedText strokeColor="#fafafa" strokeWidth={2} style={styles.questionText}>
            {currentQ?.question ?? ''}
          </StrokedText>
        </View>

        {/* 5지선다 선택지 */}
        <View style={styles.optionsContainer}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.optionCard, { borderColor: opt.color }]}
              activeOpacity={0.7}
              onPress={() => handleOptionSelect(currentQ.id, opt.value)}
            >
              <View style={[styles.optionDot, { backgroundColor: opt.color }]} />
              <StrokedText strokeColor="#fafafa" strokeWidth={1} style={styles.optionLabel}>
                {opt.label}
              </StrokedText>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </S.Container>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontFamily: 'DOSIyagiBoldface',
    marginTop: 4,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    zIndex: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF8CB6',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 60,
  },
  qNumber: {
    fontSize: 22,
    color: '#888888',
    fontFamily: 'DOSIyagiBoldface',
  },
  questionBox: {
    marginBottom: 30,
    minHeight: 72,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  questionText: {
    fontSize: 20,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
    textAlign: 'center',
    lineHeight: 30,
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 14,
  },
  optionDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  optionLabel: {
    fontSize: 15,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
  },

});
