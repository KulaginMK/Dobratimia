import type { ScreamRecord } from '@/data/local/scream';
import { addDays } from '@/lib/dates';

// «Условные децибелы» — игровая шкала, а не измерение шума: точность не обещаем (docs/07).

/** Сдвиг шкалы. Проверить на 2–3 телефонах: обычная речь должна давать 60–75, громкий крик — 90–105. */
const CALIBRATION_OFFSET = 110;
export const MAX_LEVEL = 110;
/** Замер идёт до 10 секунд. */
export const MAX_DURATION_MS = 10_000;
/** Время, уровень, волна и полоса обновляются 10 раз в секунду. */
export const TICK_MS = 100;
/** В среднее идут только отсчёты громче этого уровня: тишина до и после крика не считается. */
const AVERAGE_FLOOR = 40;
/** «Рекорд недели» — за сегодня и шесть дней до него, как неделя в дневнике. */
const WEEK_DAYS = 7;

export type ScreamSummary = {
  peak: number;
  avg: number;
  durationSec: number;
};

/** RMS отсчётов, нормированных в −1…1 → условные децибелы 0…110. */
export function toScreamDb(rms: number): number {
  if (!(rms > 0)) return 0;
  const dbfs = 20 * Math.log10(rms);
  return Math.min(MAX_LEVEL, Math.max(0, Math.round(dbfs + CALIBRATION_OFFSET)));
}

/** Итог замера по уровням, снятым 10 раз в секунду. */
export function summarize(levels: number[], elapsedMs: number): ScreamSummary {
  const loud = levels.filter((level) => level > AVERAGE_FLOOR);
  // Ни одного отсчёта громче порога (шёпот) — среднее по всем.
  const counted = loud.length > 0 ? loud : levels;
  const sum = counted.reduce((total, level) => total + level, 0);
  const seconds = Math.round(Math.min(elapsedMs, MAX_DURATION_MS) / 1000);
  return {
    peak: levels.reduce((max, level) => Math.max(max, level), 0),
    avg: counted.length > 0 ? Math.round(sum / counted.length) : 0,
    durationSec: Math.max(1, seconds),
  };
}

/** Время замера: «00:04». */
export function timeLabel(elapsedMs: number): string {
  const seconds = Math.floor(Math.min(elapsedMs, MAX_DURATION_MS) / 1000);
  return `00:${String(seconds).padStart(2, '0')}`;
}

/** Записи за последнюю неделю: более старые для «рекорда недели» не нужны и не хранятся. */
export function keepWeek(records: ScreamRecord[], todayKey: string): ScreamRecord[] {
  const from = addDays(todayKey, 1 - WEEK_DAYS);
  return records.filter((record) => record.date >= from && record.date <= todayKey);
}

export function weekRecord(records: ScreamRecord[], todayKey: string): number {
  return keepWeek(records, todayKey).reduce((max, record) => Math.max(max, record.peak), 0);
}
