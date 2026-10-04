import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdviceCard, EmergencyStrip, ListItemCard, NextTestNote, ScaleBar, ScreenHeader } from '@/components/blocks';
import { Button } from '@/components/ui';
import { PSYCH_HELPLINE } from '@/data/emergency';
import { TEXT_NEEDED } from '@/data/placeholders';
import { techniqueById, type Technique } from '@/data/techniques';
import { addDays, dayAndMonth } from '@/lib/dates';
import { useCallPhone } from '@/lib/phone';
import { useTheme } from '@/theme';
import { NEXT_TEST_DAYS, useDassHistory } from './DassHistory';
import { DassHistoryCard } from './DassHistoryCard';
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
  const tips = dassTips(levels)
    .map((id) => techniqueById(id))
    .filter((technique): technique is Technique => technique !== null);
  const home = () => router.dismissTo('/?s=home');
  // Крестик возвращает туда, откуда пришли: после теста это Главная, из дневника — дневник.
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const openTip = (technique: Technique) =>
    router.push(technique.opens === 'pomodoro' ? '/meditation?tab=pomodoro' : `/technique/${technique.id}`);

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader title="DASS-21" leading="close" onLeadingPress={close} onSosPress={() => router.push('/sos')} />
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

        <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen }}>
          <DassHistoryCard entries={entries} />
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
