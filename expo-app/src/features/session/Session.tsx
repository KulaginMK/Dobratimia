import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GUEST_USER_ID,
  clearUserData,
  loadOnboarded,
  loadSessionUser,
  saveOnboarded,
  saveSessionUser,
} from '@/data/local/session';
import { authRepo, type SessionUser } from '@/data/repos';
import { useSelectedUniversity } from '@/features/university/SelectedUniversity';

type SessionValue = {
  /** false, пока вход и флаг онбординга читаются с устройства: в это время держится сплэш. */
  ready: boolean;
  /** Онбординг уже показывали: после выхода из аккаунта открывается сразу экран входа. */
  onboarded: boolean;
  /** Кто вошёл; null — никто. Без входа доступны только онбординг, SOS и медитации (docs/01). */
  user: SessionUser | null;
  /** «Войти через Google». Отклоняется, если войти не удалось. */
  signIn: () => Promise<void>;
  /** «Выйти из аккаунта»: дневник и результаты остаются на устройстве под ключом пользователя. */
  signOut: () => Promise<void>;
  /** «Удалить мои данные»: аккаунт и всё сохранённое на устройстве, кроме темы. Дальше — онбординг с начала. */
  deleteData: () => Promise<void>;
};

const SessionContext = createContext<SessionValue>({
  ready: false,
  onboarded: false,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  deleteData: async () => {},
});

/** Вход в аккаунт и флаг «онбординг показан». Оборачивает всё приложение, внутри SelectedUniversityProvider. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const university = useSelectedUniversity();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([loadSessionUser(), loadOnboarded()]).then(([storedUser, storedOnboarded]) => {
      if (!alive) return;
      setUser(storedUser);
      setOnboarded(storedOnboarded);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const signIn = async () => {
    const signedIn = await authRepo.signInWithGoogle();
    setUser(signedIn);
    setOnboarded(true);
    // Не сохранилось — вход всё равно действует до перезапуска.
    saveSessionUser(signedIn).catch(() => {});
    saveOnboarded().catch(() => {});
  };

  const signOut = async () => {
    // Нет сети — на устройстве выходим всё равно.
    await authRepo.signOut().catch(() => {});
    setUser(null);
    saveSessionUser(null).catch(() => {});
  };

  const deleteData = async () => {
    if (!user) return;
    // Сначала аккаунт: если сервер не ответил, на устройстве ничего не трогаем и говорим об ошибке.
    await authRepo.deleteAccount(user.id);
    await clearUserData(user.id);
    university.reset();
    setOnboarded(false);
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ ready, onboarded, user, signIn, signOut, deleteData }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  return useContext(SessionContext);
}

/** Id для ключей личных данных на устройстве. Экраны внутри (app) открываются только после входа. */
export function useUserId(): string {
  return useSession().user?.id ?? GUEST_USER_ID;
}
