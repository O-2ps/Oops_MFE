import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import StrokedText from '../components/StrokedText';
import { COLORS, FONTS } from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getSavedColorResult, getSavedSkinResult } from '../utils/analysisStorage';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'WeatherBeauty'>;

const SEASON_NAMES: Record<string, string> = {
  spring: '봄 웜',
  summer: '여름 쿨',
  autumn: '가을 웜',
  winter: '겨울 쿨',
};

const SKIN_NAMES: Record<string, string> = {
  dry: '건성',
  oily: '지성',
  combination: '복합성',
  normal: '중성',
};

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  uvIndex: number;
  weatherCode: number;
  cityName: string;
  pm10: number | null;
  pm25: number | null;
}

interface BeautyTip {
  icon: string;
  category: string;
  tip: string;
}

function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  return '⛈️';
}

function getWeatherDesc(code: number): string {
  if (code === 0) return '맑음';
  if (code <= 2) return '구름 조금';
  if (code <= 3) return '흐림';
  if (code <= 48) return '안개';
  if (code <= 57) return '이슬비';
  if (code <= 67) return '비';
  if (code <= 77) return '눈';
  if (code <= 82) return '소나기';
  return '뇌우';
}

function getUVLabel(uv: number): string {
  if (uv < 3) return '낮음';
  if (uv < 6) return '보통';
  if (uv < 8) return '높음';
  return '매우높음';
}

function getUVColor(uv: number): string {
  if (uv < 3) return '#4CAF50';
  if (uv < 6) return '#FF9800';
  if (uv < 8) return '#FF5722';
  return '#B71C1C';
}

function getAQILabel(pm10: number): string {
  if (pm10 < 30) return '좋음';
  if (pm10 < 80) return '보통';
  if (pm10 < 150) return '나쁨';
  return '매우나쁨';
}

function getAQIColor(pm10: number): string {
  if (pm10 < 30) return '#4CAF50';
  if (pm10 < 80) return '#FF9800';
  if (pm10 < 150) return '#F44336';
  return '#9C27B0';
}

function getAQIEmoji(pm10: number): string {
  if (pm10 < 30) return '😊';
  if (pm10 < 80) return '😐';
  if (pm10 < 150) return '😷';
  return '🚫';
}

function getPM25Label(pm25: number): string {
  if (pm25 < 15) return '좋음';
  if (pm25 < 35) return '보통';
  if (pm25 < 75) return '나쁨';
  return '매우나쁨';
}

function getPM25Color(pm25: number): string {
  if (pm25 < 15) return '#4CAF50';
  if (pm25 < 35) return '#FF9800';
  if (pm25 < 75) return '#F44336';
  return '#9C27B0';
}

