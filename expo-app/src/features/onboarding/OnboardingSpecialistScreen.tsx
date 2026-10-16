import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { ConsentCheck, GoogleButton, HeroIcon, InlineLink } from '@/components/blocks';
import { Button, useToast } from '@/components/ui';
import { SPECIALIST_CONSENT_URL, SPECIALIST_PRIVACY_URL, TEAM_EMAIL } from '@/data/team';
import { useSession } from '@/features/session/Session';
import { useOpenLink } from '@/lib/links';
import { useTheme } from '@/theme';
import { OnboardingStep, useStepBack } from './OnboardingStep';

/** Письмо команде с дипломом. Готовит его приложение, отправляет сам человек из своей почты. */
function diplomaMailUrl(email: string | null): string {
  const body = `Здравствуйте! Хочу вести карточку специалиста в «Добратимии».\nПочта Google для входа: ${email ?? ''}\nДиплом — во вложении.`;
  return `mailto:${TEAM_EMAIL}?subject=${encodeURIComponent('Добратимия: кабинет специалиста')}&body=${encodeURIComponent(body)}`;
}

/**
 * «Зарегистрироваться как специалист» (решение владельца от 16 октября 2026 года; в макетах экрана нет).
 * Кабинет открывает администратор после просмотра диплома: вписывает почту в specialist_accounts, и при входе
 * сервер даёт роль specialist (link_specialist). Здесь — согласие специалиста и вход через Google.
 * Вошёл специалист — в кабинет. Почты среди специалистов нет — выходим (согласия студента человек не давал)
 * и объясняем, что делать дальше.
 */
export function OnboardingSpecialistScreen() {
  const t = useTheme();
  const router = useRouter();
  const toast = useToast();
  const openLink = useOpenLink();
  const back = useStepBack('/onboarding/sign-in');
  const { user, signIn, signInKind, signOut } = useSession();
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  // Почта, с которой вошли, если кабинета для неё пока нет.
  const [notLinked, setNotLinked] = useState<string | null>(null);
  // Один вход — одно решение, куда вести: эффект перезапускается при каждой отрисовке.
  const handled = useRef<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!user) {
        handled.current = null;
        return;
      }
      if (handled.current === user.id) return;
      handled.current = user.id;
      // Сюда пришёл уже вошедший студент или администратор (в вебе — по ссылке): здесь ему делать нечего.
      if (signInKind !== 'specialist' || user.role === 'admin') {
        router.replace('/?s=home');
        return;
      }
      if (user.role === 'specialist') {
        // Онбординг убираем: «Назад в профиль» из кабинета не должен вернуть ко входу.
        if (router.canDismiss()) router.dismissAll();
        router.replace('/profile');
        router.push('/cabinet');
        return;
      }
      setNotLinked(user.email);
      signOut();
    }, [user, signInKind, router, signOut]),
  );

  const onSignIn = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await signIn('specialist');
    } catch {
      toast.show({ message: 'Не удалось войти. Проверьте интернет и попробуйте ещё раз.', tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const head = (title: string, children: React.ReactNode) => (
    <View style={{ paddingTop: t.space['2xl'], paddingHorizontal: t.space.xl, gap: t.space.md }}>
      <HeroIcon icon="specialist" />
      <Text accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
        {title}
      </Text>
      {children}
    </View>
  );

  if (notLinked !== null) {
    return (
      <OnboardingStep
        step={4}
        onBack={() => setNotLinked(null)}
        footer={
          <View style={{ gap: t.space.sm }}>
            <Button size="lg" icon="message" fullWidth onPress={() => openLink(diplomaMailUrl(notLinked))}>
              Написать нам
            </Button>
            <Button variant="outline" fullWidth onPress={() => setNotLinked(null)}>
              Войти ещё раз
            </Button>
          </View>
        }
      >
        {head(
          'Кабинет пока не открыт',
          <Text style={[t.type.body, { color: t.color.text }]}>
            {`Почты ${notLinked} пока нет среди специалистов. Пришлите диплом с этой почты на ${TEAM_EMAIL} — после проверки администратор откроет кабинет, и вы сможете войти здесь.`}
          </Text>,
        )}
      </OnboardingStep>
    );
  }

  return (
    <OnboardingStep
      step={4}
      onBack={back}
      footer={
        <View style={{ gap: t.space.sm }}>
          <ConsentCheck
            checked={agreed}
            onChange={setAgreed}
            label="Принимаю политику конфиденциальности для специалистов и даю согласие на обработку персональных данных"
            links={[
              { title: 'Политика для специалистов', onPress: () => openLink(SPECIALIST_PRIVACY_URL) },
              { title: 'Согласие специалиста', onPress: () => openLink(SPECIALIST_CONSENT_URL) },
            ]}
          />
          <GoogleButton disabled={busy || !agreed} onPress={onSignIn}>
            Войти через Google
          </GoogleButton>
        </View>
      }
    >
      {head(
        'Кабинет специалиста',
        <>
          <Text style={[t.type.body, { color: t.color.text }]}>
            Психологи и психотерапевты ведут здесь свою карточку в подборе специалистов. Кабинет открывает
            администратор после того, как посмотрит ваш диплом.
          </Text>
          <Text style={[t.type.body, { color: t.color.text }]}>
            {'Пришлите диплом на '}
            <InlineLink color={t.color.primary} onPress={() => openLink(diplomaMailUrl(null))}>
              {TEAM_EMAIL}
            </InlineLink>
            {' и укажите почту Google, с которой будете входить. Уже прислали — войдите с этой почтой.'}
          </Text>
        </>,
      )}
    </OnboardingStep>
  );
}
