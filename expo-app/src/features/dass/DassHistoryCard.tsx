import React from 'react';
import { Text, View } from 'react-native';
import { HistoryChart, type ChartSeries } from '@/components/blocks';
import type { DassEntry } from '@/data/local/dass';
import { dayAndShortMonth } from '@/lib/dates';
import { plural } from '@/lib/plural';
import { useTheme } from '@/theme';
import { HISTORY_MAX } from './DassHistory';
import { DASS_MAX } from './score';

/** Что на графике, словами — для скринридера. */
function chartLabel(entries: DassEntry[]): string {
  const first = entries[0];
  const last = entries[entries.length - 1];
  if (entries.length === 1) {
    return `Один тест: стресс ${last.stress}, тревога ${last.anxiety}, депрессия ${last.depression}`;
  }
  const tests = `${entries.length} ${plural(entries.length, 'тест', 'теста', 'тестов')}`;
  return (
    `График за ${tests}: стресс — с ${first.stress} до ${last.stress}, ` +
    `тревога — с ${first.anxiety} до ${last.anxiety}, депрессия — с ${first.depression} до ${last.depression}`
  );
}

/** Подписи дат под графиком: первая, средняя (если тестов три и больше) и последняя. */
function chartDates(entries: DassEntry[]): string[] {
  const last = entries.length - 1;
  const picked = entries.length >= 3 ? [0, Math.floor(last / 2), last] : entries.map((_, i) => i);
  return picked.map((i) => dayAndShortMonth(entries[i].date));
}

type Props = {
  /** Все пройденные тесты, от старых к новым. На графике — последние десять. Список не должен быть пустым. */
  entries: DassEntry[];
};

/** Карточка «История»: график баллов трёх шкал по последним тестам. Стоит на экране результата и в дневнике. */
export function DassHistoryCard({ entries }: Props) {
  const t = useTheme();
  const recent = entries.slice(-HISTORY_MAX);
  // В макете линия тревоги — color.secondary. В тёмной теме он почти сливается с color.primary (линия стресса),
  // поэтому берём color.text: в светлой теме он выглядит так же, как в макете, а в тёмной линии различимы.
  const series: ChartSeries[] = [
    { key: 'stress', label: 'Стресс', color: t.color.primary, values: recent.map((entry) => entry.stress) },
    { key: 'anxiety', label: 'Тревога', color: t.color.text, values: recent.map((entry) => entry.anxiety) },
    {
      key: 'depression',
      label: 'Депрессия',
      color: t.color.textMuted,
      dashed: true,
      values: recent.map((entry) => entry.depression),
    },
  ];
  return (
    <View
      style={{
        padding: t.space.md,
        borderRadius: t.radius.xl,
        backgroundColor: t.color.surface,
        boxShadow: t.shadow.sm,
        gap: t.space.sm,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: t.space.sm }}>
        <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
          История
        </Text>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>
          {`${recent.length} ${plural(recent.length, 'тест', 'теста', 'тестов')}`}
        </Text>
      </View>
      <HistoryChart series={series} max={DASS_MAX} dates={chartDates(recent)} accessibilityLabel={chartLabel(recent)} />
    </View>
  );
}
