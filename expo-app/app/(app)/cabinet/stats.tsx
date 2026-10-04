import { Text, View } from 'react-native';
import { PlaceholderNote } from '@/features/navigation/PlaceholderScreen';
import { useTheme } from '@/theme';

export default function CabStats() {
  const t = useTheme();
  return (
    <View>
      <Text accessibilityRole="header" style={[t.type.h1, { paddingHorizontal: t.space.screen, color: t.color.text }]}>
        Статистика
      </Text>
      <PlaceholderNote stage={13} etalon="CabStats" />
    </View>
  );
}
