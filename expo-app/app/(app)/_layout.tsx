import { Stack } from 'expo-router';
import { useTheme } from '@/theme';

// Лента всегда лежит в основании стека: «Назад» с экрана, открытого по ссылке, ведёт на неё.
export const unstable_settings = { anchor: 'index' };

// Этапы 11–12: здесь появится проверка входа — экраны группы доступны только после входа через Google.
export default function AppLayout() {
  const t = useTheme();
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.color.background } }}>
      {/* Лента объявлена первой: с неё начинается стек, если адрес не говорит иного. */}
      <Stack.Screen name="index" />
      {/* Избранные выезжают сверху над лентой: прозрачное окно без системной анимации (docs/06). */}
      <Stack.Screen
        name="favorites"
        options={{
          presentation: 'transparentModal',
          animation: 'none',
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
    </Stack>
  );
}
