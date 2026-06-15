import { getCharacterId } from '../utils/tokenStorage';

const BASE = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const KEY  = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
};

export interface HistoryItem {
  id: string;
  type: 'skin' | 'personal';
  label: string;
  created_at: string;
  skinType?: string;
  skinAge?: number;
  personalType?: string;
  subType?: string;
}

const SKIN_LABELS: Record<string, string> = {
  dry:         '건성 피부',
  oily:        '지성 피부',
  combination: '복합성 피부',
  sensitive:   '민감성 피부',
  normal:      '중성 피부',
};

export const savePersonalResult = async (personaltype: string, subType?: string): Promise<void> => {
  const characterId = await getCharacterId();
  if (!characterId) return;

  await fetch(`${BASE}/rest/v1/personal`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ user_id: characterId, personaltype, subType }),
  });
};

export const saveSkinAnalysisResult = async (skintype: string, age: number | null): Promise<void> => {
  const characterId = await getCharacterId();
  if (!characterId) return;

  await fetch(`${BASE}/rest/v1/skin`, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ user_id: characterId, skintype, ...(age != null ? { age } : {}) }),
  });
};

export const getUserHistory = async (): Promise<HistoryItem[]> => {
  const characterId = await getCharacterId();
  if (!characterId) throw new Error('로그인이 필요합니다.');

  const [personalRes, skinRes] = await Promise.all([
    fetch(
      `${BASE}/rest/v1/personal?user_id=eq.${characterId}&select=id,personaltype,subType,created_at&order=created_at.desc`,
      { headers },
    ),
    fetch(
      `${BASE}/rest/v1/skin?user_id=eq.${characterId}&select=id,skintype,age,created_at&order=created_at.desc`,
      { headers },
    ),
  ]);

  const personalRows: any[] = personalRes.ok ? await personalRes.json() : [];
  const skinRows: any[]     = skinRes.ok     ? await skinRes.json()     : [];

  const personalItems: HistoryItem[] = personalRows.map((row) => ({
    id:           String(row.id),
    type:         'personal',
    label:        row.subType ?? row.personaltype ?? '퍼스널컬러',
    personalType: row.personaltype,
    subType:      row.subType,
    created_at:   row.created_at,
  }));

  const skinItems: HistoryItem[] = skinRows.map((row) => ({
    id:        String(row.id),
    type:      'skin',
    label:     SKIN_LABELS[row.skintype] ?? row.skintype ?? '피부 진단',
    skinType:  row.skintype,
    skinAge:   row.age,
    created_at: row.created_at,
  }));

  return [...personalItems, ...skinItems].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
};
