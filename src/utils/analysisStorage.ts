import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_COLOR = 'oops_last_color_result';
const KEY_SKIN = 'oops_last_skin_result';
const KEY_HISTORY = 'oops_local_history';
const MAX_HISTORY = 20;

export interface LocalHistoryItem {
  id: string;
  type: 'skin' | 'personal';
  label: string;
  created_at: string;
  skinType?: string;
  skinAge?: number;
  personalType?: string;
  subType?: string;
}

export async function saveToLocalHistory(item: Omit<LocalHistoryItem, 'id' | 'created_at'>): Promise<void> {
  try {
    const existing = await getLocalHistory();
    const newItem: LocalHistoryItem = {
      ...item,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    const updated = [newItem, ...existing].slice(0, MAX_HISTORY);
    await AsyncStorage.setItem(KEY_HISTORY, JSON.stringify(updated));
  } catch {}
}

export async function getLocalHistory(): Promise<LocalHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_HISTORY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export interface SavedColorResult {
  type: string;
  subType?: string;
  savedAt: string;
}

export interface SavedSkinResult {
  skinType: string;
  skinTypeLabel: string;
  savedAt: string;
}

export async function saveColorResult(type: string, subType?: string): Promise<void> {
  await AsyncStorage.setItem(KEY_COLOR, JSON.stringify({ type, subType, savedAt: new Date().toISOString() }));
}

export async function getSavedColorResult(): Promise<SavedColorResult | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_COLOR);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveSkinResult(skinType: string, skinTypeLabel: string): Promise<void> {
  await AsyncStorage.setItem(KEY_SKIN, JSON.stringify({ skinType, skinTypeLabel, savedAt: new Date().toISOString() }));
}

export async function getSavedSkinResult(): Promise<SavedSkinResult | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_SKIN);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
