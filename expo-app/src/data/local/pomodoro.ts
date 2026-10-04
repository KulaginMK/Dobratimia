import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_POMODORO, TOMATOES, type PomodoroState } from '@/features/meditation/pomodoro';

// Общие ключи, без id пользователя: медитации и Pomodoro доступны без входа, а таймер — не личные данные.
const STATE_KEY = 'app:pomodoro';
const NOTIFY_KEY = 'app:pomodoroNotify';

function isState(value: unknown): value is PomodoroState {
  const state = value as Partial<PomodoroState> | null;
  return (
    !!state &&
    (state.mode === 'focus' || state.mode === 'break') &&
    typeof state.tomato === 'number' &&
    state.tomato >= 1 &&
    state.tomato <= TOMATOES &&
    (state.endsAt === null || typeof state.endsAt === 'number') &&
    typeof state.remainingMs === 'number'
  );
}

export async function loadPomodoro(): Promise<PomodoroState> {
  try {
    const raw = await AsyncStorage.getItem(STATE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return isState(parsed) ? parsed : INITIAL_POMODORO;
  } catch {
    return INITIAL_POMODORO;
  }
}

export async function savePomodoro(state: PomodoroState): Promise<void> {
  await AsyncStorage.setItem(STATE_KEY, JSON.stringify(state));
}

/** Переключатель «Уведомить о перерыве». По умолчанию выключен: разрешение на уведомления спрашиваем при включении. */
export async function loadPomodoroNotify(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(NOTIFY_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function savePomodoroNotify(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(NOTIFY_KEY, enabled ? '1' : '0');
}
