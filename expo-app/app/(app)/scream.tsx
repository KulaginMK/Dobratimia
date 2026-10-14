import { ScreamScreen } from '@/features/scream/ScreamScreen';
import { useSession } from '@/features/session/Session';

export default function Scream() {
  return <ScreamScreen userId={useSession().user?.id ?? null} />;
}
