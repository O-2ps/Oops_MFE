import { useState, useRef } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import ImageColors from 'react-native-image-colors';
import { extractHexColors } from '../utils/colorAnalysis';
import { removeBackgroundHF, saveBase64ToCache } from '../utils/backgroundRemoval';

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
  isRemovingBg: boolean;
}

export interface ImageColorPickerActions {
  pickFromCamera: () => Promise<void>;
  pickFromGallery: () => Promise<void>;
  reset: () => void;
}

// 사용자가 지정한 볼 영역(오른쪽 볼) 크롭
async function cropFaceCenter(uri: string): Promise<string> {
  try {
    const info = await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.JPEG });
    const { width, height } = info;

    // 세로: 52% ~ 65% (다크서클 피해서 눈 아래쪽 볼 중앙)
    // 가로: 55% ~ 75% (동그라미 친 오른쪽 볼 영역)
    const originX = Math.round(width * 0.55);
    const originY = Math.round(height * 0.52);
    const cropWidth = Math.round(width * 0.20);
    const cropHeight = Math.round(height * 0.13);

    const cropped = await ImageManipulator.manipulateAsync(
      uri,
      [{ crop: { originX, originY, width: cropWidth, height: cropHeight } }],
      { format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 }
    );
    return cropped.uri;
  } catch {
    return uri;
  }
}

// 추출된 피부색을 맑고 화사하게 보정 (탁해짐 방지)
function brightenHex(hex: string): string {
  // 1. Hex -> HSL 변환 직접 파싱
  const clean = hex.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
  const rNorm = parseInt(clean.slice(0, 2), 16) / 255;
  const gNorm = parseInt(clean.slice(2, 4), 16) / 255;
  const bNorm = parseInt(clean.slice(4, 6), 16) / 255;
  
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let hVal = 0, sVal = 0, lVal = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    sVal = lVal > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rNorm) hVal = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6;
    else if (max === gNorm) hVal = ((bNorm - rNorm) / d + 2) / 6;
    else hVal = ((rNorm - gNorm) / d + 4) / 6;
  }
  hVal *= 360;

  // 2. 탁해짐(낮은 채도, 중간 명도) 방지를 위해 강력한 보정
  // 단순히 곱하는 대신 절대 수치를 더해주어 확실히 생기있게 만듭니다.
  // 채도(S)는 최소 +15% 더해주고 (최대 100%), 명도(L)는 최소 +15% 더하며 최소 75%의 밝기를 보장합니다.
  const newS = Math.min(1, sVal + 0.18); // 생기 팍팍
  const newL = Math.min(1, Math.max(0.75, lVal + 0.15)); // 화사하게 (최소 75% 밝기 보장)

  // 3. HSL -> RGB 변환
  const k = (n: number) => (n + hVal / 30) % 12;
  const a = newS * Math.min(newL, 1 - newL);
  const f = (n: number) => newL - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  
  const rOut = Math.round(255 * f(0));
  const gOut = Math.round(255 * f(8));
  const bOut = Math.round(255 * f(4));

  return '#' + [rOut, gOut, bOut].map(v => v.toString(16).padStart(2, '0')).join('');
}

export function useImageColorPicker(): ImageColorPickerState & ImageColorPickerActions {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [correctedColors, setCorrectedColors] = useState<string[]>([]);
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isRemovingBg, setIsRemovingBg] = useState(false);

  const correctedColorsRef = useRef<string[]>([]);
  correctedColorsRef.current = correctedColors;

  const extractAndCorrect = async (uri: string) => {
    setIsExtracting(true);
    try {
      // 코/앞볼 영역만 크롭하여 피부색 추출
      const croppedUri = await cropFaceCenter(uri);
      const colorResult = await ImageColors.getColors(croppedUri, { fallback: '#D4A574', cache: false });
      const extracted = extractHexColors(colorResult);
      
      // 추출된 색상들을 조금 더 하얗고 밝게 보정
      const brightened = extracted.map(c => brightenHex(c));
      
      setCorrectedColors(brightened);
      setDominantColor(brightened[0] ?? '#D4A574');
    } catch {
      setDominantColor('#D4A574');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleResult = async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.length) return;
    const { uri } = result.assets[0];
    setImageUri(uri);
    setCorrectedColors([]);
    setDominantColor(null);

    setIsRemovingBg(true);
    let processedUri = uri;
    try {
      const transparentPng = await removeBackgroundHF(uri);
      // 투명 PNG를 캐시에 저장 → 흰 배경 컨테이너 위에 렌더링하면 흰 배경처럼 보임
      processedUri = await saveBase64ToCache(transparentPng, 'png');
      setImageUri(processedUri);
    } catch {
      // 배경 제거 실패 시 원본 이미지로 계속 진행 (볼 크롭으로 색상 추출하므로 무관)
    } finally {
      setIsRemovingBg(false);
    }

    await extractAndCorrect(processedUri);
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

  return { imageUri, correctedColors, dominantColor, isExtracting, isRemovingBg, pickFromCamera, pickFromGallery, reset };
}
