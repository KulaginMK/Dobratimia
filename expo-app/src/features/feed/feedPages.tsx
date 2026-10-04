import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { FeedHeader, PullHint } from '@/components/blocks';
import { useTopInset } from '@/components/blocks/useTopInset';
import { HomePage } from '@/features/home/HomePage';
import { PlaceholderNote } from '@/features/navigation/PlaceholderScreen';
import { useTheme } from '@/theme';
import type { FeedPageProps } from './FeedPager';
import type { FeedKey } from './feedScreens';

// Экраны ленты. Главная свёрстана; остальные пока заглушки этапа 3: шапка с SOS, подсказки о жестах и переходы.
// Их вёрстка — на этапах 6 и 10.

function AnatomyPage({ active }: FeedPageProps) {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <FeedHeader title="Анатомия стресса" active={active} onSosPress={() => router.push('/sos')} />
      <PlaceholderNote
        stage={6}
        etalon="Anatomy"
        links={[{ label: 'Дыхание 4-7-8', href: '/technique/breath-4-7-8' }]}
      />
    </View>
  );
}

function TechniquesPage({ active }: FeedPageProps) {
  const t = useTheme();
  const router = useRouter();
  const topInset = useTopInset();
  return (
    <View style={{ flex: 1 }}>
      <View style={{ paddingTop: topInset, paddingHorizontal: t.space.screen }}>
        <PullHint
          label="Потяните вниз — медитации и Pomodoro"
          onPress={() => router.push('/meditation?from=feed')}
        />
      </View>
      <FeedHeader title="Техники" active={active} inset={false} onSosPress={() => router.push('/sos')} />
      <PlaceholderNote
        stage={6}
        etalon="Techniques"
        links={[{ label: 'Дыхание 4-7-8', href: '/technique/breath-4-7-8' }]}
      />
    </View>
  );
}

function MatchPage({ active }: FeedPageProps) {
  const t = useTheme();
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <FeedHeader title="Подбор специалиста" active={active} onSosPress={() => router.push('/sos')} />
      <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen }}>
        <PullHint label="Потяните вниз — избранные контакты" onPress={() => router.push('/favorites')} />
      </View>
      <PlaceholderNote stage={10} etalon="Match" links={[{ label: 'Нравится', href: '/specialist/demo' }]} />
    </View>
  );
}

function WordPage({ active }: FeedPageProps) {
  const router = useRouter();
  return (
    <View style={{ flex: 1 }}>
      <FeedHeader title="Доброе слово" active={active} onSosPress={() => router.push('/sos')} />
      <PlaceholderNote stage={10} etalon="GoodWord" />
    </View>
  );
}

export const feedPages: Record<FeedKey, React.ComponentType<FeedPageProps>> = {
  anatomy: AnatomyPage,
  techniques: TechniquesPage,
  home: HomePage,
  match: MatchPage,
  word: WordPage,
};
