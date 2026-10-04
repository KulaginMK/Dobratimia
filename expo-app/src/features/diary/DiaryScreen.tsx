import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MOODS,
  MoodCalendar,
  MoodEntryRow,
  MoodWeekBars,
  ScreenHeader,
  type CalendarMark,
} from '@/components/blocks';
import { BottomSheet, Button, Card, EmptyState, TextField } from '@/components/ui';
import { MOOD_NOTE_MAX, type MoodEntry, type MoodLevel } from '@/data/local/mood';
import { useMoodDiary } from '@/features/mood/MoodDiary';
import { moodColor, moodLabel } from '@/features/mood/moodMeta';
import { WEEKDAYS_SHORT, addDays, dayAndMonth, fromDateKey, relativeDay, weekdayIndex } from '@/lib/dates';
import { useTheme } from '@/theme';

// Сколько последних отметок показываем списком под календарём.
const RECENT_COUNT = 7;

/** Дневник настроения: среднее за неделю, календарь месяца и последние отметки. Все данные — на устройстве. */
export function DiaryScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entries, ready, todayKey, setNote } = useMoodDiary();

  const [cursor, setCursor] = useState(() => {
    const today = fromDateKey(todayKey);
    return { year: today.getFullYear(), month: today.getMonth() };
  });
  const [noteFor, setNoteFor] = useState<MoodEntry | null>(null);
  const [draft, setDraft] = useState('');

  const byDate = new Map(entries.map((entry) => [entry.date, entry]));
  const entryTitle = (entry: MoodEntry) =>
    `${relativeDay(entry.date, todayKey)}, ${entry.time} · ${moodLabel(entry.level)}`;

  // Среднее за 7 дней, заканчивая сегодняшним.
  const week = Array.from({ length: 7 }, (_, i) => addDays(todayKey, i - 6));
  const weekLevels = week.map((key) => byDate.get(key)?.level ?? null);
  const marked = weekLevels.filter((level): level is MoodLevel => level !== null);
  const average = marked.length > 0 ? marked.reduce((sum, level) => sum + level, 0) / marked.length : null;

  const marks: Record<string, CalendarMark> = {};
  for (const entry of entries) {
    marks[entry.date] = { color: moodColor(t, entry.level), label: moodLabel(entry.level).toLowerCase() };
  }

  const today = fromDateKey(todayKey);
  const atCurrentMonth = cursor.year === today.getFullYear() && cursor.month === today.getMonth();
  const shiftMonth = (delta: number) => {
    const next = new Date(cursor.year, cursor.month + delta, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  };

  const recent = entries.slice(-RECENT_COUNT).reverse();

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title="Дневник настроения"
        onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        onSosPress={() => router.push('/sos')}
      />
      {!ready ? null : entries.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <EmptyState
            title="Здесь пока пусто"
            text="Отметьте настроение на главной — и запись появится здесь."
            actionLabel="Отметить настроение"
            onAction={() => router.dismissTo({ pathname: '/', params: { s: 'home', focus: 'mood' } })}
          />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingTop: t.space.sm,
            paddingHorizontal: t.space.screen,
            paddingBottom: insets.bottom + t.space.xl,
            gap: t.space.md,
          }}
        >
          <Card>
            <View style={{ gap: t.space.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: t.space.sm }}>
                <Text accessibilityRole="header" style={[t.type.h3, { flexShrink: 1, color: t.color.text }]}>
                  Среднее за неделю
                </Text>
                {average !== null ? (
                  <Text style={[t.type.h2, { fontFamily: t.fontFamily.display[900], color: t.color.text }]}>
                    {moodLabel(Math.round(average) as MoodLevel)}
                  </Text>
                ) : null}
              </View>
              <MoodWeekBars
                days={week.map((key, i) => {
                  const level = weekLevels[i];
                  return {
                    key,
                    weekday: WEEKDAYS_SHORT[weekdayIndex(key)],
                    level,
                    color: level ? moodColor(t, level) : undefined,
                    accessibilityLabel: `${dayAndMonth(key)}: ${level ? moodLabel(level).toLowerCase() : 'нет отметки'}`,
                  };
                })}
              />
              <Text style={[t.type.caption, { color: t.color.textMuted }]}>
                {average !== null
                  ? `${average.toFixed(1).replace('.', ',')} из 5`
                  : 'За эту неделю отметок пока нет.'}
              </Text>
            </View>
          </Card>

          <Card style={{ paddingHorizontal: t.space.sm, paddingVertical: t.space.sm }}>
            <MoodCalendar
              year={cursor.year}
              month={cursor.month}
              todayKey={todayKey}
              marks={marks}
              legend={MOODS.map((mood) => ({ label: mood.label, color: moodColor(t, mood.level) }))}
              onPrev={() => shiftMonth(-1)}
              onNext={() => shiftMonth(1)}
              nextDisabled={atCurrentMonth}
            />
          </Card>

          <View style={{ gap: t.space.xs }}>
            {recent.map((entry) => (
              <MoodEntryRow
                key={entry.date}
                color={moodColor(t, entry.level)}
                title={entryTitle(entry)}
                note={entry.note}
                onPress={() => {
                  setDraft(entry.note ?? '');
                  setNoteFor(entry);
                }}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <BottomSheet open={noteFor !== null} title={noteFor ? entryTitle(noteFor) : undefined} onClose={() => setNoteFor(null)}>
        <View style={{ gap: t.space.md }}>
          <TextField
            label="Что повлияло?"
            hint={`До ${MOOD_NOTE_MAX} знаков. Заметку видите только вы.`}
            multiline
            rows={3}
            maxLength={MOOD_NOTE_MAX}
            value={draft}
            onChange={setDraft}
          />
          <Button
            fullWidth
            onPress={() => {
              if (noteFor) setNote(noteFor.date, draft);
              setNoteFor(null);
            }}
          >
            Сохранить
          </Button>
        </View>
      </BottomSheet>
    </View>
  );
}
