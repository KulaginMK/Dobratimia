import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PullHint, SosRound } from '@/components/blocks';
import { ScreenIndicator } from '@/components/ui';
import { feedKey } from '@/features/feed/feedScreens';
import { useTheme } from '@/theme';
import { useSlideFromTop } from './useSlideFromTop';

type Props = {
  /** Подсказка сверху: «Свайп вверх — к техникам». */
  hint: string;
  /** Она же для скринридера: «Назад к техникам». */
  hintAccessibilityLabel: string;
  /** Экран ленты, над которым выехал этот: 1 — Техники, 3 — Подбор. */
  feedIndex: number;
  children?: React.ReactNode;
};

/**
 * Каркас экрана, выехавшего сверху над лентой (Медитации, Избранные): подсказка-ручка, SOS,
 * содержимое и индикатор ленты. Закрывается свайпом вверх, тапом по подсказке, кнопкой «Назад»
 * и тапом по пункту индикатора — тогда лента сразу переходит на выбранный экран.
 */
export function SlideFromTopScreen({ hint, hintAccessibilityLabel, feedIndex, children }: Props) {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  // Закрытие всегда ведёт на «свой» экран ленты — даже если экран открыли по прямой ссылке.
  const toFeed = useCallback(
    (index: number) => router.dismissTo({ pathname: '/', params: { s: feedKey(index) } }),
    [router],
  );
  const leave = useCallback(() => toFeed(feedIndex), [toFeed, feedIndex]);
  const { style, gesture, close } = useSlideFromTop(true, leave);
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[{ flex: 1, backgroundColor: t.color.background }, style]}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: insets.top,
            paddingHorizontal: t.space.screen,
          }}
        >
          {/* Пустое место слева той же ширины, что SOS справа: подсказка остаётся по центру. */}
          <View style={{ width: t.size.touch }} />
          <View style={{ flex: 1 }}>
            <PullHint
              variant="handle"
              label={hint}
              accessibilityLabel={hintAccessibilityLabel}
              onPress={() => close()}
            />
          </View>
          <SosRound onPress={() => router.push('/sos')} />
        </View>
        <View style={{ flex: 1 }}>{children}</View>
        <View style={{ paddingBottom: insets.bottom }}>
          <ScreenIndicator
            current={feedIndex}
            onSelect={(i) => close(() => toFeed(i))}
          />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
