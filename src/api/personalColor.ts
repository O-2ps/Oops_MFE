import { getToken } from '../utils/tokenStorage';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface SeasonInfo {
  season: string;
  subType?: string;
  description: string;
  palette: string[];
  characteristics: string[];
}

export const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) throw new Error('Health check failed');
  return response.json();
};

export const fetchSeasons = async (): Promise<SeasonInfo[]> => {
  const response = await fetch(`${API_BASE_URL}/api/personal-color/seasons`);
  if (!response.ok) throw new Error('Failed to fetch seasons');
  const responseJson = await response.json();
  return responseJson.data;
};

export const analyzePersonalColor = async (imageUri: string): Promise<any> => {
  // Vercel 서버리스 함수의 4.5MB 제한을 초과하지 않도록 업로드 전 이미지 리사이즈/압축
  let uploadUri = imageUri;
  try {
    const compressed = await manipulateAsync(
      imageUri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: SaveFormat.JPEG }
    );
    uploadUri = compressed.uri;
  } catch {
    // 압축 실패 시 원본 URI 사용
  }

  const formData = new FormData();
  formData.append('image', {
    uri: uploadUri,
    name: 'photo.jpg',
    type: 'image/jpeg',
  } as any);

  const token = await getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/personal-color/analyze`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) throw new Error('Failed to analyze image');
  return response.json();
};

export const getPersonalResult = async (): Promise<any> => {
  const token = await getToken();
  if (!token) return null;
  try {
    const response = await fetch(`${API_BASE_URL}/api/personal-color/result`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return null;
    const json = await response.json();
    return json.data ?? json;
  } catch {
    return null;
  }
};
