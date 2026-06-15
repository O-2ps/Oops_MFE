import * as FileSystem from 'expo-file-system';

const HF_TOKEN = process.env.EXPO_PUBLIC_HF_TOKEN ?? '';

// 투명 PNG를 base64로 반환
export async function removeBackgroundHF(imageUri: string): Promise<string> {
  if (!HF_TOKEN) throw new Error('EXPO_PUBLIC_HF_TOKEN이 설정되지 않았습니다.');

  const base64 = await FileSystem.readAsStringAsync(imageUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const response = await fetch(
    'https://api-inference.huggingface.co/models/briaai/RMBG-2.0',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'image/jpeg',
        'X-Wait-For-Model': 'true', // 콜드 스타트 대기
      },
      body: bytes,
    }
  );

  if (!response.ok) {
    const msg = await response.text().catch(() => String(response.status));
    throw new Error(`HuggingFace: ${msg}`);
  }

  const buffer = await response.arrayBuffer();
  const responseBytes = new Uint8Array(buffer);
  let binary = '';
  const CHUNK = 8192;
  for (let i = 0; i < responseBytes.length; i += CHUNK) {
    binary += String.fromCharCode(...Array.from(responseBytes.subarray(i, i + CHUNK)));
  }
  return btoa(binary);
}

export async function saveBase64ToCache(base64: string, ext: string = 'jpg'): Promise<string> {
  const dest = `${FileSystem.cacheDirectory}processed_${Date.now()}.${ext}`;
  await FileSystem.writeAsStringAsync(dest, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return dest;
}
