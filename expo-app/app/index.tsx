import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { Logo } from '@/components/brand';
import { useTheme } from '@/theme';

// Размер знака как на экране «О проекте» (About.dc.html).
const LOGO_SIZE = 96;

/**
 * Временный корневой экран этапа 1: в dev-сборке сразу открывает kitchen-sink.
 * На этапе 3 его заменит лента — app/(app)/index.tsx.
 */
export default function Index() {
  const t = useTheme();
  if (__DEV__) return <Redirect href="/dev/kitchen-sink" />;
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: t.color.background,
      }}
    >
      <Logo variant="stacked" size={LOGO_SIZE} />
    </View>
  );
}
