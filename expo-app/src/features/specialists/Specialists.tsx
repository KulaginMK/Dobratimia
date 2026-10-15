import React, { createContext, useContext, useEffect, useState } from 'react';
import { useToast } from '@/components/ui';
import { loadFavoritesCache, loadRejected, saveFavoritesCache, saveRejected } from '@/data/local/match';
import { OfflineError, likesRepo, specialistsRepo, type Specialist, type SpecialistContacts } from '@/data/repos';
import { useSelectedUniversity } from '@/features/university/SelectedUniversity';
import { toDateKey } from '@/lib/dates';
import { deckOrder } from './deck';

/** Цвет заглушки фото и аватара — пока у специалистов нет настоящих фотографий. */
export type SpecialistTone = 'primary' | 'neutral' | 'growth';
const TONES: SpecialistTone[] = ['primary', 'neutral', 'growth'];

type SpecialistsValue = {
  /** false, пока специалисты и отметки читаются. */
  ready: boolean;
  /**
   * Сервер недоступен: подбор не загрузился или отметка ещё не отправлена. Избранные при этом показываются
   * из копии на устройстве, а отметки ждут в очереди.
   */
  offline: boolean;
  /** «Повторить»: отправить накопленные отметки и загрузить всё заново. */
  retry: () => void;
  byId: (id: string | undefined) => Specialist | null;
  toneOf: (id: string) => SpecialistTone;
  /** Колода подбора: без отмеченных «Нравится» и отклонённых. Первый — на верхней карточке. */
  deck: Specialist[];
  /** Сколько всего специалистов в сегодняшней колоде вместе с уже пролистанными — для счётчика «3 из 12». */
  deckTotal: number;
  /** Номер верхней карточки в колоде, с единицы. */
  deckPosition: number;
  /** Отмеченные «Нравится» — избранные. */
  liked: Specialist[];
  isLiked: (id: string) => boolean;
  /** Контакты: undefined — ещё загружаются (или нет сети, см. offline); null — их нет или они закрыты. */
  contactsOf: (id: string) => SpecialistContacts | null | undefined;
  like: (id: string) => void;
  /** «Не подходит»: в колоду специалист не вернётся, пока её не откроют заново. */
  reject: (id: string) => void;
  /** «Убрать из избранных»: контакты снова закрыты, в колоду специалист не возвращается (docs/07). */
  unlike: (id: string) => void;
  /** «Посмотреть всех заново». */
  resetRejected: () => void;
};

const SpecialistsContext = createContext<SpecialistsValue>({
  ready: false,
  offline: false,
  retry: () => {},
  byId: () => null,
  toneOf: () => 'primary',
  deck: [],
  deckTotal: 0,
  deckPosition: 0,
  liked: [],
  isLiked: () => false,
  contactsOf: () => undefined,
  like: () => {},
  reject: () => {},
  unlike: () => {},
  resetRejected: () => {},
});

/**
 * Специалисты, отметки «Нравится» и отклонённые — общее состояние Подбора, Избранных и профиля специалиста.
 * Отметки — через репозиторий (на сервере), отклонённые — только на устройстве (docs/08).
 * userId null — человек не вошёл: карточки видны, но отметок нет, и ничего не сохраняется (владелец, 15 октября 2026).
 */
