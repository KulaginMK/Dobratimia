import { FavoritesScreen } from '@/features/favorites/FavoritesScreen';
import { SignedInOnly } from '@/features/session/SignInGate';

export default function Favorites() {
  return (
    <SignedInOnly title="Избранные" gate="Избранные специалисты и их контакты доступны, когда вы войдёте через Google.">
      <FavoritesScreen />
    </SignedInOnly>
  );
}
