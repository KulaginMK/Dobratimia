/** Push «Появился новый специалист»: сервер хранит токен телефона, пока включён переключатель «Новые специалисты». */
export interface PushRepo {
  /** Сохранить токен за вошедшим. */
  subscribe(token: string): Promise<void>;
  /** Удалить свой токен. */
  unsubscribe(token: string): Promise<void>;
}
