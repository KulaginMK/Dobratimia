/** sweet — «Сахарный» (поддержка), spicy — «С перчиком» (встряхнуть). */
export type PhraseTone = 'sweet' | 'spicy';

/** Фраза «Доброго слова» (таблица phrases, docs/08). */
export type Phrase = {
  id: string;
  text: string;
  tone: PhraseTone;
  /** Автор-специалист: у фраз «С перчиком» от психотерапевтов. */
  authorSpecialistId?: string;
};

export interface PhrasesRepo {
  /** Все опубликованные фразы. На этапе 12 — с сервера, с кешем на устройстве: работает без сети. */
  all(): Promise<Phrase[]>;
  /** id фраз, которым пользователь поставил сердечко: чтобы оно оставалось нажатым, когда фраза выпадет снова. */
  liked(userId: string): Promise<string[]>;
  /**
   * Сердечко — отметка «нравится» фразе, а не закладка: списка отмеченных фраз у пользователя нет.
   * Команда видит только число отметок у каждой фразы и по нему понимает, какие фразы удачные.
   */
  setLiked(userId: string, phraseId: string, liked: boolean): Promise<void>;
}
