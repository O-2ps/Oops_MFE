const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
import { getToken } from '../utils/tokenStorage';

export interface SeasonInfo {
  season: string;
  subType?: string;
  description: string;
  palette: string[];
  characteristics: string[];
}

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  } catch (error) {
    console.error('checkHealth error:', error);
    throw error;
  }
};

export const fetchSeasons = async (): Promise<SeasonInfo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/personal-color/seasons`);
    if (!response.ok) {
      throw new Error('Failed to fetch seasons');
    }
    const responseJson = await response.json();
    return responseJson.data;
  } catch (error) {
    console.error('fetchSeasons error:', error);
    throw error;
  }
};

export const analyzePersonalColor = async (imageUri: string): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    const token = await getToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/personal-color/analyze`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }
    return response.json();
  } catch (error) {
    console.error('analyzePersonalColor error:', error);
    throw error;
  }
};
