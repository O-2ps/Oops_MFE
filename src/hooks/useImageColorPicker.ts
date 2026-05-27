import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ImageColors from 'react-native-image-colors';
import { extractHexColors } from '../utils/colorAnalysis';
import { applySkinToneCorrection } from '../utils/skinToneCorrection';

const PICKER_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ['images'],
  allowsEditing: true,
  aspect: [3, 4],
  quality: 0.8,
};

async function requestPermissions(): Promise<boolean> {
  const [camera, media] = await Promise.all([
    ImagePicker.requestCameraPermissionsAsync(),
    ImagePicker.requestMediaLibraryPermissionsAsync(),
  ]);
  if (camera.status !== 'granted' || media.status !== 'granted') {
    Alert.alert('권한 필요', '카메라 및 갤러리 접근 권한이 필요합니다.');
    return false;
  }
  return true;
}

export interface ImageColorPickerState {
  imageUri: string | null;
  correctedColors: string[];
  dominantColor: string | null;
  isExtracting: boolean;
}

export interface ImageColorPickerActions {
  pickFromCamera: () => Promise<void>;
  pickFromGallery: () => Promise<void>;
  reset: () => void;
}

export function useImageColorPicker(): ImageColorPickerState & ImageColorPickerActions {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [correctedColors, setCorrectedColors] = useState<string[]>([]);
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // ref로 최신 색상값을 컴포넌트 외부에서도 접근 가능하게 유지
  const correctedColorsRef = useRef<string[]>([]);
  correctedColorsRef.current = correctedColors;

  const extractAndCorrect = async (uri: string) => {
    setIsExtracting(true);
    try {
      const colorResult = await ImageColors.getColors(uri, { fallback: '#D4A574', cache: false });
      const raw = extractHexColors(colorResult);
      const corrected = applySkinToneCorrection(raw);

      setCorrectedColors(corrected);
      setDominantColor(corrected[0] ?? '#D4A574');
    } catch {
      setDominantColor('#D4A574');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleResult = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.length) return;
    const uri = result.assets[0].uri;
    setImageUri(uri);
    setCorrectedColors([]);
    setDominantColor(null);
    await extractAndCorrect(uri);
  };

  const pickFromCamera = async () => {
    if (!(await requestPermissions())) return;
    const result = await ImagePicker.launchCameraAsync(PICKER_OPTIONS);
    await handleResult(result);
  };

  const pickFromGallery = async () => {
    if (!(await requestPermissions())) return;
    const result = await ImagePicker.launchImageLibraryAsync(PICKER_OPTIONS);
    await handleResult(result);
  };

  const reset = () => {
    setImageUri(null);
    setCorrectedColors([]);
    setDominantColor(null);
  };

  return { imageUri, correctedColors, dominantColor, isExtracting, pickFromCamera, pickFromGallery, reset };
}
