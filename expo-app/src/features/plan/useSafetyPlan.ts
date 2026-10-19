import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { emptyPlan, loadSafetyPlan, saveSafetyPlan, type SafetyPlan } from '@/data/local/safetyPlan';
import { GUEST_USER_ID } from '@/data/local/session';
import { useSession } from '@/features/session/Session';

/**
 * План на трудный момент: того, кто вошёл, или гостя — гость тоже может его составить. Перечитывается, когда экран
 * снова в фокусе: план правят на своём экране, а показывают ещё на «Анатомии» и в SOS.
 */
export function useSafetyPlan() {
  const userId = useSession().user?.id ?? GUEST_USER_ID;
  const [state, setState] = useState<{ plan: SafetyPlan; loaded: boolean }>({ plan: emptyPlan(), loaded: false });

  useFocusEffect(
    useCallback(() => {
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
      return saveSafetyPlan(userId, plan);
    },
    [userId],
  );

  return { ...state, save };
}
