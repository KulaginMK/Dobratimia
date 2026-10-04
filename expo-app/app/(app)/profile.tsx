import { PlaceholderScreen } from '@/features/navigation/PlaceholderScreen';

// Пункт «Кабинет специалиста» на этапе 13 останется только для роли specialist.
export default function Profile() {
  return (
    <PlaceholderScreen
      title="Профиль"
      stage={11}
      etalon="Profile"
      links={[
        { label: 'О проекте', href: '/about' },
        { label: 'Кабинет специалиста', href: '/cabinet' },
      ]}
    />
  );
}
