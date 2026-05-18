import AsyncStorage from '@react-native-async-storage/async-storage';
import { CrawledProduct } from './productRecommend';

const WISHLIST_KEY = 'oops_wishlist';

export const getWishlist = async (): Promise<CrawledProduct[]> => {
  try {
    const raw = await AsyncStorage.getItem(WISHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const toggleWishlist = async (product: CrawledProduct): Promise<boolean> => {
  const list = await getWishlist();
  const exists = list.some(p => p.goodsNo === product.goodsNo);
  if (exists) {
    await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(list.filter(p => p.goodsNo !== product.goodsNo)));
    return false;
  } else {
    await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify([...list, product]));
    return true;
  }
};

export const removeFromWishlist = async (goodsNo: string): Promise<void> => {
  const list = await getWishlist();
  await AsyncStorage.setItem(WISHLIST_KEY, JSON.stringify(list.filter(p => p.goodsNo !== goodsNo)));
};
