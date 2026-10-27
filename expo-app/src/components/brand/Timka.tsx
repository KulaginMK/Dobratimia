import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useDerivedValue,
  useFrameCallback,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg from 'react-native-svg';
import { timkaBreathingShapes, timkaShapes, type Shape } from './shapes';
import { SvgShapes } from './SvgShapes';

export type TimkaPose = keyof typeof timkaShapes;
/**
 * idle — моргает и покачивает ростком; wave — сначала машет, потом как idle; nod — дважды кивает, потом как idle;
 * stretch — тянется вверх и опускается, потом как idle (поза stretch); flutter — росток часто колышется;
 * blown — росток откидывает назад; sleepy — дышит во сне (поза sleep).
 */
export type TimkaMotion = 'idle' | 'wave' | 'nod' | 'stretch' | 'flutter' | 'blown' | 'sleepy';

const LABELS: Record<TimkaPose, string> = {
  hello: 'Тимка машет рукой',
  breathe: 'Тимка спокойно дышит',
  sleep: 'Тимка спит',
  stretch: 'Тимка потягивается',
  loud: 'Тимка закрывает уши',
};

// Рисунок Тимки: viewBox "0 -6 120 120".
const VIEW = 120;
const VIEW_TOP = -6;
const VIEW_BOX = `0 ${VIEW_TOP} ${VIEW} ${VIEW}`;

// Длительности из TIMKA-MOTION.md (словарь движений), владелец согласовал 27 октября 2026 года.
const BLINK = 160;
const BLINK_CLOSED = 0.1;
const BLINK_EVERY_MIN = 4000;
const BLINK_EVERY_SPREAD = 3000;
const SWAY_DEG = 3;
const SWAY_CYCLE = 3000;
const WAVE_DEG = 20;
const WAVE_SWING = 240;
const WAVE_TIMES = 2;
const NOD = 240;
const NOD_TIMES = 2;
const NOD_SQUASH = 0.1;
const STRETCH = 320;
const STRETCH_HOLD = 600;
const STRETCH_RISE = 0.06;
const FLUTTER_DEG = 6;
const FLUTTER_CYCLE = 600;
const BLOWN_DEG = -25;
const BLOWN = 240;
const SLEEP_CYCLE = 4000;
const SLEEP_RISE = 0.02;
const ZZZ_RISE = 3;
const ZZZ_FADE = 0.5;

/**
 * Точка поворота части в координатах рисунка → transformOrigin слоя.
 * Списком, а не строкой: из строки Android берёт только целые проценты и дробные разбирает неверно.
 */
const origin = (x: number, y: number): Origin => [`${(x / VIEW) * 100}%`, `${((y - VIEW_TOP) / VIEW) * 100}%`, 0];
type Origin = [string, string, number];
const SPROUT_ORIGIN = origin(60, 30); // основание стебля
const HAND_ORIGIN = origin(98, 68); // плечо
const EYES_ORIGIN = origin(60, 64);
const BODY_ORIGIN = origin(60, 102); // низ тела: «поднимается» вверх от земли
const LEAF_LEFT_ORIGIN = origin(59.5, 18); // черешки листьев на стебле
const LEAF_RIGHT_ORIGIN = origin(60.5, 14);

const easeOut = Easing.out(Easing.cubic);
const easeInOut = Easing.inOut(Easing.sin);