async function fetchWeatherData(): Promise<WeatherData> {
  const geoRes = await fetch('https://ipapi.co/json/');
  if (!geoRes.ok) throw new Error('위치 정보를 가져올 수 없어요');
  const geo = await geoRes.json();
  const { latitude, longitude, city } = geo;

  const [weatherRes, aqRes] = await Promise.all([
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weathercode&daily=uv_index_max&timezone=auto&forecast_days=1`
    ),
    fetch(
      `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&current=pm10,pm2_5&timezone=auto`
    ).catch(() => null),
  ]);

  if (!weatherRes.ok) throw new Error('날씨 정보를 가져올 수 없어요');
  const weather = await weatherRes.json();

  let pm10: number | null = null;
  let pm25: number | null = null;
  if (aqRes?.ok) {
    const aq = await aqRes.json();
    pm10 = aq.current?.pm10 != null ? Math.round(aq.current.pm10) : null;
    pm25 = aq.current?.pm2_5 != null ? Math.round(aq.current.pm2_5) : null;
  }

  return {
    temp: Math.round(weather.current.temperature_2m ?? 20),
    feelsLike: Math.round(weather.current.apparent_temperature ?? weather.current.temperature_2m ?? 20),
    humidity: Math.round(weather.current.relative_humidity_2m ?? 60),
    uvIndex: Math.round(weather.daily?.uv_index_max?.[0] ?? 3),
    weatherCode: weather.current.weathercode ?? 0,
    cityName: city ?? '내 위치',
    pm10,
    pm25,
  };
}

function generateBeautyTips(
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

function ExpandableTipCard({ tip, index }: { tip: BeautyTip; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    Animated.timing(rotateAnim, {
      toValue: expanded ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setExpanded(prev => !prev);
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <TouchableOpacity
      style={styles.tipCard}
      onPress={toggle}
      activeOpacity={0.85}
    >
      <View style={styles.tipHeader}>
        <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.tipIcon}>{tip.icon}</StrokedText>
        <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1.5} style={styles.tipCategory}>{tip.category}</StrokedText>
        <Animated.Text style={[styles.tipChevron, { transform: [{ rotate }] }]}>▼</Animated.Text>
      </View>
      {expanded && (
        <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.tipText}>{tip.tip}</StrokedText>
      )}
    </TouchableOpacity>
  );
}

function AQIGaugeBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(value / max, 1);
  return (
    <View style={styles.aqiBar}>
      <View style={[styles.aqiBarFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
    </View>
  );
}

export default function WeatherBeautyScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [colorSeason, setColorSeason] = useState<string | null>(null);
  const [colorSeasonSub, setColorSeasonSub] = useState<string | undefined>(undefined);
  const [skinType, setSkinType] = useState<string | null>(null);
  const [skinLabel, setSkinLabel] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getSavedColorResult(), getSavedSkinResult()]).then(([color, skin]) => {
      if (color) { setColorSeason(color.type); setColorSeasonSub(color.subType); }
      if (skin) { setSkinType(skin.skinType); setSkinLabel(skin.skinTypeLabel); }
    });
  }, []);

  const loadWeather = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeatherData();
      setWeather(data);
    } catch (e: any) {
      setError(e?.message ?? '날씨 정보를 불러올 수 없어요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadWeather(); }, [loadWeather]);

  const tips = weather ? generateBeautyTips(weather, skinType, colorSeason) : [];

  const seasonDisplay = colorSeason
    ? `${SEASON_NAMES[colorSeason] ?? colorSeason}${colorSeasonSub ? ` ${colorSeasonSub}` : ''}`
    : null;
  const skinDisplay = skinLabel ?? (skinType ? SKIN_NAMES[skinType] : null);

  return (
    <S.Container>
      <View style={StyleSheet.absoluteFill}>
        <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.backText}>← 뒤로</StrokedText>
        </TouchableOpacity>

        <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={3} style={styles.title}>
          오늘의 뷰티 루틴
        </StrokedText>
        <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.subtitle}>
          현재 날씨 + 내 피부타입 + 퍼스널컬러{'\n'}맞춤 뷰티 팁을 알려드려요!
        </StrokedText>

        {(seasonDisplay || skinDisplay) && (
          <View style={styles.profileBadge}>
            {seasonDisplay && (
              <View style={styles.badgeItem}>
                <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.badgeLabel}>퍼스널컬러</StrokedText>
                <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1.5} style={styles.badgeValue}>{seasonDisplay}</StrokedText>
              </View>
            )}
            {seasonDisplay && skinDisplay && <View style={styles.badgeDivider} />}
            {skinDisplay && (
              <View style={styles.badgeItem}>
                <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.badgeLabel}>피부타입</StrokedText>
                <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1.5} style={styles.badgeValue}>{skinDisplay}</StrokedText>
              </View>
            )}
          </View>
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={COLORS.PRIMARY} />
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.loadingText}>
              날씨 정보를 불러오는 중...
            </StrokedText>
          </View>
        )}

        {error && !loading && (
          <View style={styles.errorBox}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.errorText}>
              {error}
            </StrokedText>
            <TouchableOpacity onPress={loadWeather} style={styles.retryBtn}>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1.5} style={styles.retryText}>다시 시도</StrokedText>
            </TouchableOpacity>
          </View>
        )}

        {weather && !loading && (
          <>
            <View style={styles.weatherCard}>
              <View style={styles.weatherTopRow}>
                <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.cityText}>
                  📍 {weather.cityName}
                </StrokedText>
                <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.weatherDescText}>
                  {getWeatherEmoji(weather.weatherCode)} {getWeatherDesc(weather.weatherCode)}
                </StrokedText>
              </View>
              <View style={styles.weatherStats}>
                <View style={styles.weatherStat}>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.weatherStatValue}>
                    {weather.temp}°
                  </StrokedText>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.weatherStatLabel}>
                    기온
                  </StrokedText>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.feelsLikeText}>
                    체감 {weather.feelsLike}°
                  </StrokedText>
                </View>
                <View style={styles.weatherStatDivider} />
                <View style={styles.weatherStat}>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.weatherStatValue}>
                    {weather.humidity}%
                  </StrokedText>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.weatherStatLabel}>습도</StrokedText>
                </View>
                <View style={styles.weatherStatDivider} />
                <View style={styles.weatherStat}>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={[styles.weatherStatValue, { color: getUVColor(weather.uvIndex) }]}>
                    {weather.uvIndex}
                  </StrokedText>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={[styles.weatherStatLabel, { color: getUVColor(weather.uvIndex) }]}>
                    UV {getUVLabel(weather.uvIndex)}
                  </StrokedText>
                </View>
              </View>
            </View>

            {(weather.pm10 != null || weather.pm25 != null) && (
              <View style={styles.aqiCard}>
                <View style={styles.aqiTitleRow}>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.aqiTitle}>
                    대기질 현황
                  </StrokedText>
                  {weather.pm10 != null && (
                    <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.aqiEmoji}>
                      {getAQIEmoji(weather.pm10)}
                    </StrokedText>
                  )}
                </View>
                {weather.pm10 != null && (
                  <View style={styles.aqiRow}>
                    <View style={styles.aqiLabelGroup}>
                      <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.aqiLabel}>미세먼지</StrokedText>
                      <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={[styles.aqiValue, { color: getAQIColor(weather.pm10) }]}>
                        {weather.pm10} μg/㎥
                      </StrokedText>
                    </View>
                    <View style={styles.aqiRightGroup}>
                      <AQIGaugeBar value={weather.pm10} max={200} color={getAQIColor(weather.pm10)} />
                      <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={[styles.aqiGradeText, { color: getAQIColor(weather.pm10) }]}>
                        {getAQILabel(weather.pm10)}
                      </StrokedText>
                    </View>
                  </View>
                )}
                {weather.pm25 != null && (
                  <View style={styles.aqiRow}>
                    <View style={styles.aqiLabelGroup}>
                      <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.aqiLabel}>초미세먼지</StrokedText>
                      <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={[styles.aqiValue, { color: getPM25Color(weather.pm25) }]}>
                        {weather.pm25} μg/㎥
                      </StrokedText>
                    </View>
                    <View style={styles.aqiRightGroup}>
                      <AQIGaugeBar value={weather.pm25} max={100} color={getPM25Color(weather.pm25)} />
                      <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={[styles.aqiGradeText, { color: getPM25Color(weather.pm25) }]}>
                        {getPM25Label(weather.pm25)}
                      </StrokedText>
                    </View>
                  </View>
                )}
              </View>
            )}

            <View style={styles.tipsTitleRow}>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1.5} style={styles.tipsTitle}>
                오늘의 맞춤 뷰티 팁
              </StrokedText>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.tipsTap}>
                탭해서 내용 보기
              </StrokedText>
            </View>

            {tips.map((tip, i) => (
              <ExpandableTipCard key={i} tip={tip} index={i} />
            ))}

            {!colorSeason && !skinType && (
              <View style={styles.analysisHint}>
                <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.analysisHintText}>
                  💡 퍼스널컬러·피부 분석을 받으면{'\n'}더 정확한 맞춤 팁을 드릴 수 있어요!
                </StrokedText>
              </View>
            )}
          </>
        )}

        <View style={styles.actions}>
          {!loading && (
            <TouchableOpacity onPress={loadWeather} style={styles.refreshBtn} activeOpacity={0.7}>
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.refreshText}>
                [ 새로고침 ]
              </StrokedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.goBackText}>뒤로가기</StrokedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </S.Container>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 50,
    marginBottom: 10,
  },
  backText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: FONTS.PIXEL,
  },
  title: {
    fontSize: 26,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
    textAlign: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 13,
    color: '#555555',
    fontFamily: FONTS.PIXEL,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 30,
    marginBottom: 20,
  },
  profileBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: COLORS.SECONDARY,
    gap: 12,
  },
  badgeItem: {
    alignItems: 'center',
    gap: 2,
  },
  badgeLabel: {
    fontSize: 10,
    color: '#888888',
    fontFamily: FONTS.PIXEL,
  },
  badgeValue: {
    fontSize: 15,
    color: '#333333',
    fontFamily: FONTS.PIXEL,
  },
  badgeDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#DDDDDD',
  },
  loadingBox: {
    alignItems: 'center',
    marginVertical: 40,
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: FONTS.PIXEL,
  },
  errorBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(244,67,54,0.08)',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 24,
    marginVertical: 20,
    gap: 12,
  },
  errorText: {
    fontSize: 13,
    color: '#C62828',
    fontFamily: FONTS.PIXEL,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(244,67,54,0.15)',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#C62828',
    fontFamily: FONTS.PIXEL,
  },
  weatherCard: {
    width: width * 0.88,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 16,
  },
  weatherTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityText: {
    fontSize: 14,
    color: '#444444',
    fontFamily: FONTS.PIXEL,
  },
  weatherDescText: {
    fontSize: 14,
    color: '#444444',
    fontFamily: FONTS.PIXEL,
  },
  weatherStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  weatherStat: {
    alignItems: 'center',
    gap: 2,
  },
  weatherStatValue: {
    fontSize: 28,
    color: '#333333',
    fontFamily: FONTS.PIXEL,
  },
  weatherStatLabel: {
    fontSize: 11,
    color: '#777777',
    fontFamily: FONTS.PIXEL,
  },
  feelsLikeText: {
    fontSize: 10,
    color: '#AAAAAA',
    fontFamily: FONTS.PIXEL,
    marginTop: 1,
  },
  weatherStatDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#E0E0E0',
  },
  aqiCard: {
    width: width * 0.88,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    gap: 12,
  },
  aqiTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aqiTitle: {
    fontSize: 14,
    color: '#444444',
    fontFamily: FONTS.PIXEL,
  },
  aqiEmoji: {
    fontSize: 18,
  },
  aqiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aqiLabelGroup: {
    width: 80,
    gap: 2,
  },
  aqiLabel: {
    fontSize: 11,
    color: '#666666',
    fontFamily: FONTS.PIXEL,
  },
  aqiValue: {
    fontSize: 10,
    fontFamily: FONTS.PIXEL,
  },
  aqiRightGroup: {
    flex: 1,
    gap: 4,
  },
  aqiBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  aqiBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  aqiGradeText: {
    fontSize: 10,
    fontFamily: FONTS.PIXEL,
    textAlign: 'right',
  },
  tipsTitleRow: {
    width: width * 0.88,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tipsTitle: {
    fontSize: 18,
    color: '#333333',
    fontFamily: FONTS.PIXEL,
  },
  tipsTap: {
    fontSize: 10,
    color: '#AAAAAA',
    fontFamily: FONTS.PIXEL,
  },
  tipCard: {
    width: width * 0.88,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.PRIMARY,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipIcon: {
    fontSize: 20,
  },
  tipCategory: {
    fontSize: 15,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
    flex: 1,
  },
  tipChevron: {
    fontSize: 11,
    color: '#AAAAAA',
  },
  tipText: {
    fontSize: 13,
    color: '#444444',
    fontFamily: FONTS.PIXEL,
    lineHeight: 22,
    marginTop: 10,
  },
  analysisHint: {
    backgroundColor: 'rgba(198,235,141,0.3)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    width: width * 0.88,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(198,235,141,0.6)',
  },
  analysisHintText: {
    fontSize: 13,
    color: '#2E7D32',
    fontFamily: FONTS.PIXEL,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    alignItems: 'center',
    gap: 16,
    marginTop: 12,
  },
  refreshBtn: {
    paddingVertical: 4,
  },
  refreshText: {
    fontSize: 18,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
  },
  goBackText: {
    fontSize: 14,
    color: '#ffffff',
    fontFamily: FONTS.PIXEL,
  },
});
