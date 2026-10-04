import { PlaceholderScreen } from '@/features/navigation/PlaceholderScreen';

export default function OnboardingGestures() {
  return (
    <PlaceholderScreen
      title="Онбординг · шаг 3 из 5"
      sos={false}
      stage={11}
      etalon="OnbGestures"
      links={[
        { label: 'Понятно', href: '/onboarding/sign-in' },
      ]}
    />
  );
}
