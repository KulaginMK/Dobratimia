import type { Specialist } from '@/data/repos';

/** Число из строки: одна и та же строка всегда даёт одно и то же число. */
function hash(text: string): number {
  let value = 2166136261;
  for (let i = 0; i < text.length; i++) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

/** 0 — принимает очно в городе вуза пользователя; 1 — онлайн; 2 — только очно в другом городе. */
function group(specialist: Specialist, city: string | null): number {
  if (city && specialist.formatOffline && specialist.city === city) return 0;
  return specialist.formatOnline ? 1 : 2;
}

/**
 * Порядок колоды подбора (docs/07): сначала те, кто принимает очно в городе вуза пользователя, затем онлайн.
 * Внутри группы порядок случайный, но в пределах одного дня не меняется.
 */
export function deckOrder(specialists: Specialist[], city: string | null, dayKey: string): Specialist[] {
  return [...specialists].sort(
    (a, b) => group(a, city) - group(b, city) || hash(`${dayKey}:${a.id}`) - hash(`${dayKey}:${b.id}`),
  );
}
