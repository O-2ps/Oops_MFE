import { login, logout, getProfile, KakaoOAuthToken, KakaoProfile } from '@react-native-seoul/kakao-login';

/**
 * 카카오 로그인을 실행합니다.
 * @returns {Promise<KakaoOAuthToken | null>} 카카오 인증 토큰
 */
export const loginWithKakao = async (): Promise<KakaoOAuthToken | null> => {
  try {
    const token = await login();
    return token;
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
