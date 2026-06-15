const BASE = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const KEY  = process.env.EXPO_PUBLIC_SUPABASE_KEY!;

const headers = {
  'Content-Type': 'application/json',
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
};

async function authFetch(path: string, body: object): Promise<any> {
  if (!KEY) throw new Error('설정 오류: SUPABASE_KEY 없음. Metro를 --clear로 재시작하세요.');

  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok) {
    const code = data?.error_code ?? '';
    if (code === 'email_exists') throw new Error('이미 가입된 이메일입니다. 로그인해주세요.');
    if (code === 'invalid_credentials') throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    if (code === 'email_not_confirmed') throw new Error('이메일 인증이 필요합니다.');
    throw new Error(data?.msg ?? data?.message ?? `오류 (${res.status})`);
  }
  return data;
}

async function restInsert(path: string, body: object): Promise<void> {
  if (!KEY) return;
  await fetch(`${BASE}/rest/v1${path}`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify(body),
  });
}

interface AuthResult {
  token: string;
  nickname: string;
  characterId: number | null;
}

export async function emailSignup(
  email: string,
  password: string,
  nickname: string,
): Promise<AuthResult> {
  try {
    await authFetch('/auth/v1/admin/users', {
      email,
      password,
      email_confirm: true,
      user_metadata: { nickname },
    });
  } catch (err: any) {
    // 이미 가입된 경우 → 로그인 시도
    if (err.message.includes('이미 가입')) {
      return emailLogin(email, password);
    }
    throw err;
  }

  await restInsert('/character', { email, nickname });
  return emailLogin(email, password);
}

export async function emailLogin(
  email: string,
  password: string,
): Promise<AuthResult> {
  const data = await authFetch('/auth/v1/token?grant_type=password', { email, password });

  // character 테이블에서 id, 닉네임 조회
  let nickname = email.split('@')[0];
  let characterId: number | null = null;
  if (KEY) {
    const res = await fetch(
      `${BASE}/rest/v1/character?email=eq.${encodeURIComponent(email)}&select=id,nickname&limit=1`,
      { headers },
    );
    const rows: { id: number; nickname: string }[] = res.ok ? await res.json() : [];
    if (rows[0]) {
      nickname = rows[0].nickname;
      characterId = rows[0].id;
    }
  }

  return { token: data.access_token, nickname, characterId };
}
