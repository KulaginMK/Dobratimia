import { Text, View } from 'react-native';
import { demoSpecialist } from '@/data/mocks/demo';
import { MATCH_INDEX } from '@/features/feed/feedScreens';
import { PlaceholderNote } from '@/features/navigation/PlaceholderScreen';
import { SlideFromTopScreen } from '@/features/navigation/SlideFromTopScreen';
import { useTheme } from '@/theme';

/** Избранные контакты: выезжают сверху над «Подбором специалиста». */
export default function Favorites() {
  const t = useTheme();
  return (
    <SlideFromTopScreen hint="Свайп вверх — к подбору" hintAccessibilityLabel="Назад к подбору" feedIndex={MATCH_INDEX}>
      <View style={{ paddingTop: t.space.xs, paddingHorizontal: t.space.screen }}>
        <Text accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
          Избранные контакты
        </Text>
      </View>
      <PlaceholderNote stage={10} etalon="Favorites" links={[{ label: demoSpecialist.name, href: '/specialist/demo' }]} />
    </SlideFromTopScreen>
  );
}
