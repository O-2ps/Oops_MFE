import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY       = 'oops_jwt_token';
const NICKNAME_KEY    = 'oops_nickname';
const CHARACTER_ID_KEY = 'oops_character_id';

export const saveToken = async (token: string): Promise<void> => {
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

export const removeToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};

export const saveNickname = async (nickname: string): Promise<void> => {
  await AsyncStorage.setItem(NICKNAME_KEY, nickname);
};

export const getNickname = async (): Promise<string | null> => {
  return AsyncStorage.getItem(NICKNAME_KEY);
};

export const saveCharacterId = async (id: number): Promise<void> => {
  await AsyncStorage.setItem(CHARACTER_ID_KEY, String(id));
};

export const getCharacterId = async (): Promise<number | null> => {
  const v = await AsyncStorage.getItem(CHARACTER_ID_KEY);
  return v ? Number(v) : null;
};

export const clearAuth = async (): Promise<void> => {
  await AsyncStorage.multiRemove([TOKEN_KEY, NICKNAME_KEY, CHARACTER_ID_KEY]);
};
