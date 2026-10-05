import { ScreamScreen } from '@/features/scream/ScreamScreen';
import { useUserId } from '@/features/session/Session';

export default function Scream() {
  return <ScreamScreen userId={useUserId()} />;
}
