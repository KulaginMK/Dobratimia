import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg from 'react-native-svg';
import { timkaShapes, type Shape } from './shapes';
import { SvgShapes } from './SvgShapes';

export type TimkaPose = 'hello' | 'breathe' | 'sleep';
/** idle — моргает и покачивает ростком; wave — сначала машет, потом как idle; sleepy — дышит во сне (поза sleep). */
export type TimkaMotion = 'idle' | 'wave' | 'sleepy';

const LABELS: Record<TimkaPose, string> = {
  hello: 'Тимка машет рукой',
  breathe: 'Тимка спокойно дышит',
  sleep: 'Тимка спит',
};

// Рисунок Тимки: viewBox "0 -6 120 120".
const VIEW = 120;
const VIEW_TOP = -6;
const VIEW_BOX = `0 ${VIEW_TOP} ${VIEW} ${VIEW}`;

// Длительности из TIMKA-MOTION.md (словарь движений). Медленные — предложение, ждут согласования владельца.
const BLINK = 160;
const BLINK_CLOSED = 0.1;
const BLINK_EVERY_MIN = 4000;
const BLINK_EVERY_SPREAD = 3000;
const SWAY_DEG = 3;
const SWAY_CYCLE = 3000;
const WAVE_DEG = 20;
const WAVE_SWING = 240;
const WAVE_TIMES = 2;
const SLEEP_CYCLE = 4000;
const SLEEP_RISE = 0.02;
const ZZZ_RISE = 3;
const ZZZ_FADE = 0.5;

/** Точка поворота части в координатах рисунка → transformOrigin слоя. */
const origin = (x: number, y: number) => `${(x / VIEW) * 100}% ${((y - VIEW_TOP) / VIEW) * 100}%`;
const SPROUT_ORIGIN = origin(60, 30); // основание стебля
const HAND_ORIGIN = origin(98, 68); // плечо
const EYES_ORIGIN = origin(60, 64);
const BODY_ORIGIN = origin(60, 102); // низ тела: «поднимается» вверх от земли

const easeOut = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.sin);

type Props = {
  /** hello — онбординг и вход, breathe — медитации, sleep — пустые состояния. */
  pose?: TimkaPose;
  /** По умолчанию 160. */
  size?: number;
  title?: string;
  /** Без motion Тимка неподвижен. При «Уменьшить движение» — всегда неподвижен. */
  motion?: TimkaMotion;
  /** false — экран сейчас не виден: Тимка стоит и не тратит батарею. */
  active?: boolean;
};

/**
 * Маскот Тимка — тёплое зёрнышко с ростком.
 * Где он бывает и как двигается — TIMKA-MOTION.md (решение владельца от 27 октября 2026 года).
 * Никогда — в SOS, DASS-21, у специалистов, в кабинете, в «Плане на трудный момент» и в ошибках.
 */
export function Timka({ pose = 'hello', size = 160, title, motion, active = true }: Props) {
  const reduced = useReducedMotion();
  const shapes = timkaShapes[pose];
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={title ?? LABELS[pose]}
      style={{ width: size, height: size }}
    >
      {motion && active && !reduced ? (
        <MovingTimka shapes={shapes} size={size} motion={motion} />
      ) : (
        <Svg width={size} height={size} viewBox={VIEW_BOX}>
          <SvgShapes shapes={shapes} />
        </Svg>
      )}
    </View>
  );
}

function MovingTimka({ shapes, size, motion }: { shapes: Shape[]; size: number; motion: TimkaMotion }) {
  const sway = useSharedValue(0);
  const hand = useSharedValue(0);
  const eyes = useSharedValue(1);
  const sleep = useSharedValue(0);

  useEffect(() => {
    if (motion === 'sleepy') {
      sleep.set(withRepeat(withTiming(1, { duration: SLEEP_CYCLE / 2, easing: easeInOut }), -1, true));
      return () => cancelAnimation(sleep);
    }
    if (motion === 'wave') {
      const swing = withSequence(
        withTiming(WAVE_DEG, { duration: WAVE_SWING, easing: easeOut }),
        withTiming(0, { duration: WAVE_SWING, easing: easeOut }),
      );
      hand.set(withRepeat(swing, WAVE_TIMES));
    }
    sway.set(
      withSequence(
        withTiming(SWAY_DEG, { duration: SWAY_CYCLE / 4, easing: easeInOut }),
        withRepeat(withTiming(-SWAY_DEG, { duration: SWAY_CYCLE / 2, easing: easeInOut }), -1, true),
      ),
    );
    // Моргает через случайные 4–7 с, чтобы не выглядеть механически.
    let timer: ReturnType<typeof setTimeout>;
    const next = () => {
      timer = setTimeout(() => {
        eyes.set(withSequence(withTiming(BLINK_CLOSED, { duration: BLINK / 2 }), withTiming(1, { duration: BLINK / 2 })));
        next();
      }, BLINK_EVERY_MIN + Math.random() * BLINK_EVERY_SPREAD);
    };
    next();
    return () => {
      clearTimeout(timer);
      [sway, hand, eyes].forEach(cancelAnimation);
    };
  }, [motion, sway, hand, eyes, sleep]);

  const sproutStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${sway.get()}deg` }] }));
  const handStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${hand.get()}deg` }] }));
  const eyesStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: eyes.get() }] }));
  const bodyStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: 1 + SLEEP_RISE * sleep.get() }] }));
  const zzzStyle = useAnimatedStyle(() => ({
    opacity: 1 - ZZZ_FADE * sleep.get(),
    transform: [{ translateY: (-ZZZ_RISE * sleep.get() * size) / VIEW }],
  }));

  // Части с id в SVG (handoff/assets/svg/Mascot). Части без движения рисуются вместе с остальным.
  const parts: Record<string, Part> = {
    sprout: { style: sproutStyle, origin: SPROUT_ORIGIN },
    hand: { style: handStyle, origin: HAND_ORIGIN },
    eyes: { style: eyesStyle, origin: EYES_ORIGIN },
    body: { style: bodyStyle, origin: BODY_ORIGIN },
    zzz: { style: zzzStyle },
  };
  return <Layers shapes={shapes} size={size} parts={parts} />;
}

type Part = { style: React.ComponentProps<typeof Animated.View>['style']; origin?: string };

/** Подряд идущие неподвижные фигуры — один <Svg>; каждая движущаяся часть — свой слой поверх, в том же порядке. */
function Layers({ shapes, size, parts }: { shapes: Shape[]; size: number; parts: Record<string, Part> }) {
  const layers: React.ReactNode[] = [];
  let still: Shape[] = [];
  const svg = (list: Shape[]) => (
    <Svg key={layers.length} style={StyleSheet.absoluteFill} width={size} height={size} viewBox={VIEW_BOX}>
      <SvgShapes shapes={list} />
    </Svg>
  );
  const flush = () => {
    if (still.length) layers.push(svg(still));
    still = [];
  };
  for (const shape of shapes) {
    const part = shape.p.id ? parts[shape.p.id] : undefined;
    if (!part) {
      still.push(shape);
      continue;
    }
    flush();
    layers.push(
      <Animated.View key={layers.length} style={[StyleSheet.absoluteFill, { transformOrigin: part.origin }, part.style]}>
        {shape.t === 'g' ? <Layers shapes={shape.c ?? []} size={size} parts={parts} /> : svg([shape])}
      </Animated.View>,
    );
  }
  flush();
  return <>{layers}</>;
}
