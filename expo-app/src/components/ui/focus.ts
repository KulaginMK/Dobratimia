import { Platform, type PressableStateCallbackType, type ViewStyle } from 'react-native';
import type { Theme } from '@/theme';

/** Состояние focused приходит только в вебе (react-native-web): на телефоне фокус ведёт TalkBack. */
export function isFocused(state: PressableStateCallbackType): boolean {
  return !!(state as { focused?: boolean }).focused;
}

/** Кольцо фокуса: 2 px color.focus с отступом 2 px вокруг любого интерактивного элемента (docs/09). */
export function focusRing(t: Theme, focused: boolean): ViewStyle {
  return {
    outlineWidth: focused ? 2 : 0,
    outlineStyle: 'solid',
    outlineColor: t.color.focus,
    outlineOffset: 2,
  };
}

/**
 * Состояние «нажата» у кнопки-переключателя. В вебе это aria-pressed (в React Native такого пропса нет),
 * на телефоне TalkBack читает его как «выбрано».
 */
export function pressedState(pressed: boolean): object {
  return Platform.OS === 'web' ? { 'aria-pressed': pressed } : { 'aria-selected': pressed };
}
