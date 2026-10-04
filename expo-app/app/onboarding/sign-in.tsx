import { PlaceholderScreen } from '@/features/navigation/PlaceholderScreen';

export default function OnboardingSignIn() {
  return (
    <PlaceholderScreen
      title="Онбординг · шаг 4 из 5"
      sos={false}
      stage={11}
      etalon="OnbSignIn"
      links={[
        { label: 'Войти через Google', href: '/onboarding/university' },
      ]}
    />
  );
}
