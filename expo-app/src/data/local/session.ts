/**
 * До этапов 11–12 входа в аккаунт нет, и личные данные лежат под ключом гостя.
 * После входа ключом станет id пользователя: другой аккаунт на том же телефоне этих данных не увидит (docs/08).
 */
export const GUEST_USER_ID = 'guest';

/** Ключ личных данных: user:<id>:mood, user:<id>:dass. */
export function userKey(userId: string, name: string): string {
  return `user:${userId}:${name}`;
}
