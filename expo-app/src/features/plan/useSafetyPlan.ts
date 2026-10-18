import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { emptyPlan, loadSafetyPlan, saveSafetyPlan, type SafetyPlan } from '@/data/local/safetyPlan';

/**
 * План на трудный момент этого пользователя. Перечитывается, когда экран снова в фокусе: план правят на своём
 * экране, а показывают ещё на «Анатомии» и в SOS. userId null — гость: план не сохраняется (вход необязателен).
 */
export function useSafetyPlan(userId: string | null) {
  const [state, setState] = useState<{ plan: SafetyPlan; loaded: boolean }>({ plan: emptyPlan(), loaded: false });

  useFocusEffect(
    useCallback(() => {
      if (!userId) {
        setState({ plan: emptyPlan(), loaded: true });
        return;
      }
      let alive = true;
      loadSafetyPlan(userId).then((plan) => {
        if (alive) setState({ plan, loaded: true });
      });
      return () => {
        alive = false;
      };
    }, [userId]),
  );

  const save = useCallback(
    (plan: SafetyPlan) => {
      setState({ plan, loaded: true });
      return userId ? saveSafetyPlan(userId, plan) : Promise.resolve();
    },
    [userId],
  );

  return { ...state, save };
}
