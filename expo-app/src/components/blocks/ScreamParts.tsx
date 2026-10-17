import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Icon } from '@/components/brand';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';

// Размеры из макетов Scream, ScreamLive, ScreamResult и ScreamNoMic.
const MIC_RING = 248;
const MIC_BUTTON = 176;
const MIC_ICON = 80;
const STOP_RING = 240;
const STOP_INNER_RING = 196;
const STOP_RING_GAP = 10;
const STOP_BUTTON = 148;
// Надпись живёт внутри круга фиксированного размера — системный шрифт увеличивает её не больше чем на 30%.
const MAX_FONT_SCALE = 1.3;
const LEVEL_HEIGHT = 12;
// Уровень меняется раз в 0,3 с — полоса доезжает до него плавно и успевает до следующего.
const LEVEL_GLIDE_MS = 250;
const LEVEL_LABELS_TOP = 6;
// Подписи полосы стоят через равные промежутки, хотя шаги между ними разные: заполнение считается по отрезкам.
const LEVEL_MARKS = [0, 60, 80, 100];
const LEVEL_LABELS = ['0', '60', '80', '100+'];
const SCALE_PAD_V = 14;
const SCALE_PAD_H = 18;
const SCALE_ROW = 40;
const SCALE_GAP = 12;
const SCALE_RANGE_WIDTH = 64;
const SCALE_FONT = 15;
const SCALE_LINE = 20;
const PEAK_SIZE = 104;
// В макете высота строки равна кеглю (104). На Android такая строка срезает верх цифр — берём с запасом.
const PEAK_LINE = 120;
const PEAK_UNIT_SIZE = 22;
const PEAK_UNIT_LINE = 28;
const REACTION_PAD_TOP = 22;
const REACTION_PAD_H = 22;
const REACTION_PAD_BOTTOM = 20;
const REACTION_BODY_SIZE = 15;
const REACTION_BODY_LINE = 22;
const STAT_PAD_V = 12;
// В макете 14: с 12 три плитки помещаются в ряд на экране 412 без переноса слова «Длительность».
const STAT_PAD_H = 12;
const STAT_GAP = 2;
const STAT_VALUE_SIZE = 22;
const STAT_VALUE_LINE = 28;
const MIC_OFF = 132;
const MIC_OFF_ICON = 64;
const STRIKE_LENGTH = 96;
const STRIKE_WIDTH = 6;
const STRIKE_OUTLINE = 4;
const NOTE_ICON = 18;

