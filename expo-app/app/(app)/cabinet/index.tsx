import { Text, View } from 'react-native';
import { PlaceholderNote } from '@/features/navigation/PlaceholderScreen';
import { useTheme } from '@/theme';

export default function CabCard() {
  const t = useTheme();
  return (
    <View>
      <Text accessibilityRole="header" style={[t.type.h1, { paddingHorizontal: t.space.screen, color: t.color.text }]}>
        Моя карточка
      </Text>
      <PlaceholderNote stage={13} etalon="CabCard" links={[{ label: 'Редактировать', href: '/cabinet/edit' }]} />
    </View>
  );
}
