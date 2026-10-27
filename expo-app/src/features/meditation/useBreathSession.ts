import * as Haptics from 'expo-haptics';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import { Easing, ReduceMotion, cancelAnimation, useSharedValue, withTiming } from 'react-native-reanimated';
import type { BreathScheme } from '@/data/techniques';
import { MIN_SCALE, PHASE_TEXT, breathPosition, phaseEndScale, totalMs, type BreathPhaseKind } from './breath';

// Как часто пересчитываем подписи. Сам круг движется анимацией, а не этими тиками.
const TICK_MS = 200;

type Run = {
  running: boolean;
  /** Когда практика запущена или продолжена, мс от эпохи. */
  startedAt: number;
  /** Сколько прошло до последней паузы. */
  elapsedBefore: number;
};

type Options = {
  /** Лёгкая вибрация на смене фазы. Выключается вместе со звуком (docs/07). */
  haptics: boolean;
  /** Началась фаза или вся практика закончена — для звукового сигнала. Первый вдох начинается с «Начать». */
  onPhase?: (phase: BreathPhaseKind | 'done') => void;
};

/**
 * Дыхательная практика: время — единственный источник правды, фазы и круг вычисляются из него.
 * Ждёт «Начать»: сама не запускается ни при открытии, ни после сброса.
 */
export function useBreathSession(scheme: BreathScheme, cycles: number, { haptics, onPhase }: Options) {
  const [run, setRun] = useState<Run>(() => ({ running: false, startedAt: Date.now(), elapsedBefore: 0 }));
  const [now, setNow] = useState(() => Date.now());
  const total = totalMs(scheme, cycles);

  useEffect(() => {
    if (!run.running) return;
    const timer = setInterval(() => {
      const at = Date.now();
      if (run.elapsedBefore + (at - run.startedAt) >= total) {
        setRun({ running: false, startedAt: at, elapsedBefore: total });
      }
      setNow(at);
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [run, total]);

  const elapsed = run.elapsedBefore + (run.running ? Math.max(0, now - run.startedAt) : 0);
  const position = breathPosition(elapsed, scheme, cycles);
  const phaseKey = `${position.cycle}:${position.phaseIndex}:${position.done}`;

  // Фаза сменяется ровно по секундам схемы, а не на ближайшем тике: на смену звучит сигнал.
  useEffect(() => {
    if (!run.running || position.done) return;
    const timer = setTimeout(() => setNow(Date.now()), position.msLeft - (Date.now() - now));
    return () => clearTimeout(timer);
  }, [run.running, position.done, position.msLeft, now]);

  // Круг: строго по секундам схемы, линейно. Анимация не отключается системной настройкой —
  // при «Уменьшить движение» круг остаётся: это сама практика (docs/09).
  const scale = useSharedValue(MIN_SCALE);
  useEffect(() => {
    const at = Date.now();
    const current = breathPosition(
      run.elapsedBefore + (run.running ? Math.max(0, at - run.startedAt) : 0),
      scheme,
      cycles,
    );
    cancelAnimation(scale);
    scale.set(current.scale);
    if (run.running && !current.done) {
      scale.set(
        withTiming(phaseEndScale(current.kind), {
          duration: current.msLeft,
          easing: Easing.linear,
          reduceMotion: ReduceMotion.Never,
        }),
      );
    }
  }, [run, scheme, cycles, phaseKey, scale]);

  // Смена фазы: объявляем скринридеру (а не каждую секунду), слегка вибрируем и подаём сигнал.
  const phaseStarted = useEffectEvent((phase: BreathPhaseKind | 'done') => onPhase?.(phase));
  const announced = useRef(phaseKey);
  useEffect(() => {
    if (announced.current === phaseKey) return;
    announced.current = phaseKey;
    if (!run.running && !position.done) return;
    AccessibilityInfo.announceForAccessibility(position.done ? 'Готово' : PHASE_TEXT[position.kind].name);
    if (haptics && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    phaseStarted(position.done ? 'done' : position.kind);
  }, [phaseKey, run.running, position.done, position.kind, haptics]);

  const toggle = () => {
    const at = Date.now();
    if (!run.running && run.elapsedBefore === 0) onPhase?.(position.kind);
    setNow(at);
    setRun(
      run.running
        ? { running: false, startedAt: at, elapsedBefore: run.elapsedBefore + Math.max(0, at - run.startedAt) }
        : { running: true, startedAt: at, elapsedBefore: run.elapsedBefore },
    );
  };

  /** «Сброс» и смена схемы — к началу, ждём «Начать»; «Повторить» (running) — заново и сразу идёт. */
  const restart = (running = false) => {
    const at = Date.now();
    setNow(at);
    setRun({ running, startedAt: at, elapsedBefore: 0 });
  };

  return { position, running: run.running, untouched: !run.running && run.elapsedBefore === 0, scale, toggle, restart };
}
