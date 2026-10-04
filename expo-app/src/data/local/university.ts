import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UniversityId } from '@/data/repos';
import { universitiesRepo } from '@/data/repos';

// Общий ключ, без id пользователя: SOS вуза работает без входа и без сети (docs/08).
const KEY = 'app:university';

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
