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

/**
 * Gray World 화이트밸런스 보정.
 * 각 채널의 평균값이 동일해야 한다는 가정 하에 색온도 편향을 제거한다.
 * strength 0~1: 1이면 완전 보정, 0이면 원본 유지 (기본값 0.55 — 과보정 방지)
 */
export function correctWhiteBalance(hexColors: string[], strength = 0.55): string[] {
  if (hexColors.length === 0) return hexColors;

  const rgbColors = hexColors.map(hexToRgb);

  const avgR = rgbColors.reduce((s, [r]) => s + r, 0) / rgbColors.length;
  const avgG = rgbColors.reduce((s, [, g]) => s + g, 0) / rgbColors.length;
  const avgB = rgbColors.reduce((s, [, , b]) => s + b, 0) / rgbColors.length;
  const avgGray = (avgR + avgG + avgB) / 3;

  const rawScaleR = avgGray / (avgR || 1);
  const rawScaleG = avgGray / (avgG || 1);
  const rawScaleB = avgGray / (avgB || 1);

  // strength 만큼만 보정 (완전 보정 시 피부톤이 지나치게 탈색될 수 있음)
  const sR = 1 + (rawScaleR - 1) * strength;
  const sG = 1 + (rawScaleG - 1) * strength;
  const sB = 1 + (rawScaleB - 1) * strength;

  return rgbColors.map(([r, g, b]) => rgbToHex(r * sR, g * sG, b * sB));
}

/**
 * 색온도 편향 감지 후 수동 보정.
 * - 강한 황/주황빛(warm cast): R↓ B↑
 * - 강한 파란빛(cool cast): R↑ B↓
 */
export function correctColorTemperature(hexColors: string[]): string[] {
  if (hexColors.length === 0) return hexColors;

  const rgbColors = hexColors.map(hexToRgb);
  const avgR = rgbColors.reduce((s, [r]) => s + r, 0) / rgbColors.length;
  const avgB = rgbColors.reduce((s, [, , b]) => s + b, 0) / rgbColors.length;
  const diff = avgR - avgB;

  // diff > 40: 너무 warm → R 약간 낮추고 B 약간 올림
  // diff < -40: 너무 cool → R 약간 올리고 B 약간 낮춤
  const MAX_SHIFT = 18;
  const castShift = Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, diff * 0.12));

  if (Math.abs(castShift) < 2) return hexColors;

  return rgbColors.map(([r, g, b]) =>
    rgbToHex(r - castShift, g, b + castShift)
  );
}

/**
 * 피부톤 색감 보정 메인 함수.
 * 화이트밸런스 → 색온도 보정 순으로 적용.
 */
export function applySkinToneCorrection(hexColors: string[]): string[] {
  const wb = correctWhiteBalance(hexColors);
  const ct = correctColorTemperature(wb);
  return ct;
}
