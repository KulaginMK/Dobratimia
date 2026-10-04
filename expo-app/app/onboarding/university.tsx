import { PlaceholderScreen } from '@/features/navigation/PlaceholderScreen';

export default function OnboardingUniversity() {
  return (
    <PlaceholderScreen
      title="Онбординг · шаг 5 из 5"
      sos={false}
      stage={11}
      etalon="OnbUniversity"
      links={[
        { label: 'Готово', href: '/?s=home', action: 'replace' },
        { label: 'Выберу позже', href: '/?s=home', action: 'replace' },
      ]}
    />
  );
}
