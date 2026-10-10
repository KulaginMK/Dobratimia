import { Redirect } from 'expo-router';

export default function KitchenSinkRoute() {
  // Витрина нужна только при разработке. В собранном приложении эта ветка вырезается при сборке,
  // поэтому ни витрина, ни её демо-данные (src/data/mocks/demo.ts) в него не попадают.
  // Вырезается именно require: обычный import остался бы в сборке.
  if (__DEV__) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { KitchenSinkScreen } = require('@/features/dev/KitchenSinkScreen');
    return <KitchenSinkScreen />;
  }
  return <Redirect href="/" />;
}
