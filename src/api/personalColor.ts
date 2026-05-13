const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface SeasonInfo {
  type: string;
  name: string;
  description: string;
  colors: string[];
}

export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  } catch (error) {
    console.error('checkHealth error:', error);
    throw error;
  }
};

export const fetchSeasons = async (): Promise<SeasonInfo[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/personal-color/seasons`);
    if (!response.ok) {
      throw new Error('Failed to fetch seasons');
    }
    return response.json();
  } catch (error) {
    return [
      {
        type: 'spring',
        name: '봄 웜 라이트',
        description: '고명도, 저채도의 밝고 따뜻한 파스텔톤이\\n가장 잘 어울리는 유형입니다.',
        colors: ['#FFCDD2', '#F8BBD0', '#E1BEE7']
      }
    ];
  }
};

export const analyzePersonalColor = async (imageUri: string): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    } as any);

    const response = await fetch(`${API_BASE_URL}/api/personal-color/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to analyze image');
    }
    return response.json();
  } catch (error) {
    console.error('analyzePersonalColor error:', error);
    return {
      data: {
        season: 'spring',
        analysis: {
          isWarm: true,
          isBright: true
        }
      }
    };
  }
};
