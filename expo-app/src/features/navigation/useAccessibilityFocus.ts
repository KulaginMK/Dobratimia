import { useEffect, useRef } from 'react';
import { AccessibilityInfo, Platform, type Text } from 'react-native';

/**
 * Переводит фокус TalkBack на элемент, когда экран ленты становится текущим (docs/09):
 * «при смене экрана фокус переходит на заголовок нового экрана». При первом показе фокус не трогаем.
 */
export function useAccessibilityFocus(active: boolean) {
  const ref = useRef<Text>(null);
  const wasActive = useRef(active);
  useEffect(() => {
    const becameActive = active && !wasActive.current;
    wasActive.current = active;
    if (becameActive && ref.current && Platform.OS !== 'web') {
      AccessibilityInfo.sendAccessibilityEvent(ref.current, 'focus');
    }
  }, [active]);
  return ref;
}
