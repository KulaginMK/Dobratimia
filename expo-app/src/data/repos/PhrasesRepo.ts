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
}
