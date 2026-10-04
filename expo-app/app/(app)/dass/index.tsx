import { PlaceholderScreen } from '@/features/navigation/PlaceholderScreen';

export default function DassQuestion() {
  return (
    <PlaceholderScreen
      title="DASS-21"
      leading="close"
      leadingLabel="Прервать тест"
      stage={9}
      etalon="DassQuestion"
      links={[
        { label: 'Дальше', href: '/dass/result', action: 'replace' },
      ]}
    />
  );
}
