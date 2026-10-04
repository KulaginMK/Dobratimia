import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { FeedHeader, PullHint, SosRound } from '@/components/blocks';
import { useTopInset } from '@/components/blocks/useTopInset';
import { Logo } from '@/components/brand';
import { PlaceholderNote, type PlaceholderLink } from '@/features/navigation/PlaceholderScreen';
import { useTheme } from '@/theme';
import type { FeedPageProps } from './FeedPager';
import type { FeedKey } from './feedScreens';

// Заглушки экранов ленты этапа 3: шапка с SOS, подсказки о жестах и переходы. Вёрстка — на этапах 5, 6 и 10.

const DEV_LINKS: PlaceholderLink[] = __DEV__ ? [{ label: 'Витрина компонентов', href: '/dev/kitchen-sink' }] : [];

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

function HomePage() {
  const t = useTheme();
  const router = useRouter();
  const topInset = useTopInset();
  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: topInset,
          paddingHorizontal: t.space.screen,
        }}
      >
        <Logo />
        <SosRound size="lg" onPress={() => router.push('/sos')} />
      </View>
      <PlaceholderNote
        stage={5}
        etalon="Home"
        links={[
          { label: 'КРИК', href: '/scream' },
          { label: 'Дневник', href: '/diary' },
          { label: 'Карта', href: '/map' },
          { label: 'Тест DASS-21', href: '/dass' },
          { label: 'Профиль', href: '/profile' },
          { label: 'О проекте', href: '/about' },
          ...DEV_LINKS,
        ]}
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

export const placeholderPages: Record<FeedKey, React.ComponentType<FeedPageProps>> = {
  anatomy: AnatomyPage,
  techniques: TechniquesPage,
  home: HomePage,
  match: MatchPage,
  word: WordPage,
};
