import { PlaceholderScreen } from '@/features/navigation/PlaceholderScreen';

// В онбординге кнопки SOS в шапке нет: номер 133 есть в тексте шага 2.
export default function OnboardingMain() {
  return (
    <PlaceholderScreen
      title="Онбординг · шаг 1 из 5"
      leading="none"
      sos={false}
      stage={11}
      etalon="Main"
      links={[
        { label: 'Дальше', href: '/onboarding/warning' },
        { label: 'Пропустить', href: '/onboarding/sign-in' },
      ]}
    />
  );
}
