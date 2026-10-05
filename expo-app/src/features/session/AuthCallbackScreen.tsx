import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useToast } from '@/components/ui';
import { useSelectedUniversity } from '@/features/university/SelectedUniversity';
import { useTheme } from '@/theme';
import { useSession } from './Session';

/**
 * Возврат от Google: в адресе — одноразовый код входа. Экран обменивает его на вход и ведёт дальше:
 * к выбору вуза или сразу на Главную. В вебе это обычная страница после перехода с Google;
 * на телефоне сюда приводит ссылка dobratimia://auth/callback, если приложение успели закрыть.
 */
export function AuthCallbackScreen() {
  const t = useTheme();
  const router = useRouter();
  const toast = useToast();
  const { code, error, error_description: description } = useLocalSearchParams<{
    code?: string;
    error?: string;
    error_description?: string;
  }>();
  const { user, completeSignIn } = useSession();
  const { universityId } = useSelectedUniversity();

  useEffect(() => {
    let alive = true;
    completeSignIn({ code, error: description ?? error }).catch(() => {
      if (!alive) return;
      toast.show({ message: 'Не удалось войти. Проверьте интернет и попробуйте ещё раз.', tone: 'error' });
      router.replace('/onboarding/sign-in');
    });
    return () => {
      alive = false;
    };
    // Код одноразовый: вход завершаем один раз, при открытии экрана.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      // Под этим экраном мог остаться онбординг — убираем его, чтобы «Назад» с Главной туда не вернул.
      if (router.canDismiss()) router.dismissAll();
      router.replace(universityId ? '/?s=home' : '/onboarding/university');
    }, [user, universityId, router]),
  );

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: t.space.md,
        backgroundColor: t.color.background,
      }}
    >
      <ActivityIndicator color={t.color.primary} />
      <Text accessibilityLiveRegion="polite" style={[t.type.body, { color: t.color.textMuted }]}>
        Входим в аккаунт…
      </Text>
    </View>
  );
}
