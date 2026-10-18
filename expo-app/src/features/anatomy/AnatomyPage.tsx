import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AnatomyFigure, BulletItem, FeedHeader, ListItemCard } from '@/components/blocks';
import { Button, Card, Chip, SegmentedControl } from '@/components/ui';
import { focusRing, isFocused } from '@/components/ui/focus';
import { DEFAULT_ORGAN, ORGANS, type OrganId } from '@/data/anatomy';
import { filledSections } from '@/data/local/safetyPlan';
import { PLAN_STEPS } from '@/data/safetyPlan';
import { SITUATIONS } from '@/data/situations';
import type { FeedPageProps } from '@/features/feed/FeedPager';
import { useReportScrollTop } from '@/features/feed/useReportScrollTop';
import { useSafetyPlan } from '@/features/plan/useSafetyPlan';
import { useSession } from '@/features/session/Session';
import { useTheme } from '@/theme';

type Tab = 'stress' | 'situations' | 'plan';

const TABS: { value: Tab; label: string }[] = [
  { value: 'stress', label: 'Стресс' },
  { value: 'situations', label: 'Ситуации' },
  { value: 'plan', label: 'Мой план' },
];

const STEP_IDS = PLAN_STEPS.map((step) => step.id);

/**
 * «Анатомия»: разбор трудного по частям. Вкладки — «Анатомия стресса» (силуэт с органами), трудные ситуации
 * медицинского вуза и план на трудный момент. Сюда же добавляются новые разделы (решение владельца от 19 октября 2026 года).
 */
export function AnatomyPage({ active, onScrollAtTop }: FeedPageProps) {
  const t = useTheme();
  const router = useRouter();
  const onScroll = useReportScrollTop(onScrollAtTop);
  const [tab, setTab] = useState<Tab>('stress');

  return (
    <ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: t.space.xl }}
    >
      <FeedHeader
        title="Анатомия"
        subtitle="Разбираем трудное по частям"
        active={active}
        onSosPress={() => router.push('/sos')}
      />
      <View style={{ paddingTop: t.space.xs, paddingHorizontal: t.space.screen }}>
        <SegmentedControl options={TABS} value={tab} onChange={setTab} accessibilityLabel="Раздел" />
      </View>
      {tab === 'stress' ? <StressTab /> : tab === 'situations' ? <SituationsTab /> : <PlanTab />}
    </ScrollView>
  );
}

/** «Анатомия стресса»: силуэт с органами и карточка выбранного органа. По умолчанию выбрано «Сердце». */
function StressTab() {
  const t = useTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<OrganId>(DEFAULT_ORGAN);
  const organ = ORGANS.find((item) => item.id === selected) ?? ORGANS[0];

  return (
    <>
      <Text
        style={[t.type.caption, { color: t.color.textMuted, paddingTop: t.space.sm, paddingHorizontal: t.space.screen }]}
      >
        Нажмите на орган, чтобы узнать, что с ним происходит при стрессе
      </Text>

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
    </>
  );
}

/** Трудные ситуации медицинского вуза: список, каждая открывается своим экраном. */
function SituationsTab() {
  const t = useTheme();
  const router = useRouter();
  return (
    <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
      <Text style={[t.type.caption, { color: t.color.textMuted }]}>
        С этим сталкиваются многие студенты-медики. Что происходит, что может помочь и когда стоит поговорить со
        специалистом.
      </Text>
      {SITUATIONS.map((situation) => (
        <ListItemCard
          key={situation.id}
          icon={situation.icon}
          title={situation.title}
          caption={situation.summary}
          onPress={() => router.push(`/situation/${situation.id}`)}
        />
      ))}
    </View>
  );
}

/** Что такое план на трудный момент и переход к нему. */
function PlanTab() {
  const t = useTheme();
  const router = useRouter();
  const { user } = useSession();
  const { plan } = useSafetyPlan(user?.id ?? null);
  const filled = filledSections(plan, STEP_IDS);

  return (
    <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
      <Card>
        <View style={{ gap: t.space.sm }}>
          <Text accessibilityRole="header" style={[t.type.h2, { color: t.color.text }]}>
            План на трудный момент
          </Text>
          <Text style={[t.type.body, { color: t.color.text }]}>
            Короткий план своими словами: как понять, что становится хуже, что помогает, кому позвонить и ради чего
            держаться. А в конце — коробка поддержки с записками себе на трудный день.
          </Text>
          <Text style={[t.type.caption, { color: t.color.textMuted }]}>
            {filled > 0
              ? `Заполнено шагов: ${filled} из ${STEP_IDS.length}`
              : 'Составьте его в спокойный день. Когда станет тяжело, план откроется и из SOS.'}
          </Text>
          <Button fullWidth onPress={() => router.push('/plan')}>
            {filled > 0 ? 'Открыть план' : 'Составить план'}
          </Button>
        </View>
      </Card>
      <Text style={[t.type.caption, { color: t.color.textMuted }]}>
        План хранится только на этом устройстве и никуда не отправляется.
      </Text>
    </View>
  );
}
