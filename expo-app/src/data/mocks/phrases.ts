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
  // Черновые фразы Claude (15 октября 2026 года): ждут вычитки владельца и психолога. Те же — в supabase/demo.sql.
  { id: 'sweet-6', tone: 'sweet', text: 'Сессия закончится, а вы останетесь. Берегите того, кто останется.' },
  { id: 'sweet-7', tone: 'sweet', text: 'Не обязательно знать всё. Даже профессора иногда заглядывают в учебник.' },
  { id: 'sweet-8', tone: 'sweet', text: 'Сегодня достаточно сделать чуть-чуть. Завтра — ещё чуть-чуть.' },
  { id: 'sweet-9', tone: 'sweet', text: 'Вы больше, чем оценка в зачётке.' },
  { id: 'sweet-10', tone: 'sweet', text: 'Вы учитесь помогать людям. Помогать себе — тоже часть этой профессии.' },
  { id: 'sweet-11', tone: 'sweet', text: 'Горячий обед и восемь часов сна — не слабость, а подготовка к экзамену.' },
  { id: 'sweet-12', tone: 'sweet', text: 'Ошибаться на учёбе можно и нужно: именно для этого учёба и существует.' },
  { id: 'sweet-13', tone: 'sweet', text: 'Устать — нормально. Даже самые сильные люди иногда устают.' },
  { id: 'spicy-2', tone: 'spicy', text: 'Учебник не обидится, если вы закроете его и пойдёте спать. Во сне мозг как раз раскладывает выученное по полочкам.' },
  { id: 'spicy-3', tone: 'spicy', text: 'Кофе — не замена сну, а кредит под высокий процент.' },
  { id: 'spicy-4', tone: 'spicy', text: 'Выучить всё за ночь не получится ни у кого. А вот выспаться за ночь — вполне.' },
  { id: 'spicy-5', tone: 'spicy', text: 'Отвечать в чате группы в два часа ночи необязательно. Чат переживёт.' },
  { id: 'spicy-6', tone: 'spicy', text: '«Отдохну после сессии» — самая популярная неправда медвуза.' },
  { id: 'spicy-7', tone: 'spicy', text: 'Перфекционизм — это страх, который надел белый халат.' },
  { id: 'spicy-8', tone: 'spicy', text: 'Читаете одну страницу в третий раз? Дело не в уме, а в усталости. Сделайте перерыв.' },
  { id: 'spicy-9', tone: 'spicy', text: 'Не можете начать — начните с пяти минут. Из-под одеяла задача всегда кажется больше.' },
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
