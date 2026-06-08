import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import ImageColors from 'react-native-image-colors';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import StrokedText from '../components/StrokedText';
import { COLORS, FONTS } from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getSavedColorResult } from '../utils/analysisStorage';
import { hexToHSL, scoreColorForSeason, extractAllHexColors } from '../utils/colorAnalysis';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ColorMatch'>;

const SEASON_NAMES: Record<string, string> = {
  spring: '봄 웜',
  summer: '여름 쿨',
  autumn: '가을 웜',
  winter: '겨울 쿨',
};

function getVerdict(score: number): { emoji: string; text: string; color: string } {
  if (score >= 72) return { emoji: '✅', text: '잘 어울려요!', color: '#4CAF50' };
  if (score >= 52) return { emoji: '⚠️', text: '보통이에요', color: '#FF9800' };
  return { emoji: '❌', text: '피하세요', color: '#F44336' };
}

function getExplanation(score: number, season: string, colors: string[]): string {
  if (!colors.length) return '';
  const { h } = hexToHSL(colors[0]);
  const isWarm = (h >= 0 && h <= 65) || (h >= 340 && h <= 360);
  const isCool = h >= 175 && h <= 295;
  const tone = isWarm ? '따뜻한(웜) 계열' : isCool ? '차가운(쿨) 계열' : '중간 계열';
  const seasonWarm = season === 'spring' || season === 'autumn';
  const name = SEASON_NAMES[season] ?? season;

  if (score >= 72) return `${tone} 색상이 ${name} 타입과 잘 어울려요!`;
  if (score >= 52) {
    if (seasonWarm && isCool) return `쿨한 색상이에요. ${name}는 웜 계열이 더 잘 어울려요.`;
    if (!seasonWarm && isWarm) return `웜한 색상이에요. ${name}는 쿨 계열이 더 잘 어울려요.`;
    return `어울리긴 하지만 더 좋은 색상이 있어요.`;
  }
  if (seasonWarm && isCool) return `쿨 계열은 ${name} 타입과 어울리지 않아요.`;
  if (!seasonWarm && isWarm) return `웜 계열은 ${name} 타입과 어울리지 않아요.`;
  return `이 색상은 ${name} 타입에 잘 맞지 않아요.`;
}


