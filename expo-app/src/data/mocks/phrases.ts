// ЗАГЛУШКА: стартовый набор «Доброго слова». Две фразы — из макетов GoodWord и GoodWordAuthor; остальные
// «сахарные» взяты из старой веб-версии и переписаны на «вы», без эмодзи (docs/07: можно взять после вычитки).
// Вычитку делает владелец, фразы «С перчиком» пишут психотерапевты (docs/10). На этапе 12 — с сервера.
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Phrase, PhrasesRepo } from '@/data/repos/PhrasesRepo';

const PHRASES: Phrase[] = [
  { id: 'sweet-1', tone: 'sweet', text: 'Вы не обязаны быть продуктивным каждый день. Отдых — тоже часть учёбы.' },
  { id: 'sweet-2', tone: 'sweet', text: 'Вы справляетесь. Даже если кажется, что нет — справляетесь.' },
  { id: 'sweet-3', tone: 'sweet', text: 'Даже маленький шаг вперёд — это уже движение.' },
  { id: 'sweet-4', tone: 'sweet', text: 'Вы заслуживаете тепла, отдыха и вкусного чая.' },
  { id: 'sweet-5', tone: 'sweet', text: 'В самый трудный день вы остаётесь собой — это уже немало.' },
  {
    id: 'spicy-1',
    tone: 'spicy',
    text: 'Перестаньте сравнивать свой черновик с чужим чистовиком. Особенно в сторис однокурсников.',
    authorSpecialistId: 'irina-rakovich',
  },
];

// Вместо отметок на сервере — хранилище устройства. На этапе 12 сердечки уйдут на сервер, и команда увидит их число.
const likesKey = (userId: string) => `mock:phraseLikes:${userId}`;

async function readLikes(userId: string): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(likesKey(userId));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

export const mockPhrasesRepo: PhrasesRepo = {
  all: async () => PHRASES,
  liked: readLikes,
  setLiked: async (userId, phraseId, liked) => {
    const others = (await readLikes(userId)).filter((id) => id !== phraseId);
    await AsyncStorage.setItem(likesKey(userId), JSON.stringify(liked ? [...others, phraseId] : others));
  },
};
