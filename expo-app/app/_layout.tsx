import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ToastProvider } from '@/components/ui';
import { ThemePreferenceProvider, appFonts, useTheme, useThemePreference } from '@/theme';

// Основание стека — лента: «Назад» с экрана, открытого по ссылке (SOS, медитации), ведёт на неё.
export const unstable_settings = { anchor: '(app)' };

// Сплэш держится, пока не загрузятся шрифты и сохранённая настройка темы.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemePreferenceProvider>
        <RootStack />
      </ThemePreferenceProvider>
    </GestureHandlerRootView>
  );
}

function RootStack() {
  const t = useTheme();
  const { ready: themeReady } = useThemePreference();
  const [fontsLoaded, fontError] = useFonts(appFonts);
  // Шрифты не загрузились — показываем приложение системным шрифтом, а не вечный сплэш.
  const ready = themeReady && (fontsLoaded || fontError != null);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Фон под экранами: чтобы при переходах в тёмной теме не мелькал белый.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(t.color.background);
  }, [t.color.background]);

  if (!ready) return null;

  return (
    <ToastProvider>
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.color.background },
        }}
      >
        {/* Группа с лентой объявлена первой: с неё начинается стек, если адрес не говорит иного. */}
        <Stack.Screen name="(app)" />
        {/* Из ленты медитации выезжают сверху над «Техниками»: прозрачное окно без системной анимации (docs/06). */}
        <Stack.Screen
          name="meditation"
          options={({ route }) =>
            (route.params as { from?: string } | undefined)?.from === 'feed'
              ? {
                  presentation: 'transparentModal',
                  animation: 'none',
                  contentStyle: { backgroundColor: 'transparent' },
                }
              : {}
          }
        />
      </Stack>
    </ToastProvider>
  );
}
