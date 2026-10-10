import { Linking } from 'react-native';
import { useToast } from '@/components/ui';

/** Пока политики конфиденциальности и согласия нет (их пишет юрист), ссылки на них отвечают этой фразой. */
export const DOCUMENT_PENDING = 'Документ пока готовится';

/**
 * Открыть внешнюю страницу. Пока адреса нет (заглушка в src/data/mocks/links.ts) или он не открылся,
 * говорим об этом, а не молчим.
 */
export function useOpenLink() {
  const toast = useToast();
  return (url: string | null, pendingMessage = '') => {
    if (!url) {
      toast.show({ message: pendingMessage });
      return;
    }
    Linking.openURL(url).catch(() => {
      toast.show({ message: 'Не удалось открыть ссылку. Попробуйте ещё раз.', tone: 'error' });
    });
  };
}
