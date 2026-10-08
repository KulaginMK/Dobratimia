import { Redirect, Stack } from 'expo-router';
import { DassHistoryProvider } from '@/features/dass/DassHistory';
import { MoodDiaryProvider } from '@/features/mood/MoodDiary';
import { ReminderSync } from '@/features/reminders/reminders';
import { useSession } from '@/features/session/Session';
import { SpecialistsProvider } from '@/features/specialists/Specialists';
import { useTheme } from '@/theme';

// Лента всегда лежит в основании стека: «Назад» с экрана, открытого по ссылке, ведёт на неё.
export const unstable_settings = { anchor: 'index' };

// Экраны группы доступны только после входа (docs/05). Без него — онбординг, а если его уже показывали
// (человек вышел из аккаунта) — сразу экран входа. SOS и медитации лежат вне группы и открываются без входа.
export default function AppLayout() {
  const t = useTheme();
  const { user, onboarded } = useSession();
  if (!user) return <Redirect href={onboarded ? '/onboarding/sign-in' : '/onboarding'} />;
  return (
    <MoodDiaryProvider userId={user.id}>
      <DassHistoryProvider userId={user.id}>
        <SpecialistsProvider userId={user.id}>
          <ReminderSync />
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
        </SpecialistsProvider>
      </DassHistoryProvider>
    </MoodDiaryProvider>
  );
}
