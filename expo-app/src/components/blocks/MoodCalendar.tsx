import React from 'react';
import { Text, View } from 'react-native';
import { IconButton } from '@/components/ui/IconButton';
import { MONTHS, MONTHS_GENITIVE, WEEKDAYS_SHORT, toDateKey } from '@/lib/dates';
import { useTheme } from '@/theme';

// Размеры из макета Diary (.grid, .wd, .day, .mk, .lg).
const GRID_GAP = 2;
const WEEKDAY_SIZE = 12;
const WEEKDAY_LINE = 16;
const WEEKDAY_PAD = 4;
const DAY_HEIGHT = 44;
const DAY_GAP = 3;
const DAY_SIZE = 14;
const DAY_LINE = 18;
const MARK_WIDTH = 18;
const MARK_HEIGHT = 6;
const NAV_ICON = 20;
const LEGEND_GAP = 6;
const LEGEND_COLUMN_GAP = 14;
const LEGEND_SIZE = 13;
const LEGEND_LINE = 18;

export type CalendarMark = {
  /** Цвет отметки дня. */
  color: string;
  /** Слово уровня для скринридера: «хорошо». */
  label: string;
};

type Props = {
  year: number;
  /** Месяц: 0 — январь. */
  month: number;
  todayKey: string;
  /** Отметки по ключам дней: «2026-09-24». */
  marks: Record<string, CalendarMark>;
  /** Подписи цветов под календарём. */
  legend: { label: string; color: string }[];
  onPrev: () => void;
  onNext: () => void;
  /** Вперёд дальше текущего месяца не листаем: отметок там быть не может. */
  nextDisabled?: boolean;
};

/** Маленькая полоска-отметка уровня. */
export function MoodMark({ color, width = MARK_WIDTH, height = MARK_HEIGHT }: { color?: string; width?: number; height?: number }) {
  return <View style={{ width, height, borderRadius: Math.min(width, height) / 2, backgroundColor: color }} />;
}

/** Календарь месяца с отметками настроения. Неделя начинается с понедельника. */
export function MoodCalendar({ year, month, todayKey, marks, legend, onPrev, onNext, nextDisabled }: Props) {
  const t = useTheme();
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton
          icon="chevronLeft"
          iconSize={NAV_ICON}
          accessibilityLabel={MONTHS[(month + 11) % 12]}
          onPress={onPrev}
        />
        <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
          {`${MONTHS[month]} ${year}`}
        </Text>
        <IconButton
          icon="chevronRight"
          iconSize={NAV_ICON}
          accessibilityLabel={MONTHS[(month + 1) % 12]}
          onPress={onNext}
          disabled={nextDisabled}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: GRID_GAP, paddingTop: t.space.xs }}>
        {WEEKDAYS_SHORT.map((weekday) => (
          <Text
            key={weekday}
            aria-hidden
            style={{
              flex: 1,
              textAlign: 'center',
              paddingBottom: WEEKDAY_PAD,
              fontFamily: t.fontFamily.text[600],
              fontSize: WEEKDAY_SIZE,
              lineHeight: WEEKDAY_LINE,
              color: t.color.textMuted,
            }}
          >
            {weekday}
          </Text>
        ))}
      </View>

      <View style={{ gap: GRID_GAP }}>
        {weeks.map((week, row) => (
          <View key={row} style={{ flexDirection: 'row', gap: GRID_GAP }}>
            {week.map((day, column) => {
              if (day === null) return <View key={column} style={{ flex: 1, height: DAY_HEIGHT }} />;
              const key = toDateKey(new Date(year, month, day));
              const mark = marks[key];
              const today = key === todayKey;
              const future = key > todayKey;
              const state = mark ? mark.label : future ? 'ещё не наступило' : 'нет отметки';
              return (
                <View
                  key={column}
                  accessible
                  accessibilityLabel={`${day} ${MONTHS_GENITIVE[month]}: ${state}`}
                  style={{
                    flex: 1,
                    height: DAY_HEIGHT,
                    borderRadius: t.radius.md,
                    backgroundColor: today ? t.color.primarySoft : undefined,
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: DAY_GAP,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: today ? t.fontFamily.text[700] : t.fontFamily.text[500],
                      fontSize: DAY_SIZE,
                      lineHeight: DAY_LINE,
                      color: today ? t.color.onPrimarySoft : future ? t.color.textMuted : t.color.text,
                    }}
                  >
                    {day}
                  </Text>
                  <MoodMark color={mark?.color} />
                </View>
              );
            })}
          </View>
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: LEGEND_COLUMN_GAP,
          rowGap: LEGEND_GAP,
          paddingTop: t.space.sm,
          paddingHorizontal: t.space.xs,
        }}
      >
        {legend.map((item) => (
          <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: LEGEND_GAP }}>
            <MoodMark color={item.color} />
            <Text
              style={{
                fontFamily: t.type.caption.fontFamily,
                fontSize: LEGEND_SIZE,
                lineHeight: LEGEND_LINE,
                color: t.color.textMuted,
              }}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
