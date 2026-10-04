import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/blocks';
import { SegmentedControl } from '@/components/ui';
import { TECHNIQUES_INDEX } from '@/features/feed/feedScreens';
import { SlideFromTopScreen } from '@/features/navigation/SlideFromTopScreen';
import { useTheme } from '@/theme';
import { BreathTab } from './BreathTab';
import { PomodoroTab } from './PomodoroTab';
import { parseCycles, parseScheme } from './breath';

type Tab = 'breath' | 'pomodoro';

const TABS: { value: Tab; label: string }[] = [
  { value: 'breath', label: 'Дыхание' },
  { value: 'pomodoro', label: 'Pomodoro' },
];

/**
 * Медитации и Pomodoro. Доступны без входа: сюда ведёт SOS.
 * Параметры: ?tab=breath|pomodoro&scheme=4-6|4-7-8|5-5-5&cycles=N&from=feed|sos|technique (docs/06).
 */
export function MeditationScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ tab?: string; scheme?: string; cycles?: string; from?: string }>();
  const [tab, setTab] = useState<Tab>(params.tab === 'pomodoro' ? 'pomodoro' : 'breath');

  const body = (
    <View style={{ paddingTop: t.space.xs, gap: t.space.md }}>
      <View style={{ paddingHorizontal: t.space.screen }}>
        <SegmentedControl accessibilityLabel="Практика" options={TABS} value={tab} onChange={setTab} />
      </View>
      {/* Вкладка «Дыхание» живёт, только пока открыта: уход на Pomodoro останавливает практику. */}
      {tab === 'breath' ? (
        <BreathTab initialScheme={parseScheme(params.scheme)} cycles={parseCycles(params.cycles)} />
      ) : (
        <PomodoroTab />
      )}
    </View>
  );

  // Из ленты экран выезжает сверху над «Техниками»: подсказка о свайпе и индикатор ленты.
  if (params.from === 'feed') {
    return (
      <SlideFromTopScreen
        hint="Свайп вверх — к техникам"
        hintAccessibilityLabel="Назад к техникам"
        feedIndex={TECHNIQUES_INDEX}
      >
        {body}
      </SlideFromTopScreen>
    );
  }

  // Из SOS или с экрана техники: обычная шапка «Назад», индикатора ленты нет.
  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title="Медитации"
        onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        // Пришли из SOS — кнопка SOS возвращает туда же, а не открывает второй такой экран.
        onSosPress={() => (params.from === 'sos' && router.canGoBack() ? router.back() : router.push('/sos'))}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + t.space.xl }}>{body}</ScrollView>
    </View>
  );
}
