/** student — студент; specialist — специалист с кабинетом (почту указал администратор, docs/07). */
export type UserRole = 'student' | 'specialist';

/** Вошедший пользователь. Имя и почта приходят из Google-аккаунта и нужны только для входа (docs/08). */
export type SessionUser = {
  /** С этим id лежат личные данные на устройстве: user:<id>:mood. */
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

/** Вход и аккаунт. На этапе 12 — Supabase Auth с Google (docs/08). */
export interface AuthRepo {
  signInWithGoogle(): Promise<SessionUser>;
  signOut(): Promise<void>;
  /** «Удалить мои данные»: аккаунт и отметки «Нравится» на сервере. Данные на устройстве стираются отдельно. */
  deleteAccount(userId: string): Promise<void>;
}
