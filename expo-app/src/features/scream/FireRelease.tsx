import { createAudioPlayer } from 'expo-audio';
import React, { useEffect, useEffectEvent, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme';
import { COVERED_MS, DONE_MS, FLAME_LAYERS, bandOf, bandTop, durationOf, flameEdge, type FlameLayer } from './fire';

// «Вжух» вспыхнувшего огня: BigSoundBank №1341, CC0, первые 1,4 с — затихает раньше, чем огонь уходит (assets/sounds/README.md).
const WHOOSH = require('../../../assets/sounds/fire.m4a');

// Слои уходят вверх чуть наискосок, попеременно влево и вправо: пламя «колышется». Доля ширины экрана.
const SWAY = 0.06;

type Props = {
  /** Экран целиком под огнём: пора сменить замер на результат. */
  onCovered: () => void;
  /** Огонь ушёл за верх. */
  onDone: () => void;
};

type LayerProps = { layer: FlameLayer; index: number; color: string; width: number; height: number };

function Flames({ layer, index, color, width, height }: LayerProps) {
  // Каждый раз языки другие: огонь не повторяется.
  const [edges] = useState(() => ({
    top: flameEdge(width, layer.tongues * height),
    tail: flameEdge(width, layer.tail * height),
  }));
  const progress = useSharedValue(0);
  const band = bandOf(layer);
  const sway = (index % 2 === 0 ? 1 : -1) * SWAY * width;

  useEffect(() => {
    progress.set(
      withDelay(
        layer.delayMs,
        withTiming(1, { duration: durationOf(layer), easing: Easing.linear, reduceMotion: ReduceMotion.Never }),
      ),
    );
  }, [layer, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: bandTop(progress.get(), band) * height }, { translateX: (progress.get() - 0.5) * sway }],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left: 0, top: 0, width }, style]}>
      <Svg width={width} height={layer.tongues * height}>
        <Path d={edges.top} fill={color} />
      </Svg>
      {/* Тело заходит на края на точку: на стыке не видно щели. */}
      <View style={{ height: layer.body * height + 2, marginVertical: -1, backgroundColor: color }} />
      <Svg width={width} height={layer.tail * height} style={{ transform: [{ scaleY: -1 }] }}>
        <Path d={edges.tail} fill={color} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Огонь по всему экрану после «Отпустить» в КРИКе. Плоские слои в цветах знака, без градиентов (docs/02):
 * терракотовая стена, внутри оранжевые, медовые и абрикосовые языки, со звуком вспышки.
 * При «Уменьшить движение» не показывается и не звучит.
 */
export function FireRelease({ onCovered, onDone }: Props) {
  const t = useTheme();
  const { width, height } = useWindowDimensions();
  const colors = [t.logo.warm, t.logo.orange, t.logo.head, t.logo.apricot];

  // Смена экрана и конец — по таймерам, а не по анимации: результат появится, даже если кадры не идут.
  const covered = useEffectEvent(onCovered);
  const done = useEffectEvent(onDone);
  useEffect(() => {
    const timers = [setTimeout(covered, COVERED_MS), setTimeout(done, DONE_MS)];
    const whoosh = createAudioPlayer(WHOOSH);
    whoosh.play();
    return () => {
      timers.forEach(clearTimeout);
      // На Android remove() только вычёркивает плеер из списка модуля, остановку и освобождение делает release().
      whoosh.remove();
      whoosh.release();
    };
  }, []);

  return (
    // Нажатия под огнём не проходят; скринридеру он не нужен — о результате объявляет сам замер.
    <View
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}
    >
      {FLAME_LAYERS.map((layer, index) => (
        <Flames key={index} layer={layer} index={index} color={colors[index]} width={width} height={height} />
      ))}
    </View>
  );
}
