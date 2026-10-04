import { useFocusEffect, useIsFocused, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, BackHandler, Platform, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { ScreenIndicator } from '@/components/ui';
import { useTheme } from '@/theme';
import { FEED_LABELS, FEED_SCREENS, HOME_INDEX, MATCH_INDEX, feedIndex, feedKey, type FeedKey } from './feedScreens';

// Пороги свайпа из docs/06: 60 dp или скорость больше 500 dp/с.
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 500;
// Сдвиг, после которого жест считается горизонтальным или вертикальным.
const AXIS_LOCK = 12;
// Мягкий упор на краях ленты: экран тянется вчетверо слабее пальца.
const EDGE_RESISTANCE = 0.25;
// «Уменьшить движение»: смена экрана без сдвига, с кроссфейдом 120 мс.
const CROSSFADE_MS = 120;

const LAST_INDEX = FEED_SCREENS.length - 1;

export type FeedPageProps = {
  /** Экран сейчас текущий в ленте. Соседние экраны смонтированы, но скрыты от скринридера и клавиатуры. */
  active: boolean;
};

type Props = {
  pages: Record<FeedKey, React.ComponentType<FeedPageProps>>;
  /** Свайп вниз на экране: с Техник — медитации, с Подбора — избранные. */
  onPullDown?: Partial<Record<FeedKey, () => void>>;
};

function neighbours(index: number): number[] {
  return [index - 1, index, index + 1].filter((i) => i >= 0 && i <= LAST_INDEX);
}

/**
 * Лента из пяти экранов «как карточки на столе». Текущий экран хранится в адресе (?s=home),
 * поэтому работают ссылки в вебе и возврат на тот же экран после других экранов.
 */
export function FeedPager({ pages, onPullDown }: Props) {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const reduced = useReducedMotion();
  const { width: windowWidth } = useWindowDimensions();
  const [width, setWidth] = useState(windowWidth);

  const { s } = useLocalSearchParams<{ s?: string }>();
  const index = feedIndex(s);

  // Экраны монтируются лениво: текущий и соседние. Уже открытые остаются в памяти.
  const [mounted, setMounted] = useState(() => new Set(neighbours(index)));
  if (neighbours(index).some((i) => !mounted.has(i))) {
    setMounted(new Set([...mounted, ...neighbours(index)]));
  }

  // Положение ленты в экранах: 2 — Главная, 2.5 — на полпути к Подбору.
  const position = useSharedValue(index);
  const fade = useSharedValue(1);

  useEffect(() => {
    if (reduced) {
      position.set(index);
      fade.set(0);
      fade.set(withTiming(1, { duration: CROSSFADE_MS, reduceMotion: ReduceMotion.Never }));
    } else {
      position.set(withTiming(index, { duration: t.motion.feed, easing: Easing.out(Easing.cubic) }));
    }
  }, [index, reduced, position, fade, t.motion.feed]);

  const go = (next: number) => {
    if (next < 0 || next > LAST_INDEX || next === index) return;
    router.setParams({ s: feedKey(next) });
  };

  // TalkBack объявляет, где мы в ленте: «Главная, экран 3 из 5».
  const announced = useRef(index);
  useEffect(() => {
    if (announced.current === index) return;
    announced.current = index;
    AccessibilityInfo.announceForAccessibility(`${FEED_LABELS[index]}, экран ${index + 1} из ${FEED_SCREENS.length}`);
  }, [index]);

  // Системная кнопка «Назад»: с любого экрана ленты — на Главную, с Главной — выход из приложения.
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (index === HOME_INDEX) return false;
        router.setParams({ s: feedKey(HOME_INDEX) });
        return true;
      });
      return () => subscription.remove();
    }, [index, router]),
  );

  // Веб: стрелки ← → переключают экраны ленты. В полях ввода стрелки двигают курсор, как обычно.
  useEffect(() => {
    if (Platform.OS !== 'web' || !focused) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      const next = event.key === 'ArrowLeft' ? index - 1 : event.key === 'ArrowRight' ? index + 1 : null;
      if (next === null || next < 0 || next > LAST_INDEX) return;
      router.setParams({ s: feedKey(next) });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, focused, router]);

  // На «Подборе» горизонтальный свайп листает карточки специалистов, лента не двигается (docs/06).
  const swipe = Gesture.Pan()
    .enabled(index !== MATCH_INDEX)
    .activeOffsetX([-AXIS_LOCK, AXIS_LOCK])
    .failOffsetY([-AXIS_LOCK, AXIS_LOCK])
    .onUpdate((e) => {
      if (reduced) return;
      const atEdge = (index === 0 && e.translationX > 0) || (index === LAST_INDEX && e.translationX < 0);
      const shift = atEdge ? e.translationX * EDGE_RESISTANCE : e.translationX;
      position.set(index - shift / width);
    })
    .onEnd((e) => {
      const fast = Math.abs(e.velocityX) > SWIPE_VELOCITY;
      const far = Math.abs(e.translationX) > SWIPE_DISTANCE;
      const toNext = (fast ? e.velocityX : e.translationX) < 0;
      const next = index + (toNext ? 1 : -1);
      if ((fast || far) && next >= 0 && next <= LAST_INDEX) {
        scheduleOnRN(go, next);
      } else {
        position.set(withTiming(index, { duration: t.motion.feed, easing: Easing.out(Easing.cubic) }));
      }
    });

  // Этап 6: когда на Техниках появится список, свайп вниз ловить только при прокрутке в самый верх (docs/06).
  const pullDown = onPullDown?.[feedKey(index)];
  const pull = Gesture.Pan()
    .enabled(!!pullDown)
    .activeOffsetY(AXIS_LOCK)
    .failOffsetX([-AXIS_LOCK, AXIS_LOCK])
    .onEnd((e) => {
      if (pullDown && (e.translationY > SWIPE_DISTANCE || e.velocityY > SWIPE_VELOCITY)) {
        scheduleOnRN(pullDown);
      }
    });

  const rowStyle = useAnimatedStyle(() => ({
    opacity: fade.get(),
    transform: [{ translateX: -position.get() * width }],
  }));

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <GestureDetector gesture={Gesture.Race(swipe, pull)}>
        <View
          onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
          style={{ flex: 1, overflow: 'hidden' }}
        >
          <Animated.View style={[{ flex: 1, flexDirection: 'row', width: width * FEED_SCREENS.length }, rowStyle]}>
            {FEED_SCREENS.map((screen, i) => {
              const Page = pages[screen.key];
              return (
                <FeedSlot key={screen.key} width={width} active={i === index}>
                  {mounted.has(i) ? <Page active={i === index} /> : null}
                </FeedSlot>
              );
            })}
          </Animated.View>
        </View>
      </GestureDetector>
      <View style={{ paddingBottom: insets.bottom }}>
        <ScreenIndicator current={index} onSelect={go} />
      </View>
    </View>
  );
}

/** Место одного экрана в ленте. Неактивные экраны скрыты от скринридера и не получают фокус с клавиатуры. */
function FeedSlot({ width, active, children }: { width: number; active: boolean; children: React.ReactNode }) {
  const ref = useRef<View>(null);
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    // В вебе inert убирает соседний экран из порядка Tab: иначе браузер прокрутит ленту к фокусу сам.
    (ref.current as unknown as HTMLElement | null)?.toggleAttribute('inert', !active);
  }, [active]);
  return (
    <View ref={ref} aria-hidden={!active} style={{ width }}>
      {children}
    </View>
  );
}
