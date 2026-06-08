import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import StrokedText from '../components/StrokedText';
import { COLORS, FONTS } from '../constants/theme';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { getSavedColorResult, getSavedSkinResult } from '../utils/analysisStorage';
import { WeatherData, fetchWeatherData } from '../api/weatherApi';
import { generateBeautyTips, BeautyTip } from '../utils/beautyTips';
import {
  getWeatherEmoji, getWeatherDesc,
  getUVLabel, getUVColor,
  getAQILabel, getAQIColor, getAQIEmoji,
  getPM25Label, getPM25Color,
} from '../utils/weatherUtils';

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

function ExpandableTipCard({ tip, index }: { tip: BeautyTip; index: number }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <TouchableOpacity
      style={styles.tipCard}
      onPress={() => setExpanded(prev => !prev)}
      activeOpacity={0.85}
    >
      <View style={styles.tipHeader}>
        <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.tipIcon}>{tip.icon}</StrokedText>
        <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1.5} style={styles.tipCategory}>{tip.category}</StrokedText>
        <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0} style={[styles.tipChevron, expanded && { transform: [{ rotate: '180deg' }] }]}>▼</StrokedText>
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
          <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1} style={styles.backText} numberOfLines={1}>← 뒤로</StrokedText>
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
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1.5} style={styles.retryText} numberOfLines={1}>다시 시도</StrokedText>
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
              <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.refreshText} numberOfLines={1}>
                [ 새로고침 ]
              </StrokedText>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 20, right: 20 }}>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={0.5} style={styles.goBackText} numberOfLines={1}>뒤로가기</StrokedText>
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
