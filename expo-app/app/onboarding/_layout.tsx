import { Redirect, Stack, useSegments } from 'expo-router';
import { useSession } from '@/features/session/Session';
import { useTheme } from '@/theme';

// Шаги до входа: что это, честно о главном, жесты.
const INTRO_STEPS: (string | undefined)[] = [undefined, 'warning', 'gestures'];

// Онбординг — свой стек: когда человек входит в приложение, он убирается целиком, и «Назад» в него не вернёт.
// Доступен без входа; кнопки SOS в шапке нет — номер 133 есть в тексте шага 2 (docs/06).
export default function OnboardingLayout() {
  const t = useTheme();
  const { user } = useSession();
  const [, step] = useSegments() as string[];
  // Онбординг показывается один раз: вошедшего человека вводные шаги отправляют на Главную.
  // В вебе сюда приводит кнопка «Назад» браузера.
  if (user && INTRO_STEPS.includes(step)) return <Redirect href="/?s=home" />;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.color.background } }} />;
}
