import type { PushRepo } from '@/data/repos/PushRepo';
import { request } from './client';

export const supabasePushRepo: PushRepo = {
  subscribe: (token) => request((db) => db.rpc('register_push_token', { p_token: token })),
  unsubscribe: (token) => request((db) => db.rpc('unregister_push_token', { p_token: token })),
};
