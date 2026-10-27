import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { FeedHeader, ListItemCard, PullHint } from '@/components/blocks';
import { useTopInset } from '@/components/blocks/useTopInset';
import { Chip, EmptyState } from '@/components/ui';
import { TECHNIQUES, TECHNIQUE_FILTERS, type Technique, type TechniqueFilter } from '@/data/techniques';
import type { FeedPageProps } from '@/features/feed/FeedPager';
import { useReportScrollTop } from '@/features/feed/useReportScrollTop';
import { useTheme } from '@/theme';

/** Техники самопомощи: фильтры и список. Свайп вниз из самого верха списка открывает медитации и Pomodoro. */
export function TechniquesPage({ active, onScrollAtTop }: FeedPageProps) {
  const t = useTheme();
  const router = useRouter();
  const topInset = useTopInset();
  const onScroll = useReportScrollTop(onScrollAtTop);
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
      <View style={{ paddingTop: topInset, paddingHorizontal: t.space.screen }}>
        <PullHint
          label="Потяните вниз — медитации и Pomodoro"
          onPress={() => router.push('/meditation?from=feed')}
        />
      </View>
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
