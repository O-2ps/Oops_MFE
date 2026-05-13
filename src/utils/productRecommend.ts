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
        { name: '코럴', hex: '#FFB3A7' },
        { name: '피치', hex: '#FFCFC7' },
        { name: '살구', hex: '#FFD6C2' },
        { name: '오렌지레드', hex: '#FFB0A0' },
      ],
    },
    {
      label: '아이',
      chips: [
        { name: '샴페인', hex: '#FFE4DC' },
        { name: '골드', hex: '#FFD0B8' },
        { name: '피치브라운', hex: '#FFBCAA' },
        { name: '카퍼', hex: '#FFC4A8' },
      ],
    },
    {
      label: '베이스',
      chips: [
        { name: '아이보리', hex: '#FFE8E0' },
        { name: '웜베이지', hex: '#FFD8CC' },
      ],
    },
  ],
  summer: [
    {
      label: '립',
      chips: [
        { name: '로즈핑크', hex: '#A8D8EA' },
        { name: '모브', hex: '#B8E0F0' },
        { name: '핑크베이지', hex: '#C8EEF8' },
        { name: '라즈베리', hex: '#90C8E0' },
      ],
    },
    {
      label: '아이',
      chips: [
        { name: '라벤더', hex: '#B0D4F0' },
        { name: '라일락', hex: '#A8CCE8' },
        { name: '베이비블루', hex: '#C0E8F8' },
        { name: '민트', hex: '#A8E4D8' },
      ],
    },
    {
      label: '베이스',
      chips: [
        { name: '쿨베이지', hex: '#D0ECF8' },
        { name: '아이스핑크', hex: '#D8EEF4' },
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
        { name: '초콜릿', hex: '#7B4020' },
      ],
    },
    {
      label: '베이스',
      chips: [
        { name: '골든베이지', hex: '#D4A060' },
        { name: '웜오클', hex: '#C08040' },
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
        { name: '그레이', hex: '#8090A8' },
        { name: '네이비', hex: '#2A3870' },
        { name: '플럼', hex: '#6A3878' },
        { name: '블랙', hex: '#303040' },
      ],
    },
    {
      label: '베이스',
      chips: [
        { name: '쿨아이보리', hex: '#E8EEF4' },
        { name: '핑크포슬린', hex: '#E8D8E0' },
      ],
    },
  ],
  skin: [],
};
