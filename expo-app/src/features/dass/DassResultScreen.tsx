import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AdviceCard,
  EmergencyStrip,
  HistoryChart,
  ListItemCard,
  NextTestNote,
  ScaleBar,
  ScreenHeader,
  type ChartSeries,
} from '@/components/blocks';
import { Button } from '@/components/ui';
import { PSYCH_HELPLINE } from '@/data/emergency';
import type { DassEntry } from '@/data/local/dass';
import { TEXT_NEEDED } from '@/data/placeholders';
import { techniqueById, type Technique } from '@/data/techniques';
import { addDays, dayAndMonth, dayAndShortMonth } from '@/lib/dates';
import { useCallPhone } from '@/lib/phone';
import { plural } from '@/lib/plural';
import { useTheme } from '@/theme';
import { HISTORY_MAX, NEXT_TEST_DAYS, useDassHistory } from './DassHistory';
import { DASS_MAX, dassAdvice, dassLevels, dassTips, scalesFrom, type DassScale } from './score';

// Порядок шкал на экране — как в макете DassResult.
const SCALES: { scale: DassScale; title: string }[] = [
  { scale: 'stress', title: 'Стресс' },
  { scale: 'anxiety', title: 'Тревога' },
  { scale: 'depression', title: 'Депрессия' },
];

// Как шкала называется в предложении «… сейчас выше обычного». Не диагноз: о депрессии — только «показатель по шкале».
const IN_SENTENCE: Record<DassScale, string> = {
  anxiety: 'тревога',
  stress: 'стресс',
  depression: 'показатель по шкале депрессии',
};

/** «Тревога и стресс сейчас выше обычного.» — про шкалы с высоким уровнем. */
function raisedSentence(scales: DassScale[]): string {
  // В предложении шкалы идут в постоянном порядке, как в макете: тревога, стресс, депрессия.
  const names = (['anxiety', 'stress', 'depression'] as const)
    .filter((scale) => scales.includes(scale))
    .map((scale) => IN_SENTENCE[scale]);
  const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} и ${names[names.length - 1]}` : names[0];
  return `${list[0].toUpperCase()}${list.slice(1)} сейчас выше обычного.`;
}

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

/** DassResult: результат последнего теста, история и что может помочь. Это ориентир, а не диагноз. */
export function DassResultScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const call = useCallPhone();
  const { entries, ready } = useDassHistory();

  if (!ready) return <View style={{ flex: 1, backgroundColor: t.color.background }} />;
  const latest = entries[entries.length - 1];
  // Тестов ещё не было (экран открыли по ссылке) — показывать нечего, начинаем тест.
  if (!latest) return <Redirect href="/dass" />;

  const levels = dassLevels(latest);
  const advice = dassAdvice(levels);
  const recent = entries.slice(-HISTORY_MAX);
  const tips = dassTips(levels)
    .map((id) => techniqueById(id))
    .filter((technique): technique is Technique => technique !== null);
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

  const home = () => router.dismissTo('/?s=home');
  const openTip = (technique: Technique) =>
    router.push(technique.opens === 'pomodoro' ? '/meditation?tab=pomodoro' : `/technique/${technique.id}`);

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader title="DASS-21" leading="close" onLeadingPress={home} onSosPress={() => router.push('/sos')} />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + t.space['2xl'] }}>
        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen, gap: t.space.xs }}>
          <Text accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
            Ваши результаты
          </Text>
          <Text style={[t.type.caption, { color: t.color.textMuted }]}>
            {`${dayAndMonth(latest.date)} · это ориентир, а не диагноз`}
          </Text>
        </View>

        {advice === 'talk' ? (
          <View style={{ paddingTop: t.space.lg, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
            <AdviceCard
              tone="sos"
              title="Возможно, сейчас стоит поговорить со специалистом"
              body={`${raisedSentence(scalesFrom(levels, 'high'))} Это не приговор — но разговор с психологом часто заметно облегчает состояние. Вы не обязаны справляться в одиночку.`}
            >
              <Button icon="specialist" fullWidth onPress={() => router.dismissTo('/?s=match')}>
                Подобрать специалиста
              </Button>
              <Button variant="outline" fullWidth onPress={() => router.push('/sos/university')}>
                Помощь в моём вузе
              </Button>
            </AdviceCard>
            {/* Крайне высокий уровень по шкале депрессии — номер 133 рядом (docs/07, [решить вместе с психологом]). */}
            {levels.depression === 'extreme' ? (
              <EmergencyStrip
                label="Экстренная психологическая помощь"
                number={PSYCH_HELPLINE}
                onCall={() => call(PSYCH_HELPLINE)}
              />
            ) : null}
          </View>
        ) : null}
        {advice === 'gentle' ? (
          <View style={{ paddingTop: t.space.lg, paddingHorizontal: t.space.screen }}>
            {/* [текст] Мягкая карточка при умеренном уровне: текст пишет и проверяет психолог (docs/07, docs/10). */}
            <AdviceCard tone="soft" body={TEXT_NEEDED} />
          </View>
        ) : null}

        <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
          <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
            Три шкалы
          </Text>
          {SCALES.map(({ scale, title }) => (
            <ScaleBar key={scale} title={title} score={latest[scale]} max={DASS_MAX} level={levels[scale]} />
          ))}
          <Text style={[t.type.caption, { color: t.color.textMuted }]}>
            Уровни: норма · лёгкий · умеренный · высокий · крайне высокий.
          </Text>
        </View>

        <View
          style={{
            marginTop: t.space.xl,
            marginHorizontal: t.space.screen,
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

        <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
          <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
            Что может помочь сейчас
          </Text>
          {tips.map((technique) => (
            <ListItemCard
              key={technique.id}
              icon={technique.icon}
              tone="neutral"
              title={technique.title}
              caption={`${technique.duration} · ${technique.summary}`}
              onPress={() => openTip(technique)}
            />
          ))}
        </View>

        <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen }}>
          {/* Этап 14: когда появятся напоминания, дописать «Мы напомним за день» — пока этого обещать нельзя. */}
          <NextTestNote>{`Следующий тест — ${dayAndMonth(addDays(latest.date, NEXT_TEST_DAYS))}.`}</NextTestNote>
        </View>
        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen, gap: t.space.xs }}>
          <Button variant="outline" fullWidth onPress={home}>
            На главную
          </Button>
          <Text style={[t.type.caption, { color: t.color.textMuted, textAlign: 'center' }]}>
            Результаты видны только вам
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
