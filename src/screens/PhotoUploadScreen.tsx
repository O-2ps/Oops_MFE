import React from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import StrokedText from '../components/StrokedText';
import FaceGuide from '../components/FaceGuide';
import { COLORS, FONTS } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';
import { analyzePersonalColor } from '../api/personalColor';
import { useImageColorPicker } from '../hooks/useImageColorPicker';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PhotoUpload'>;

export default function PhotoUploadScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const { imageUri, correctedColors, dominantColor, isExtracting, pickFromCamera, pickFromGallery } =
    useImageColorPicker();

  const handleStartAnalysis = async () => {
    if (!imageUri) {
      Alert.alert('사진 등록 필요', '얼굴 사진을 먼저 등록해주세요.');
      return;
    }
    try {
      setIsAnalyzing(true);
      const responseJson = await analyzePersonalColor(imageUri);
      const resultData = responseJson.data || responseJson;
      navigation.navigate('Result', {
        type: resultData.season || 'spring',
        subType: resultData.subType,
        analysisData: resultData,
        extractedColors: correctedColors,
      });
    } catch {
      Alert.alert('분석 실패', '사진 분석 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isAnalyzing) {
    return (
      <S.Container>
        <View style={StyleSheet.absoluteFill}>
          <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
        </View>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.loadingText}>
            사진을 분석하는 중입니다...
          </StrokedText>
        </View>
      </S.Container>
    );
  }

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>

      <S.MainContent>
        <View style={{ marginBottom: 30 }}>
          <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2.5} style={styles.title}>
            얼굴 사진을 등록해주세요
          </StrokedText>
        </View>

        <View style={styles.imagePreviewContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <FaceGuide width={width * 0.7} height={width * 0.7 * (4 / 3)} />
          )}
          {isExtracting && (
            <View style={styles.extractingOverlay}>
              <ActivityIndicator size="small" color={COLORS.OFF_WHITE} />
            </View>
          )}
        </View>

        <ColorSwatches colors={correctedColors} dominant={dominantColor} />

        <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1.5} style={styles.hintText}>
          손목의 색깔과 비교해보세요!
        </StrokedText>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={pickFromCamera}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1.5} style={styles.actionButtonText} numberOfLines={1}>
              사진 촬영
            </StrokedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={pickFromGallery}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1.5} style={styles.actionButtonText} numberOfLines={1}>
              갤러리 선택
            </StrokedText>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 50, alignItems: 'center' }}>
          <S.FooterAction onPress={handleStartAnalysis} style={{ opacity: imageUri ? 1 : 0.5 }}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.footerText} numberOfLines={1}>
              [ 분석 시작하기 ]
            </StrokedText>
          </S.FooterAction>

          <S.BackButton onPress={() => navigation.goBack()}>
            <S.BackButtonText>뒤로가기</S.BackButtonText>
          </S.BackButton>
        </View>
      </S.MainContent>
    </S.Container>
  );
}

function ColorSwatches({ colors, dominant }: { colors: string[]; dominant: string | null }) {
  const visible = colors.length > 0 ? colors.slice(0, 4) : dominant ? [dominant] : [];
  if (visible.length === 0) return null;
  return (
    <View style={styles.swatchRow}>
      {visible.map((color, i) => (
        <View key={i} style={[styles.swatch, { backgroundColor: color }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    color: '#333333',
    fontFamily: FONTS.PIXEL,
  },
  imagePreviewContainer: {
    width: width * 0.7,
    height: width * 0.7 * (4 / 3),
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#fafafa',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  extractingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fafafa',
  },
  hintText: {
    fontSize: 15,
    color: '#333333',
    fontFamily: FONTS.PIXEL,
    marginBottom: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fafafa',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#333333',
    fontFamily: FONTS.PIXEL,
  },
  footerText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
  },
  loadingCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  loadingText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
    marginTop: 4,
  },
});
