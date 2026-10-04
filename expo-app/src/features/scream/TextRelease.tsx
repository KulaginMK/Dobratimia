import React, { useEffect, useEffectEvent, useLayoutEffect, useRef, useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  type NativeSyntheticEvent,
  type TextLayoutEventData,
  type TextStyle,
} from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import {
  GROW_MS,
  GROW_SCALE,
  planRelease,
  splitWords,
  type MeasuredLine,
  type Piece,
  type ReleaseEffect,
  type ReleasePlan,
  type Unit,
} from './release';

// За какую долю своего исчезновения полоски шредера расходятся в стороны.
const CUT_SHARE = 0.15;
// Исчезающий текст — жирный. Жирное начертание Golos Text шире обычного примерно на 0,18 точки на букву;
// на столько же сжимаем расстояние между буквами, чтобы слова остались на своих местах и строки не поехали.
const BOLD_TRACKING = -0.18;
// Запас ширины, чтобы слово внутри кусочка не перенеслось на вторую строку из-за округления.
// (numberOfLines тут не годится: в вебе он обрезает слово по ширине окошка и ставит многоточие.)
const WIDTH_SLACK = 100;

type Props = {
  text: string;
  effect: ReleaseEffect;
  /** На сколько текст в поле был прокручен (веб: длинный текст прокручивается внутри поля). */
  scrollTop: number;
  /** Последнее слово исчезло. */
  onDone: () => void;
};

/**
 * Текст, который исчезает после «Отпустить». Лежит поверх поля ввода, ровно на месте его текста:
 * сначала весь текст становится жирным и увеличивается, затем слова по очереди распадаются на кусочки.
 */
export function TextRelease({ text, effect, scrollTop, onDone }: Props) {
  const t = useTheme();
  const paragraph = useRef<Text>(null);
  const [plan, setPlan] = useState<ReleasePlan | null>(null);
  // Время от нажатия «Отпустить», мс: по нему считают своё движение и весь текст, и каждый кусочек.
  const clock = useSharedValue(0);
  // Те же шрифт и высота строки, что у текста в поле: строки ложатся так же.
  const textStyle: TextStyle = { ...t.type.body, color: t.color.text };
  const boldStyle: TextStyle = { ...textStyle, fontFamily: t.fontFamily.text[700], letterSpacing: BOLD_TRACKING };
  const lineHeight = t.type.body.lineHeight;

  // Телефон: система сама сообщает, как текст разбился на строки.
  const onTextLayout = (event: NativeSyntheticEvent<TextLayoutEventData>) => {
    if (plan) return;
    const lines = event.nativeEvent.lines.map((line) => ({ top: line.y, tokens: splitWords(line.text) }));
    setPlan(planRelease(effect, lines));
  };

  // Веб: каждое слово абзаца — отдельный <span>; строки собираем по их высоте от верха абзаца.
  // Меряем сразу после появления абзаца, до первого кадра: текст не успевает мигнуть.
  useLayoutEffect(() => {
    if (Platform.OS !== 'web') return;
    const element = paragraph.current as unknown as HTMLElement | null;
    if (!element) return;
    const visible = element.parentElement?.clientHeight ?? Number.POSITIVE_INFINITY;
    const lines: MeasuredLine[] = [];
    for (const span of Array.from(element.children) as HTMLElement[]) {
      // offsetTop слова — на пару точек ниже верха строки (буквы стоят внутри строки) — берём начало строки.
      const top = Math.floor(span.offsetTop / lineHeight) * lineHeight;
      // Строки, прокрученные за край поля, не показываем: их и до нажатия не было видно.
      if (top + lineHeight / 2 < scrollTop || top + lineHeight / 2 > scrollTop + visible) continue;
      const line = lines.find((item) => item.top === top);
      if (line) line.tokens.push(span.textContent ?? '');
      else lines.push({ top, tokens: [span.textContent ?? ''] });
    }
    setPlan(planRelease(effect, lines));
  }, [effect, lineHeight, scrollTop]);

  const done = useEffectEvent(onDone);
  useEffect(() => {
    if (!plan) return;
    // Сюда попадаем, только если «Уменьшить движение» выключено: иначе текст исчезает сразу, без анимации.
    clock.set(
      withTiming(plan.totalMs, { duration: plan.totalMs, easing: Easing.linear, reduceMotion: ReduceMotion.Never }),
    );
    // Конец — по таймеру, а не по анимации: текст сотрётся, даже если кадры не идут.
    const timer = setTimeout(done, plan.totalMs);
    return () => clearTimeout(timer);
  }, [plan, clock]);

  const grow = useAnimatedStyle(() => {
    const share = Math.min(1, clock.get() / GROW_MS);
    return { transform: [{ scale: 1 + (GROW_SCALE - 1) * (1 - Math.pow(1 - share, 3)) }] };
  });

  return (
    <View
      // Скринридеру улетающие копии текста не нужны.
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {/* Абзац для измерения строк. Пока план не готов (один-два кадра), он же и показывает текст на месте. */}
      <Text
        ref={paragraph}
        textBreakStrategy="simple"
        onTextLayout={Platform.OS === 'web' ? undefined : onTextLayout}
        style={[textStyle, { position: 'absolute', left: 0, right: 0, top: -scrollTop, opacity: plan ? 0 : 1 }]}
      >
        {splitWords(text).map((word, i) => (
          <Text key={i}>{word}</Text>
        ))}
      </Text>
      {plan ? (
        <Animated.View style={[StyleSheet.absoluteFill, { transformOrigin: 'top' }, grow]}>
          {plan.lines.map((line) => (
            <View
              key={line.key}
              style={{ position: 'absolute', left: 0, top: line.top - scrollTop, height: lineHeight, flexDirection: 'row' }}
            >
              {line.units.map((unit) => (
                <UnitView key={unit.key} unit={unit} wordMs={plan.wordMs} clock={clock} textStyle={boldStyle} />
              ))}
            </View>
          ))}
        </Animated.View>
      ) : null}
    </View>
  );
}

