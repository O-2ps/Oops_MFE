import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_COLOR = 'oops_last_color_result';
const KEY_SKIN = 'oops_last_skin_result';

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
