import { getToken } from '../utils/tokenStorage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface HistoryItem {
  id: string;
  type: 'skin' | 'personal';
  label: string;
  created_at: string;
  // skin
  skinType?: string;
  skinAge?: number;
  // personal
  personalType?: string;
  subType?: string;
}

export const getUserHistory = async (): Promise<HistoryItem[]> => {
  const token = await getToken();
  if (!token) throw new Error('로그인이 필요합니다.');

  const res = await fetch(`${API_BASE_URL}/api/user/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`history 조회 실패: ${res.status}`);
  const json = await res.json();
  return json.data ?? [];
};
