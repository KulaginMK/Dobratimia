import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AnatomyFigure, BulletItem, FeedHeader } from '@/components/blocks';
import { Chip } from '@/components/ui';
import { focusRing, isFocused } from '@/components/ui/focus';
import { DEFAULT_ORGAN, ORGANS, type OrganId } from '@/data/anatomy';
import type { FeedPageProps } from '@/features/feed/FeedPager';
import { useReportScrollTop } from '@/features/feed/useReportScrollTop';
import { useTheme } from '@/theme';

/** «Анатомия стресса»: 2D-силуэт с органами и карточка выбранного органа. По умолчанию выбрано «Сердце». */
export function AnatomyPage({ active, onScrollAtTop }: FeedPageProps) {
  const t = useTheme();
  const router = useRouter();
  const onScroll = useReportScrollTop(onScrollAtTop);
  const [selected, setSelected] = useState<OrganId>(DEFAULT_ORGAN);
  const organ = ORGANS.find((item) => item.id === selected) ?? ORGANS[0];

  return (
    <ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: t.space.xl }}
    >
      <FeedHeader
        title="Анатомия стресса"
        subtitle="Нажмите на орган, чтобы узнать, что с ним происходит"
        active={active}
        onSosPress={() => router.push('/sos')}
      />

      <View style={{ paddingTop: t.space.xs }}>
        <AnatomyFigure organs={ORGANS} selected={selected} onSelect={setSelected} />
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: t.space.xs,
          paddingTop: t.space.xs,
          paddingHorizontal: t.space.screen,
        }}
      >
        {ORGANS.map((item) => (
          <Chip key={item.id} selected={item.id === selected} onChange={() => setSelected(item.id)}>
            {item.name}
          </Chip>
        ))}
      </View>

      <View
        style={{
          marginTop: t.space.sm,
          marginHorizontal: t.space.screen,
          padding: t.space.lg,
          borderRadius: t.radius.xl,
          backgroundColor: t.color.surface,
          boxShadow: t.shadow.md,
          gap: t.space.sm,
        }}
      >
        <Text accessibilityRole="header" style={[t.type.h2, { color: t.color.text }]}>
          {organ.name}
        </Text>
        <Text style={[t.type.body, { color: t.color.text }]}>
          <Text style={t.type.bodyStrong}>Что происходит. </Text>
          {organ.what}
        </Text>
        <Text accessibilityRole="header" style={[t.type.bodyStrong, { color: t.color.text }]}>
          Как помочь себе
        </Text>
        {organ.help.map((item) => (
          <BulletItem key={item}>{item}</BulletItem>
        ))}
        {organ.technique ? (
          <Pressable
            onPress={() => router.push(`/technique/${organ.technique!.id}`)}
            accessibilityRole="link"
            style={(state) => [
              { minHeight: t.size.touch, justifyContent: 'center', alignSelf: 'flex-start' },
              focusRing(t, isFocused(state)),
            ]}
          >
            <Text style={[t.type.bodyStrong, { color: t.color.primary }]}>{organ.technique.linkLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </ScrollView>
  );
}
