import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { digest, getRandomValues, type CryptoDigestAlgorithm } from 'expo-crypto';
import { AppState, Platform } from 'react-native';
import { OfflineError } from '@/data/repos/errors';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config';

// На телефоне нет встроенного WebCrypto. Без него supabase-js защищает вход слабее:
// проверочную строку берёт из Math.random и отправляет её без хэша. В вебе crypto даёт браузер.
if (Platform.OS !== 'web' && typeof globalThis.crypto?.subtle === 'undefined') {
  globalThis.crypto = {
    ...globalThis.crypto,
    getRandomValues,
    subtle: { digest: (algorithm: string, data: BufferSource) => digest(algorithm as CryptoDigestAlgorithm, data) },
  } as unknown as Crypto;
}

// Общий ключ с префиксом app: — «Удалить мои данные» стирает и сохранённый вход (src/data/local/session.ts).
export const AUTH_STORAGE_KEY = 'app:supabase-auth';

let client: SupabaseClient | null = null;

/** Клиент Supabase. Создаётся при первом обращении; вызывать только если SUPABASE_CONFIGURED. */
export function supabase(): SupabaseClient {
  if (client) return client;
  const created = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    // Без скрытых повторов: иначе при пропавшей сети экран несколько секунд молчит.
    // Человеку сразу говорим «Нет интернета» и даём «Повторить», а отметки ждут в очереди.
    db: { retry: false },
    auth: {
      storage: AsyncStorage,
      storageKey: AUTH_STORAGE_KEY,
      persistSession: true,
      autoRefreshToken: true,
      // PKCE: после входа в адрес возвращается одноразовый код, а не сами ключи доступа.
      flowType: 'pkce',
      // В вебе Supabase сам забирает код из адреса после возврата от Google; на телефоне это делает экран /auth/callback.
      detectSessionInUrl: Platform.OS === 'web',
    },
  });
  // На телефоне обновлять вход имеет смысл, только пока приложение на экране.
  if (Platform.OS !== 'web') {
    AppState.addEventListener('change', (state) => {
      if (state === 'active') created.auth.startAutoRefresh();
      else created.auth.stopAutoRefresh();
    });
  }
  client = created;
  return created;
}

/** Забыть вход на устройстве, даже если сервер недоступен: «Выйти из аккаунта» работает и без сети. */
export async function forgetSession(): Promise<void> {
  client = null;
  await AsyncStorage.multiRemove([AUTH_STORAGE_KEY, `${AUTH_STORAGE_KEY}-code-verifier`]);
}

type Result<T> = { data: T | null; error: { message: string; code?: string } | null; status?: number };

/**
 * Достаёт данные из ответа Supabase. Статус 0 — запрос не дошёл до сервера, 5xx — сервер сбоит:
 * это OfflineError, действие можно повторить, а отметка остаётся в очереди. Остальные ошибки — отказ сервера.
 */
export function unwrap<T>(result: Result<T>): T {
  if (result.error) {
    // ponytail: отметка, на которую сервер всегда отвечает 5xx, останется первой в очереди и задержит остальные.
    // Если такое встретится — считать попытки и после нескольких убирать её из очереди.
    if (result.status === 0 || (result.status ?? 0) >= 500) throw new OfflineError();
    throw Object.assign(new Error(result.error.message), { code: result.error.code });
  }
  return result.data as T;
}

/** Запрос к Supabase, у которого сетевой сбой превращается в OfflineError, а не в необработанное исключение. */
export async function request<T>(run: (db: SupabaseClient) => PromiseLike<Result<T>>): Promise<T> {
  let result: Result<T>;
  try {
    result = await run(supabase());
  } catch {
    throw new OfflineError();
  }
  return unwrap(result);
}
