import AsyncStorage from '@react-native-async-storage/async-storage';
import { PLAN_SECTIONS, type PlanSection } from '@/data/safetyPlan';
import { userKey } from './session';

/**
 * План на трудный момент: по разделу — пункты своими словами. Хранится только на устройстве (docs/08:
 * чувствительное не уходит на сервер) и стирается вместе с остальным по «Удалить мои данные» (ключ user:<id>:).
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
