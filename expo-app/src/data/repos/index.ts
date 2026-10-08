import { userKey } from '@/data/local/session';
import { mockPhrasesRepo } from '@/data/mocks/phrases';
import { mockPresenceRepo } from '@/data/mocks/presence';
import { mockCabinetRepo, mockLikesRepo, mockSpecialistsRepo } from '@/data/mocks/specialists';
import { mockUniversitiesRepo } from '@/data/mocks/universities';
import { mockAuthRepo } from '@/data/mocks/user';
import { supabaseAuthRepo } from '@/data/supabase/auth';
import { supabaseCabinetRepo } from '@/data/supabase/cabinet';
import { SUPABASE_CONFIGURED } from '@/data/supabase/config';
import { supabasePhrasesRepo } from '@/data/supabase/phrases';
import { supabasePresenceRepo } from '@/data/supabase/presence';
import { supabaseLikesRemote, supabaseSpecialistsRepo } from '@/data/supabase/specialists';
import { fetchUniversities } from '@/data/supabase/universities';
import { createSyncedSet } from '@/data/sync/syncedSet';
import type { AuthRepo } from './AuthRepo';
import type { CabinetRepo } from './CabinetRepo';
import type { LikesRepo } from './LikesRepo';
import type { PhrasesRepo } from './PhrasesRepo';
import type { PresenceRepo } from './PresenceRepo';
import type { SpecialistsRepo } from './SpecialistsRepo';
import type { UniversitiesRepo } from './UniversitiesRepo';

// Экраны берут данные только отсюда и о сервере не знают (docs/08).
// Сервер подключён, если в expo-app/.env.local вписаны адрес и ключ проекта Supabase; иначе работают заглушки.

// Отметка «Нравится», поставленная без сети, ждёт в очереди на устройстве и уходит на сервер позже.
const likes = createSyncedSet((userId) => userKey(userId, 'likes'), supabaseLikesRemote);
const supabaseLikesRepo: LikesRepo = {
  list: likes.list,
  add: (userId, specialistId) => likes.set(userId, specialistId, true),
  remove: (userId, specialistId) => likes.set(userId, specialistId, false),
  flush: likes.flush,
};

// Вузы зашиты в приложение (SOS работает без сети) и обновляются с сервера.
const supabaseUniversitiesRepo: UniversitiesRepo = { ...mockUniversitiesRepo, fresh: fetchUniversities };

export const universitiesRepo: UniversitiesRepo = SUPABASE_CONFIGURED ? supabaseUniversitiesRepo : mockUniversitiesRepo;
export const presenceRepo: PresenceRepo = SUPABASE_CONFIGURED ? supabasePresenceRepo : mockPresenceRepo;
export const specialistsRepo: SpecialistsRepo = SUPABASE_CONFIGURED ? supabaseSpecialistsRepo : mockSpecialistsRepo;
export const likesRepo: LikesRepo = SUPABASE_CONFIGURED ? supabaseLikesRepo : mockLikesRepo;
export const phrasesRepo: PhrasesRepo = SUPABASE_CONFIGURED ? supabasePhrasesRepo : mockPhrasesRepo;
export const authRepo: AuthRepo = SUPABASE_CONFIGURED ? supabaseAuthRepo : mockAuthRepo;
export const cabinetRepo: CabinetRepo = SUPABASE_CONFIGURED ? supabaseCabinetRepo : mockCabinetRepo;

export * from './errors';
export type * from './AuthRepo';
export type * from './CabinetRepo';
export type * from './LikesRepo';
export type * from './PhrasesRepo';
export type * from './PresenceRepo';
export type * from './SpecialistsRepo';
export type * from './UniversitiesRepo';
