import AsyncStorage from '@react-native-async-storage/async-storage';
import type { University, UniversityId } from '@/data/repos';
import { universitiesRepo } from '@/data/repos';

// Общие ключи, без id пользователя: SOS вуза работает без входа и без сети (docs/08).
const KEY = 'app:university';
const DIRECTORY_KEY = 'app:universities';

/** Выбранный вуз. null — ещё не выбран. */
export async function loadUniversityId(): Promise<UniversityId | null> {
  try {
    const value = await AsyncStorage.getItem(KEY);
    return universitiesRepo.byId(value)?.id ?? null;
  } catch {
    return null;
  }
}

export async function saveUniversityId(id: UniversityId): Promise<void> {
  await AsyncStorage.setItem(KEY, id);
}

function isUniversity(value: unknown): value is University {
  const university = value as Partial<University> | null;
  return (
    !!university &&
    typeof university.id === 'string' &&
    typeof university.shortName === 'string' &&
    typeof university.fullName === 'string' &&
    (university.service === null || typeof university.service?.phone === 'string')
  );
}

/** Последний справочник вузов, полученный с сервера: без сети SOS показывает его, а не зашитый в приложение. */
export async function loadDirectory(): Promise<University[] | null> {
  try {
    const raw = await AsyncStorage.getItem(DIRECTORY_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.every(isUniversity) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveDirectory(universities: University[]): Promise<void> {
  await AsyncStorage.setItem(DIRECTORY_KEY, JSON.stringify(universities));
}
