import { mockUniversitiesRepo } from '@/data/mocks/universities';
import type { UniversitiesRepo } from './UniversitiesRepo';

// Экраны берут данные только отсюда. На этапе 12 моки заменятся серверными реализациями (docs/08).
export const universitiesRepo: UniversitiesRepo = mockUniversitiesRepo;

export type * from './UniversitiesRepo';
