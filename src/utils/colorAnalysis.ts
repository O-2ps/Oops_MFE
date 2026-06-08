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

export function computeImageColorStats(
  hexColors: string[],
  season: string
): ImageColorStats | null {
  if (!hexColors.length) return null;

  const skinRange = hexColors.filter(hex => {
    const { s, l } = hexToHSL(hex);
    return l > 18 && l < 90 && s > 5;
  });
  const colors = skinRange.length > 0 ? skinRange : hexColors;

  const hslValues = colors.map(hexToHSL);
  const avgH = hslValues.reduce((sum, v) => sum + v.h, 0) / hslValues.length;
  const avgS = hslValues.reduce((sum, v) => sum + v.s, 0) / hslValues.length;
  const avgL = hslValues.reduce((sum, v) => sum + v.l, 0) / hslValues.length;

  let warmFill: number;
  if ((avgH >= 5 && avgH <= 55) || (avgH >= 355)) {
    warmFill = Math.min(0.88, 0.58 + (avgS / 100) * 0.28);
  } else if (avgH > 55 && avgH < 90) {
    warmFill = 0.52 + (avgS / 100) * 0.12;
  } else if (avgH >= 280 && avgH < 355) {
    warmFill = Math.max(0.12, 0.38 - (avgS / 100) * 0.22);
  } else if (avgH >= 175 && avgH < 280) {
    warmFill = Math.max(0.08, 0.32 - (avgS / 100) * 0.20);
  } else {
    warmFill = 0.42 + (avgS / 100) * 0.08;
  }

  const lightFill = Math.max(0.08, Math.min(0.92, (avgL - 10) / 75));

  let seasonFill: number;
  if (season === 'spring' || season === 'autumn') {
    seasonFill = Math.max(0.08, Math.min(0.92,
      (avgL / 100) * 0.65 + (avgS / 100) * 0.35
    ));
  } else {
    const summerScore = (avgL / 100) * 0.55 + ((100 - avgS) / 100) * 0.45;
    seasonFill = Math.max(0.08, Math.min(0.92, summerScore));
  }

  const toneConfidence = Math.abs(warmFill - 0.5) * 2;
  const tonePctNum = Math.round(55 + toneConfidence * 35);

  const brightnessConfidence = Math.abs(lightFill - 0.5) * 2;
  const brightnessPctNum = Math.round(54 + brightnessConfidence * 32);

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

function skinLikeScore(hex: string): number {
  const { h, s, l } = hexToHSL(hex);
  const hNorm = h >= 340 ? h - 360 : h;

  let hueScore = -100;
  if (hNorm >= 10 && hNorm <= 35) hueScore = -(Math.abs(hNorm - 22) * 2);
  else if ((hNorm >= 5 && hNorm < 10) || (hNorm > 35 && hNorm <= 45)) hueScore = -40;

  let satScore = -100;
  if (s >= 25 && s <= 55) satScore = -(Math.abs(s - 35) * 1.5);
  else if ((s >= 18 && s < 25) || (s > 55 && s <= 65)) satScore = -30;

  let lightScore = -100;
  if (l >= 50 && l <= 82) lightScore = -(Math.abs(l - 65) * 0.8);
  else if ((l >= 40 && l < 50) || (l > 82 && l <= 88)) lightScore = -20;

  return (hueScore * 3) + (satScore * 2) + lightScore;
}

export function extractAllHexColors(colorResult: any): string[] {
  if (!colorResult) return [];

  const colors: string[] = [];
  if (colorResult.platform === 'ios') {
    ['primary', 'secondary', 'detail', 'background'].forEach(k => {
      if (colorResult[k]) colors.push(colorResult[k]);
    });
  } else if (colorResult.platform === 'android') {
    ['dominant', 'vibrant', 'lightVibrant', 'muted', 'lightMuted', 'darkMuted'].forEach(k => {
      if (colorResult[k]) colors.push(colorResult[k]);
    });
  } else {
    ['dominant', 'vibrant', 'average', 'muted'].forEach(k => {
      if (colorResult[k]) colors.push(colorResult[k]);
    });
  }

  return colors.filter(c => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c));
}

export function extractHexColors(colorResult: any): string[] {
  if (!colorResult) return [];

  const colors: string[] = [];
  if (colorResult.platform === 'ios') {
    ['primary', 'secondary', 'detail', 'background'].forEach(k => {
      if (colorResult[k]) colors.push(colorResult[k]);
    });
  } else if (colorResult.platform === 'android') {
    ['dominant', 'vibrant', 'lightVibrant', 'muted', 'lightMuted', 'darkMuted'].forEach(k => {
      if (colorResult[k]) colors.push(colorResult[k]);
    });
  } else {
    ['dominant', 'vibrant', 'average', 'muted'].forEach(k => {
      if (colorResult[k]) colors.push(colorResult[k]);
    });
  }

  const validHex = colors.filter(c => typeof c === 'string' && /^#[0-9a-fA-F]{6}$/.test(c));
  if (validHex.length === 0) return [];

  // 한국인/아시아인 피부톤 범위로 확장
  // Hue: 5-50° (핑크-베이지-오렌지), 340-360° (붉은빛 포함)
  // Sat: 12-70% (밝은 핑크빛 피부 포함)
  // Lightness: 35-92% (어두운 피부~밝은 피부 모두 포함)
  const skinTones = validHex.filter(hex => {
    const { h, s, l } = hexToHSL(hex);
    const hueOk = (h >= 5 && h <= 50) || (h >= 340 && h <= 360);
    const satOk = s >= 12 && s <= 70;
    const lightOk = l >= 35 && l <= 92;
    return hueOk && satOk && lightOk;
  });

  if (skinTones.length > 0) {
    // 피부톤 범위 내에서 가장 피부에 가까운 색상 반환
    skinTones.sort((a, b) => skinLikeScore(b) - skinLikeScore(a));
    return [skinTones[0]];
  }

  // 피부톤 범위 필터 통과한 색상이 없으면, 전체에서 skinLikeScore 가장 높은 것 반환
  // (배경/머리카락이 dominant인 경우 최선의 근사값 사용)
  const sorted = [...validHex].sort((a, b) => skinLikeScore(b) - skinLikeScore(a));
  return [sorted[0]];
}
