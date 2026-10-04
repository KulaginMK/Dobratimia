import type { Phrase, PhraseTone } from '@/data/repos';

/** «Ещё» не повторяет фразы из последних двадцати показанных (docs/07). */
export const NO_REPEAT = 20;

/**
 * Следующая случайная фраза нужного тона. recent — id уже показанных, последние в конце.
 * Если фраз меньше, чем нужно помнить, не повторяется хотя бы только что показанная.
 */
export function nextPhrase(phrases: Phrase[], tone: PhraseTone, recent: string[], random = Math.random): Phrase | null {
  const ofTone = phrases.filter((phrase) => phrase.tone === tone);
  if (ofTone.length === 0) return null;
  const last = recent[recent.length - 1];
  // Чем меньше фраз, тем короче память: иначе выбирать стало бы не из чего.
  const remembered = recent.slice(-Math.min(NO_REPEAT, ofTone.length - 1));
  const fresh = ofTone.filter((phrase) => !remembered.includes(phrase.id));
  const pool = fresh.length > 0 ? fresh : ofTone.filter((phrase) => phrase.id !== last);
  const choice = pool.length > 0 ? pool : ofTone;
  return choice[Math.floor(random() * choice.length)];
}
