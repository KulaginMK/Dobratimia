import { mockPhrasesRepo } from '@/data/mocks/phrases';
import { mockPresenceRepo } from '@/data/mocks/presence';
import { mockLikesRepo, mockSpecialistsRepo } from '@/data/mocks/specialists';
import { mockUniversitiesRepo } from '@/data/mocks/universities';
import type { LikesRepo } from './LikesRepo';
import type { PhrasesRepo } from './PhrasesRepo';
import type { PresenceRepo } from './PresenceRepo';
import type { SpecialistsRepo } from './SpecialistsRepo';
import type { UniversitiesRepo } from './UniversitiesRepo';

// Экраны берут данные только отсюда. На этапе 12 моки заменятся серверными реализациями (docs/08).
export const universitiesRepo: UniversitiesRepo = mockUniversitiesRepo;
export const presenceRepo: PresenceRepo = mockPresenceRepo;
export const specialistsRepo: SpecialistsRepo = mockSpecialistsRepo;
export const likesRepo: LikesRepo = mockLikesRepo;
export const phrasesRepo: PhrasesRepo = mockPhrasesRepo;

export type * from './LikesRepo';
export type * from './PhrasesRepo';
export type * from './PresenceRepo';
export type * from './SpecialistsRepo';
export type * from './UniversitiesRepo';
