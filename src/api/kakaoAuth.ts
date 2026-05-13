import { login, logout, getProfile, KakaoOAuthToken, KakaoProfile } from '@react-native-seoul/kakao-login';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

/**
 * 카카오 로그인을 실행하고 백엔드 서버에 토큰을 전송합니다.
 * @returns {Promise<{token: KakaoOAuthToken, user: any} | null>} 성공 시 토큰과 백엔드 유저 정보
 */
export const loginWithKakao = async (): Promise<any | null> => {
  try {
    const token = await login();

    if (!token) return null;

    console.log('Sending token to backend:', { hasAccessToken: !!token.accessToken, hasIdToken: !!token.idToken });

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
      console.error('Backend Login Failed:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Backend login failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const userData = await response.json();

    return {
      kakaoToken: token,
      user: userData
    };
  } catch (err: any) {
    if (err.code === 'E_CANCELLED_OPERATION') {
      console.log('Login Cancelled');
    } else {
      console.error('Kakao Login Error:', err);
    }
    return null;
  }
};

/**
 * 카카오 로그아웃을 실행합니다.
 */
export const logoutWithKakao = async (): Promise<string | null> => {
  try {
    const message = await logout();
    return message;
  } catch (err) {
    console.error('Kakao Logout Error:', err);
    return null;
  }
};

/**
 * 로그인된 사용자의 카카오 프로필 정보를 가져옵니다.
 */
export const getKakaoProfile = async (): Promise<KakaoProfile | null> => {
  try {
    const profile = await getProfile();
    return profile;
  } catch (err) {
    console.error('Get Kakao Profile Error:', err);
    return null;
  }
};
