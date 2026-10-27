import { useEffect, useState } from 'react';
import { hintSeen, markHintSeen, type Hint } from '@/data/local/hints';

// Пауза перед подсказкой: сначала человек видит сам экран.
const DELAY_MS = 800;

/**
 * Подсказка, которая показывается один раз за всё время: когда экран впервые стал виден (enabled).
 * Пропадает сама через shownMs или когда экран перестал быть виден — и больше не возвращается.
 */
export function useOnceHint(hint: Hint, enabled: boolean, shownMs: number): boolean {
  const [state, setState] = useState<'waiting' | 'shown' | 'done'>('waiting');

  useEffect(() => {
    if (state === 'shown') {
      // Ушли с экрана — подсказка закончилась сразу.
      const timer = setTimeout(() => setState('done'), enabled ? shownMs : 0);
      return () => clearTimeout(timer);
    }
    if (state !== 'waiting' || !enabled) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const seen = await hintSeen(hint);
      if (cancelled) return;
      setState(seen ? 'done' : 'shown');
      if (!seen) void markHintSeen(hint);
    }, DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hint, enabled, shownMs, state]);

  return state === 'shown' && enabled;
}
