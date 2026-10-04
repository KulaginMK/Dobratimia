import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { svgA11y } from '@/components/brand';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';

// Размеры из макетов Home и HomeMarked (.mood, .face).
const ITEM_WIDTH = 68;
const ITEM_MIN_HEIGHT = 78;
const ITEM_GAP = 5;
const FACE = 52;
const FACE_ICON = 30;
const FACE_STROKE = 2.2;
const EYE_RADIUS = 1.3;
// Двойное кольцо выбранного лица: 3 цвета фона + 2 color.primary.
const RING_BORDER = 2;
const RING_OUTSET = 5;

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

/** Пять уровней настроения: подпись и линия рта (сетка 32). */
export const MOODS: { level: MoodLevel; label: string; mouth: string }[] = [
  { level: 1, label: 'Тяжело', mouth: 'M11 22 Q16 17.5 21 22' },
  { level: 2, label: 'Грустно', mouth: 'M12 21.5 Q16 19 20 21.5' },
  { level: 3, label: 'Ровно', mouth: 'M12 20.5 H20' },
  { level: 4, label: 'Хорошо', mouth: 'M12 19 Q16 22.5 20 19' },
  { level: 5, label: 'Отлично', mouth: 'M11 18.5 Q16 24.5 21 18.5' },
];

type Props = {
  /** Отметка за сегодня; null — ещё не отмечено. */
  value: MoodLevel | null;
  /** Повторный тап по другому лицу меняет отметку. */
  onChange?: (level: MoodLevel) => void;
};

/** Пять лиц «Как вы сегодня?». Настроение подписано словом — цвет не единственный носитель смысла. */
export function MoodPicker({ value, onChange }: Props) {
  const t = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel="Как вы сегодня?"
      style={{ flexDirection: 'row', justifyContent: 'space-between' }}
    >
      {MOODS.map(({ level, label, mouth }) => {
        const selected = level === value;
        const ink = selected ? t.color.onPrimary : t.color.text;
        return (
          <Pressable
            key={level}
            onPress={() => onChange?.(level)}
            accessibilityRole="radio"
            accessibilityLabel={label}
            aria-checked={selected}
            style={(state) => [
              {
                // На узком экране пункты сжимаются, но кольцо выбранного лица помещается всегда.
                flexBasis: ITEM_WIDTH,
                flexShrink: 1,
                minWidth: FACE + RING_OUTSET * 2,
                minHeight: ITEM_MIN_HEIGHT,
                alignItems: 'center',
                gap: ITEM_GAP,
                borderRadius: t.radius.md,
              },
              focusRing(t, isFocused(state)),
            ]}
          >
            <View style={{ width: FACE, height: FACE }}>
              {selected ? (
                <View
                  style={{
                    position: 'absolute',
                    top: -RING_OUTSET,
                    right: -RING_OUTSET,
                    bottom: -RING_OUTSET,
                    left: -RING_OUTSET,
                    borderRadius: t.radius.full,
                    borderWidth: RING_BORDER,
                    borderColor: t.color.primary,
                    backgroundColor: t.color.background,
                  }}
                />
              ) : null}
              <View
                style={{
                  width: FACE,
                  height: FACE,
                  borderRadius: t.radius.full,
                  backgroundColor: selected ? t.color.primary : t.color.primarySoft,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Svg width={FACE_ICON} height={FACE_ICON} viewBox="0 0 32 32" {...svgA11y()}>
                  <Circle cx={11.5} cy={13} r={EYE_RADIUS} fill={ink} />
                  <Circle cx={20.5} cy={13} r={EYE_RADIUS} fill={ink} />
                  <Path d={mouth} fill="none" stroke={ink} strokeWidth={FACE_STROKE} strokeLinecap="round" />
                </Svg>
              </View>
            </View>
            <Text
              style={[
                t.type.label,
                { color: selected ? t.color.text : t.color.textMuted },
                selected && { fontFamily: t.fontFamily.text[700] },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
