import { DiaryScreen } from '@/features/diary/DiaryScreen';
import { SignedInOnly } from '@/features/session/SignInGate';

export default function Diary() {
  return (
    <SignedInOnly title="Дневник настроения" gate="Отметки настроения сохраняются в дневник, когда вы войдёте через Google.">
      <DiaryScreen />
    </SignedInOnly>
  );
}
