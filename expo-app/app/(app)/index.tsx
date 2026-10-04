import { useRouter } from 'expo-router';
import { FeedPager } from '@/features/feed/FeedPager';
import { placeholderPages } from '@/features/feed/placeholderPages';

/** Лента: Анатомия · Техники · Главная · Подбор специалиста · Доброе слово. */
export default function Feed() {
  const router = useRouter();
  return (
    <FeedPager
      pages={placeholderPages}
      onPullDown={{
        techniques: () => router.push('/meditation?from=feed'),
        match: () => router.push('/favorites'),
      }}
    />
  );
}