type Props = {
  /** hello — онбординг, вход, подсказки; breathe — медитации; sleep — пустые состояния; stretch — перерыв Pomodoro; loud — КРИК. */
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

type MovingProps = { shapes: Shape[]; size: number; motion: TimkaMotion };

function MovingTimka({ shapes, size, motion }: MovingProps) {
  const sway = useSharedValue(0);
  const hand = useSharedValue(0);
  const eyes = useSharedValue(1);
  const sleep = useSharedValue(0);
  const nod = useSharedValue(0);
  const stretch = useSharedValue(0);

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
    if (motion === 'nod') {
      const dip = withSequence(
        withTiming(1, { duration: NOD / 2, easing: easeOut }),
        withTiming(0, { duration: NOD / 2, easing: easeOut }),
      );
      nod.set(withRepeat(dip, NOD_TIMES));
    }
    if (motion === 'stretch') {
      stretch.set(
        withSequence(
          withTiming(1, { duration: STRETCH, easing: easeOut }),
          withDelay(STRETCH_HOLD, withTiming(0, { duration: STRETCH, easing: easeOut })),
        ),
      );
    }
    if (motion === 'blown') {
      sway.set(withTiming(BLOWN_DEG, { duration: BLOWN, easing: easeOut }));
    } else {
      const [deg, cycle] = motion === 'flutter' ? [FLUTTER_DEG, FLUTTER_CYCLE] : [SWAY_DEG, SWAY_CYCLE];
      sway.set(
        withSequence(
          withTiming(deg, { duration: cycle / 4, easing: easeInOut }),
          withRepeat(withTiming(-deg, { duration: cycle / 2, easing: easeInOut }), -1, true),
        ),
      );
    }
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
      [sway, hand, eyes, nod, stretch].forEach(cancelAnimation);
    };
  }, [motion, sway, hand, eyes, sleep, nod, stretch]);

  const sproutStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${sway.get()}deg` }] }));
  const handStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${hand.get()}deg` }] }));
  const eyesStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: eyes.get() }] }));
  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: 1 + SLEEP_RISE * sleep.get() + STRETCH_RISE * stretch.get() }],
  }));
  // Кивок: Тимка чуть приседает к земле и выпрямляется.
  const nodStyle = useAnimatedStyle(() => ({ transform: [{ scaleY: 1 - NOD_SQUASH * nod.get() }] }));
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
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: BODY_ORIGIN }, nodStyle]}>
      <Layers shapes={shapes} size={size} parts={parts} />
    </Animated.View>
  );
}

/** Лицо Тимки в дыхательном круге: вдох, задержка, выдох, пауза; look — открыл глаза в конце практики. */
export type BreathFace = 'in' | 'hold' | 'out' | 'rest' | 'look';

// Дыхание — «Тимка · дыхание · спецификация» 1.0 и timka-breath.js (Google Drive, «Графика бренда / Тимка / Дыхание»),
// владелец утвердил 27 октября 2026 года. Время — в секундах, углы — в радианах, длины — в единицах рисунка.
const FACE_BLEND = 280; // мс: новое лицо смешивается с прежним
const BODY_EMPTY_X = 0.97;
const BODY_GROW_X = 0.06;
const BODY_PUFF_X = 0.025; // на задержке щёки надуваются
const BODY_EMPTY_Y = 0.94;
const BODY_GROW_Y = 0.1;
const BODY_HEIGHT = 74; // от низа тела до основания ростка: росток поднимается вместе с головой
const STEM_HEIGHT = 21;
const STEM_SWAY = 9;
const STEM_SPEED = 3.2;
const LEAF_TILT = 0.18;
const LEAF_IDLE = 0.03;
const LEAF_IDLE_SPEED = 1.7;
const LEAF_FLUTTER = 0.18;
const LEAF_FLUTTER_SPEED = 11;
const BREATH_BLINK_EVERY = 3.6;
const BREATH_BLINK = 0.13;
const BREATH_BLINK_CLOSED = 0.08;
// Рот кружком: радиусы от MIN до MIN + GROW, в рисунке — самый большой.
const MOUTH_MIN_X = 1.6;
const MOUTH_GROW_X = 2.4;
const MOUTH_MIN_Y = 2;
const MOUTH_GROW_Y = 3.2;
const MOUTH_SPEED = 6;
// Облачко летит от (60, 92) на 16 вправо и 22 вниз и растёт с радиуса 2 до 7; в рисунке оно на середине пути.
const PUFF_SPEED = 0.8;
const PUFF_DX = 16;
const PUFF_DY = 22;
const PUFF_R_MIN = 2;
const PUFF_R_GROW = 5;
const PUFF_R = 4.5;
const PUFF_ALPHA = 0.8;
const EFFECT_AFTER = 0.4; // облачка и искорка появляются, когда лицо сменилось на 40 %
const SPARK_SPEED = 5;
const SPARK_SIZE = 7;
const SPARK_MIN = 2;
const SPARK_DIM = 0.4;
const RAD = 180 / Math.PI;
const STEM_ORIGIN = origin(60, 31);
const MOUTH_ORIGIN = origin(60, 79);
const PUFF_ORIGIN = origin(68, 103);
const SPARK_ORIGIN = origin(98, 38);

/** Кадр дыхательной анимации: время, лицо (kind — новое, shift — насколько сменилось), наполненность, вес лиц. */
type BreathNow = {
  t: number;
  kind: BreathFace;
  shift: number;
  fill: number;
  faces: Record<BreathFace, number>;
  /** Сдвиг кончика ростка на выдохе. */
  tip: number;
  flutter: number;
};

