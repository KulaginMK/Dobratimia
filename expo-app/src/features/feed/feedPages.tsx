import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { FeedHeader, PullHint } from '@/components/blocks';
import { AnatomyPage } from '@/features/anatomy/AnatomyPage';
import { HomePage } from '@/features/home/HomePage';
import { PlaceholderNote } from '@/features/navigation/PlaceholderScreen';
import { TechniquesPage } from '@/features/techniques/TechniquesPage';
import { useTheme } from '@/theme';
import type { FeedPageProps } from './FeedPager';
import type { FeedKey } from './feedScreens';

// Экраны ленты. «Подбор специалиста» и «Доброе слово» пока заглушки этапа 3: шапка с SOS,
// подсказка о жесте и переходы. Их вёрстка — на этапе 10.

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
