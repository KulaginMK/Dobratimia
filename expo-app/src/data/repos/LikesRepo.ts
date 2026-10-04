/**
 * Отметки «Нравится» (таблица likes, docs/08). Пользователь видит и меняет только свои.
 * Специалист видит лишь число отметок; кто их поставил — не видит никто.
 */
export interface LikesRepo {
  /** id специалистов, отмеченных пользователем. */
  list(userId: string): Promise<string[]>;
  add(userId: string, specialistId: string): Promise<void>;
  remove(userId: string, specialistId: string): Promise<void>;
}
