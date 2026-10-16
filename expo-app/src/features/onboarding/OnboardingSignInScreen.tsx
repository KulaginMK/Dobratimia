import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { ConsentCheck, GoogleButton } from '@/components/blocks';
import { Logo } from '@/components/brand';
import { Button, useToast } from '@/components/ui';
import { CONSENT_URL, PRIVACY_URL } from '@/data/team';
import { useSession } from '@/features/session/Session';
import { useSelectedUniversity } from '@/features/university/SelectedUniversity';
import { useOpenLink } from '@/lib/links';
import { useTheme } from '@/theme';
import { OnboardingStep } from './OnboardingStep';

// Размеры из макета OnbSignIn.
const LOGO_SIZE = 112;
const HEAD_PAD_TOP = 88;
const HEAD_PAD_H = 28;
const HEAD_GAP = 14;
const TITLE_MARGIN_TOP = 28;

/**
 * Шаг 4 (эталон OnbSignIn): вход через Google. Сюда же приложение возвращает после «Выйти из аккаунта» —
 * тогда стрелки «Назад» нет. После входа — выбор вуза или сразу Главная, если вуз уже выбран.
 * Вход необязателен (решение владельца от 14 октября 2026 года): «Продолжить без входа» ведёт туда же,
 * но без сохранения данных. Кнопки нет в макете.
 * В вебе страница целиком уходит на Google и возвращается на экран /auth/callback: он и завершает вход.
 * Согласие на обработку данных — отдельная отметка, без неё кнопка Google не нажимается; специалисты входят
 * со своего экрана со своим согласием (решение владельца от 16 октября 2026 года). Этих элементов нет в макете.
 */
export function OnboardingSignInScreen() {
  const t = useTheme();
  const router = useRouter();
  const toast = useToast();
  const openLink = useOpenLink();
  const { width } = useWindowDimensions();
  const { user, signIn, skipSignIn } = useSession();
  const { universityId } = useSelectedUniversity();
  const [busy, setBusy] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Экран входа при этом заменяется: вернуться «назад ко входу» после входа нельзя.
  const next = useCallback(
    () => router.replace(universityId ? '/?s=home' : '/onboarding/university'),
    [universityId, router],
  );

  // Человек вошёл (или открыл экран, уже войдя — в вебе кнопкой «Назад» браузера): ведём дальше.
  useFocusEffect(
    useCallback(() => {
      if (user) next();
    }, [user, next]),
  );

  const onSignIn = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // Закрыл окно Google — остаёмся на экране входа; остальное сделает переход выше.
      await signIn('user');
    } catch {
      toast.show({ message: 'Не удалось войти. Проверьте интернет и попробуйте ещё раз.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <OnboardingStep
      step={4}
      onBack={router.canGoBack() ? () => router.back() : undefined}
      footer={
        <View style={{ gap: t.space.sm }}>
          <ConsentCheck
            checked={agreed}
            onChange={setAgreed}
            label="Принимаю политику конфиденциальности и даю согласие на обработку персональных данных"
            links={[
              { title: 'Политика конфиденциальности', onPress: () => openLink(PRIVACY_URL) },
              { title: 'Согласие', onPress: () => openLink(CONSENT_URL) },
            ]}
          />
          <GoogleButton disabled={busy || !agreed} onPress={onSignIn}>
            Войти через Google
          </GoogleButton>
          <Button
            variant="text"
            fullWidth
            disabled={busy}
            onPress={() => {
              skipSignIn();
              next();
            }}
          >
            Продолжить без входа
          </Button>
          <Button
            variant="text"
            fullWidth
            disabled={busy}
            onPress={() => router.push('/onboarding/specialist')}
          >
            Зарегистрироваться как специалист
          </Button>
        </View>
      }
    >
      <View style={{ alignItems: 'center', paddingTop: HEAD_PAD_TOP, paddingHorizontal: HEAD_PAD_H, gap: HEAD_GAP }}>
        {/* В макете надпись логотипа шире экрана и обрезана — здесь знак уменьшается, чтобы слово поместилось. */}
        <Logo variant="stacked" size={LOGO_SIZE} maxWidth={width - HEAD_PAD_H * 2} />
        <Text
          accessibilityRole="header"
          style={[t.type.h1, { marginTop: TITLE_MARGIN_TOP, color: t.color.text, textAlign: 'center' }]}
        >
          Войдите, чтобы начать
        </Text>
        <Text style={[t.type.body, { color: t.color.textMuted, textAlign: 'center' }]}>
          Google-аккаунт нужен только для входа. Ваши ответы, отметки настроения и избранные специалисты видны только
          вам.
        </Text>
      </View>
    </OnboardingStep>
  );
}
