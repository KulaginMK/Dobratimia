import { getRecordingPermissionsAsync, requestRecordingPermissionsAsync, useAudioStream } from 'expo-audio';
import { useMemo, useRef } from 'react';
import { AppState } from 'react-native';
import type { LoudnessMeter } from './meter';

// 44,1 кГц поддерживают все телефоны на Android; для громкости частота не важна.
const SAMPLE_RATE = 44_100;
// Отсчёты приходят 16-битными целыми: делим на 32768, чтобы получить −1…1 (docs/07).
const INT16_SCALE = 32_768;
const BYTES_PER_SAMPLE = 2;

/**
 * Громкость с микрофона на телефоне. Поток expo-audio отдаёт отсчёты кусками примерно по 0,1 с прямо в память:
 * файла на диске нет. От каждого куска остаются только сумма квадратов и число отсчётов — сам звук не хранится.
 */
export function useLoudnessMeter(): LoudnessMeter {
  const heard = useRef({ squares: 0, count: 0 });

  const { stream } = useAudioStream({
    sampleRate: SAMPLE_RATE,
    channels: 1,
    encoding: 'int16',
    onBuffer: (buffer) => {
      const samples = new Int16Array(buffer.data, 0, Math.floor(buffer.data.byteLength / BYTES_PER_SAMPLE));
      let squares = 0;
      for (let i = 0; i < samples.length; i++) {
        const value = samples[i] / INT16_SCALE;
        squares += value * value;
      }
      heard.current.squares += squares;
      heard.current.count += samples.length;
    },
  });

  return useMemo<LoudnessMeter>(
    () => ({
      start: async () => {
        try {
          const permission = await requestRecordingPermissionsAsync();
          if (!permission.granted) return 'denied';
          heard.current = { squares: 0, count: 0 };
          await stream.start();
          return 'started';
        } catch {
          // Микрофон занят другим приложением или звонком.
          return 'failed';
        }
      },
      read: () => {
        const { squares, count } = heard.current;
        if (count === 0) return null;
        heard.current = { squares: 0, count: 0 };
        return Math.sqrt(squares / count);
      },
      stop: () => {
        try {
          stream.stop();
        } catch {
          // Экран уже закрыт: expo-audio сам освободил поток и выключил микрофон, повторная остановка — ошибка.
        }
        heard.current = { squares: 0, count: 0 };
      },
      // Из настроек человек возвращается в приложение — в этот момент и проверяем, появился ли доступ.
      watchAccess: (onGranted) => {
        const subscription = AppState.addEventListener('change', (status) => {
          if (status !== 'active') return;
          getRecordingPermissionsAsync()
            .then((permission) => {
              if (permission.granted) onGranted();
            })
            .catch(() => {});
        });
        return () => subscription.remove();
      },
    }),
    [stream],
  );
}
