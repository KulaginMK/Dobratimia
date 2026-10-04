import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';
import { MoodMark } from './MoodCalendar';

// Размеры из макета Diary (список последних отметок).
const GAP = 12;
const MARK_WIDTH = 6;
const MARK_HEIGHT = 36;
const TITLE_SIZE = 15;
const TITLE_LINE = 20;

type Props = {
  /** Цвет уровня. */
  color: string;
  /** «Сегодня, 14:20 · Хорошо». */
  title: string;
  /** Заметка «Что повлияло?». */
  note?: string;
  /** Тап по записи открывает заметку. */
  onPress: () => void;
};

/** Строка отметки в дневнике: цветная полоска, день с уровнем и заметка. */
export function MoodEntryRow({ color, title, note, onPress }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint="Открыть заметку"
      style={(state) => [
        {
          minHeight: t.size.touch,
          flexDirection: 'row',
          alignItems: 'center',
          gap: GAP,
          borderRadius: t.radius.sm,
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      <MoodMark color={color} width={MARK_WIDTH} height={MARK_HEIGHT} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: t.fontFamily.text[700],
            fontSize: TITLE_SIZE,
            lineHeight: TITLE_LINE,
            color: t.color.text,
          }}
        >
          {title}
        </Text>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>{note ? `«${note}»` : 'Без заметки'}</Text>
      </View>
    </Pressable>
  );
}