type UnitProps = {
  unit: Unit;
  wordMs: number;
  clock: SharedValue<number>;
  textStyle: TextStyle;
};

/** Слово: целое, пока не пришла его очередь, затем — кусочки. */
function UnitView({ unit, wordMs, clock, textStyle }: UnitProps) {
  const whole = useAnimatedStyle(() => ({ opacity: clock.get() < unit.startMs ? 1 : 0 }));
  if (unit.pieces.length === 0) return <Text style={textStyle}>{unit.text}</Text>;
  return (
    <View>
      {/* Целое слово задаёт размер, по которому нарезаются окошки кусочков. */}
      <Animated.Text style={[textStyle, whole]}>{unit.text}</Animated.Text>
      {unit.pieces.map((piece) => (
        <PieceView key={piece.key} piece={piece} unit={unit} wordMs={wordMs} clock={clock}>
          <Text
            style={[
              textStyle,
              {
                position: 'absolute',
                left: `${-piece.col * 100}%`,
                top: `${-piece.row * 100}%`,
                width: `${unit.cols * 100 + WIDTH_SLACK}%`,
              },
            ]}
          >
            {unit.text}
          </Text>
        </PieceView>
      ))}
    </View>
  );
}

type PieceProps = {
  piece: Piece;
  unit: Unit;
  wordMs: number;
  clock: SharedValue<number>;
  children: React.ReactNode;
};

/** Кусочек слова: окошко, в котором виден свой участок слова. Улетает вместе с ним. */
function PieceView({ piece, unit, wordMs, clock, children }: PieceProps) {
  const style = useAnimatedStyle(() => {
    const word = Math.min(1, Math.max(0, (clock.get() - unit.startMs) / wordMs));
    if (word <= 0) return { opacity: 0, transform: [{ translateX: 0 }, { translateY: 0 }, { rotate: '0deg' }, { scale: 1 }] };
    const own = Math.min(1, Math.max(0, (word - piece.delay) / (1 - piece.delay)));
    const eased = piece.accelerate ? own * own : 1 - Math.pow(1 - own, 3);
    return {
      opacity: own <= piece.fadeFrom ? 1 : 1 - (own - piece.fadeFrom) / (1 - piece.fadeFrom),
      transform: [
        { translateX: piece.cut * Math.min(1, word / CUT_SHARE) + piece.dx * eased },
        { translateY: piece.dy * eased + piece.fall * own * own },
        { rotate: `${piece.rotate * eased}deg` },
        { scale: 1 + (piece.scale - 1) * eased },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: `${(piece.col * 100) / unit.cols}%`,
          top: `${(piece.row * 100) / unit.rows}%`,
          width: `${100 / unit.cols}%`,
          height: `${100 / unit.rows}%`,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
