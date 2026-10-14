import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  GUEST_USER_ID,
  adoptGuestData,
  clearUserData,
  loadOnboarded,
  loadSessionUser,
  saveOnboarded,
  saveSessionUser,
} from '@/data/local/session';
import { authRepo, universitiesRepo, type SessionUser, type SignInCallback, type SignedIn } from '@/data/repos';
import { cancelPersonalReminders } from '@/features/reminders/reminders';
import { useSelectedUniversity } from '@/features/university/SelectedUniversity';
import { cancelAllNotifications } from '@/lib/notifications';

type SessionValue = {
  /** false, пока вход и флаг онбординга читаются с устройства: в это время держится сплэш. */
  ready: boolean;
  /** Онбординг уже показывали: после выхода из аккаунта открывается сразу экран входа. */
  onboarded: boolean;
  /**
   * Кто вошёл; null — никто. До онбординга без входа открываются онбординг, SOS и медитации; после
   * «Продолжить без входа» — и остальное, кроме подбора, «Доброго слова» и дневника (SignInGate).
   */
  user: SessionUser | null;
  /**
   * «Войти через Google». signedIn — вход состоялся; redirected — открылась страница Google, вход завершит
   * экран /auth/callback; cancelled — человек закрыл окно. Отклоняется, если войти не удалось.
   */
  signIn: () => Promise<'signedIn' | 'redirected' | 'cancelled'>;
  /** Завершить вход после возврата от Google. */
  completeSignIn: (callback: SignInCallback) => Promise<void>;
  /** «Продолжить без входа»: онбординг пройден, войти можно позже из профиля. */
  skipSignIn: () => void;
  /** «Выйти из аккаунта»: дневник и результаты остаются на устройстве под ключом пользователя. */
  signOut: () => Promise<void>;
  /** «Удалить мои данные»: аккаунт и всё сохранённое на устройстве, кроме темы. Дальше — онбординг с начала. */
  deleteData: () => Promise<void>;
};

const SessionContext = createContext<SessionValue>({
  ready: false,
  onboarded: false,
  user: null,
  signIn: async () => 'cancelled',
  completeSignIn: async () => {},
  skipSignIn: () => {},
  signOut: async () => {},
  deleteData: async () => {},
});

/** Вход в аккаунт и флаг «онбординг показан». Оборачивает всё приложение, внутри SelectedUniversityProvider. */
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const university = useSelectedUniversity();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [onboarded, setOnboarded] = useState(false);
  const [ready, setReady] = useState(false);

  // Кто вошёл, приложение помнит само: дневник и тесты открываются и без сети, когда сервер проверить вход не может.
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

  // После запуска и после входа сверяемся с сервером: вход могли отозвать, а роль — поменять
  // (специалисту открыли кабинет). Сверка идёт по тому, кто вошёл сейчас, а не по записи на устройстве:
  // сразу после входа она ещё может быть не сохранена.
  useEffect(() => {
    if (!ready || !user) return;
    let alive = true;
    const forget = () => {
      if (!alive) return;
      setUser(null);
      saveSessionUser(null).catch(() => {});
    };
    authRepo
      .restore(user)
      .then((checked) => {
        if (!alive) return;
        if (!checked) {
          forget();
          return;
        }
        // Ничего не изменилось — состояние не трогаем, иначе сверка запустится заново.
        if (checked.role === user.role && checked.name === user.name && checked.email === user.email) return;
        setUser(checked);
        saveSessionUser(checked).catch(() => {});
      })
      // Нет сети — оставляем вход как есть: дневник и тесты работают и без неё.
      .catch(() => {});
    const unsubscribe = authRepo.onSignedOut(forget);
    return () => {
      alive = false;
      unsubscribe();
    };
  }, [ready, user]);

  // Никто не вошёл (выход, отозванный вход): напоминания о дневнике и тесте больше не приходят.
  useEffect(() => {
    if (ready && !user) cancelPersonalReminders();
  }, [ready, user]);

  // Выбранный вуз хранится и в профиле на сервере; источник правды — устройство (SOS работает без сети).
  const userId = user?.id;
  const universityId = university.universityId;
  useEffect(() => {
    if (userId && universityId) authRepo.saveUniversity(userId, universityId).catch(() => {});
  }, [userId, universityId]);

  const accept = async ({ user: signedIn, universityId: fromProfile }: SignedIn) => {
    // Данные, накопленные с входом-заглушкой, переходят к первому настоящему аккаунту.
    await adoptGuestData(signedIn.id).catch(() => {});
    // Новое устройство: вуз берём из профиля, если здесь он ещё не выбран.
    const known = universitiesRepo.byId(fromProfile);
    if (!university.universityId && known) university.select(known.id);
    setUser(signedIn);
    setOnboarded(true);
    // Не сохранилось — вход всё равно действует до перезапуска.
    saveSessionUser(signedIn).catch(() => {});
    saveOnboarded().catch(() => {});
  };

  const signIn = async () => {
    const result = await authRepo.signInWithGoogle();
    if (result === 'redirected' || result === 'cancelled') return result;
    await accept(result);
    return 'signedIn' as const;
  };

  const completeSignIn = async (callback: SignInCallback) => {
    await accept(await authRepo.completeSignIn(callback));
  };

  const skipSignIn = () => {
    setOnboarded(true);
    // Не сохранилось — после перезапуска онбординг покажется снова, только и всего.
    saveOnboarded().catch(() => {});
  };

  const signOut = async () => {
    await authRepo.signOut().catch(() => {});
    setUser(null);
    saveSessionUser(null).catch(() => {});
  };

  const deleteData = async () => {
    if (!user) return;
    // Сначала аккаунт: если сервер не ответил, на устройстве ничего не трогаем и говорим об ошибке.
    await authRepo.deleteAccount(user.id);
    await clearUserData(user.id);
    // Переключатели стёрты вместе с данными — убираем и уже поставленные уведомления, включая таймер Pomodoro.
    await cancelAllNotifications().catch(() => {});
    university.reset();
    setOnboarded(false);
    setUser(null);
  };

  return (
    <SessionContext.Provider value={{ ready, onboarded, user, signIn, completeSignIn, skipSignIn, signOut, deleteData }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  return useContext(SessionContext);
}

/** Id для ключей личных данных на устройстве. Экраны, где он нужен, открываются только после входа (SignInGate). */
export function useUserId(): string {
  return useSession().user?.id ?? GUEST_USER_ID;
}
