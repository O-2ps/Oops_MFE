import React from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as S from './style';
import BG from '../../assets/icons/BG.svg';
import Logo from '../../assets/icons/logo.svg';
import Star from '../../assets/icons/star.svg';
import StrokedText from '../components/StrokedText';
import { emailLogin, emailSignup } from '../api/emailAuth';
import { saveToken, saveNickname, saveCharacterId } from '../utils/tokenStorage';
import { RootStackParamList } from '../types/navigation';
import { COLORS, FONTS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;
type Mode = 'main' | 'login' | 'signup';

interface StarItemProps {
  top: number;
  right: number;
  size: number;
  rotate: string;
}

function StaticStar({ top, right, size, rotate }: StarItemProps) {
  return (
    <S.StarContainer
      $top={top}
      $right={right}
      $size={size}
      $rotate={rotate}
      style={{ transform: [{ rotate }] }}
      pointerEvents="none"
    >
      <Star width={size} height={size} fill="#FFD1E3" />
    </S.StarContainer>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  returnKeyType?: 'next' | 'done';
  editable?: boolean;
  onSubmitEditing?: () => void;
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  returnKeyType = 'next',
  editable = true,
  onSubmitEditing,
}: InputFieldProps) {
  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>{label}</Text>
      <TextInput
        style={inputStyles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? ''}
        placeholderTextColor="rgba(255,140,182,0.45)"
        secureTextEntry={secureTextEntry}
        autoCapitalize="none"
        keyboardType={keyboardType}
        returnKeyType={returnKeyType}
        editable={editable}
        onSubmitEditing={onSubmitEditing}
      />
    </View>
  );
}

