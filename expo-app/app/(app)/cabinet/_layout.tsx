import { Redirect, Slot, useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/blocks';
import { ScreenIndicator } from '@/components/ui';
import { CabinetProvider } from '@/features/cabinet/Cabinet';
import { useSession } from '@/features/session/Session';
import { useTheme } from '@/theme';

const TABS = ['Моя карточка', 'Статистика'];

/**
 * Кабинет специалиста: шапка «Назад» (в профиль) и вкладки внизу. Кнопки SOS здесь нет (docs/06).
 * Открывается только роли specialist: её даёт сервер, когда почту человека вписал администратор (docs/07).
 */
export default function CabinetLayout() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const { user } = useSession();
  const last = segments[segments.length - 1];

  if (user?.role !== 'specialist') return <Redirect href="/profile" />;

  return (
    <CabinetProvider>
      {last === 'edit' ? (
        // Редактирование открывается поверх вкладок, без шапки кабинета и индикатора.
        <Slot />
      ) : (
        <View style={{ flex: 1, backgroundColor: t.color.background }}>
          <ScreenHeader
            title="Кабинет специалиста"
            leadingLabel="Назад в профиль"
            onLeadingPress={() => router.dismissTo('/profile')}
          />
          <View style={{ flex: 1 }}>
            <Slot />
          </View>
          <View style={{ paddingBottom: insets.bottom }}>
            <ScreenIndicator
              screens={TABS}
              itemNoun="вкладка"
              current={last === 'stats' ? 1 : 0}
              onSelect={(i) => router.replace(i === 1 ? '/cabinet/stats' : '/cabinet')}
            />
          </View>
        </View>
      )}
    </CabinetProvider>
  );
}
