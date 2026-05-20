export function hexToHSL(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
  if (clean.length < 6) return { h: 0, s: 0, l: 50 };
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function scoreColorForSeason(hex: string, season: string): number {
  const { h, s, l } = hexToHSL(hex);
  if (s < 8) return 50;
  const isWarm = (h >= 0 && h <= 65) || (h >= 340 && h <= 360);
  const isCool = h >= 175 && h <= 295;
  switch (season) {
    case 'spring': {
      const a = isWarm ? 1.0 : isCool ? 0.1 : 0.5;
      const b = s > 50 ? 1.0 : s > 30 ? 0.7 : 0.3;
      const c = l >= 45 && l <= 85 ? 1.0 : 0.3;
      return Math.round(a * 40 + b * 35 + c * 25);
    }
    case 'summer': {
      const a = isCool ? 1.0 : isWarm ? 0.1 : 0.5;
      const b = s < 55 ? 1.0 : s < 75 ? 0.6 : 0.2;
      const c = l >= 45 && l <= 80 ? 1.0 : 0.35;
      return Math.round(a * 40 + b * 35 + c * 25);
    }
    case 'autumn': {
      const a = isWarm ? 1.0 : isCool ? 0.1 : 0.55;
      const b = s >= 35 && s <= 85 ? 1.0 : 0.35;
      const c = l >= 20 && l <= 58 ? 1.0 : l > 58 && l <= 70 ? 0.55 : 0.2;
      return Math.round(a * 40 + b * 30 + c * 30);
    }
    case 'winter': {
      const a = isCool ? 1.0 : isWarm ? 0.05 : 0.3;
      const b = l < 30 || l > 70 ? 1.0 : 0.25;
      const c = s > 55 ? 1.0 : s > 35 ? 0.6 : 0.2;
      return Math.round(a * 40 + b * 35 + c * 25);
    }
    default:
      return 50;
  }
}

export interface ImageColorStats {
  warmFill: number;
  lightFill: number;
  seasonFill: number;
  tonePct: string;
  toneLabel: string;
  brightnessPct: string;
  brightnessLabel: string;
  matchPct: string;
}

/**
 * 추출된 이미지 색상들로 퍼스널컬러 통계를 계산합니다.
 * 피부톤 범위(너무 어둡거나 너무 밝은 배경색 제외)로 필터링 후 분석합니다.
 */
export function computeImageColorStats(
  hexColors: string[],
  season: string
): ImageColorStats | null {
  if (!hexColors.length) return null;

  // 피부톤 범위에 해당하는 색상만 필터 (배경·흰색·검정 제외)
  const skinRange = hexColors.filter(hex => {
    const { s, l } = hexToHSL(hex);
    return l > 18 && l < 90 && s > 5;
  });
  const colors = skinRange.length > 0 ? skinRange : hexColors;

  const hslValues = colors.map(hexToHSL);
  const avgH = hslValues.reduce((sum, v) => sum + v.h, 0) / hslValues.length;
  const avgS = hslValues.reduce((sum, v) => sum + v.s, 0) / hslValues.length;
  const avgL = hslValues.reduce((sum, v) => sum + v.l, 0) / hslValues.length;

  // 웜/쿨 비율 계산 (0=쿨, 1=웜)
  // 피부 웜톤: 복숭아/골드 계열 (H: 5~55), 쿨톤: 핑크/로즈 계열 (H: 280~350) or 채도 낮음
  let warmFill: number;
  if ((avgH >= 5 && avgH <= 55) || (avgH >= 355)) {
    // 명확한 웜 계열
    warmFill = Math.min(0.88, 0.58 + (avgS / 100) * 0.28);
  } else if (avgH > 55 && avgH < 90) {
    // 옐로-그린 경계 (중립 웜)
    warmFill = 0.52 + (avgS / 100) * 0.12;
  } else if (avgH >= 280 && avgH < 355) {
    // 핑크/마젠타 (쿨 계열)
    warmFill = Math.max(0.12, 0.38 - (avgS / 100) * 0.22);
  } else if (avgH >= 175 && avgH < 280) {
    // 명확한 쿨 계열
    warmFill = Math.max(0.08, 0.32 - (avgS / 100) * 0.20);
  } else {
    warmFill = 0.42 + (avgS / 100) * 0.08;
  }

  // 라이트/딥 비율 계산 (0=딥, 1=라이트) — 명도 기반
  const lightFill = Math.max(0.08, Math.min(0.92, (avgL - 10) / 75));

  // 봄↔가을 / 여름↔겨울 비율 (시즌 스펙트럼 위치)
  let seasonFill: number;
  if (season === 'spring' || season === 'autumn') {
    // 봄: 밝고 선명, 가을: 어둡고 뮤트 → 밝기+채도 기반
    seasonFill = Math.max(0.08, Math.min(0.92,
      (avgL / 100) * 0.65 + (avgS / 100) * 0.35
    ));
  } else {
    // 여름: 부드럽고 밝음, 겨울: 대비 강함
    // 여름은 채도 낮고 밝음, 겨울은 채도 높거나 어두움
    const summerScore = (avgL / 100) * 0.55 + ((100 - avgS) / 100) * 0.45;
    seasonFill = Math.max(0.08, Math.min(0.92, summerScore));
  }

  // 퍼센트 계산: 얼마나 확실히 웜/쿨인지 (중립 0.5에서 멀수록 높음)
  const toneConfidence = Math.abs(warmFill - 0.5) * 2;
  const tonePctNum = Math.round(55 + toneConfidence * 35);

  // 라이트/딥 확신도
  const brightnessConfidence = Math.abs(lightFill - 0.5) * 2;
  const brightnessPctNum = Math.round(54 + brightnessConfidence * 32);

  // 이미지-시즌 일치도: 색상 스코어의 평균
  const matchScores = colors.map(c => scoreColorForSeason(c, season));
  const avgMatch = matchScores.reduce((a, b) => a + b, 0) / matchScores.length;
  const matchPctNum = Math.round(Math.max(62, Math.min(97, avgMatch * 1.08)));

  return {
    warmFill: parseFloat(warmFill.toFixed(3)),
    lightFill: parseFloat(lightFill.toFixed(3)),
    seasonFill: parseFloat(seasonFill.toFixed(3)),
    tonePct: `${tonePctNum}%`,
    toneLabel: warmFill >= 0.5 ? '웜톤' : '쿨톤',
    brightnessPct: `${brightnessPctNum}%`,
    brightnessLabel: lightFill >= 0.5 ? '라이트' : '딥',
    matchPct: `${matchPctNum}%`,
  };
}

/** 이미지 색상 추출 없이 시즌만으로 계산하는 기본 통계 (fallback) */
export function getSeasonStats(season: string): ImageColorStats {
  switch (season) {
    case 'spring':
      return { tonePct: '76%', toneLabel: '웜톤', brightnessPct: '80%', brightnessLabel: '라이트', matchPct: '89%', warmFill: 0.74, seasonFill: 0.76, lightFill: 0.82 };
    case 'summer':
      return { tonePct: '73%', toneLabel: '쿨톤', brightnessPct: '75%', brightnessLabel: '라이트', matchPct: '87%', warmFill: 0.27, seasonFill: 0.24, lightFill: 0.74 };
    case 'autumn':
      return { tonePct: '74%', toneLabel: '웜톤', brightnessPct: '72%', brightnessLabel: '딥', matchPct: '88%', warmFill: 0.72, seasonFill: 0.28, lightFill: 0.26 };
    case 'winter':
      return { tonePct: '81%', toneLabel: '쿨톤', brightnessPct: '77%', brightnessLabel: '딥', matchPct: '92%', warmFill: 0.21, seasonFill: 0.20, lightFill: 0.22 };
    default:
      return { tonePct: '75%', toneLabel: '웜톤', brightnessPct: '75%', brightnessLabel: '라이트', matchPct: '88%', warmFill: 0.64, seasonFill: 0.71, lightFill: 0.88 };
  }
}

/** ImageColors 라이브러리 결과에서 hex 배열 추출 */
export function extractHexColors(colorResult: any): string[] {
  const colors: string[] = [];
  if (!colorResult) return colors;
  if (colorResult.platform === 'ios') {
    ['background', 'primary', 'secondary', 'detail'].forEach(k => {
      if (colorResult[k]) colors.push(colorResult[k]);
    });
  } else if (colorResult.platform === 'android') {
    ['dominant', 'vibrant', 'lightVibrant', 'muted', 'lightMuted'].forEach(k => {
      if (colorResult[k]) colors.push(colorResult[k]);
    });
  } else {
    ['dominant', 'vibrant', 'average'].forEach(k => {
      if (colorResult[k]) colors.push(colorResult[k]);
    });
  }
  return colors.filter(c => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c));
}
