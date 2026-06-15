import {
  loginWithKakaoAccount,
  logout,
  getProfile,
  KakaoOAuthToken,
  KakaoProfile,
} from '@react-native-seoul/kakao-login';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

async function getKakaoToken(): Promise<KakaoOAuthToken> {
  // loginWithKakaoAccount: 시뮬레이터·실기기 모두 안정적으로 동작
  // (실기기에서도 카카오 계정 웹 로그인으로 진행됨)
  return await loginWithKakaoAccount();
}

// 2단계: 백엔드 전송 (실패해도 null 반환, throw 하지 않음)
async function sendToBackend(accessToken: string): Promise<any | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${API_BASE_URL}/api/auth/kakao/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ accessToken }),
      signal: controller.signal,
    }).finally(() => clearTimeout(timer));
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export const loginWithKakao = async (): Promise<any | null> => {
  try {
    const token = await getKakaoToken();
    if (!token) return null;

    const userData = await sendToBackend(token.accessToken);

    if (userData) {
      return { kakaoToken: token, user: userData };
    }

    // 백엔드 실패 → 카카오 프로필로 로컬 로그인 처리
    const profile = await getProfile().catch(() => null);
    return {
      kakaoToken: token,
      user: {
        token: token.accessToken,
        nickname: profile?.nickname ?? '사용자',
      },
    };
  } catch (err: any) {
    if (err.code === 'E_CANCELLED_OPERATION') return null;
    throw err;
  }
};

export const logoutWithKakao = async (): Promise<string | null> => {
  try {
    return await logout();
  } catch {
    return null;
  }
};

export const getKakaoProfile = async (): Promise<KakaoProfile | null> => {
  try {
    return await getProfile();
  } catch {
    return null;
  }
};
