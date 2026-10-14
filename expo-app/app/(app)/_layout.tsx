import { Redirect, Stack } from 'expo-router';
import { DassHistoryProvider } from '@/features/dass/DassHistory';
import { MoodDiaryProvider } from '@/features/mood/MoodDiary';
import { ReminderSync } from '@/features/reminders/reminders';
import { useSession } from '@/features/session/Session';
import { SpecialistsProvider } from '@/features/specialists/Specialists';
import { useTheme } from '@/theme';

// Лента всегда лежит в основании стека: «Назад» с экрана, открытого по ссылке, ведёт на неё.
export const unstable_settings = { anchor: 'index' };

// Экраны группы открываются после онбординга. Вход необязателен (решение владельца от 14 октября 2026 года):
// гость проходит тест и пользуется техниками, но ничего не сохраняет, а подбор, «Доброе слово» и дневник
// просят войти (SignInGate). SOS и медитации лежат вне группы и открываются и до онбординга.
export default function AppLayout() {
  const t = useTheme();
  const { user, onboarded } = useSession();
  if (!user && !onboarded) return <Redirect href="/onboarding" />;
  const stack = (
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
  // Гостю — только результат теста в памяти: без дневника, специалистов и напоминаний.
  if (!user) return <DassHistoryProvider userId={null}>{stack}</DassHistoryProvider>;
  return (
    <MoodDiaryProvider userId={user.id}>
      <DassHistoryProvider userId={user.id}>
        <SpecialistsProvider userId={user.id}>
          <ReminderSync />
          {stack}
        </SpecialistsProvider>
      </DassHistoryProvider>
    </MoodDiaryProvider>
  );
}
