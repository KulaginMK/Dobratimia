import { useRouter } from 'expo-router';
import { FeedPager } from '@/features/feed/FeedPager';
import { feedPages } from '@/features/feed/feedPages';

/** Лента: Анатомия · Техники · Главная · Подбор специалиста · Доброе слово. */
export default function Feed() {
  const router = useRouter();
  return (
    <FeedPager
      pages={feedPages}
      onPullDown={{
        techniques: () => router.push('/meditation?from=feed'),
        match: () => router.push('/favorites'),
      }}
    />
  );
}
