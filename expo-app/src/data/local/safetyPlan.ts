import AsyncStorage from '@react-native-async-storage/async-storage';
import { PLAN_SECTIONS, type PlanSection } from '@/data/safetyPlan';
import { GUEST_USER_ID, userKey } from './session';

/**
 * План на трудный момент: по разделу — пункты своими словами. Хранится только на устройстве (docs/08:
 * чувствительное не уходит на сервер) и стирается вместе с остальным по «Удалить мои данные» (ключ user:<id>:).
 * Гость тоже может его составить (решение владельца от 19 октября 2026 года): план лежит под ключом гостя
 * и при входе переходит в аккаунт — adoptGuestPlan.
 */
export type SafetyPlan = Record<PlanSection, string[]>;

export const PLAN_ITEM_MAX = 200;
export const PLAN_ITEMS_MAX = 20;

const KEY = 'safetyPlan';

export function emptyPlan(): SafetyPlan {
  return Object.fromEntries(PLAN_SECTIONS.map((section) => [section, []])) as unknown as SafetyPlan;
}

/** Запись с устройства → план. Неизвестные разделы и не строки отбрасываются, длина и число пунктов ограничены. */
export function parsePlan(value: unknown): SafetyPlan {
  const plan = emptyPlan();
  if (!value || typeof value !== 'object') return plan;
  for (const section of PLAN_SECTIONS) {
    const items: unknown = (value as Record<string, unknown>)[section];
    if (!Array.isArray(items)) continue;
    plan[section] = items
      .filter((item): item is string => typeof item === 'string')
      .map((item) => item.trim().slice(0, PLAN_ITEM_MAX))
      .filter((item) => item.length > 0)
      .slice(0, PLAN_ITEMS_MAX);
  }
  return plan;
}

/** Сколько разделов плана заполнено хотя бы одним пунктом. */
export function filledSections(plan: SafetyPlan, sections: readonly PlanSection[] = PLAN_SECTIONS): number {
  return sections.filter((section) => plan[section].length > 0).length;
}

export async function loadSafetyPlan(userId: string): Promise<SafetyPlan> {
  try {
    const raw = await AsyncStorage.getItem(userKey(userId, KEY));
    return parsePlan(raw ? JSON.parse(raw) : null);
  } catch {
    return emptyPlan();
  }
}

export async function saveSafetyPlan(userId: string, plan: SafetyPlan): Promise<void> {
  await AsyncStorage.setItem(userKey(userId, KEY), JSON.stringify(plan));
}

/** Пункты второго плана, которых нет в первом, дописываются в конец раздела. */
export function mergePlans(base: SafetyPlan, extra: SafetyPlan): SafetyPlan {
  return Object.fromEntries(
    PLAN_SECTIONS.map((section) => [
      section,
      [...base[section], ...extra[section].filter((item) => !base[section].includes(item))].slice(0, PLAN_ITEMS_MAX),
    ]),
  ) as unknown as SafetyPlan;
}

/**
 * Вход: план, составленный гостем, переходит в аккаунт. Если у аккаунта на этом устройстве уже есть план,
 * пункты гостя дописываются к нему — ни один план не теряется. Вызывается до adoptGuestData: та стирает ключи гостя.
 */
export async function adoptGuestPlan(userId: string): Promise<void> {
  if (userId === GUEST_USER_ID) return;
  const guestKey = userKey(GUEST_USER_ID, KEY);
  if ((await AsyncStorage.getItem(guestKey)) === null) return;
  const [guest, own] = await Promise.all([loadSafetyPlan(GUEST_USER_ID), loadSafetyPlan(userId)]);
  await saveSafetyPlan(userId, mergePlans(own, guest));
  await AsyncStorage.removeItem(guestKey);
}
