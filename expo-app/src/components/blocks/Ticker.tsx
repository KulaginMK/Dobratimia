import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useFrameCallback, useReducedMotion, useSharedValue } from 'react-native-reanimated';
import { Icon, type IconName } from '@/components/brand';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';

// Размеры из макета Home (.ticker, .pause).
const HEIGHT = 48;
const PAD_LEFT = 14;
const PAD_RIGHT = 6;
const GAP = 10;
const ICON_SIZE = 22;
const FONT_SIZE = 15;
const LINE_HEIGHT = 20;
const PAUSE_SIZE = 36;
const PAUSE_ICON = 16;
// В макете фраза проходит мимо за 16 с — это около 16 dp в секунду.
const SPEED = 16;
// Дорожка заведомо шире двух фраз подряд: текст в ней не переносится и не обрезается.
const TRACK_WIDTH = 2000;
// Неразрывные пробелы: обычный пробел в конце строки веб обрезает, и фразы слипаются.
const SEPARATOR = '\u00A0·\u00A0';

type Props = {
  icon: IconName;
  /** Начало фразы: «Сегодня вы не одни: ». */
  text: string;
  /** Выделенная часть: «128 человек». */
  strong: string;
  /** false — экран сейчас не виден: строка стоит и не тратит батарею. */
  active?: boolean;
};

/**
 * Бегущая строка с паузой. Нажатие останавливает и запускает движение;
 * при «Уменьшить движение» строка стоит и показывает фразу целиком.
 */
export function Ticker({ icon, text, strong, active = true }: Props) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const running = active && !paused && !reduced;

  const shift = useSharedValue(0);
  const phraseWidth = useSharedValue(0);
  const frame = useFrameCallback((info) => {
    const width = phraseWidth.get();
    if (width <= 0) return;
    shift.set((shift.get() + (SPEED * (info.timeSincePreviousFrame ?? 0)) / 1000) % width);
  }, false);
  useEffect(() => {
    frame.setActive(running);
  }, [frame, running]);
  const trackStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -shift.get() }] }));

  const phrase = (measure: boolean) => (
    <Text
      numberOfLines={1}
      onLayout={measure ? (e) => phraseWidth.set(e.nativeEvent.layout.width) : undefined}
      style={{
        fontFamily: t.type.body.fontFamily,
        fontSize: FONT_SIZE,
        lineHeight: LINE_HEIGHT,
        color: t.color.text,
      }}
    >
      {text}
      <Text style={{ fontFamily: t.fontFamily.text[700] }}>{strong}</Text>
      {reduced ? '' : SEPARATOR}
    </Text>
  );

  const body = (
    <>
      <Icon name={icon} size={ICON_SIZE} color={t.color.primary} />
      <View style={{ flex: 1, overflow: 'hidden', justifyContent: 'center' }}>
        {reduced ? (
          phrase(false)
        ) : (
          <Animated.View style={[{ flexDirection: 'row', width: TRACK_WIDTH }, trackStyle]}>
            {phrase(true)}
            {phrase(false)}
          </Animated.View>
        )}
      </View>
      {reduced ? null : (
        <View
          style={{
            width: PAUSE_SIZE,
            height: PAUSE_SIZE,
            borderRadius: t.radius.full,
            backgroundColor: t.color.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name={paused ? 'play' : 'pause'} size={PAUSE_ICON} color={t.color.textMuted} />
        </View>
      )}
    </>
  );

  const frameStyle = {
    minHeight: HEIGHT,
    paddingLeft: PAD_LEFT,
    paddingRight: reduced ? PAD_LEFT : PAD_RIGHT,
    borderRadius: t.radius.full,
    backgroundColor: t.color.surface,
    boxShadow: t.shadow.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: GAP,
  } as const;

  if (reduced) {
    return (
      <View accessible accessibilityLabel={`${text}${strong}`} style={frameStyle}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      onPress={() => setPaused(!paused)}
      accessibilityRole="button"
      accessibilityLabel={`${text}${strong}. ${paused ? 'Запустить бегущую строку' : 'Остановить бегущую строку'}`}
      style={(state) => [frameStyle, focusRing(t, isFocused(state))]}
    >
      {body}
    </Pressable>
  );
}
