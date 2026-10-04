import { PlaceholderScreen } from '@/features/navigation/PlaceholderScreen';

export default function OnboardingWarning() {
  return (
    <PlaceholderScreen
      title="Онбординг · шаг 2 из 5"
      sos={false}
      stage={11}
      etalon="OnbWarning"
      links={[
        { label: 'Понятно', href: '/onboarding/gestures' },
      ]}
    />
  );
}
