import AsyncStorage from '@react-native-async-storage/async-storage';

/** Подсказки о жестах при первом визите (TIMKA-MOTION.md, раздел Б). */
export type Hint = 'feedSwipe' | 'techniquesPull' | 'matchSwipe';

// Общий ключ, без id пользователя, как у темы: жест один и тот же, кто бы ни вошёл.
const key = (hint: Hint) => `app:hint:${hint}`;

/** Видел ли человек подсказку. Не прочиталось — считаем, что видел: лучше не показать, чем показывать каждый раз. */
export async function hintSeen(hint: Hint): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(key(hint))) !== null;
  } catch {
    return true;
  }
}

export async function markHintSeen(hint: Hint): Promise<void> {
  try {
    await AsyncStorage.setItem(key(hint), '1');
  } catch {
    // Не записалось — подсказка покажется ещё раз, это не страшно.
  }
}
