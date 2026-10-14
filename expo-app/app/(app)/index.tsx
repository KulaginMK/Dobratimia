import { useRouter } from 'expo-router';
import { FeedPager } from '@/features/feed/FeedPager';
import { feedPages } from '@/features/feed/feedPages';
import { useSession } from '@/features/session/Session';

/** Лента: Анатомия · Техники · Главная · Подбор специалиста · Доброе слово. */
export default function Feed() {
  const router = useRouter();
  const { user } = useSession();
  return (
    <FeedPager
      pages={feedPages}
      onPullDown={{
        techniques: () => router.push('/meditation?from=feed'),
        match: user ? () => router.push('/favorites') : undefined,
      }}
    />
  );
}
