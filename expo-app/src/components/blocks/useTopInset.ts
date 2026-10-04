import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

/**
 * Отступ сверху у шапки экрана. В макетах там 24 — место под статусбар;
 * на устройстве берём его настоящую высоту, но не меньше, чем в макете.
 */
export function useTopInset(): number {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return Math.max(insets.top, t.space.xl);
}
