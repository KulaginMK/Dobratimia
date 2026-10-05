/** student — студент; specialist — специалист с кабинетом (почту указал администратор, docs/07); admin — администратор. */
export type UserRole = 'student' | 'specialist' | 'admin';

/** Вошедший пользователь. Имя и почта приходят из Google-аккаунта и нужны только для входа (docs/08). */
export type SessionUser = {
  /** С этим id лежат личные данные на устройстве: user:<id>:mood. */
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

/** Итог входа: кто вошёл и какой вуз записан в его профиле на сервере (null — не записан). */
export type SignedIn = { user: SessionUser; universityId: string | null };

/** Что пришло в адресе возврата от Google: одноразовый код или причина отказа. */
export type SignInCallback = { code?: string; error?: string };

/** Вход и аккаунт. Настоящая реализация — Supabase Auth с Google (docs/08), заглушка — src/data/mocks/user.ts. */
export interface AuthRepo {
  /**
   * «Войти через Google». Итог входа — если вход завершился сразу; 'redirected' — открылась страница Google,
   * вход завершится на экране /auth/callback; 'cancelled' — человек закрыл окно входа.
   */
  signInWithGoogle(): Promise<SignedIn | 'redirected' | 'cancelled'>;
  /** Завершить вход после возврата от Google. Повторный вызов с тем же кодом возвращает тот же итог. */
  completeSignIn(callback: SignInCallback): Promise<SignedIn>;
  /**
   * Проверить при запуске вход, сохранённый на устройстве, и обновить роль. null — на сервере входа нет
   * (его отозвали или аккаунт удалён): на устройстве тоже нужно выйти.
   * Отклоняется с OfflineError, если проверить не удалось — тогда вход на устройстве остаётся как есть.
   */
  restore(user: SessionUser): Promise<SessionUser | null>;
  /** Сервер сообщил, что вход больше не действует. Возвращает функцию отписки. */
  onSignedOut(listener: () => void): () => void;
  /** Выйти. Срабатывает и без сети: на устройстве вход забывается в любом случае. */
  signOut(): Promise<void>;
  /** «Удалить мои данные»: аккаунт, отметки «Нравится» и сердечки на сервере. Данные на устройстве стираются отдельно. */
  deleteAccount(userId: string): Promise<void>;
  /** Записать выбранный вуз в профиль на сервере (копия на устройстве нужна SOS без сети). */
  saveUniversity(userId: string, universityId: string): Promise<void>;
}