export function SpecialistsProvider({ userId, children }: { userId: string | null; children: React.ReactNode }) {
  const toast = useToast();
  const { universityId, byId: universityById } = useSelectedUniversity();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Record<string, SpecialistContacts | null>>({});
  const [ready, setReady] = useState(false);
  const [offline, setOffline] = useState(false);
  // «Повторить» увеличивает счётчик — загрузка запускается заново.
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    (async () => {
      // Отметки и отклонённые читаются и без сети: отметки — с учётом ещё не отправленных.
      const [likes, rejected] = userId
        ? await Promise.all([likesRepo.list(userId).catch((): string[] => []), loadRejected(userId)])
        : [[], []];
      if (!alive) return;
      setLikedIds(likes);
      setRejectedIds(rejected);
      try {
        const published = await specialistsRepo.published();
        if (!alive) return;
        setSpecialists(published);
        setOffline(false);
        setReady(true);
        if (!userId) return;

        const opened = await Promise.all(likes.map((id) => specialistsRepo.contacts(userId, id)));
        if (!alive) return;
        const byId = Object.fromEntries(likes.map((id, i) => [id, opened[i]]));
        setContacts(byId);
        // Копия избранных на устройстве: позвонить можно и без интернета.
        const cards = published.filter((specialist) => likes.includes(specialist.id));
        saveFavoritesCache(userId, { cards, contacts: byId }).catch(() => {});
      } catch {
        // Нет сети: вместо подбора — «Нет интернета», избранные — из копии на устройстве.
        const cache = userId
          ? await loadFavoritesCache<Specialist, SpecialistContacts>(userId)
          : { cards: [], contacts: {} };
        if (!alive) return;
        setSpecialists((current) => (current.length > 0 ? current : cache.cards));
        setContacts((current) => ({ ...cache.contacts, ...current }));
        setOffline(true);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [userId, attempt]);

  const retry = () => {
    if (!userId) {
      setAttempt((current) => current + 1);
      return;
    }
    likesRepo
      .flush(userId)
      .catch(() => {})
      .finally(() => setAttempt((current) => current + 1));
  };

  /** Отметка не дошла до сервера: она в очереди, а человеку говорим, что сети нет. */
  const reportOffline = () => {
    setOffline(true);
    toast.show({ message: 'Нет интернета', tone: 'error', actionLabel: 'Повторить', onAction: retry });
  };

  const city = universityById(universityId)?.city ?? null;
  // Порядок случайный, но в пределах дня не меняется.
  const order = deckOrder(
    specialists.filter((specialist) => !likedIds.includes(specialist.id)),
    city,
    toDateKey(new Date()),
  );
  const deck = order.filter((specialist) => !rejectedIds.includes(specialist.id));

  const commitRejected = (next: string[]) => {
    setRejectedIds(next);
    if (userId) saveRejected(userId, next).catch(() => {});
  };

  const like = (id: string) => {
    if (!userId || likedIds.includes(id)) return;
    setLikedIds([...likedIds, id]);
    likesRepo
      .add(userId, id)
      .then(() => specialistsRepo.contacts(userId, id))
      .then((opened) => {
        setContacts((current) => ({ ...current, [id]: opened }));
        const cards = specialists.filter((specialist) => specialist.id === id || likedIds.includes(specialist.id));
        saveFavoritesCache(userId, { cards, contacts: { ...contacts, [id]: opened } }).catch(() => {});
      })
      .catch((error) => {
        if (error instanceof OfflineError) reportOffline();
        else setContacts((current) => ({ ...current, [id]: null }));
      });
  };

  const unlike = (id: string) => {
    if (!userId) return;
    const stillLiked = likedIds.filter((item) => item !== id);
    const stillOpen = Object.fromEntries(Object.entries(contacts).filter(([key]) => key !== id));
    setLikedIds(stillLiked);
    setContacts(stillOpen);
    // Контакты закрываются и в копии на устройстве.
    const cards = specialists.filter((specialist) => stillLiked.includes(specialist.id));
    saveFavoritesCache(userId, { cards, contacts: stillOpen }).catch(() => {});
    if (!rejectedIds.includes(id)) commitRejected([...rejectedIds, id]);
    // Без сети снятая отметка уйдёт на сервер позже, из очереди.
    likesRepo.remove(userId, id).catch(() => {});
  };

  const value: SpecialistsValue = {
    ready,
    offline,
    retry,
    byId: (id) => specialists.find((specialist) => specialist.id === id) ?? null,
    toneOf: (id) => TONES[Math.max(0, specialists.findIndex((specialist) => specialist.id === id)) % TONES.length],
    deck,
    deckTotal: order.length,
    deckPosition: deck.length > 0 ? order.indexOf(deck[0]) + 1 : 0,
    liked: specialists.filter((specialist) => likedIds.includes(specialist.id)),
    isLiked: (id) => likedIds.includes(id),
    contactsOf: (id) => contacts[id],
    like,
    reject: (id) => {
      if (!rejectedIds.includes(id)) commitRejected([...rejectedIds, id]);
    },
    unlike,
    resetRejected: () => commitRejected([]),
  };

  return <SpecialistsContext.Provider value={value}>{children}</SpecialistsContext.Provider>;
}

export function useSpecialists(): SpecialistsValue {
  return useContext(SpecialistsContext);
}
