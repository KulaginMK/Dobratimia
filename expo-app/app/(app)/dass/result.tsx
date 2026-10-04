import { PlaceholderScreen } from '@/features/navigation/PlaceholderScreen';

export default function DassResult() {
  return (
    <PlaceholderScreen
      title="DASS-21"
      leading="close"
      leadingLabel="Закрыть"
      stage={9}
      etalon="DassResult"
      links={[
        { label: 'Подобрать специалиста', href: '/?s=match', action: 'dismissTo' },
        { label: 'Помощь в моём вузе', href: '/sos/university' },
        { label: 'На главную', href: '/?s=home', action: 'dismissTo' },
      ]}
    />
  );
}