/** Большая кнопка-микрофон в мягком кольце: начинает замер. */
export function MicButton({ onPress, disabled }: { onPress: () => void; disabled?: boolean }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel="Начать замер"
      aria-disabled={!!disabled}
      style={(state) => [
        {
          width: MIC_RING,
          height: MIC_RING,
          borderRadius: t.radius.full,
          backgroundColor: t.color.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      {({ pressed }) => (
        <View
          style={{
            width: MIC_BUTTON,
            height: MIC_BUTTON,
            borderRadius: t.radius.full,
            backgroundColor: pressed ? t.color.primaryPressed : t.color.primary,
            alignItems: 'center',
            justifyContent: 'center',
            transform: [{ scale: pressed ? 0.98 : 1 }],
          }}
        >
          <Icon name="scream" size={MIC_ICON} color={t.color.onPrimary} />
        </View>
      )}
    </Pressable>
  );
}

/** Кнопка «Отпустить» в двух кольцах: заканчивает замер, после неё экран сгорает (FireRelease). */
export function StopButton({ onPress }: { onPress: () => void }) {
  const t = useTheme();
  const circle = { borderRadius: t.radius.full, alignItems: 'center', justifyContent: 'center' } as const;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Отпустить"
      accessibilityHint="Закончить замер"
      style={(state) => [
        { width: STOP_RING, height: STOP_RING, backgroundColor: t.color.primarySoft, ...circle },
        focusRing(t, isFocused(state)),
      ]}
    >
      {({ pressed }) => (
        <View
          style={{
            width: STOP_INNER_RING + STOP_RING_GAP * 2,
            height: STOP_INNER_RING + STOP_RING_GAP * 2,
            backgroundColor: t.color.background,
            ...circle,
          }}
        >
          <View
            style={{
              width: STOP_INNER_RING,
              height: STOP_INNER_RING,
              backgroundColor: t.color.primarySoft,
              ...circle,
            }}
          >
            <View
              style={{
                width: STOP_BUTTON,
                height: STOP_BUTTON,
                backgroundColor: pressed ? t.color.primaryPressed : t.color.primary,
                transform: [{ scale: pressed ? 0.98 : 1 }],
                ...circle,
              }}
            >
              <Text maxFontSizeMultiplier={MAX_FONT_SCALE} style={[t.type.h3, { color: t.color.onPrimary }]}>
                Отпустить
              </Text>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
}

/** Какая часть полосы закрашена при этом уровне. */
function levelShare(level: number): number {
  const last = LEVEL_MARKS.length - 1;
  if (level >= LEVEL_MARKS[last]) return 1;
  const i = LEVEL_MARKS.findLastIndex((mark) => level >= mark);
  if (i < 0) return 0;
  const within = (level - LEVEL_MARKS[i]) / (LEVEL_MARKS[i + 1] - LEVEL_MARKS[i]);
  return (i + within) / last;
}

/** Полоса текущего уровня КРИКа с подписями «0 · 60 · 80 · 100+» — границами шкалы реакций. */
export function LevelBar({ level, max }: { level: number; max: number }) {
  const t = useTheme();
  const share = useSharedValue(levelShare(level));
  useEffect(() => {
    // При «Уменьшить движение» withTiming сразу ставит конечное значение.
    share.set(withTiming(levelShare(level), { duration: LEVEL_GLIDE_MS, easing: Easing.out(Easing.quad) }));
  }, [level, share]);
  const fill = useAnimatedStyle(() => ({ width: `${share.get() * 100}%` }));
  return (
    <View>
      <View
        accessibilityRole="progressbar"
        accessibilityLabel="Уровень громкости"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={level}
        style={{
          height: LEVEL_HEIGHT,
          borderRadius: LEVEL_HEIGHT / 2,
          backgroundColor: t.color.surfaceAlt,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={[{ height: LEVEL_HEIGHT, borderRadius: LEVEL_HEIGHT / 2, backgroundColor: t.color.primary }, fill]}
        />
      </View>
      <View
        // Числа шкалы без полосы скринридеру ничего не говорят.
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: LEVEL_LABELS_TOP }}
      >
        {LEVEL_LABELS.map((label) => (
          <Text key={label} style={[t.type.caption, { color: t.color.textMuted }]}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

type ScaleRow = { range: string; text: string; accent?: boolean };

/** Карточка «Шкала реакций»: диапазон громкости и что он значит. */
export function ReactionScale({ title, rows }: { title: string; rows: ScaleRow[] }) {
  const t = useTheme();
  return (
    <View
      style={{
        paddingVertical: SCALE_PAD_V,
        paddingHorizontal: SCALE_PAD_H,
        borderRadius: t.radius.xl,
        backgroundColor: t.color.surface,
        boxShadow: t.shadow.sm,
      }}
    >
      <Text
        accessibilityRole="header"
        style={[
          t.type.caption,
          { fontFamily: t.fontFamily.text[600], color: t.color.textMuted, marginBottom: t.space.xxs },
        ]}
      >
        {title}
      </Text>
      {rows.map((row) => (
        <View
          key={row.range}
          accessible
          accessibilityLabel={`${row.range}: ${row.text}`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: SCALE_GAP, minHeight: SCALE_ROW }}
        >
          <Text
            style={{
              minWidth: SCALE_RANGE_WIDTH,
              fontFamily: t.fontFamily.display[800],
              fontSize: SCALE_FONT,
              lineHeight: SCALE_LINE,
              color: row.accent ? t.color.primary : t.color.text,
            }}
          >
            {row.range}
          </Text>
          <Text
            style={{
              flex: 1,
              fontFamily: t.type.body.fontFamily,
              fontSize: SCALE_FONT,
              lineHeight: SCALE_LINE,
              color: t.color.text,
            }}
          >
            {row.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Крупное число результата: «Ваш пик · 87 усл. дБ». */
export function PeakNumber({ label, value, unit }: { label: string; value: number; unit: string }) {
  const t = useTheme();
  return (
    <View
      accessible
      accessibilityRole="header"
      accessibilityLabel={`${label}: ${value} условных децибел`}
      style={{ alignItems: 'center' }}
    >
      <Text style={[t.type.overline, { color: t.color.textMuted }]}>{label}</Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'center',
          columnGap: t.space.xs,
        }}
      >
        <Text
          style={{
            fontFamily: t.fontFamily.display[900],
            fontSize: PEAK_SIZE,
            lineHeight: PEAK_LINE,
            color: t.color.primary,
          }}
        >
          {value}
        </Text>
        <Text
          style={{
            fontFamily: t.fontFamily.display[800],
            fontSize: PEAK_UNIT_SIZE,
            lineHeight: PEAK_UNIT_LINE,
            color: t.color.text,
          }}
        >
          {unit}
        </Text>
      </View>
    </View>
  );
}

/** Карточка-реакция на результат: диапазон, заголовок и, если есть, пояснение. */
export function ReactionCard({ overline, title, body }: { overline: string; title: string; body?: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        paddingTop: REACTION_PAD_TOP,
        paddingHorizontal: REACTION_PAD_H,
        paddingBottom: REACTION_PAD_BOTTOM,
        borderRadius: t.radius['2xl'],
        backgroundColor: t.color.primarySoft,
        gap: t.space.xs,
      }}
    >
      <Text style={[t.type.overline, { color: t.color.onPrimarySoft }]}>{overline}</Text>
      <Text accessibilityRole="header" style={[t.type.h2, { color: t.color.onPrimarySoft }]}>
        {title}
      </Text>
      {body ? (
        <Text
          style={{
            fontFamily: t.type.body.fontFamily,
            fontSize: REACTION_BODY_SIZE,
            lineHeight: REACTION_BODY_LINE,
            color: t.color.onPrimarySoft,
          }}
        >
          {body}
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Плитка итога: «Длительность · 6 с». Ширина — по подписи, остаток ряда плитки делят поровну.
 * Ряду нужен flexWrap: на узком экране или при крупном шрифте третья плитка уходит на вторую строку.
 */
export function StatTile({ label, value }: { label: string; value: string }) {
  const t = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${label}: ${value}`}
      style={{
        flexGrow: 1,
        gap: STAT_GAP,
        paddingVertical: STAT_PAD_V,
        paddingHorizontal: STAT_PAD_H,
        borderRadius: t.radius.lg,
        backgroundColor: t.color.surface,
        boxShadow: t.shadow.sm,
      }}
    >
      <Text style={[t.type.caption, { color: t.color.textMuted }]}>{label}</Text>
      <Text
        style={{
          fontFamily: t.fontFamily.display[900],
          fontSize: STAT_VALUE_SIZE,
          lineHeight: STAT_VALUE_LINE,
          color: t.color.text,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

/** Перечёркнутый микрофон: доступа нет. Картинка декоративная — смысл несёт заголовок под ней. */
export function MicOffBadge() {
  const t = useTheme();
  return (
    <View
      style={{
        width: MIC_OFF,
        height: MIC_OFF,
        borderRadius: t.radius.full,
        backgroundColor: t.color.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name="scream" size={MIC_OFF_ICON} color={t.color.textMuted} />
      <View
        style={{
          position: 'absolute',
          width: STRIKE_LENGTH + STRIKE_OUTLINE * 2,
          height: STRIKE_WIDTH + STRIKE_OUTLINE * 2,
          borderRadius: t.radius.full,
          borderWidth: STRIKE_OUTLINE,
          borderColor: t.color.surfaceAlt,
          backgroundColor: t.color.textMuted,
          transform: [{ rotate: '-45deg' }],
        }}
      />
    </View>
  );
}

/** Строка с галочкой: обещание «Мы не записываем ваш голос — анализируется только громкость». */
export function PrivacyNote({ children }: { children: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: t.space.xs }}>
      <Icon name="check" size={NOTE_ICON} color={t.color.success} />
      <Text style={[t.type.caption, { flexShrink: 1, color: t.color.textMuted }]}>{children}</Text>
    </View>
  );
}
