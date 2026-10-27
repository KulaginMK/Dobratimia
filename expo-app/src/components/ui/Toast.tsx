import React, { createContext, useContext, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, Timka } from '@/components/brand';
import { useTheme } from '@/theme';
import { focusRing, isFocused } from './focus';

// Размеры из веб-эталона bundle.css (.dt-toast) и макета HomeMarked.
const MIN_HEIGHT = 52;
const MAX_WIDTH = 372;
const GAP = 10;
const PAD = 10;
const PAD_LEFT = 16;
const FONT_SIZE = 15;
const LINE_HEIGHT = 20;
const ICON_CIRCLE = 24;
const ICON_SIZE = 16;
const TIMKA_SIZE = 32;
const MSG_PAD_RIGHT = 6;
const ACTION_MIN_HEIGHT = 40;
const ACTION_PAD_H = 12;
const ACTION_RADIUS = 12;
// Над индикатором ленты: в макете 80 от низа экрана.
const BOTTOM = 80;
// Исчезает через 4 с, с действием — через 6 с (docs/04).
const HIDE_MS = 4000;
const HIDE_WITH_ACTION_MS = 6000;
// ease-out кривой Безье: в вебе Reanimated понимает для появления только такие кривые.
const EASE_OUT = Easing.bezier(0.33, 1, 0.68, 1);

export type ToastTone = 'neutral' | 'success' | 'error';

export type ToastOptions = {
  /** Одна короткая фраза. */
  message: string;
  /** Тон всегда подкреплён иконкой: success — галочка, error — крестик. */
  tone?: ToastTone;
  /** Одно действие: «Отменить», «Повторить». */
  actionLabel?: string;
  onAction?: () => void;
  /** Вместо значка кивает Тимка: подтверждение отметки настроения (TIMKA-MOTION.md, пункт 10). */
  timka?: boolean;
};

/** Сам тост, без появления и таймера. Показывать через useToast().show(). */
export function ToastView({ message, tone = 'neutral', actionLabel, onAction, timka }: ToastOptions) {
  const t = useTheme();
  const icon = tone === 'success' ? 'check' : tone === 'error' ? 'close' : null;
  const actionSlop = (t.size.touch - ACTION_MIN_HEIGHT) / 2;
  return (
    <View
      role={tone === 'error' ? 'alert' : 'status'}
      accessibilityLiveRegion={tone === 'error' ? 'assertive' : 'polite'}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: GAP,
        minHeight: MIN_HEIGHT,
        maxWidth: MAX_WIDTH,
        paddingVertical: PAD,
        paddingRight: PAD,
        paddingLeft: PAD_LEFT,
        borderRadius: t.radius.lg,
        backgroundColor: t.color.secondary,
        boxShadow: t.shadow.md,
      }}
    >
      {timka ? (
        <View aria-hidden>
          <Timka pose="hello" size={TIMKA_SIZE} motion="nod" />
        </View>
      ) : icon ? (
        <View
          style={{
            width: ICON_CIRCLE,
            height: ICON_CIRCLE,
            borderRadius: t.radius.full,
            backgroundColor: tone === 'success' ? t.color.growthSoft : t.color.sosSoft,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Icon name={icon} size={ICON_SIZE} color={tone === 'success' ? t.color.success : t.color.error} />
        </View>
      ) : null}
      <Text
        style={{
          flexShrink: 1,
          flexGrow: 1,
          paddingRight: MSG_PAD_RIGHT,
          fontFamily: t.type.body.fontFamily,
          fontSize: FONT_SIZE,
          lineHeight: LINE_HEIGHT,
          color: t.color.onSecondary,
        }}
      >
        {message}
      </Text>
      {actionLabel ? (
        <Pressable
          onPress={onAction}
          hitSlop={{ top: actionSlop, bottom: actionSlop }}
          accessibilityRole="button"
          style={(state) => [
            {
              minHeight: ACTION_MIN_HEIGHT,
              paddingHorizontal: ACTION_PAD_H,
              borderRadius: ACTION_RADIUS,
              justifyContent: 'center',
              flexShrink: 0,
            },
            focusRing(t, isFocused(state)),
          ]}
        >
          <Text
            style={{
              fontFamily: t.fontFamily.text[700],
              fontSize: FONT_SIZE,
              lineHeight: LINE_HEIGHT,
              color: t.color.onSecondary,
              textDecorationLine: 'underline',
            }}
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

type ToastApi = {
  /** Показать тост. Новый тост заменяет предыдущий. */
  show: (options: ToastOptions) => void;
  hide: () => void;
};

const ToastContext = createContext<ToastApi>({ show: () => {}, hide: () => {} });

/** Оборачивает приложение: один тост внизу экрана над индикатором ленты. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<(ToastOptions & { id: number }) | null>(null);

  const show = (options: ToastOptions) => setToast((prev) => ({ ...options, id: (prev?.id ?? 0) + 1 }));
  const hide = () => setToast(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), toast.actionLabel ? HIDE_WITH_ACTION_MS : HIDE_MS);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <ToastContext.Provider value={{ show, hide }}>
      {children}
      <View
        style={{
          position: 'absolute',
          left: t.space.screen,
          right: t.space.screen,
          bottom: insets.bottom + BOTTOM,
          alignItems: 'center',
          pointerEvents: 'box-none',
        }}
      >
        {toast ? (
          // При «Уменьшить движение» Reanimated пропускает сдвиг: тост просто появляется.
          <Animated.View
            key={toast.id}
            entering={FadeInDown.duration(t.motion.toast).easing(EASE_OUT)}
            exiting={FadeOut.duration(t.motion.press)}
          >
            <ToastView
              message={toast.message}
              tone={toast.tone}
              actionLabel={toast.actionLabel}
              timka={toast.timka}
              onAction={() => {
                toast.onAction?.();
                hide();
              }}
            />
          </Animated.View>
        ) : null}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastContext);
}
