import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { AccessibilityInfo, AppState } from 'react-native';
import { useToast } from '@/components/ui';
import { loadScreamRecords, saveScreamRecords, type ScreamRecord } from '@/data/local/scream';
import { toDateKey } from '@/lib/dates';
import { MAX_DURATION_MS, TICK_MS, keepWeek, summarize, toScreamDb, weekRecord, type ScreamSummary } from './loudness';
import { useLoudnessMeter } from './useLoudnessMeter';

/** ready — Scream; starting — ждём ответа о доступе к микрофону; live — ScreamLive; result — ScreamResult; nomic — ScreamNoMic. */
export type ScreamPhase = 'ready' | 'starting' | 'live' | 'result' | 'nomic';

export type ScreamLive = {
  elapsedMs: number;
  /** Текущий уровень, усл. дБ. */
  level: number;
  /** Все уровни замера по порядку, 10 в секунду. */
  levels: number[];
};

export type ScreamResult = ScreamSummary & {
  /** Уровни замера — для волны на экране результата. Живут только в памяти, пока открыт результат. */
  levels: number[];
  weekRecord: number;
};

const EMPTY_LIVE: ScreamLive = { elapsedMs: 0, level: 0, levels: [] };

type Run = { startedAt: number; level: number; levels: number[] };

/** Замер КРИКа: доступ к микрофону, до 10 секунд замера, итог и «рекорд недели» на устройстве. */
export function useScreamSession(userId: string) {
  const meter = useLoudnessMeter();
  const toast = useToast();
  const [phase, setPhase] = useState<ScreamPhase>('ready');
  const [live, setLive] = useState<ScreamLive>(EMPTY_LIVE);
  const [result, setResult] = useState<ScreamResult | null>(null);
  const [records, setRecords] = useState<ScreamRecord[]>([]);
  const run = useRef<Run | null>(null);
  // Номер попытки запуска: пока человек отвечал на вопрос о микрофоне, он мог уйти с экрана.
  const attempt = useRef(0);

  useEffect(() => {
    let alive = true;
    loadScreamRecords(userId).then((stored) => {
      if (alive) setRecords(stored);
    });
    return () => {
      alive = false;
    };
  }, [userId]);

  const end = (withResult: boolean) => {
    const finished = run.current;
    run.current = null;
    attempt.current += 1;
    meter.stop();
    if (!finished || !withResult || finished.levels.length === 0) {
      setPhase('ready');
      return;
    }
    const summary = summarize(finished.levels, Date.now() - finished.startedAt);
    const today = toDateKey(new Date());
    const next = [...keepWeek(records, today), { date: today, ...summary }];
    setRecords(next);
    // Не сохранилось — результат всё равно виден, пострадает только «рекорд недели».
    saveScreamRecords(userId, next).catch(() => {});
    setResult({ ...summary, levels: finished.levels, weekRecord: weekRecord(next, today) });
    setPhase('result');
    AccessibilityInfo.announceForAccessibility(`Замер окончен. Ваш пик — ${summary.peak} условных децибел`);
  };

  const tick = useEffectEvent(() => {
    const current = run.current;
    if (!current) return;
    const rms = meter.read();
    // Нового звука за этот шаг не пришло — держим прежний уровень.
    if (rms !== null) current.level = toScreamDb(rms);
    current.levels.push(current.level);
    const elapsedMs = Date.now() - current.startedAt;
    if (elapsedMs >= MAX_DURATION_MS) {
      end(true);
      return;
    }
    setLive({ elapsedMs, level: current.level, levels: [...current.levels] });
  });

  /** Замер прерывается без результата: «Назад», уход с экрана, свёрнутое приложение (docs/06). */
  const cancel = () => {
    if (phase === 'live') end(false);
    else if (phase === 'starting') {
      attempt.current += 1;
      setPhase('ready');
    }
  };
  const onBackground = useEffectEvent(cancel);

  useEffect(() => {
    if (phase !== 'live') return;
    const timer = setInterval(tick, TICK_MS);
    // Свернули приложение — микрофон выключаем сразу. Пока идёт вопрос о доступе, фаза ещё не live,
    // поэтому системный диалог разрешения замер не обрывает.
    const subscription = AppState.addEventListener('change', (status) => {
      if (status !== 'active') onBackground();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [phase]);

  // Доступ дали в настройках — возвращаем экран готовности.
  useEffect(() => {
    if (phase !== 'nomic') return;
    return meter.watchAccess(() => setPhase('ready'));
  }, [phase, meter]);

  // Экран закрыт — микрофон выключен.
  useEffect(() => {
    const stop = meter.stop;
    return () => {
      attempt.current += 1;
      run.current = null;
      stop();
    };
  }, [meter]);

  const start = async () => {
    if (phase !== 'ready') return;
    const id = (attempt.current += 1);
    setPhase('starting');
    const outcome = await meter.start();
    if (attempt.current !== id) {
      // Пока ждали ответа, человек ушёл с экрана: слушать уже не нужно.
      if (outcome === 'started') meter.stop();
      return;
    }
    if (outcome === 'denied') {
      setPhase('nomic');
      return;
    }
    if (outcome === 'failed') {
      setPhase('ready');
      toast.show({ message: 'Не удалось включить микрофон. Попробуйте ещё раз.', tone: 'error' });
      return;
    }
    run.current = { startedAt: Date.now(), level: 0, levels: [] };
    setLive(EMPTY_LIVE);
    setPhase('live');
    AccessibilityInfo.announceForAccessibility('Идёт замер');
  };

  return {
    phase,
    live,
    result,
    start,
    /** «Стоп»: замер заканчивается результатом. */
    stop: () => end(true),
    cancel,
    /** «Крикнуть ещё раз» и повторная попытка после отказа в доступе. */
    reset: () => {
      setResult(null);
      setPhase('ready');
    },
  };
}
