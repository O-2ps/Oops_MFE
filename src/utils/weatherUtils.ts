export function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  return '⛈️';
}

export function getWeatherDesc(code: number): string {
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

export function getUVLabel(uv: number): string {
  if (uv < 3) return '낮음';
  if (uv < 6) return '보통';
  if (uv < 8) return '높음';
  return '매우높음';
}

export function getUVColor(uv: number): string {
  if (uv < 3) return '#4CAF50';
  if (uv < 6) return '#FF9800';
  if (uv < 8) return '#FF5722';
  return '#B71C1C';
}

export function getAQILabel(pm10: number): string {
  if (pm10 < 30) return '좋음';
  if (pm10 < 80) return '보통';
  if (pm10 < 150) return '나쁨';
  return '매우나쁨';
}

export function getAQIColor(pm10: number): string {
  if (pm10 < 30) return '#4CAF50';
  if (pm10 < 80) return '#FF9800';
  if (pm10 < 150) return '#F44336';
  return '#9C27B0';
}

export function getAQIEmoji(pm10: number): string {
  if (pm10 < 30) return '😊';
  if (pm10 < 80) return '😐';
  if (pm10 < 150) return '😷';
  return '🚫';
}

export function getPM25Label(pm25: number): string {
  if (pm25 < 15) return '좋음';
  if (pm25 < 35) return '보통';
  if (pm25 < 75) return '나쁨';
  return '매우나쁨';
}

export function getPM25Color(pm25: number): string {
  if (pm25 < 15) return '#4CAF50';
  if (pm25 < 35) return '#FF9800';
  if (pm25 < 75) return '#F44336';
  return '#9C27B0';
}