export default function LandingScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [mode, setMode] = React.useState<Mode>('main');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [nickname, setNickname] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(20)).current;

  React.useEffect(() => {
    if (mode !== 'main') {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(20);
    }
  }, [mode]);

  const reset = () => {
    setEmail('');
    setPassword('');
    setNickname('');
  };

  const handleSubmit = async () => {
    if (loading) return;

    const trimEmail = email.trim();
    const trimPassword = password.trim();
    const trimNickname = nickname.trim();

    if (!trimEmail || !trimPassword) {
      Alert.alert('입력 오류', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    if (!trimEmail.includes('@')) {
      Alert.alert('입력 오류', '올바른 이메일 형식이 아닙니다.');
      return;
    }
    if (trimPassword.length < 6) {
      Alert.alert('입력 오류', '비밀번호는 6자 이상이어야 합니다.');
      return;
    }
    if (mode === 'signup' && !trimNickname) {
      Alert.alert('입력 오류', '닉네임을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const result =
        mode === 'signup'
          ? await emailSignup(trimEmail, trimPassword, trimNickname)
          : await emailLogin(trimEmail, trimPassword);

      await saveToken(result.token);
      await saveNickname(result.nickname);
      if (result.characterId) await saveCharacterId(result.characterId);
      navigation.navigate('MainCarousel');
    } catch (err: any) {
      Alert.alert(
        mode === 'signup' ? '회원가입 실패' : '로그인 실패',
        err?.message ?? '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (next: Mode) => {
    reset();
    setMode(next);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <S.Container>
        <View style={StyleSheet.absoluteFill}>
          <BG width={width} height={height} preserveAspectRatio="xMidYMid slice" />
        </View>

        <S.MainContent>
          <StaticStar top={-height * 0.18} right={width * 0.78} size={width * 1.0} rotate="18deg" />
          <StaticStar top={height * 0.12} right={width * 0.38} size={width * 0.55} rotate="-6deg" />
          <StaticStar top={height * 0.32} right={width * 0.82} size={width * 0.7} rotate="10deg" />
          <StaticStar top={height * 0.48} right={width * 0.45} size={width * 0.6} rotate="0deg" />
          <StaticStar top={height * 0.64} right={width * 0.18} size={width * 0.85} rotate="-14deg" />
          <StaticStar top={height * 0.84} right={-width * 0.08} size={width * 1.05} rotate="14deg" />

          <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1.5} style={styles.noticeText}>
            마이페이지는 로그인 후 이용 가능합니다.
          </StrokedText>

          <S.CenterSection>
            <View style={styles.logoContainer}>
              <Logo width={width * 0.6} height={(width * 0.6) * (122 / 245)} />
            </View>
            <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2.5} style={styles.subTitleText}>
              {'내 피부를 위한\n가장 정교한 선택'}
            </StrokedText>
          </S.CenterSection>

          <S.ButtonSection style={{ paddingBottom: 40 }}>
            {mode === 'main' ? (
              <>
                <S.LoginButton onPress={() => switchMode('login')}>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.buttonText} numberOfLines={1}>
                    [ 이메일 로그인 ]
                  </StrokedText>
                </S.LoginButton>
                <S.LoginButton onPress={() => navigation.navigate('MainCarousel')}>
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={2} style={styles.buttonText} numberOfLines={1}>
                    [ 비회원 로그인 ]
                  </StrokedText>
                </S.LoginButton>
              </>
            ) : (
              <Animated.View
                style={[
                  styles.card,
                  { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
              >
                {/* 카드 헤더 */}
                <View style={styles.cardHeader}>
                  <View style={styles.cardHeaderDot} />
                  <StrokedText strokeColor={COLORS.OFF_WHITE} strokeWidth={1.5} style={styles.cardTitle}>
                    {mode === 'login' ? '로그인' : '회원가입'}
                  </StrokedText>
                  <View style={styles.cardHeaderDot} />
                </View>

                {/* 입력 필드들 */}
                <View style={styles.fields}>
                  <InputField
                    label="이메일"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="example@email.com"
                    keyboardType="email-address"
                    returnKeyType="next"
                    editable={!loading}
                  />
                  <InputField
                    label="비밀번호"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="6자 이상"
                    secureTextEntry
                    returnKeyType={mode === 'signup' ? 'next' : 'done'}
                    editable={!loading}
                    onSubmitEditing={mode === 'login' ? handleSubmit : undefined}
                  />
                  {mode === 'signup' && (
                    <InputField
                      label="닉네임"
                      value={nickname}
                      onChangeText={setNickname}
                      placeholder="앱에서 사용할 이름"
                      returnKeyType="done"
                      editable={!loading}
                      onSubmitEditing={handleSubmit}
                    />
                  )}
                </View>

                {/* 제출 버튼 */}
                <TouchableOpacity
                  style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  activeOpacity={0.75}
                  disabled={loading}
                >
                  <Text style={styles.submitBtnText}>
                    {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
                  </Text>
                </TouchableOpacity>

                {/* 하단 링크 */}
                <View style={styles.footer}>
                  <TouchableOpacity
                    onPress={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                    disabled={loading}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.footerLink}>
                      {mode === 'login' ? '처음이신가요? 회원가입' : '이미 계정이 있어요'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.footerDivider}>|</Text>
                  <TouchableOpacity
                    onPress={() => switchMode('main')}
                    disabled={loading}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.footerLink}>취소</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            )}
          </S.ButtonSection>
        </S.MainContent>
      </S.Container>
    </KeyboardAvoidingView>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: {
    width: '100%',
    gap: 5,
  },
  label: {
    fontSize: 11,
    fontFamily: FONTS.PIXEL,
    color: COLORS.PRIMARY,
    letterSpacing: 1,
  },
  input: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: 'rgba(255,140,182,0.5)',
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    fontFamily: FONTS.PIXEL,
    color: COLORS.TEXT_DARK,
  },
});

const styles = StyleSheet.create({
  noticeText: {
    paddingHorizontal: 20,
    textAlign: 'center',
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
    zIndex: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  logoContainer: {
    marginBottom: 25,
    alignItems: 'center',
  },
  subTitleText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    lineHeight: 32,
    textAlign: 'center',
    fontFamily: FONTS.PIXEL,
  },
  buttonText: {
    fontSize: 20,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
  },

  /* 폼 카드 */
  card: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderWidth: 2,
    borderColor: COLORS.PRIMARY,
    padding: 22,
    gap: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardHeaderDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.PRIMARY,
  },
  cardTitle: {
    fontSize: 18,
    color: COLORS.PRIMARY,
    fontFamily: FONTS.PIXEL,
  },
  fields: {
    gap: 14,
  },

  /* 제출 버튼 */
  submitBtn: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 13,
    alignItems: 'center',
    width: '100%',
  },
  submitBtnDisabled: {
    opacity: 0.55,
  },
  submitBtnText: {
    fontSize: 16,
    fontFamily: FONTS.PIXEL,
    color: '#ffffff',
    letterSpacing: 1,
  },

  /* 하단 링크 */
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  footerLink: {
    fontSize: 12,
    fontFamily: FONTS.PIXEL,
    color: COLORS.TEXT_MID,
  },
  footerDivider: {
    fontSize: 12,
    color: 'rgba(255,140,182,0.4)',
  },
});