function leafTurn(n: BreathNow, side: number) {
  'worklet';
  const tilt = LEAF_TILT * (1 - 2 * n.fill); // на вдохе листья приподнимаются
  return { transform: [{ rotate: `${(side * (tilt - n.flutter) + LEAF_IDLE * Math.sin(n.t * LEAF_IDLE_SPEED)) * RAD}deg` }] };
}

/** open — насколько открыт рот кружком, 1 — как в рисунке. */
function mouthOpen(open: number) {
  'worklet';
  return {
    transform: [
      { scaleX: (MOUTH_MIN_X + MOUTH_GROW_X * open) / (MOUTH_MIN_X + MOUTH_GROW_X) },
      { scaleY: (MOUTH_MIN_Y + MOUTH_GROW_Y * open) / (MOUTH_MIN_Y + MOUTH_GROW_Y) },
    ],
  };
}

/** i-е из трёх облачков; k — сколько точек экрана в единице рисунка. */
function puffFlight(n: BreathNow, i: number, k: number) {
  'worklet';
  const run = (n.t * PUFF_SPEED + i / 3) % 1;
  const q = n.kind === 'in' ? 1 - run : run; // на вдохе облачка летят в рот
  const shown = (n.kind === 'in' || n.kind === 'out') && n.shift >= EFFECT_AFTER;
  return {
    opacity: shown ? (1 - q) * PUFF_ALPHA : 0,
    transform: [
      { translateX: PUFF_DX * (q - 0.5) * k },
      { translateY: PUFF_DY * (q - 0.5) * k },
      { scale: (PUFF_R_MIN + PUFF_R_GROW * q) / PUFF_R },
    ],
  };
}

type BreathingProps = {
  /** Наполненность 0…1: 0 — выдохнул, 1 — полный вдох. То же значение, что двигает дыхательный круг. */
  level: SharedValue<number>;
  face: BreathFace;
  /** По умолчанию 160. */
  size?: number;
  /** false — экран сейчас не виден: Тимка замирает и не тратит батарею. */
  active?: boolean;
};

/**
 * Тимка в дыхательном круге: лицо по фазе, на вдохе тело наполняется и облачка летят в рот, на задержке надуты щёки
 * и мигает искорка, на выдохе облачка выходят изо рта и росток качается. При «Уменьшить движение» лицо меняется
 * сразу, а качания, моргание и полёт облачков стоят.
 */
