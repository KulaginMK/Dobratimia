import { PlaceholderScreen } from '@/features/navigation/PlaceholderScreen';

// SOS доступен без входа в аккаунт и открывается поверх любого экрана.
export default function Sos() {
  return (
    <PlaceholderScreen
      title="SOS"
      sos={false}
      stage={4}
      etalon="Sos"
      links={[
        { label: 'Помощь в моём вузе', href: '/sos/university' },
        { label: 'Дыхание · 2\u00A0минуты', href: '/meditation?scheme=4-6&cycles=12&from=sos' },
      ]}
    />
  );
}
