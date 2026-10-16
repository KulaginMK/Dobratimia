import { Linking } from 'react-native';
import { useToast } from '@/components/ui';

/** Открыть внешнюю страницу. Если она не открылась, говорим об этом, а не молчим. */
export function useOpenLink() {
  const toast = useToast();
  return (url: string) => {
    Linking.openURL(url).catch(() => {
      toast.show({ message: 'Не удалось открыть ссылку. Попробуйте ещё раз.', tone: 'error' });
    });
  };
}
