import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadRejected, saveRejected } from '@/data/local/match';
import {
  likesRepo,
  specialistsRepo,
  universitiesRepo,
  type Specialist,
  type SpecialistContacts,
} from '@/data/repos';
import { useSelectedUniversity } from '@/features/university/SelectedUniversity';
import { toDateKey } from '@/lib/dates';
import { deckOrder } from './deck';

/** Цвет заглушки фото и аватара — пока у специалистов нет настоящих фотографий. */
export type SpecialistTone = 'primary' | 'neutral' | 'growth';
const TONES: SpecialistTone[] = ['primary', 'neutral', 'growth'];

type SpecialistsValue = {
  /** false, пока специалисты и отметки читаются. */
  ready: boolean;
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
  /** Контакты: undefined — ещё загружаются; null — их нет или они закрыты. */
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
 */
export function SpecialistsProvider({ userId, children }: { userId: string; children: React.ReactNode }) {
  const { universityId } = useSelectedUniversity();
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Record<string, SpecialistContacts | null>>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([specialistsRepo.published(), likesRepo.list(userId), loadRejected(userId)])
      .then(async ([published, likes, rejected]) => {
        if (!alive) return;
        setSpecialists(published);
        setLikedIds(likes);
        setRejectedIds(rejected);
        setReady(true);
        const opened = await Promise.all(likes.map((id) => specialistsRepo.contacts(userId, id).catch(() => null)));
        if (alive) setContacts(Object.fromEntries(likes.map((id, i) => [id, opened[i]])));
      })
      .catch(() => {
        // Нет сети: показываем пустую колоду, а не вечную загрузку.
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  const city = universitiesRepo.byId(universityId)?.city ?? null;
  // Порядок случайный, но в пределах дня не меняется.
  const order = deckOrder(
    specialists.filter((specialist) => !likedIds.includes(specialist.id)),
    city,
    toDateKey(new Date()),
  );
  const deck = order.filter((specialist) => !rejectedIds.includes(specialist.id));

  const commitRejected = (next: string[]) => {
    setRejectedIds(next);
    saveRejected(userId, next).catch(() => {});
  };

  const like = (id: string) => {
    if (likedIds.includes(id)) return;
    setLikedIds([...likedIds, id]);
    likesRepo
      .add(userId, id)
      .then(() => specialistsRepo.contacts(userId, id))
      .then((opened) => setContacts((current) => ({ ...current, [id]: opened })))
      .catch(() => setContacts((current) => ({ ...current, [id]: null })));
  };

  const unlike = (id: string) => {
    setLikedIds(likedIds.filter((item) => item !== id));
    setContacts((current) => Object.fromEntries(Object.entries(current).filter(([key]) => key !== id)));
    if (!rejectedIds.includes(id)) commitRejected([...rejectedIds, id]);
    likesRepo.remove(userId, id).catch(() => {});
  };

  const value: SpecialistsValue = {
    ready,
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
