import { PlaceholderScreen } from '@/features/navigation/PlaceholderScreen';

export default function Technique() {
  return (
    <PlaceholderScreen
      title="Техника"
      leadingLabel="Назад к техникам"
      stage={6}
      etalon="Technique"
      links={[
        { label: 'Начать с таймером', href: '/meditation?from=technique&scheme=4-7-8' },
      ]}
    />
  );
}
