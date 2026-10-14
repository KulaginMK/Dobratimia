import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { FeedHeader, ScreenHeader } from '@/components/blocks';
import { EmptyState } from '@/components/ui';
import type { FeedPageProps } from '@/features/feed/FeedPager';
import { useTheme } from '@/theme';
import { useSession } from './Session';

// Вход необязателен (решение владельца от 14 октября 2026 года). Без входа работают тест, техники, КРИК и SOS,
// но ничего не сохраняется, а подбор специалистов, «Доброе слово» и дневник открываются только после входа:
// их данные сервер отдаёт только вошедшим, а дневник — то, что сохраняется.

/** Что откроется после входа, и кнопка входа. */
export function SignInGate({ text }: { text: string }) {
  const t = useTheme();
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: t.space.xl }}>
      <EmptyState
        pose="hello"
        title="Откроется после входа"
        text={text}
        actionLabel="Войти через Google"
        onAction={() => router.push('/onboarding/sign-in')}
      />
    </ScrollView>
  );
}

/** Экран только для вошедших. Гость попадает сюда по ссылке, из браузера или кнопкой «Назад». */
export function SignedInOnly({ title, gate, children }: { title: string; gate: string; children: React.ReactNode }) {
  const t = useTheme();
  const router = useRouter();
  const { user } = useSession();
  if (user) return children;
  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title={title}
        onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        onSosPress={() => router.push('/sos')}
      />
      <SignInGate text={gate} />
    </View>
  );
}

/** Экран ленты только для вошедших: гостю — шапка ленты и SignInGate. */
export function signedInPage(Page: React.ComponentType<FeedPageProps>, title: string, gate: string) {
  return function SignedInPage(props: FeedPageProps) {
    const router = useRouter();
    const { user } = useSession();
    if (user) return <Page {...props} />;
    return (
      <View style={{ flex: 1 }}>
        <FeedHeader title={title} active={props.active} onSosPress={() => router.push('/sos')} />
        <SignInGate text={gate} />
      </View>
    );
  };
}
