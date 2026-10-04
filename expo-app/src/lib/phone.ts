import { Linking } from 'react-native';
import { useToast } from '@/components/ui';

/** «+375 212 00-00-00» → «tel:+375212000000». */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

/** Звонок в одно касание. Если телефон не смог открыть набор номера — подсказываем, что сделать. */
export function useCallPhone() {
  const toast = useToast();
  return (phone: string) => {
    Linking.openURL(telHref(phone)).catch(() => {
      toast.show({ message: `Не удалось начать звонок. Наберите номер вручную: ${phone}`, tone: 'error' });
    });
  };
}
