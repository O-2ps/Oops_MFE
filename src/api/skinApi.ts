import { getToken } from '../utils/tokenStorage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface SkinOption {
  value: string;
  label: string;
  score: number;
}

export interface SkinQuestion {
  id: string;
  question: string;
  options: SkinOption[];
}

export interface SkinDiagnoseBody {
  age: number;
  answers: Record<string, string>;
}

export interface SkinDiagnoseResult {
  skinType: string;
  description?: string;
  [key: string]: any;
}

export interface SkinResultResponse {
  skinType: string;
  description?: string;
  diagnosedAt?: string;
  [key: string]: any;
}

/**
 * GET /api/skin/questions
 * 설문 문항 5개 + 선택지 반환 (인증 불필요)
 */
export const getSkinQuestions = async (): Promise<SkinQuestion[]> => {
  const response = await fetch(`${API_BASE_URL}/api/skin/questions`);
  if (!response.ok) {
    throw new Error(`Failed to fetch skin questions: ${response.status}`);
  }
  const json = await response.json();
  return json.data ?? json;
};

/**
 * POST /api/skin/diagnose
 * 설문 답변으로 피부 진단 (인증 불필요, 로그인 시 자동 저장)
 */
export const diagnoseSkin = async (body: SkinDiagnoseBody): Promise<SkinDiagnoseResult> => {
  const token = await getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/api/skin/diagnose`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Skin diagnose failed: ${response.status} - ${errorText}`);
  }
  const json = await response.json();
  return json.data ?? json;
};

/**
 * GET /api/skin/result
 * 최근 진단 결과 조회 (인증 필요)
 */
export const getSkinResult = async (): Promise<SkinResultResponse> => {
  const token = await getToken();
  if (!token) throw new Error('로그인이 필요합니다.');

  const response = await fetch(`${API_BASE_URL}/api/skin/result`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch skin result: ${response.status} - ${errorText}`);
  }
  return response.json();
};
