import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import ImageColors from 'react-native-image-colors';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import StrokedText from '../components/StrokedText';
import FaceGuide from '../components/FaceGuide';
import { COLORS } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';
import { analyzePersonalColor } from '../api/personalColor';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PhotoUpload'>;

export default function PhotoUploadScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const requestPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
      Alert.alert('카메라 및 갤러리 접근 권한이 필요합니다.', '카메라 및 갤러리 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  const handleImageSelection = async (useCamera: boolean) => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const options: any = {
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    };

    let result = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      setDominantColor(null);
      extractDominantColor(uri);
    }
  };

  const extractDominantColor = async (uri: string) => {
    try {
      const colors = await ImageColors.getColors(uri, { fallback: '#888888', cache: false });
      let color: string | undefined;
      if (colors.platform === 'android') {
        color = colors.dominant ?? colors.average ?? colors.vibrant;
      } else if (colors.platform === 'ios') {
        color = colors.primary ?? colors.secondary;
      } else {
        color = colors.dominant;
      }
      setDominantColor(color ?? '#888888');
    } catch {
      setDominantColor('#888888');
    }
  };

  const handleTakePhoto = () => handleImageSelection(true);
  const handlePickImage = () => handleImageSelection(false);

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
        analysisData: resultData
      });
    } catch (error) {
      Alert.alert('분석 실패', '사진 분석 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (isAnalyzing) {
    return (
      <S.Container>
        <View style={StyleSheet.absoluteFill}>
          <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
        </View>
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={COLORS.PRIMARY} />
          <StrokedText strokeColor="#fafafa" strokeWidth={2} style={styles.loadingText}>
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
          <StrokedText strokeColor="#fafafa" strokeWidth={2.5} style={styles.title}>
            얼굴 사진을 등록해주세요
          </StrokedText>
        </View>

        <View style={styles.imagePreviewContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <FaceGuide width={width * 0.7} height={width * 0.7 * (4 / 3)} />
          )}
          {dominantColor && (
            <View style={[styles.colorSwatch, { backgroundColor: dominantColor }]} />
          )}
        </View>

        <StrokedText strokeColor="#fafafa" strokeWidth={1.5} style={styles.hintText}>
          손목의 색깔과 비교해보세요!
        </StrokedText>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleTakePhoto}>
            <StrokedText strokeColor="#fafafa" strokeWidth={1.5} style={styles.actionButtonText}>
              사진 촬영
            </StrokedText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handlePickImage}>
            <StrokedText strokeColor="#fafafa" strokeWidth={1.5} style={styles.actionButtonText}>
              갤러리 선택
            </StrokedText>
          </TouchableOpacity>
        </View>

        <View style={{ marginTop: 50, alignItems: 'center' }}>
          <S.FooterAction onPress={handleStartAnalysis} style={{ opacity: imageUri ? 1 : 0.5 }}>
            <StrokedText strokeColor="#fafafa" strokeWidth={2} style={styles.footerText}>
              [ 분석 시작하기 ]
            </StrokedText>
          </S.FooterAction>

          <S.BackButton onPress={handleBack}>
            <S.BackButtonText style={{ color: '#fafafa', opacity: 0.8 }}>뒤로가기</S.BackButtonText>
          </S.BackButton>
        </View>
      </S.MainContent>
    </S.Container>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
  },
  imagePreviewContainer: {
    width: width * 0.7,
    height: width * 0.7 * (4 / 3),
    backgroundColor: '#rgba(255, 255, 255, 0.3)',
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#fafafa',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  hintText: {
    fontSize: 15,
    color: '#333333',
    fontFamily: 'DOSIyagiBoldface',
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
    fontFamily: 'DOSIyagiBoldface',
  },
  footerText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontFamily: 'DOSIyagiBoldface',
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
    fontFamily: 'DOSIyagiBoldface',
    marginTop: 4,
  },
  colorSwatch: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#fafafa',
  },
});
