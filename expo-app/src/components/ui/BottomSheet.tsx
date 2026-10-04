import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
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
import { useTheme } from '@/theme';
import { IconButton } from './IconButton';

// Размеры из веб-эталона bundle.css (.dt-sheet).
const MAX_HEIGHT_SHARE = 0.88;
const PAD_TOP = 8;
const PAD_BOTTOM = 28;
const HANDLE_WIDTH = 40;
const HANDLE_HEIGHT = 4;
const HANDLE_MARGIN_TOP = 4;
const HANDLE_MARGIN_BOTTOM = 12;
const HEAD_GAP = 12;
const HEAD_MARGIN_BOTTOM = 8;
const TITLE_SIZE = 20;
const TITLE_LINE = 26;
// Свайп вниз закрывает шторку: тот же порог, что у свайпов ленты (docs/06).
const CLOSE_DISTANCE = 60;
const CLOSE_VELOCITY = 500;
const DRAG_START = 10;

type Props = {
  open: boolean;
  title?: string;
  /** Крестик, тап по затемнению, свайп вниз и системная кнопка «Назад». */
  onClose: () => void;
  children?: React.ReactNode;
};

/**
 * Нижняя шторка поверх всего окна. Высота по содержимому, не больше 88% экрана;
 * если содержимого больше — оно прокручивается. Появление 320 мс, без пружин.
 */
export function BottomSheet({ open, title, onClose, children }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const reduced = useReducedMotion();

  // Шторка остаётся в дереве, пока доигрывает анимация закрытия.
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) setMounted(true);

  const [viewport, setViewport] = useState(0);
  const [content, setContent] = useState(0);
  const scrollable = content > viewport + 1;

  const progress = useSharedValue(0);
  const drag = useSharedValue(0);
  const sheetHeight = useSharedValue(windowHeight);

  useEffect(() => {
    // Анимация не отключается системной настройкой: при «Уменьшить движение» она становится проявлением.
    const timing = {
      duration: t.motion.sheet,
      easing: Easing.out(Easing.cubic),
      reduceMotion: ReduceMotion.Never,
    };
    if (open) {
      drag.set(0);
      progress.set(withTiming(1, timing));
    } else {
      progress.set(
        withTiming(0, timing, (finished) => {
          if (finished) scheduleOnRN(setMounted, false);
        }),
      );
    }
  }, [open, progress, drag, t.motion.sheet]);

  const scrimStyle = useAnimatedStyle(() => ({ opacity: progress.get() }));
  const sheetStyle = useAnimatedStyle(() => {
    const shown = progress.get();
    return reduced
      ? { opacity: shown, transform: [{ translateY: drag.get() }] }
      : { opacity: 1, transform: [{ translateY: (1 - shown) * sheetHeight.get() + drag.get() }] };
  });

  const makePan = (enabled: boolean) =>
    Gesture.Pan()
      .enabled(enabled)
      .activeOffsetY(DRAG_START)
      .onUpdate((e) => {
        drag.set(Math.max(0, e.translationY));
      })
      .onEnd((e) => {
        if (e.translationY > CLOSE_DISTANCE || e.velocityY > CLOSE_VELOCITY) {
          scheduleOnRN(onClose);
        } else {
          drag.set(withTiming(0, { duration: t.motion.press, easing: Easing.out(Easing.cubic) }));
        }
      });
  const headPan = makePan(true);
  // Когда содержимое прокручивается, свайп по нему — это прокрутка, а не закрытие.
  const bodyPan = makePan(!scrollable);

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
      // В вебе Modal сам становится диалогом (role="dialog"); заголовок — его имя для скринридера.
      aria-label={title}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Animated.View
            style={[{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: t.color.scrim }, scrimStyle]}
          >
            <Pressable
              onPress={onClose}
              focusable={false}
              aria-hidden
              importantForAccessibility="no"
              style={{ flex: 1 }}
            />
          </Animated.View>
          <Animated.View
            accessibilityViewIsModal
            onLayout={(e) => sheetHeight.set(e.nativeEvent.layout.height)}
            style={[
              {
                maxHeight: windowHeight * MAX_HEIGHT_SHARE,
                backgroundColor: t.color.surface,
                borderTopLeftRadius: t.radius['2xl'],
                borderTopRightRadius: t.radius['2xl'],
                boxShadow: t.shadow.lg,
                paddingTop: PAD_TOP,
                paddingHorizontal: t.space.lg,
                paddingBottom: PAD_BOTTOM + insets.bottom,
              },
              sheetStyle,
            ]}
          >
            <GestureDetector gesture={headPan}>
              <View>
                <View
                  style={{
                    width: HANDLE_WIDTH,
                    height: HANDLE_HEIGHT,
                    borderRadius: HANDLE_HEIGHT / 2,
                    backgroundColor: t.color.borderStrong,
                    alignSelf: 'center',
                    marginTop: HANDLE_MARGIN_TOP,
                    marginBottom: HANDLE_MARGIN_BOTTOM,
                  }}
                />
                {title ? (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: HEAD_GAP,
                      marginBottom: HEAD_MARGIN_BOTTOM,
                    }}
                  >
                    <Text
                      accessibilityRole="header"
                      style={{
                        flexShrink: 1,
                        fontFamily: t.fontFamily.display[800],
                        fontSize: TITLE_SIZE,
                        lineHeight: TITLE_LINE,
                        color: t.color.text,
                      }}
                    >
                      {title}
                    </Text>
                    <IconButton icon="close" accessibilityLabel="Закрыть" onPress={onClose} />
                  </View>
                ) : null}
              </View>
            </GestureDetector>
            <GestureDetector gesture={bodyPan}>
              <ScrollView
                bounces={false}
                overScrollMode="never"
                keyboardShouldPersistTaps="handled"
                onLayout={(e) => setViewport(e.nativeEvent.layout.height)}
                onContentSizeChange={(_, height) => setContent(height)}
              >
                {children}
              </ScrollView>
            </GestureDetector>
          </Animated.View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}
