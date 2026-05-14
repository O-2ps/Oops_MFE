/**
 * products.json 각 상품에 suitableFor 필드를 추가하는 스크립트
 * 실행: npx ts-node crawler/tag_tones.ts
 */

import * as fs from 'fs';
import * as path from 'path';

interface Product {
  goodsNo: string;
  name: string;
  brand: string;
  price: string;
  orgPrice: string;
  imageUrl: string;
  category: string;
  categoryId: string;
  suitableFor?: string[];
}

// 12개 서브톤 (assets/personal/ 파일명 기준)
const SUBTONES = {
  spring: ['spring_warm_bright', 'spring_warm_true', 'spring_warm_right'],
  summer: ['summer_cool_true', 'summer_cool_mute', 'summer_cool_right'],
  autumn: ['autumn_warm_true', 'autumn_warm_mute', 'autumn_warm_deep'],
  winter: ['winter_cool_true', 'winter_cool_bright', 'winter_cool_deep'],
} as const;

const MAKEUP_CATEGORIES = [
  '메이크업 > 립메이크업',
  '메이크업 > 베이스메이크업',
  '메이크업 > 아이메이크업',
];

const SKINCARE_CATEGORIES = [
  '스킨케어 > 스킨/토너',
  '스킨케어 > 에센스/세럼/앰플',
  '스킨케어 > 크림',
  '스킨케어 > 로션',
  '스킨케어 > 스킨케어세트',
];

// 피부타입별 키워드
const SKIN_TYPE_KEYWORDS: { type: string; keywords: string[] }[] = [
  { type: 'dry',         keywords: ['건성', '보습', '수분', '히알루론', '영양', '리페어', '딥모이스처', '모이스처', '수딩', '밀크', '버터', '크리미'] },
  { type: 'oily',        keywords: ['지성', '오일컷', '유분', '모공', '포어', '세부', '가벼운', '워터리', '젤', '라이트', '오일프리', '수분유분'] },
  { type: 'combination', keywords: ['복합', '중건성', '지복합', '밸런스', '수분밸런스', '중성', '티존'] },
  { type: 'normal',      keywords: ['진정', '민감', '시카', '저자극', '칼라민', '세라마이드', '판테놀', '진정케어'] },
];

// 시즌별 상품명 키워드 → 해당 시즌 서브톤 전체 매핑
const SEASON_KEYWORDS: { season: keyof typeof SUBTONES; keywords: string[] }[] = [
  {
    season: 'spring',
    keywords: ['코럴', '피치', '오렌지', '살구', '골드', '샴페인', '카퍼', '아이보리', '웜베이지', '옐로우', '버터', '망고', '스프링'],
  },
  {
    season: 'summer',
    keywords: ['핑크', '로즈', '라벤더', '라일락', '모브', '베이비', '스카이', '쿨핑크', '베이비핑크', '서머', '블러시'],
  },
  {
    season: 'autumn',
    keywords: ['테라코타', '브릭', '카멜', '카키', '올리브', '초콜릿', '어스', '머스타드', '브라운', '호박', '가을', '앰버', '카카오'],
  },
  {
    season: 'winter',
    keywords: ['퓨시아', '플럼', '스모키', '네이비', '버건디', '딥레드', '블랙베리', '체리', '와인', '겨울', '인텐스'],
  },
];

function detectSeason(name: string): keyof typeof SUBTONES | null {
  for (const { season, keywords } of SEASON_KEYWORDS) {
    if (keywords.some(kw => name.includes(kw))) return season;
  }
  return null;
}

function detectSkinType(name: string): string | null {
  for (const { type, keywords } of SKIN_TYPE_KEYWORDS) {
    if (keywords.some(kw => name.includes(kw))) return type;
  }
  return null;
}

function tagProducts(products: Product[]): Product[] {
  // 카테고리별 인덱스 추적 (키워드 없는 상품 균등 분배용)
  const categoryIndexMap: Record<string, number> = {};
  const seasons = Object.keys(SUBTONES) as (keyof typeof SUBTONES)[];
  const skinTypes = ['dry', 'oily', 'combination', 'normal'];

  return products.map(product => {
    const { category, name } = product;

    // 스킨케어 → 피부타입별 태깅
    if (SKINCARE_CATEGORIES.includes(category)) {
      const detected = detectSkinType(name);
      if (detected) {
        return { ...product, suitableFor: [`skin_${detected}`] };
      }
      // 키워드 없으면 카테고리별 인덱스로 4타입 균등 분배
      const idx = categoryIndexMap[category] ?? 0;
      categoryIndexMap[category] = idx + 1;
      const skinType = skinTypes[idx % 4];
      return { ...product, suitableFor: [`skin_${skinType}`] };
    }

    // 메이크업 → 톤 태깅
    if (MAKEUP_CATEGORIES.includes(category)) {
      const detected = detectSeason(name);
      if (detected) {
        return { ...product, suitableFor: [...SUBTONES[detected]] };
      }

      // 키워드 없으면 카테고리별 인덱스 기반으로 4시즌 균등 분배
      const idx = categoryIndexMap[category] ?? 0;
      categoryIndexMap[category] = idx + 1;
      const season = seasons[idx % 4];
      return { ...product, suitableFor: [...SUBTONES[season]] };
    }

    // 바디케어, 뷰티툴 등 기타 → 퍼스널컬러/피부타입 추천 제외
    return { ...product, suitableFor: [] };
  });
}

function main() {
  const inputPath = path.join(__dirname, '..', 'src', 'assets', 'products.json');
  let products: Product[];
  try {
    products = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
  } catch (err) {
    console.error('products.json 읽기 실패:', (err as Error).message);
    process.exit(1);
  }

  console.log(`총 ${products.length}개 상품 처리 중...`);

  const tagged = tagProducts(products);

  // 결과 통계
  const stats: Record<string, number> = {};
  for (const p of tagged) {
    for (const tone of p.suitableFor ?? []) {
      stats[tone] = (stats[tone] ?? 0) + 1;
    }
  }
  console.log('\n톤별 상품 수:');
  for (const [tone, count] of Object.entries(stats).sort()) {
    console.log(`  ${tone}: ${count}개`);
  }

  fs.writeFileSync(inputPath, JSON.stringify(tagged, null, 2), 'utf-8');
  console.log(`\n✅ ${inputPath} 업데이트 완료`);
}

main();
