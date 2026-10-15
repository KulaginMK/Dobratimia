import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { ScreenHeader } from '@/components/blocks';
import { EmptyState } from '@/components/ui';
import { useTheme } from '@/theme';
import { useSession } from './Session';

// Вход необязателен (решения владельца от 14 и 15 октября 2026 года). Без входа работают тест, техники, КРИК, SOS,
// подбор специалистов и «Доброе слово», но ничего не сохраняется и не отмечается. Дневник и избранные — то, что
// сохраняется, — открываются только после входа.

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
