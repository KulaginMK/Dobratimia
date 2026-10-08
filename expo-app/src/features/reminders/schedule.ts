import { NEXT_TEST_DAYS } from '@/features/dass/DassHistory';
import { TOMATOES, nextPhase, type PomodoroState } from '@/features/meditation/pomodoro';
import { addDays, fromDateKey } from '@/lib/dates';
import type { LocalNotification } from '@/lib/notifications';
import { DASS_REMINDER, DIARY_DAILY, DIARY_MISSED, POMODORO_BREAK } from './texts';

// Когда приходят напоминания (docs/07): дневник — в 21:00, тест — накануне в 19:00.
const DIARY_HOUR = 21;
const DASS_HOUR = 19;
const DAY_MS = 86_400_000;

// Экраны, которые открываются по нажатию (docs/06, «Глубокие ссылки»).
const DIARY_URL = '/?s=home&focus=mood';
const DASS_URL = '/dass';
const POMODORO_URL = '/meditation?tab=pomodoro';

/** Постоянные id уведомлений: по ним прежние отменяются перед пересчётом. */
export const DIARY_IDS = Array.from({ length: DIARY_MISSED.length + 1 }, (_, i) => `diary-${i + 1}`);
export const DASS_ID = 'dass';
export const POMODORO_IDS = Array.from({ length: TOMATOES }, (_, i) => `pomodoro-${i + 1}`);

function at(day: string, hour: number): Date {
  const date = fromDateKey(day);
  date.setHours(hour);
  return date;
}

/**
 * С какого дня считать пропуски: день последней отметки, а если её нет или она старая —
 * день накануне включения напоминаний (в первый вечер приходит обычное напоминание).
 */
export function diaryAnchor(lastMarked: string | null, since: string): string {
  const before = addDays(since, -1);
  return lastMarked && lastMarked > before ? lastMarked : before;
}

/**
 * Напоминания о дневнике на ближайшие вечера — на случай, если человек больше ничего не отметит.
 * В первый вечер после отметки — обычное напоминание (каждый день новое), дальше текст меняется
 * с каждым пропущенным днём. После прощального — тишина. Новая отметка пересчитывает всё заново.
 */
export function diaryPlan(anchor: string, now: Date): LocalNotification[] {
  return DIARY_IDS.map((id, i) => {
    const day = addDays(anchor, i + 1);
    const daily = DIARY_DAILY[Math.round(fromDateKey(day).getTime() / DAY_MS) % DIARY_DAILY.length];
    const text = i === 0 ? daily : DIARY_MISSED[i - 1];
    return { id, at: at(day, DIARY_HOUR), ...text, url: DIARY_URL, channel: 'reminders' as const };
  }).filter((notification) => notification.at > now);
}

/** Напоминание о тесте: накануне следующего теста. null — время уже прошло. */
export function dassReminder(lastTest: string, now: Date): LocalNotification | null {
  const when = at(addDays(lastTest, NEXT_TEST_DAYS - 1), DASS_HOUR);
  return when > now ? { id: DASS_ID, at: when, ...DASS_REMINDER, url: DASS_URL, channel: 'reminders' } : null;
}

/**
 * «Уведомить о перерыве»: по уведомлению на конец каждого оставшегося фокуса в круге.
 * Фазы сменяются сами, пока приложение свёрнуто, поэтому все уведомления ставятся заранее.
 */
export function pomodoroBreaks(state: PomodoroState): LocalNotification[] {
  const breaks: LocalNotification[] = [];
  for (let phase = state; phase.endsAt !== null; phase = nextPhase(phase, phase.endsAt)) {
    if (phase.mode !== 'focus') continue;
    breaks.push({
      id: `pomodoro-${phase.tomato}`,
      at: new Date(phase.endsAt),
      ...POMODORO_BREAK,
      url: POMODORO_URL,
      channel: 'pomodoro',
    });
  }
  return breaks;
}
