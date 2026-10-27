import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { FeedHeader, ListItemCard, PullHint } from '@/components/blocks';
import { useTopInset } from '@/components/blocks/useTopInset';
import { Timka } from '@/components/brand';
import { Chip, EmptyState } from '@/components/ui';
import { TECHNIQUES, TECHNIQUE_FILTERS, type Technique, type TechniqueFilter } from '@/data/techniques';
import type { FeedPageProps } from '@/features/feed/FeedPager';
import { useOnceHint } from '@/features/feed/useOnceHint';
import { useReportScrollTop } from '@/features/feed/useReportScrollTop';
import { useTheme } from '@/theme';

// Подсказка при первом визите (TIMKA-MOTION.md, пункт 8): Тимка висит на плашке и дважды тянет её вниз.
const HINT_TIMKA = 40;
// Тимка держится за плашку ростком: верхние 15 % рисунка заходят на неё.
const HINT_GRIP = 0.15;
const HINT_TUG = 16;
const HINT_TUGS = 2;
const HINT_SHOWN_MS = 3000;
const easeOut = Easing.out(Easing.cubic);

/** Техники самопомощи: фильтры и список. Свайп вниз из самого верха списка открывает медитации и Pomodoro. */
export function TechniquesPage({ active, onScrollAtTop }: FeedPageProps) {
  const t = useTheme();
  const router = useRouter();
  const topInset = useTopInset();
  const onScroll = useReportScrollTop(onScrollAtTop);
  const reduced = useReducedMotion();
  const hint = useOnceHint('techniquesPull', active, HINT_SHOWN_MS);
  const tug = useSharedValue(0);
  const tugStyle = useAnimatedStyle(() => ({ transform: [{ translateY: tug.get() }] }));
  useEffect(() => {
    if (!hint || reduced) return;
    const timing = { duration: t.motion.sheet, easing: easeOut };
    tug.set(withRepeat(withSequence(withTiming(HINT_TUG, timing), withTiming(0, timing)), HINT_TUGS));
  }, [hint, reduced, tug, t.motion.sheet]);
  // null — «Все».
  const [filter, setFilter] = useState<TechniqueFilter | null>(null);
  const shown = filter ? TECHNIQUES.filter((technique) => technique.filters.includes(filter)) : TECHNIQUES;

  const open = (technique: Technique) => {
    if (technique.opens === 'pomodoro') router.push('/meditation?from=feed&tab=pomodoro');
    else router.push(`/technique/${technique.id}`);
  };

  return (
    <ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: t.space.xl }}
    >
      <Animated.View style={[{ zIndex: 1, paddingTop: topInset, paddingHorizontal: t.space.screen }, tugStyle]}>
        <PullHint
          label="Потяните вниз — медитации и Pomodoro"
          onPress={() => router.push('/meditation?from=feed')}
        />
        {hint ? (
          <Animated.View
            entering={FadeIn.duration(t.motion.toast)}
            exiting={FadeOut.duration(t.motion.toast)}
            aria-hidden
            pointerEvents="none"
            style={{ position: 'absolute', top: '100%', alignSelf: 'center', marginTop: -HINT_TIMKA * HINT_GRIP }}
          >
            <Timka pose="hello" size={HINT_TIMKA} motion="idle" />
          </Animated.View>
        ) : null}
      </Animated.View>
      <FeedHeader
        title="Техники"
        subtitle="Проверенные способы снять напряжение"
        active={active}
        inset={false}
        onSosPress={() => router.push('/sos')}
      />

      {/* Фильтры переносятся на вторую строку: горизонтальная прокрутка мешала бы свайпу ленты. */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: t.space.xs,
          paddingTop: t.space.xs,
          paddingHorizontal: t.space.screen,
        }}
      >
        <Chip selected={filter === null} onChange={() => setFilter(null)}>
          Все
        </Chip>
        {TECHNIQUE_FILTERS.map((item) => (
          <Chip
            key={item.id}
            selected={filter === item.id}
            onChange={() => setFilter(filter === item.id ? null : item.id)}
          >
            {item.label}
          </Chip>
        ))}
      </View>

      {shown.length === 0 ? (
        <EmptyState
          title="Здесь пока пусто"
          text="Под этот фильтр техник пока нет."
          active={active}
          actionLabel="Показать все"
          onAction={() => setFilter(null)}
        />
      ) : (
        <View style={{ paddingTop: t.space.xs, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
          {shown.map((technique) => (
            <ListItemCard
              key={technique.id}
              icon={technique.icon}
              title={technique.title}
              caption={`${technique.duration} · ${technique.summary}`}
              onPress={() => open(technique)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
