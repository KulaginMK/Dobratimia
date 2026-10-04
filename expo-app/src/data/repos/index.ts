import { mockPresenceRepo } from '@/data/mocks/presence';
import { mockUniversitiesRepo } from '@/data/mocks/universities';
import type { PresenceRepo } from './PresenceRepo';
import type { UniversitiesRepo } from './UniversitiesRepo';

// Экраны берут данные только отсюда. На этапе 12 моки заменятся серверными реализациями (docs/08).
export const universitiesRepo: UniversitiesRepo = mockUniversitiesRepo;
export const presenceRepo: PresenceRepo = mockPresenceRepo;

export type * from './PresenceRepo';
export type * from './UniversitiesRepo';
