import { GUEST_USER_ID } from '@/data/local/session';
import { ScreamScreen } from '@/features/scream/ScreamScreen';

// Этапы 11–12: вместо гостя здесь будет id вошедшего пользователя, как в (app)/_layout.
export default function Scream() {
  return <ScreamScreen userId={GUEST_USER_ID} />;
}
