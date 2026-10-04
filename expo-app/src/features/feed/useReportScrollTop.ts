import { useRef } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

/**
 * Обработчик onScroll для экрана ленты: сообщает ленте, когда список уходит из самого верха и возвращается.
 * Сообщает только при смене состояния, а не на каждый кадр прокрутки.
 */
export function useReportScrollTop(onScrollAtTop: (atTop: boolean) => void) {
  const atTop = useRef(true);
  return (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = event.nativeEvent.contentOffset.y <= 0;
    if (next === atTop.current) return;
    atTop.current = next;
    onScrollAtTop(next);
  };
}
