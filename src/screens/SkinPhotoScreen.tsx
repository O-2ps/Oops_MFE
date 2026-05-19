import React, { useState } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import StrokedText from '../components/StrokedText';
import FaceGuide from '../components/FaceGuide';
import { COLORS } from '../constants/theme';
import { RootStackParamList } from '../types/navigation';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SkinPhoto'>;

export default function SkinPhotoScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const requestPermissions = async () => {
    const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
    const mediaStatus = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus.status !== 'granted' || mediaStatus.status !== 'granted') {
      Alert.alert('권한 필요', '카메라 및 갤러리 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handlePickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleNext = () => {
    if (!imageUri) {
      Alert.alert('사진 등록 필요', '피부 사진을 먼저 등록해주세요.');
      return;
    }
    navigation.navigate('Survey');
  };

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>

      <S.MainContent>
        <View style={{ marginBottom: 30 }}>
          <StrokedText strokeColor="#fafafa" strokeWidth={2.5} style={styles.title}>
            피부 사진을 등록해주세요
          </StrokedText>
        </View>

        <View style={styles.imagePreviewContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.imagePreview} />
          ) : (
            <FaceGuide width={width * 0.7} height={width * 0.7 * (4 / 3)} />
          )}
        </View>

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
          <S.FooterAction onPress={handleNext} style={{ opacity: imageUri ? 1 : 0.5 }}>
            <StrokedText strokeColor="#fafafa" strokeWidth={2} style={styles.footerText}>
              [ 다음으로 ]
            </StrokedText>
          </S.FooterAction>

          <S.BackButton onPress={() => navigation.goBack()}>
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
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#fafafa',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    backgroundColor: 'rgba(255,255,255,0.5)',
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
});
