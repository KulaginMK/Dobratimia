import { SignedInOnly } from '@/features/session/SignInGate';
import { SpecialistScreen } from '@/features/specialists/SpecialistScreen';

export default function Specialist() {
  return (
    <SignedInOnly title="Специалист" gate="Карточки психологов и их контакты доступны, когда вы войдёте через Google.">
      <SpecialistScreen />
    </SignedInOnly>
  );
}
