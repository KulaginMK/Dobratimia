import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineError } from '@/data/repos/errors';
import type { Phrase, PhrasesRepo } from '@/data/repos/PhrasesRepo';
import { userKey } from '@/data/local/session';
import { createSyncedSet, type SetRemote } from '@/data/sync/syncedSet';
import { request } from './client';

type PhraseRow = { id: string; text: string; tone: 'sweet' | 'spicy'; author_specialist_id: string | null };

// Копия фраз на устройстве: «Доброе слово» работает без сети (docs/08). Не личные данные — общий ключ.
const CACHE_KEY = 'app:phrases';
const DUPLICATE = '23505';

export function toPhrase(row: PhraseRow): Phrase {
  return { id: row.id, text: row.text, tone: row.tone, authorSpecialistId: row.author_specialist_id ?? undefined };
}

const isPhrase = (value: unknown): value is Phrase => {
  const phrase = value as Partial<Phrase> | null;
  return (
    !!phrase &&
    typeof phrase.id === 'string' &&
    typeof phrase.text === 'string' &&
    (phrase.tone === 'sweet' || phrase.tone === 'spicy')
  );
};

async function cached(): Promise<Phrase[]> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter(isPhrase) : [];
  } catch {
    return [];
  }
}

const remote: SetRemote = {
  list: async (userId) => {
    const rows = await request<{ phrase_id: string }[]>((db) =>
      db.from('phrase_likes').select('phrase_id').eq('user_id', userId),
    );
    return rows.map((row) => row.phrase_id);
  },
  add: async (userId, phraseId) => {
    try {
      await request((db) => db.from('phrase_likes').insert({ user_id: userId, phrase_id: phraseId }));
    } catch (error) {
      if ((error as { code?: string }).code !== DUPLICATE) throw error;
    }
  },
  remove: async (userId, phraseId) => {
    await request((db) => db.from('phrase_likes').delete().eq('user_id', userId).eq('phrase_id', phraseId));
  },
};

// Сердечко, поставленное без сети, дойдёт до сервера позже — той же очередью, что и «Нравится» специалистам.
const hearts = createSyncedSet((userId) => userKey(userId, 'phraseLikes'), remote);

export const supabasePhrasesRepo: PhrasesRepo = {
  all: async () => {
    try {
      const rows = await request<PhraseRow[]>((db) =>
        db.from('phrases').select('id, text, tone, author_specialist_id').eq('published', true),
      );
      const phrases = rows.map(toPhrase);
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(phrases)).catch(() => {});
      return phrases;
    } catch (error) {
      if (!(error instanceof OfflineError)) throw error;
      // Без сети — из копии на устройстве. Копии ещё нет (первый запуск без сети) — так и говорим.
      const phrases = await cached();
      if (phrases.length === 0) throw error;
      return phrases;
    }
  },
  liked: (userId) => hearts.list(userId),
  setLiked: async (userId, phraseId, liked) => {
    try {
      await hearts.set(userId, phraseId, liked);
    } catch (error) {
      // Без сети сердечко ждёт в очереди — для человека это не ошибка.
      if (!(error instanceof OfflineError)) throw error;
    }
  },
};
