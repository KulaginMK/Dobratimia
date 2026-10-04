import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ToastProvider } from '@/components/ui';
import { ThemePreferenceProvider, appFonts, useTheme, useThemePreference } from '@/theme';

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
      />
    </ToastProvider>
  );
}
