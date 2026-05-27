function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return '#' + [clamp(r), clamp(g), clamp(b)]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('');
}

// sRGB ↔ linear 변환 (감마 보정): 선형 공간에서 채널 스케일링해야 지각적으로 정확함
function srgbToLinear(v: number): number {
  const n = v / 255;
  return n <= 0.04045 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
}

function linearToSrgb(v: number): number {
  const c = Math.max(0, Math.min(1, v));
  return Math.round((c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255);
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l * 100];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h * 360, s * 100, l * 100];
}

/**
 * 해당 색상이 피부톤 범위에 속하는지 판별.
 * Hue 0–45°(warm red/orange), Saturation 12–70%, Lightness 20–88%
 */
function isSkinTone(hex: string): boolean {
  const [r, g, b] = hexToRgb(hex);
  const [h, s, l] = rgbToHsl(r, g, b);
  return (h <= 45 || h >= 340) && s >= 12 && s <= 70 && l >= 20 && l <= 88;
}

/**
 * Gray World 화이트밸런스 보정 (선형 공간에서 연산).
 * 피부톤 범위 색상이 있으면 그것만 illuminant 추정에 사용해 정확도 향상.
 * strength: 0(보정 없음) ~ 1(완전 보정). 기본 0.6 — 과보정 방지.
 */
export function correctWhiteBalance(hexColors: string[], strength = 0.6): string[] {
  if (hexColors.length === 0) return hexColors;

  const skinColors = hexColors.filter(isSkinTone);
  const reference = skinColors.length > 0 ? skinColors : hexColors;

  const linRef = reference.map(h => {
    const [r, g, b] = hexToRgb(h);
    return [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)] as [number, number, number];
  });

  const avgR = linRef.reduce((s, [r]) => s + r, 0) / linRef.length;
  const avgG = linRef.reduce((s, [, g]) => s + g, 0) / linRef.length;
  const avgB = linRef.reduce((s, [, , b]) => s + b, 0) / linRef.length;
  const avgGray = (avgR + avgG + avgB) / 3;

  const sR = 1 + (avgGray / (avgR || 1e-4) - 1) * strength;
  const sG = 1 + (avgGray / (avgG || 1e-4) - 1) * strength;
  const sB = 1 + (avgGray / (avgB || 1e-4) - 1) * strength;

  return hexColors.map(hex => {
    const [r, g, b] = hexToRgb(hex);
    return rgbToHex(
      linearToSrgb(srgbToLinear(r) * sR),
      linearToSrgb(srgbToLinear(g) * sG),
      linearToSrgb(srgbToLinear(b) * sB),
    );
  });
}

/**
 * 색온도 편향 보정.
 * R-B 차이로 warm/cool 캐스트를 감지해 반대 방향으로 보정.
 * 최대 보정량 ±20 으로 제한.
 */
export function correctColorTemperature(hexColors: string[]): string[] {
  if (hexColors.length === 0) return hexColors;

  const rgbColors = hexColors.map(hexToRgb);
  const avgR = rgbColors.reduce((s, [r]) => s + r, 0) / rgbColors.length;
  const avgB = rgbColors.reduce((s, [, , b]) => s + b, 0) / rgbColors.length;
  const diff = avgR - avgB;

  const shift = Math.max(-20, Math.min(20, diff * 0.1));
  if (Math.abs(shift) < 1.5) return hexColors;

  return rgbColors.map(([r, g, b]) => rgbToHex(r - shift, g, b + shift));
}

/**
 * 피부톤 색감 보정 메인 함수.
 * 선형 공간 화이트밸런스 → 색온도 편향 보정 순 적용.
 */
export function applySkinToneCorrection(hexColors: string[]): string[] {
  const wb = correctWhiteBalance(hexColors);
  return correctColorTemperature(wb);
}
