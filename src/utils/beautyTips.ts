import { WeatherData } from '../api/weatherApi';

export interface BeautyTip {
  icon: string;
  category: string;
  tip: string;
}

export function generateBeautyTips(
  weather: WeatherData,
  skinType: string | null,
  colorSeason: string | null
): BeautyTip[] {
  const { temp, humidity, uvIndex, weatherCode, pm10, pm25 } = weather;
  const isHot = temp >= 26;
  const isCold = temp < 14;
  const isHumid = humidity >= 68;
  const isDry = humidity < 42;
  const isHighUV = uvIndex >= 6;
  const isRaining = weatherCode >= 51 && weatherCode <= 99;
  const isHighDust = pm10 != null && pm10 >= 80;
  const isHighFine = pm25 != null && pm25 >= 35;

  const tips: BeautyTip[] = [];

  if (skinType === 'dry') {
    if (isDry || isCold) {
      tips.push({ icon: '💧', category: '수분케어', tip: '건조한 날씨! 세안 후 즉시 에센스 + 크림 2단계로 수분을 잠가주세요. 오일 한 방울 추가하면 더욱 촉촉해요.' });
    } else if (isHot && isHumid) {
      tips.push({ icon: '🌿', category: '수분케어', tip: '습하지만 건성 피부엔 수분이 필수! 가벼운 젤 타입 크림으로 촉촉함을 유지하세요.' });
    } else {
      tips.push({ icon: '💧', category: '수분케어', tip: '건성 피부엔 수분 크림을 넉넉하게 발라주세요. 수분 미스트도 챙기면 더욱 좋아요!' });
    }
  } else if (skinType === 'oily') {
    if (isHot || isHumid) {
      tips.push({ icon: '🧊', category: '피지케어', tip: `${isHot ? '더운' : '습한'} 날씨엔 피지 분비가 활발해요! 가벼운 오일프리 에센스로 보습하고, 파우더로 마무리해 피지를 잡아주세요.` });
    } else {
      tips.push({ icon: '⚖️', category: '피지케어', tip: '유분·수분 밸런스 토너로 피부 컨디션을 맞춰주세요. 보습도 놓치지 마세요!' });
    }
  } else if (skinType === 'combination') {
    if (isHot) {
      tips.push({ icon: '🌀', category: '복합성케어', tip: 'T존은 클레이 마스크로 주 2회 관리, 볼은 수분 크림으로 집중 케어하세요. 부위별 케어가 핵심이에요!' });
    } else {
      tips.push({ icon: '🌀', category: '복합성케어', tip: 'T존과 볼에 각각 다른 제품을 써주세요. 오늘 같은 날씨엔 가벼운 로션 + T존 파우더 조합 추천!' });
    }
  } else if (skinType === 'normal') {
    tips.push({ icon: '✨', category: '피부관리', tip: isHot ? '좋은 피부 컨디션! 더운 날엔 가벼운 로션으로 충분해요. 선크림만 잊지 마세요.' : '균형 잡힌 피부를 유지해줘요. 기초케어를 꼼꼼히 해주면 더 빛나요!' });
  } else {
    tips.push({ icon: '💆', category: '기초케어', tip: isDry ? '건조한 날씨에는 수분 보습에 신경 써주세요!' : '피부 타입에 맞는 기초케어를 꼼꼼히 챙겨주세요.' });
  }

  if (isHighDust) {
    tips.push({ icon: '😷', category: '미세먼지 대처', tip: `미세먼지 나쁨(${pm10}μg/㎥)! 외출 시 마스크 필수. 귀가 후 이중 클렌징으로 모공 속 먼지를 제거하고, 피부 장벽 강화 세럼을 사용하세요.` });
  } else if (isHighFine && !isHighDust) {
    tips.push({ icon: '🌫️', category: '초미세먼지 대처', tip: `초미세먼지 주의(${pm25}μg/㎥)! 가벼운 메이크업으로 피부 모공 부담을 줄이고, 외출 후엔 이중 세안으로 초미세먼지를 깨끗이 제거하세요.` });
  }

  if (isHighUV) {
    tips.push({ icon: '☀️', category: '자외선 차단', tip: `UV 지수 ${uvIndex}! SPF50+ PA++++ 선크림을 꼭 발라주세요. 외출 30분 전 바르고, 2시간마다 덧바르는 게 중요해요.` });
  } else if (uvIndex >= 3) {
    tips.push({ icon: '🔆', category: '자외선 차단', tip: `UV 지수 ${uvIndex}. SPF30 이상 선크림으로 기본 보호를 챙기세요. 맑은 날엔 특히 신경 써주세요.` });
  } else {
    tips.push({ icon: '🌙', category: '자외선 차단', tip: 'UV가 약한 날이에요. 기본 SPF 선크림 정도면 충분하지만, 습관적으로 챙기는 게 좋아요!' });
  }

  if (isRaining) {
    tips.push({ icon: '☔', category: '비오는날 팁', tip: '비 오는 날엔 습도가 높아 메이크업이 번지기 쉬워요. 픽서 스프레이로 마무리하고, 워터프루프 제품을 사용하세요!' });
  }

  if (colorSeason === 'spring') {
    if (isHot) {
      tips.push({ icon: '🌸', category: '메이크업', tip: '봄 웜 타입! 더운 날엔 가벼운 코럴/피치 틴트 하나로 생기를 살려요. 쿠션 파운데이션으로 얇게 베이스 해주세요.' });
    } else if (isCold) {
      tips.push({ icon: '🌷', category: '메이크업', tip: '봄 웜 타입! 선선한 날엔 살구빛 베이스에 피치 핑크 립으로 화사한 봄 분위기를 연출해보세요.' });
    } else {
      tips.push({ icon: '🌸', category: '메이크업', tip: '봄 웜 타입에게 딱 맞는 날씨! 샴페인 골드 섀도우 + 코럴 립으로 밝고 사랑스러운 룩을 완성하세요.' });
    }
  } else if (colorSeason === 'summer') {
    if (isRaining || !isHot) {
      tips.push({ icon: '💜', category: '메이크업', tip: '여름 쿨 타입! 흐리거나 선선한 날엔 라벤더/모브 섀도우 + 로즈핑크 립으로 차분하고 우아한 룩을 연출하세요.' });
    } else {
      tips.push({ icon: '💙', category: '메이크업', tip: '여름 쿨 타입! 더운 날엔 핑크베이지 베이스로 시원하고 투명한 피부 표현을 해주세요. 쿨한 계열이 더위에도 싱그러워 보여요!' });
    }
  } else if (colorSeason === 'autumn') {
    if (isCold || (!isHot && !isRaining)) {
      tips.push({ icon: '🍂', category: '메이크업', tip: '가을 웜 타입! 테라코타/버건디 립에 카멜브라운 섀도우를 더하면 최고의 가을 룩이 완성돼요. 오늘 날씨와 찰떡!' });
    } else {
      tips.push({ icon: '🍁', category: '메이크업', tip: '가을 웜 타입! 카멜 베이스에 브릭 계열 립 하나로 깊이 있는 어스 톤 메이크업을 완성해보세요.' });
    }
  } else if (colorSeason === 'winter') {
    if (isHighUV || (!isRaining && !isCold)) {
      tips.push({ icon: '❄️', category: '메이크업', tip: '겨울 쿨 타입! 맑고 밝은 날엔 딥레드 립 + 선명한 블랙 라이너로 강렬한 고대비 룩을 연출해보세요.' });
    } else {
      tips.push({ icon: '🖤', category: '메이크업', tip: '겨울 쿨 타입! 흐린 날엔 버건디/플럼 계열로 깊이 있는 메이크업을 연출하고, 피부는 투명하게 표현하세요.' });
    }
  } else {
    if (isHot) {
      tips.push({ icon: '💄', category: '메이크업', tip: '더운 날엔 가볍고 지속력 강한 제품 위주로! 픽서 스프레이와 워터프루프 제품을 선택해보세요.' });
    } else {
      tips.push({ icon: '💄', category: '메이크업', tip: '퍼스널컬러 분석을 받으면 오늘 날씨에 딱 맞는 컬러 추천을 받을 수 있어요!' });
    }
  }

  return tips;
}
