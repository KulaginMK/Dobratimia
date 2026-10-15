import { DASS_COUNT } from '@/data/dass';
import type { DassEntry } from '@/data/local/dass';
import { MOOD_NOTE_MAX, type MoodEntry, type MoodLevel } from '@/data/local/mood';
import { scoreDass } from '@/features/dass/score';
import { moodLabel } from '@/features/mood/moodMeta';

// Файл дневника: человек выгружает отметки настроения и тесты DASS-21, а после нового входа (например, удалив
// аккаунт) загружает их обратно (решение владельца от 15 октября 2026 года). Файл не уходит на сервер.
// JSON — чтобы загрузка была точной; слова («Хорошо») и баллы шкал в файле для человека, при загрузке
// их не читают: уровень берут числом, баллы пересчитывают из ответов.

export const BACKUP_FORMAT = 'dobratimia-diary';
export const BACKUP_VERSION = 1;
/** Дневник за годы весит десятки килобайт; файл больше — не наш. */
export const BACKUP_MAX_BYTES = 2_000_000;

/** Файл не похож на дневник «Добратимии» или сделан более новой версией приложения. */
export class BackupError extends Error {}

export function backupFileName(dateKey: string): string {
  return `dobratimia-dnevnik-${dateKey}.json`;
}

export function buildBackup(mood: MoodEntry[], dass: DassEntry[], now: Date): string {
  return JSON.stringify(
    {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      app: 'Добратимия',
      exportedAt: now.toISOString(),
      mood: mood.map(({ date, time, level, note }) => ({ date, time, level, mood: moodLabel(level), ...(note ? { note } : {}) })),
      dass: dass.map(({ date, answers, stress, anxiety, depression }) => ({ date, answers, stress, anxiety, depression })),
    },
    null,
    2,
  );
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^\d{2}:\d{2}$/;
const isDate = (value: unknown): value is string =>
  typeof value === 'string' && DATE.test(value) && !Number.isNaN(Date.parse(value));

function toMood(value: unknown): MoodEntry[] {
  const entry = value as Record<string, unknown> | null;
  if (!entry || !isDate(entry.date) || typeof entry.time !== 'string' || !TIME.test(entry.time)) return [];
  const level = entry.level;
  if (typeof level !== 'number' || !Number.isInteger(level) || level < 1 || level > 5) return [];
  const note = typeof entry.note === 'string' ? entry.note.trim().slice(0, MOOD_NOTE_MAX) : '';
  return [{ date: entry.date, time: entry.time, level: level as MoodLevel, ...(note ? { note } : {}) }];
}

function toDass(value: unknown): DassEntry[] {
  const entry = value as Record<string, unknown> | null;
  if (!entry || !isDate(entry.date) || !Array.isArray(entry.answers) || entry.answers.length !== DASS_COUNT) return [];
  if (!entry.answers.every((answer) => Number.isInteger(answer) && answer >= 0 && answer <= 3)) return [];
  const answers = entry.answers as number[];
  // Баллам из файла не верим: их пересчитывают из ответов.
  return [{ date: entry.date, answers, ...scoreDass(answers) }];
}

/** Записи из файла. Испорченные записи пропускаются и считаются в skipped; чужой файл — BackupError. */
export function parseBackup(text: string): { mood: MoodEntry[]; dass: DassEntry[]; skipped: number } {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new BackupError('not-json');
  }
  const file = data as { format?: unknown; version?: unknown; mood?: unknown; dass?: unknown } | null;
  if (!file || file.format !== BACKUP_FORMAT || typeof file.version !== 'number') throw new BackupError('not-backup');
  if (file.version > BACKUP_VERSION) throw new BackupError('newer');
  const moodIn: unknown[] = Array.isArray(file.mood) ? file.mood : [];
  const dassIn: unknown[] = Array.isArray(file.dass) ? file.dass : [];
  const mood = moodIn.flatMap(toMood);
  const dass = dassIn.flatMap(toDass);
  return { mood, dass, skipped: moodIn.length - mood.length + dassIn.length - dass.length };
}

const byDate = (a: { date: string }, b: { date: string }) => a.date.localeCompare(b.date);

/** Отметки из файла дополняют дневник: день, уже отмеченный на устройстве, не перезаписывается. */
export function mergeMood(current: MoodEntry[], incoming: MoodEntry[]): { entries: MoodEntry[]; added: number } {
  const days = new Map(current.map((entry) => [entry.date, entry]));
  let added = 0;
  for (const entry of incoming) {
    if (days.has(entry.date)) continue;
    days.set(entry.date, entry);
    added += 1;
  }
  return { entries: [...days.values()].sort(byDate), added };
}

/** Тест тот же, если совпали день и все ответы: повторная загрузка того же файла ничего не удвоит. */
export function mergeDass(current: DassEntry[], incoming: DassEntry[]): { entries: DassEntry[]; added: number } {
  const key = (entry: DassEntry) => `${entry.date}:${entry.answers.join('')}`;
  const seen = new Set(current.map(key));
  const entries = [...current];
  for (const entry of incoming) {
    if (seen.has(key(entry))) continue;
    seen.add(key(entry));
    entries.push(entry);
  }
  return { entries: entries.sort(byDate), added: entries.length - current.length };
}
