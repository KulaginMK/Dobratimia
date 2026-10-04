import { useEffect, useMemo, useRef } from 'react';
import type { LoudnessMeter } from './meter';

// Браузер по умолчанию «улучшает» голос для звонков. Для замера громкости это вредно: автоусиление
// подтягивает тихое и прижимает громкое.
const CONSTRAINTS: MediaStreamConstraints = {
  audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
};
// Окно анализатора: 2048 отсчётов — около 0,04 с звука.
const FFT_SIZE = 2048;

type Capture = {
  media: MediaStream;
  context: AudioContext;
  analyser: AnalyserNode;
  samples: Float32Array<ArrayBuffer>;
};

function release(capture: Capture) {
  capture.media.getTracks().forEach((track) => track.stop());
  capture.context.close().catch(() => {});
}

/**
 * Громкость с микрофона в вебе: getUserMedia + AnalyserNode (docs/07). Анализатор ни к чему не подключён —
 * звук не воспроизводится, не записывается и никуда не отправляется. Работает только по HTTPS и на localhost.
 */
export function useLoudnessMeter(): LoudnessMeter {
  const capture = useRef<Capture | null>(null);

  // Уходим с экрана — микрофон выключаем.
  useEffect(
    () => () => {
      if (capture.current) release(capture.current);
      capture.current = null;
    },
    [],
  );

  return useMemo<LoudnessMeter>(
    () => ({
      start: async () => {
        // Без HTTPS браузер микрофон не даёт вовсе.
        if (!navigator.mediaDevices?.getUserMedia) return 'denied';
        let media: MediaStream;
        try {
          media = await navigator.mediaDevices.getUserMedia(CONSTRAINTS);
        } catch (error) {
          const name = error instanceof DOMException ? error.name : '';
          return name === 'NotAllowedError' || name === 'SecurityError' ? 'denied' : 'failed';
        }
        try {
          const context = new AudioContext();
          const analyser = context.createAnalyser();
          analyser.fftSize = FFT_SIZE;
          context.createMediaStreamSource(media).connect(analyser);
          await context.resume();
          if (capture.current) release(capture.current);
          capture.current = { media, context, analyser, samples: new Float32Array(FFT_SIZE) };
          return 'started';
        } catch {
          media.getTracks().forEach((track) => track.stop());
          return 'failed';
        }
      },
      read: () => {
        const current = capture.current;
        if (!current) return null;
        current.analyser.getFloatTimeDomainData(current.samples);
        let squares = 0;
        for (let i = 0; i < current.samples.length; i++) {
          squares += current.samples[i] * current.samples[i];
        }
        return Math.sqrt(squares / current.samples.length);
      },
      stop: () => {
        if (capture.current) release(capture.current);
        capture.current = null;
      },
      // Разрешение меняют в настройках сайта — браузер сообщает об этом сам.
      watchAccess: (onGranted) => {
        let status: PermissionStatus | null = null;
        let cancelled = false;
        const onChange = () => {
          if (status?.state === 'granted') onGranted();
        };
        navigator.permissions
          ?.query({ name: 'microphone' as PermissionName })
          .then((result) => {
            if (cancelled) return;
            status = result;
            status.addEventListener('change', onChange);
          })
          .catch(() => {});
        return () => {
          cancelled = true;
          status?.removeEventListener('change', onChange);
        };
      },
    }),
    [],
  );
}
