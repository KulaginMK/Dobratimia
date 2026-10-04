import { useLocalSearchParams } from 'expo-router';
import { TECHNIQUES_INDEX } from '@/features/feed/feedScreens';
import { PlaceholderNote, PlaceholderScreen } from '@/features/navigation/PlaceholderScreen';
import { SlideFromTopScreen } from '@/features/navigation/SlideFromTopScreen';

/**
 * Медитации и Pomodoro. Доступны без входа: сюда ведёт SOS.
 * Параметры: ?tab=breath|pomodoro&scheme=4-6|4-7-8|5-5-5&cycles=N&from=feed|sos|technique (docs/06).
 */
export default function Meditation() {
  const { from } = useLocalSearchParams<{ from?: string }>();

  // Из ленты экран выезжает сверху над «Техниками»: подсказка о свайпе и индикатор ленты.
  if (from === 'feed') {
    return (
      <SlideFromTopScreen
        hint="Свайп вверх — к техникам"
        hintAccessibilityLabel="Назад к техникам"
        feedIndex={TECHNIQUES_INDEX}
      >
        <PlaceholderNote stage={7} etalon="Meditation" />
      </SlideFromTopScreen>
    );
  }

  // Из SOS или с экрана техники: обычная шапка «Назад», индикатора ленты нет.
  return <PlaceholderScreen title="Медитации" stage={7} etalon="Meditation" />;
}
