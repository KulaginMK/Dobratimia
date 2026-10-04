import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { BackHandler, useWindowDimensions } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useTheme } from '@/theme';

// Пороги свайпа из docs/06: 60 dp или скорость больше 500 dp/с.
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 500;
const AXIS_LOCK = 12;

/**
 * Экран, который выезжает сверху над лентой: Медитации над Техниками, Избранные над Подбором.
 * Маршрут открыт как прозрачное окно без системной анимации; движение рисуем сами (docs/06):
 * появление сверху за 320 мс, закрытие свайпом вверх, кнопкой «Назад» или через close().
 *
 * enabled = false — экран открыт обычным переходом (например, медитация из SOS): ничего не анимируем.
 * leave — куда уйти после закрытия: на экран ленты, над которым выехал этот.
 */
export function useSlideFromTop(enabled: boolean, leave: () => void) {
  const t = useTheme();
  const { height } = useWindowDimensions();
  const reduced = useReducedMotion();

  // 0 — экран спрятан за верхним краем, 1 — на месте.
  const shown = useSharedValue(enabled ? 0 : 1);
  const drag = useSharedValue(0);
  const duration = t.motion.sheet;

  useEffect(() => {
    if (!enabled) return;
    // При «Уменьшить движение» анимация не отключается, а становится проявлением.
    shown.set(withTiming(1, { duration, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.Never }));
  }, [enabled, shown, duration]);

  /** Закрыть экран с анимацией. to — свой переход вместо обычного, например на другой экран ленты. */
  const close = useCallback(
    (to?: () => void) => {
      const finish = to ?? leave;
      if (!enabled) {
        finish();
        return;
      }
      shown.set(
        withTiming(
          0,
          { duration, easing: Easing.out(Easing.cubic), reduceMotion: ReduceMotion.Never },
          (finished) => {
            if (finished) scheduleOnRN(finish);
          },
        ),
      );
    },
    [enabled, shown, duration, leave],
  );

  // Системная кнопка «Назад» закрывает экран с той же анимацией.
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        close();
        return true;
      });
      return () => subscription.remove();
    }, [enabled, close]),
  );

  // Свайп вверх. Когда на экране появится длинный список, жест останется только на подсказке сверху.
  const gesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetY(-AXIS_LOCK)
    .failOffsetX([-AXIS_LOCK, AXIS_LOCK])
    .onUpdate((e) => {
      if (!reduced) drag.set(Math.min(0, e.translationY));
    })
    .onEnd((e) => {
      if (e.translationY < -SWIPE_DISTANCE || e.velocityY < -SWIPE_VELOCITY) {
        scheduleOnRN(close);
      } else {
        drag.set(withTiming(0, { duration: t.motion.press, easing: Easing.out(Easing.cubic) }));
      }
    });

  const style = useAnimatedStyle(() =>
    reduced
      ? { opacity: shown.get() }
      : { opacity: 1, transform: [{ translateY: (shown.get() - 1) * height + drag.get() }] },
  );

  return { style, gesture, close };
}
