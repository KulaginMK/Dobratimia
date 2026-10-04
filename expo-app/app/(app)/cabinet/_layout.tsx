import { Slot, useRouter, useSegments } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/blocks';
import { ScreenIndicator } from '@/components/ui';
import { useTheme } from '@/theme';

const TABS = ['Моя карточка', 'Статистика'];

/**
 * Кабинет специалиста: шапка «Назад» (в профиль) и вкладки внизу. Кнопки SOS здесь нет (docs/06).
 * Этап 13: кабинет останется доступен только роли specialist.
 */
export default function CabinetLayout() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const segments = useSegments();
  const last = segments[segments.length - 1];

  // Редактирование открывается поверх вкладок, без шапки кабинета и индикатора.
  if (last === 'edit') return <Slot />;

  return (
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
  );
}
