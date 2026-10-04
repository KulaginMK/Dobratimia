import React from 'react';
import { Text, View } from 'react-native';
import { useTheme, type Theme } from '@/theme';

// Размеры из макета DassResult (.scale, .segs, .seg, .badge).
const PAD_V = 16;
const PAD_H = 18;
const GAP = 10;
const SEG_HEIGHT = 10;
const SEG_GAP = 4;
const BADGE_PAD_V = 4;
const BADGE_PAD_H = 12;

export type ScaleLevel = 'normal' | 'mild' | 'moderate' | 'high' | 'extreme';

const LEVELS: ScaleLevel[] = ['normal', 'mild', 'moderate', 'high', 'extreme'];

/** Уровень всегда подписан словом. Без слов «тяжёлая» и диагнозов (docs/07). */
export const SCALE_LEVEL_LABEL: Record<ScaleLevel, string> = {
  normal: 'Норма',
  mild: 'Лёгкий',
  moderate: 'Умеренный',
  high: 'Высокий',
  extreme: 'Крайне высокий',
};

/**
 * Цвета уровня. В макете есть только «Лёгкий» (accent) и «Высокий» (primary);
 * «Норма», «Умеренный» и «Крайне высокий» — предложение, ждёт решения владельца.
 * color.sos здесь не используется: он только для SOS.
 */
function levelColors(t: Theme, level: ScaleLevel) {
  switch (level) {
    case 'normal':
      return { fill: t.color.growth, badgeBg: t.color.growthSoft, badgeFg: t.color.text };
    case 'mild':
    case 'moderate':
      return { fill: t.color.accent, badgeBg: t.color.surfaceAlt, badgeFg: t.color.text };
    default:
      return { fill: t.color.primary, badgeBg: t.color.primarySoft, badgeFg: t.color.onPrimarySoft };
  }
}

type Props = {
  /** Название шкалы: «Стресс», «Тревога», «Депрессия». */
  title: string;
  score: number;
  max: number;
  level: ScaleLevel;
};

/** Шкала результата DASS-21: пять сегментов от «Нормы» до «Крайне высокого», уровень словом рядом. */
export function ScaleBar({ title, score, max, level }: Props) {
  const t = useTheme();
  const colors = levelColors(t, level);
  const filled = LEVELS.indexOf(level) + 1;
  const scoreText = `${score} из ${max}`;
  return (
    <View
      accessible
      accessibilityLabel={`${title}: ${scoreText}, уровень — ${SCALE_LEVEL_LABEL[level]}`}
      style={{
        paddingVertical: PAD_V,
        paddingHorizontal: PAD_H,
        borderRadius: t.radius.xl,
        backgroundColor: t.color.surface,
        boxShadow: t.shadow.sm,
        gap: GAP,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: GAP }}>
        <Text style={[t.type.h3, { flexGrow: 1, flexShrink: 1, color: t.color.text }]}>{title}</Text>
        <Text style={[t.type.caption, { flexShrink: 0, color: t.color.textMuted }]}>{scoreText}</Text>
        <View
          style={{
            paddingVertical: BADGE_PAD_V,
            paddingHorizontal: BADGE_PAD_H,
            borderRadius: t.radius.full,
            backgroundColor: colors.badgeBg,
            flexShrink: 0,
          }}
        >
          <Text
            style={{
              fontFamily: t.fontFamily.text[600],
              fontSize: t.type.caption.fontSize,
              lineHeight: t.type.caption.lineHeight,
              color: colors.badgeFg,
            }}
          >
            {SCALE_LEVEL_LABEL[level]}
          </Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: SEG_GAP }}>
        {LEVELS.map((name, i) => (
          <View
            key={name}
            style={{
              flex: 1,
              height: SEG_HEIGHT,
              borderRadius: SEG_HEIGHT / 2,
              backgroundColor: i < filled ? colors.fill : t.color.surfaceAlt,
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>{SCALE_LEVEL_LABEL.normal}</Text>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>{SCALE_LEVEL_LABEL.extreme}</Text>
      </View>
    </View>
  );
}
