export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  uvIndex: number;
  weatherCode: number;
  cityName: string;
  pm10: number | null;
  pm25: number | null;
}

export async function fetchWeatherData(): Promise<WeatherData> {
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