export default function ColorMatchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [extractedColors, setExtractedColors] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [savedSeason, setSavedSeason] = useState<string | null>(null);
  const [savedSeasonSub, setSavedSeasonSub] = useState<string | undefined>(undefined);

  useEffect(() => {
    getSavedColorResult().then(res => {
      if (res) {
        setSavedSeason(res.type);
        setSavedSeasonSub(res.subType);
      }
    });
  }, []);

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setExtractedColors([]);
      setScore(null);
      setIsExtracting(true);
      try {
        const colorResult = await ImageColors.getColors(uri, { fallback: '#888888', cache: false });
        const colors = extractAllHexColors(colorResult);
        setExtractedColors(colors);
        if (savedSeason && colors.length > 0) {
          const scores = colors.map((c: string) => scoreColorForSeason(c, savedSeason));
          const avg = Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length);
          setScore(avg);
        }
      } catch {
        Alert.alert('색상 추출 실패', '다시 시도해주세요.');
      } finally {
        setIsExtracting(false);
      }
    }
  }, [savedSeason]);

  const reset = useCallback(() => {
    setImageUri(null);
    setExtractedColors([]);
    setScore(null);
  }, []);

  const seasonDisplayName = savedSeason
    ? `${SEASON_NAMES[savedSeason] ?? savedSeason}${savedSeasonSub ? ` ${savedSeasonSub}` : ''}`
    : null;

  const verdict = score !== null ? getVerdict(score) : null;
  const explanation = score !== null && savedSeason
    ? getExplanation(score, savedSeason, extractedColors)
    : '';

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.backText} numberOfLines={1}>← 뒤로</StrokedText>
        </TouchableOpacity>

        <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={3} style={styles.title}>
          컬러 매칭 스캐너
        </StrokedText>
        <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.subtitle}>
          옷, 가방, 립스틱 사진을 올리면{'\n'}내 퍼스널컬러와 어울리는지 알려드려요!
        </StrokedText>

        <View style={styles.seasonBadge}>
          {seasonDisplayName ? (
            <>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.seasonLabel}>내 퍼스널컬러</StrokedText>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.seasonValue}>
                [ {seasonDisplayName} ]
              </StrokedText>
            </>
          ) : (
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.noSeason}>
              * 먼저 퍼스널컬러 분석을 받아주세요
            </StrokedText>
          )}
        </View>

        <TouchableOpacity
          onPress={pickImage}
          style={[styles.imagePicker, imageUri ? styles.imagePickerFilled : styles.imagePickerEmpty]}
          activeOpacity={0.8}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.pickedImage} resizeMode="cover" />
          ) : (
            <View style={styles.emptyImageContent}>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.emptyImageIcon}>📷</StrokedText>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.emptyImageText}>
                사진을 선택해주세요
              </StrokedText>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.emptyImageHint}>
                옷 / 악세사리 / 화장품 등
              </StrokedText>
            </View>
          )}
        </TouchableOpacity>

        {isExtracting && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.loadingText}>
              색상 분석 중...
            </StrokedText>
          </View>
        )}

        {extractedColors.length > 0 && !isExtracting && (
          <View style={styles.colorSection}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.colorSectionLabel}>
              추출된 색상
            </StrokedText>
            <View style={styles.colorChips}>
              {extractedColors.slice(0, 4).map((color, i) => (
                <View key={i} style={styles.chipWrapper}>
                  <View style={[styles.colorChip, { backgroundColor: color }]} />
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.3} style={styles.chipHex}>
                    {color.toUpperCase()}
                  </StrokedText>
                </View>
              ))}
            </View>
          </View>
        )}

        {verdict && score !== null && !isExtracting && (
          <View style={styles.resultCard}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.verdictEmoji}>
              {verdict.emoji}
            </StrokedText>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={3} style={[styles.verdictText, { color: verdict.color }]}>
              {verdict.text}
            </StrokedText>
            <View style={styles.scoreRow}>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.scoreNumber}>{score}</StrokedText>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.scoreUnit}>점</StrokedText>
            </View>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreBarFill, { width: `${score}%`, backgroundColor: verdict.color }]} />
            </View>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.explanationText}>
              {explanation}
            </StrokedText>
          </View>
        )}

        {!savedSeason && !isExtracting && (
          <View style={styles.noAnalysisHint}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.noAnalysisText}>
              퍼스널컬러 분석 결과가 없어요.{'\n'}홈에서 분석을 먼저 진행해주세요!
            </StrokedText>
          </View>
        )}

        <View style={styles.actions}>
          {imageUri && (
            <TouchableOpacity onPress={reset} style={styles.resetBtn} activeOpacity={0.7}>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.resetText} numberOfLines={1}>
                [ 다른 사진 분석하기 ]
              </StrokedText>
            </TouchableOpacity>
          )}
          {!imageUri && (
            <TouchableOpacity onPress={pickImage} style={styles.resetBtn} activeOpacity={0.7}>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.resetText} numberOfLines={1}>
                [ 사진 선택하기 ]
              </StrokedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.goBackText} numberOfLines={1}>뒤로가기</StrokedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </S.Container>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 10,
  },
  backText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: FONTS.PIXEL,
  },
  title: {
    fontSize: 26,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 13,
    color: '#555555',
    fontFamily: FONTS.PIXEL,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  seasonBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: COLORS.PRIMARY,
  },
  seasonLabel: {
    fontSize: 12,
    color: '#888888',
    fontFamily: FONTS.PIXEL,
    marginBottom: 4,
  },
  seasonValue: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
  },
  noSeason: {
    fontSize: 13,
    color: '#FF9800',
    fontFamily: FONTS.PIXEL,
  },
  imagePicker: {
    width: width * 0.78,
    height: width * 0.78,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  imagePickerEmpty: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: COLORS.PRIMARY,
    backgroundColor: 'rgba(255,140,182,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePickerFilled: {},
  pickedImage: {
    width: '100%',
    height: '100%',
  },
  emptyImageContent: {
    alignItems: 'center',
    gap: 8,
  },
  emptyImageIcon: {
    fontSize: 40,
  },
  emptyImageText: {
    fontSize: 16,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
  },
  emptyImageHint: {
    fontSize: 12,
    color: '#999999',
    fontFamily: FONTS.PIXEL,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: FONTS.PIXEL,
  },
  colorSection: {
    width: '100%',
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  colorSectionLabel: {
    fontSize: 15,
    color: '#444444',
    fontFamily: FONTS.PIXEL,
    marginBottom: 12,
  },
  colorChips: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  chipWrapper: {
    alignItems: 'center',
    gap: 4,
  },
  colorChip: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  chipHex: {
    fontSize: 9,
    color: '#666666',
    fontFamily: FONTS.PIXEL,
  },
  resultCard: {
    width: width * 0.85,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 6,
  },
  verdictEmoji: {
    fontSize: 42,
  },
  verdictText: {
    fontSize: 24,
    fontFamily: FONTS.PIXEL,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 2,
    marginTop: 4,
  },
  scoreNumber: {
    fontSize: 40,
    fontFamily: FONTS.PIXEL,
    color: '#333333',
  },
  scoreUnit: {
    fontSize: 18,
    fontFamily: FONTS.PIXEL,
    color: '#555555',
  },
  scoreBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 6,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  explanationText: {
    fontSize: 13,
    color: '#555555',
    fontFamily: FONTS.PIXEL,
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
  },
  noAnalysisHint: {
    backgroundColor: 'rgba(255,152,0,0.1)',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,152,0,0.3)',
  },
  noAnalysisText: {
    fontSize: 13,
    color: '#E65100',
    fontFamily: FONTS.PIXEL,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  resetBtn: {
    paddingVertical: 4,
  },
  resetText: {
    fontSize: 18,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
  },
  goBackText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: FONTS.PIXEL,
  },
});
