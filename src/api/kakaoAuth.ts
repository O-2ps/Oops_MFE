import { login, logout, getProfile, KakaoOAuthToken, KakaoProfile } from '@react-native-seoul/kakao-login';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const loginWithKakao = async (): Promise<any | null> => {
  try {
    const token = await login();

    if (!token) return null;

    const response = await fetch(`${API_BASE_URL}/api/auth/kakao/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ accessToken: token.accessToken })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Backend login failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const userData = await response.json();

    return {
      kakaoToken: token,
      user: userData
    };
  } catch (err: any) {
    if (err.code !== 'E_CANCELLED_OPERATION') {
      throw err;
    }
    return null;
  }
};

export const logoutWithKakao = async (): Promise<string | null> => {
  try {
    const message = await logout();
    return message;
  } catch {
    return null;
  }
};

export const getKakaoProfile = async (): Promise<KakaoProfile | null> => {
  try {
    const profile = await getProfile();
    return profile;
  } catch {
    return null;
  }
};