export function BreathingTimka({ level, face, size = 160, active = true }: BreathingProps) {
  const reduced = useReducedMotion();
  const clock = useSharedValue(0);
  const from = useSharedValue(face);
  const to = useSharedValue(face);
  const blend = useSharedValue(1);
  const k = size / VIEW;

  const frame = useFrameCallback((info) => {
    clock.set(clock.get() + (info.timeSincePreviousFrame ?? 0) / 1000);
  }, false);
  useEffect(() => {
    frame.setActive(active && !reduced);
  }, [frame, active, reduced]);

  useEffect(() => {
    if (to.get() === face) return;
    from.set(to.get());
    to.set(face);
    blend.set(0);
    blend.set(withTiming(1, { duration: reduced ? 0 : FACE_BLEND, easing: easeInOut }));
  }, [face, reduced, from, to, blend]);

  // Всё, что нужно кадру, — в одном значении. Стиль пересчитывается, только когда меняется значение,
  // которое он читает сам, а не через вспомогательную функцию: поэтому каждый стиль читает now.
  const now = useDerivedValue<BreathNow>(() => {
    const t = clock.get();
    const kind = to.get();
    const shift = blend.get();
    const weight = (f: BreathFace) => (kind === f ? shift : 0) + (from.get() === f ? 1 - shift : 0);
    return {
      t,
      kind,
      shift,
      // Плавная кривая от того же значения, что у круга: на границах фаз они совпадают.
      fill: 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, level.get()))),
      faces: { in: weight('in'), hold: weight('hold'), out: weight('out'), rest: weight('rest'), look: weight('look') },
      tip: STEM_SWAY * Math.sin(t * STEM_SPEED) * weight('out'),
      flutter: LEAF_FLUTTER * Math.sin(t * LEAF_FLUTTER_SPEED) * weight('out'),
    };
  });

  const sproutStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -BODY_HEIGHT * (BODY_EMPTY_Y + BODY_GROW_Y * now.get().fill - 1) * k }],
  }));
  const stemStyle = useAnimatedStyle(() => ({
    transform: [{ skewX: `${-Math.atan(now.get().tip / STEM_HEIGHT) * RAD}deg` }],
  }));
  const leavesStyle = useAnimatedStyle(() => ({ transform: [{ translateX: now.get().tip * k }] }));
  const leafLeftStyle = useAnimatedStyle(() => leafTurn(now.get(), -1));
  const leafRightStyle = useAnimatedStyle(() => leafTurn(now.get(), 1));
  const bodyStyle = useAnimatedStyle(() => {
    const n = now.get();
    return {
      transform: [
        { scaleX: BODY_EMPTY_X + BODY_GROW_X * n.fill + BODY_PUFF_X * n.faces.hold },
        { scaleY: BODY_EMPTY_Y + BODY_GROW_Y * n.fill },
      ],
    };
  });
  const faceInStyle = useAnimatedStyle(() => ({ opacity: now.get().faces.in }));
  const faceHoldStyle = useAnimatedStyle(() => ({ opacity: now.get().faces.hold }));
  const faceOutStyle = useAnimatedStyle(() => ({ opacity: now.get().faces.out }));
  const faceRestStyle = useAnimatedStyle(() => ({ opacity: now.get().faces.rest }));
  const faceLookStyle = useAnimatedStyle(() => ({ opacity: now.get().faces.look }));
  const eyesStyle = useAnimatedStyle(() => ({
    transform: [
      { scaleY: now.get().t % BREATH_BLINK_EVERY > BREATH_BLINK_EVERY - BREATH_BLINK ? BREATH_BLINK_CLOSED : 1 },
    ],
  }));
  const mouthInStyle = useAnimatedStyle(() => mouthOpen(0.65 + 0.35 * now.get().fill));
  const mouthOutStyle = useAnimatedStyle(() => mouthOpen(0.75 + 0.25 * Math.sin(now.get().t * MOUTH_SPEED)));
  const puff0Style = useAnimatedStyle(() => puffFlight(now.get(), 0, k));
  const puff1Style = useAnimatedStyle(() => puffFlight(now.get(), 1, k));
  const puff2Style = useAnimatedStyle(() => puffFlight(now.get(), 2, k));
  const sparkStyle = useAnimatedStyle(() => {
    const n = now.get();
    const twinkle = 0.5 + 0.5 * Math.sin(n.t * SPARK_SPEED);
    const shown = n.kind === 'hold' && n.shift >= EFFECT_AFTER;
    return {
      opacity: shown ? SPARK_DIM + (1 - SPARK_DIM) * twinkle : 0,
      transform: [{ scale: (SPARK_MIN + (SPARK_SIZE - SPARK_MIN) * twinkle) / SPARK_SIZE }],
    };
  });

  const parts: Record<string, Part> = {
    sprout: { style: sproutStyle },
    stem: { style: stemStyle, origin: STEM_ORIGIN },
    leaves: { style: leavesStyle },
    'leaf-left': { style: leafLeftStyle, origin: LEAF_LEFT_ORIGIN },
    'leaf-right': { style: leafRightStyle, origin: LEAF_RIGHT_ORIGIN },
    body: { style: bodyStyle, origin: BODY_ORIGIN },
    'face-in': { style: faceInStyle },
    'face-hold': { style: faceHoldStyle },
    'face-out': { style: faceOutStyle },
    'face-rest': { style: faceRestStyle },
    'face-look': { style: faceLookStyle },
    'eyes-in': { style: eyesStyle, origin: EYES_ORIGIN },
    'eyes-look': { style: eyesStyle, origin: EYES_ORIGIN },
    'mouth-in': { style: mouthInStyle, origin: MOUTH_ORIGIN },
    'mouth-out': { style: mouthOutStyle, origin: MOUTH_ORIGIN },
    'puff-0': { style: puff0Style, origin: PUFF_ORIGIN },
    'puff-1': { style: puff1Style, origin: PUFF_ORIGIN },
    'puff-2': { style: puff2Style, origin: PUFF_ORIGIN },
    spark: { style: sparkStyle, origin: SPARK_ORIGIN },
  };
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={LABELS.breathe} style={{ width: size, height: size }}>
      <Layers shapes={timkaBreathingShapes} size={size} parts={parts} />
    </View>
  );
}

type Part = { style: React.ComponentProps<typeof Animated.View>['style']; origin?: Origin };

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
