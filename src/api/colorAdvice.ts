// productShades.json은 scripts/scrapeShades.js 실행 후 생성됨
let PRODUCT_SHADES: Record<string, string[]> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PRODUCT_SHADES = require('../assets/productShades.json');
} catch {
  // 아직 스크랩 전이면 빈 객체로 시작
}

const SEASON_KO: Record<string, string> = {
  spring: '봄 웜톤',
  summer: '여름 쿨톤',
  autumn: '가을 웜톤',
  winter: '겨울 쿨톤',
};

// 시즌별로 어울리는 색감 키워드 → 색상명에서 찾음
const SEASON_SHADE_KEYWORDS: Record<string, string[]> = {
  spring: [
    '피치', '복숭아', '살구', '코럴', '산호', '오렌지', '아프리콧',
    '웜핑크', '누드', '베이지', '아이보리', '비스킷', '시럽',
    '멜론', '망고', '파파야', '캐롯', '선셋',
    '쨈', '잼', '꿀', '카라멜', '버터', '크림',
    '딸기(밝)', '사과(밝)', '쥬스', '젤리', '캔디',
  ],
  summer: [
    '핑크', '로즈', '모브', '라벤더', '라일락', '블러셔',
    '딸기', '라즈베리', '수박', '체리(연)', '포도(연)',
    '쿨', '소프트', '뮬베리', '블로섬', '플로럴',
    '피오니', '밀크티', '아쿠아',
  ],
  autumn: [
    '테라코타', '테라', '브릭', '버건디', '카멜', '카키',
    '올리브', '초콜릿', '쇼콜라', '모카', '코코아', '카카오',
    '브라운', '갈색', '어스', '무화과', '호두', '넛',
    '사과', '토피', '마롱', '마론', '스파이스', '시나몬',
    '카라멜', '꿀', '진저', '체리', '크랜베리', '와인(웜)',
    '앰버', '로스팅', '밤', '도토리',
  ],
  winter: [
    '블랙', '흑', '다크', '딥', '네이비', '블루',
    '플럼', '포도', '퓨시아', '핫핑크', '와인', '차콜',
    '그레이', '실버', '인디고', '바이올렛', '퍼플',
    '블루베리', '쿨레드', '벨벳', '잉크', '미드나잇',
    '체리(딥)', '버건디(쿨)', '매그놀리아',
  ],
};

function filterShadesBySeason(shades: string[], season: string): string[] {
  const keywords = SEASON_SHADE_KEYWORDS[season] ?? [];
  return shades.filter(shade =>
    keywords.some(kw => shade.includes(kw.replace('(밝)', '').replace('(연)', '').replace('(딥)', '').replace('(쿨)', '').replace('(웜)', '')))
  );
}

async function fetchOliveyoungShades(goodsNo: string): Promise<string[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  const response = await fetch(
    `https://www.oliveyoung.co.kr/store/goods/getGoodsDetail.do?goodsNo=${goodsNo}`,
    {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'ko-KR,ko;q=0.9',
        'Accept': 'text/html',
      },
    }
  ).catch(() => null).finally(() => clearTimeout(timer));

  if (!response || !response.ok) return [];
  const html = await response.text().catch(() => '');

  const shades: string[] = [];
  let m: RegExpExecArray | null;
  const re = /data-name="([^"]{1,40})"/g;
  while ((m = re.exec(html)) !== null) {
    const v = m[1].trim();
    if (v && !shades.includes(v)) shades.push(v);
  }
  return shades;
}

function buildAdviceText(matched: string[], allShades: string[], seasonKo: string, paletteColors: string[]): string {
  if (matched.length > 0) {
    const list = matched.join(', ');
    return `${seasonKo}에 어울리는 색상: ${list}\n전체 색상 ${allShades.length}개 중 추천이에요!`;
  }
  // 매칭 없으면 전체 목록 + 계열 안내
  const hint = paletteColors.slice(0, 2).join(', ');
  const all = allShades.slice(0, 6).join(', ');
  return `전체 색상: ${all}\n${seasonKo}에는 ${hint} 계열 색상을 골라보세요!`;
}

export async function getShadeAdvice(
  productName: string,
  season: string,
  paletteColors: string[],
  category?: string,
  goodsNo?: string,
): Promise<string> {
  const seasonKo = SEASON_KO[season] ?? season;

  if (goodsNo) {
    // 1순위: 로컬 DB
    const localShades = PRODUCT_SHADES[goodsNo];
    if (localShades && localShades.length > 0) {
      const matched = filterShadesBySeason(localShades, season);
      return buildAdviceText(matched, localShades, seasonKo, paletteColors);
    }

    // 2순위: 실시간 fetch
    const shades = await fetchOliveyoungShades(goodsNo);
    if (shades.length > 0) {
      const matched = filterShadesBySeason(shades, season);
      return buildAdviceText(matched, shades, seasonKo, paletteColors);
    }
  }

  const hint = paletteColors.slice(0, 2).join(', ');
  return `${seasonKo}에는 ${hint} 계열 색상이 잘 어울려요!`;
}
