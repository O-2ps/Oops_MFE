import ALL_PRODUCTS from '../assets/products.json';

export interface CrawledProduct {
  goodsNo: string;
  name: string;
  brand: string;
  price: string;
  orgPrice: string;
  imageUrl: string;
  category: string;
  categoryId: string;
}

// 시즌 → 우선 카테고리 매핑
const SEASON_CATEGORIES: Record<string, string[]> = {
  spring: ['메이크업 > 립메이크업', '메이크업 > 베이스메이크업', '메이크업 > 아이메이크업'],
  summer: ['메이크업 > 아이메이크업', '메이크업 > 립메이크업', '메이크업 > 베이스메이크업'],
  autumn: ['메이크업 > 베이스메이크업', '메이크업 > 립메이크업', '메이크업 > 아이메이크업'],
  winter: ['메이크업 > 립메이크업', '메이크업 > 아이메이크업', '메이크업 > 베이스메이크업'],
  skin:   ['스킨케어 > 스킨/토너', '스킨케어 > 에센스/세럼/앰플', '스킨케어 > 크림', '스킨케어 > 로션'],
};

/** 시즌에 맞는 카테고리 상품 풀 반환 */
export function getProductPool(type: string): CrawledProduct[] {
  const categories = SEASON_CATEGORIES[type] ?? SEASON_CATEGORIES.spring;
  return (ALL_PRODUCTS as CrawledProduct[]).filter(p =>
    categories.includes(p.category)
  );
}

/** pool 에서 n 개 무작위 비복원 추출 */
export function sampleProducts(pool: CrawledProduct[], n: number): CrawledProduct[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export interface ColorChip {
  name: string;
  hex: string;
}

export interface ColorCategory {
  label: string;
  chips: ColorChip[];
}

// 시즌별 어울리는 색조 팔레트
export const SEASON_COLOR_PALETTE: Record<string, ColorCategory[]> = {
  spring: [
    {
      label: '립',
      chips: [
        { name: '코럴', hex: '#FF6F4A' },
        { name: '피치', hex: '#FFB49A' },
        { name: '살구', hex: '#FFBE85' },
        { name: '오렌지레드', hex: '#FF5533' },
      ],
    },
    {
      label: '아이',
      chips: [
        { name: '샴페인', hex: '#F7E1BB' },
        { name: '골드', hex: '#E8B84B' },
        { name: '피치브라운', hex: '#C68B59' },
        { name: '카퍼', hex: '#B87333' },
      ],
    },
    {
      label: '베이스',
      chips: [
        { name: '아이보리', hex: '#FFF3DC' },
        { name: '웜베이지', hex: '#F0D4A8' },
      ],
    },
  ],
  summer: [
    {
      label: '립',
      chips: [
        { name: '로즈핑크', hex: '#F06292' },
        { name: '모브', hex: '#C07BA0' },
        { name: '핑크베이지', hex: '#F2B8C0' },
        { name: '라즈베리', hex: '#C04E78' },
      ],
    },
    {
      label: '아이',
      chips: [
        { name: '라벤더', hex: '#C5B3E6' },
        { name: '라일락', hex: '#C8A2C8' },
        { name: '베이비핑크', hex: '#FFB6C1' },
        { name: '스모키그레이', hex: '#A0A0B8' },
      ],
    },
    {
      label: '베이스',
      chips: [
        { name: '쿨베이지', hex: '#E8D5C4' },
        { name: '핑크베이지', hex: '#F2C8C0' },
      ],
    },
  ],
  autumn: [
    {
      label: '립',
      chips: [
        { name: '테라코타', hex: '#C8603A' },
        { name: '브릭레드', hex: '#B84040' },
        { name: '버건디', hex: '#8B2030' },
        { name: '카멜', hex: '#C19A6B' },
      ],
    },
    {
      label: '아이',
      chips: [
        { name: '카키', hex: '#7A8B4A' },
        { name: '올리브', hex: '#808040' },
        { name: '카멜브라운', hex: '#A06830' },
        { name: '테라코타', hex: '#C86040' },
      ],
    },
    {
      label: '베이스',
      chips: [
        { name: '골든베이지', hex: '#E8C090' },
        { name: '웜오클', hex: '#D4A060' },
      ],
    },
  ],
  winter: [
    {
      label: '립',
      chips: [
        { name: '딥레드', hex: '#8B0000' },
        { name: '버건디', hex: '#6B001A' },
        { name: '블랙베리', hex: '#4A0830' },
        { name: '퓨시아', hex: '#D40070' },
      ],
    },
    {
      label: '아이',
      chips: [
        { name: '그레이', hex: '#707080' },
        { name: '네이비', hex: '#1A2060' },
        { name: '플럼', hex: '#7A3870' },
        { name: '블랙', hex: '#202020' },
      ],
    },
    {
      label: '베이스',
      chips: [
        { name: '쿨아이보리', hex: '#F4F0EE' },
        { name: '핑크포슬린', hex: '#EED8D8' },
      ],
    },
  ],
  skin: [],
};
