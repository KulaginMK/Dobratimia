import { Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, View, useWindowDimensions } from 'react-native';
import { GoogleButton, InlineLink } from '@/components/blocks';
import { Logo } from '@/components/brand';
import { useToast } from '@/components/ui';
import { CONSENT_URL, PRIVACY_URL } from '@/data/mocks/links';
import { useSession } from '@/features/session/Session';
import { useSelectedUniversity } from '@/features/university/SelectedUniversity';
import { DOCUMENT_PENDING, useOpenLink } from '@/lib/links';
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
 */
export function OnboardingSignInScreen() {
  const t = useTheme();
  const router = useRouter();
  const toast = useToast();
  const openLink = useOpenLink();
  const { width } = useWindowDimensions();
  const { user, signIn } = useSession();
  const { universityId } = useSelectedUniversity();
  const [busy, setBusy] = useState(false);
  // Экран открыли, уже войдя (в вебе — кнопкой «Назад» браузера): входить незачем.
  const [alreadySignedIn] = useState(user !== null);

  const onSignIn = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signIn();
      if (universityId) router.replace('/?s=home');
      else router.push('/onboarding/university');
    } catch {
      toast.show({ message: 'Не удалось войти. Проверьте интернет и попробуйте ещё раз.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  if (alreadySignedIn) return <Redirect href="/?s=home" />;

  return (
    <OnboardingStep
      step={4}
      onBack={router.canGoBack() ? () => router.back() : undefined}
      footer={
        <View style={{ gap: t.space.md }}>
          <GoogleButton disabled={busy} onPress={onSignIn}>
            Войти через Google
          </GoogleButton>
          <Text style={[t.type.caption, { color: t.color.textMuted, textAlign: 'center' }]}>
            {'Продолжая, вы принимаете '}
            <InlineLink color={t.color.primary} onPress={() => openLink(PRIVACY_URL, DOCUMENT_PENDING)}>
              политику конфиденциальности
            </InlineLink>
            {' и даёте '}
            <InlineLink color={t.color.primary} onPress={() => openLink(CONSENT_URL, DOCUMENT_PENDING)}>
              согласие на обработку персональных данных
            </InlineLink>
            .
          </Text>
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
