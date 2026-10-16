import type { User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import type { AuthRepo, SessionUser, SignInCallback, SignedIn, UserRole } from '@/data/repos/AuthRepo';
import { OfflineError } from '@/data/repos/errors';
import { forgetSession, request, supabase } from './client';

/** Сюда Google возвращает человека после входа: экран app/auth/callback.tsx. */
export const SIGN_IN_CALLBACK_PATH = '/auth/callback';

// Сбой сети у входа Supabase помечает так (AuthRetryableFetchError); остальные ошибки — отказ сервера.
const isNetworkFailure = (error: { name?: string; status?: number } | null) =>
  error?.name === 'AuthRetryableFetchError' || error?.status === 0;

const toRole = (value: unknown): UserRole => (value === 'specialist' || value === 'admin' ? value : 'student');

/** «dobratimia://auth/callback?code=…» или «…#error=access_denied» → { code } / { error }. */
export function parseCallbackUrl(url: string): SignInCallback {
  const params = new Map<string, string>();
  for (const part of url.split(/[?#]/).slice(1)) {
    for (const pair of part.split('&')) {
      const [name, value = ''] = pair.split('=');
      if (!name) continue;
      try {
        params.set(decodeURIComponent(name), decodeURIComponent(value.replace(/\+/g, ' ')));
      } catch {
        // Испорченный кусок адреса — пропускаем.
      }
    }
  }
  return {
    code: params.get('code') || undefined,
    error: params.get('error_description') || params.get('error') || undefined,
  };
}

function displayName(user: User): string {
  const meta = user.user_metadata as { full_name?: unknown; name?: unknown } | undefined;
  const name = typeof meta?.full_name === 'string' ? meta.full_name : typeof meta?.name === 'string' ? meta.name : '';
  return name.trim() || (user.email ?? '').split('@')[0];
}

/** Роль и вуз из профиля. Заодно привязывает карточку специалиста, если почту вписал администратор. */
async function loadProfile(userId: string): Promise<{ role: UserRole; universityId: string | null }> {
  const role = toRole(await request<string>((db) => db.rpc('link_specialist')));
  const profile = await request<{ university_id: string | null } | null>((db) =>
    db.from('profiles').select('university_id').eq('id', userId).maybeSingle(),
  );
  return { role, universityId: profile?.university_id ?? null };
}

async function signedIn(user: User): Promise<SignedIn> {
  const base: SessionUser = { id: user.id, name: displayName(user), email: user.email ?? '', role: 'student' };
  try {
    const profile = await loadProfile(user.id);
    return { user: { ...base, role: profile.role }, universityId: profile.universityId };
  } catch {
    // Вход состоялся; роль и вуз уточним при следующем запуске (restore).
    return { user: base, universityId: null };
  }
}

async function finishSignIn(callback: SignInCallback): Promise<SignedIn> {
  if (callback.error) throw new Error(callback.error);
  const auth = supabase().auth;
  if (Platform.OS === 'web') {
    // В вебе Supabase сам обменивает код из адреса при запуске — дожидаемся готового входа.
    const { data, error } = await auth.getSession();
    if (error) throw isNetworkFailure(error) ? new OfflineError() : new Error(error.message);
    if (!data.session) throw new Error('Вход не состоялся');
    return signedIn(data.session.user);
  }
  if (!callback.code) throw new Error('В адресе возврата нет кода входа');
  const { data, error } = await auth.exchangeCodeForSession(callback.code);
  if (error) throw isNetworkFailure(error) ? new OfflineError() : new Error(error.message);
  return signedIn(data.session.user);
}

// Код входа одноразовый, а завершить вход могут попытаться дважды: экран входа и экран возврата.
let finishing: { key: string; result: Promise<SignedIn> } | null = null;

export const supabaseAuthRepo: AuthRepo = {
  signInWithGoogle: async () => {
    const auth = supabase().auth;
    // Веб-версия на GitHub Pages лежит в подпапке, а createURL в вебе её не добавляет. На телефоне подпапки нет.
    const redirectTo = Linking.createURL(`${process.env.EXPO_BASE_URL ?? ''}${SIGN_IN_CALLBACK_PATH}`);

    if (Platform.OS === 'web') {
      // Без сети браузер показал бы свою страницу ошибки вместо Google — говорим об этом сами.
      if (typeof navigator !== 'undefined' && navigator.onLine === false) throw new OfflineError();
      // Страница целиком уходит на Google и вернётся на /auth/callback.
      const { error } = await auth.signInWithOAuth({ provider: 'google', options: { redirectTo } });
      if (error) throw isNetworkFailure(error) ? new OfflineError() : new Error(error.message);
      return 'redirected';
    }

    // На телефоне страница Google открывается во встроенном окне браузера; так вход работает и в Expo Go.
    const { data, error } = await auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, skipBrowserRedirect: true },
    });
    if (error) throw isNetworkFailure(error) ? new OfflineError() : new Error(error.message);
    if (!data.url) throw new Error('Сервер не вернул адрес входа');

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success') return 'cancelled';
    return supabaseAuthRepo.completeSignIn(parseCallbackUrl(result.url));
  },

  completeSignIn: (callback) => {
    const key = callback.code ?? callback.error ?? '';
    if (finishing?.key === key) return finishing.result;
    const result = finishSignIn(callback);
    finishing = { key, result };
    // Неудачную попытку не запоминаем: её можно повторить.
    result.catch(() => {
      if (finishing?.result === result) finishing = null;
    });
    return result;
  },

  restore: async (user) => {
    const { data, error } = await supabase().auth.getSession();
    if (error) {
      if (isNetworkFailure(error)) throw new OfflineError();
      return null;
    }
    // Входа на сервере нет или он от другого аккаунта (на устройстве остался вход-заглушка) — выходим.
    if (!data.session || data.session.user.id !== user.id) return null;
    const profile = await loadProfile(user.id);
    return { ...user, name: displayName(data.session.user), email: data.session.user.email ?? user.email, role: profile.role };
  },

  onSignedOut: (listener) => {
    const { data } = supabase().auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') listener();
    });
    return () => data.subscription.unsubscribe();
  },

  signOut: async () => {
    try {
      const { error } = await supabase().auth.signOut({ scope: 'local' });
      if (error) await forgetSession();
    } catch {
      await forgetSession();
    }
  },

  deleteAccount: async () => {
    await request((db) => db.rpc('delete_account'));
    await forgetSession();
  },

  giveConsent: async (kind, version) => {
    await request((db) => db.rpc('give_consent', { p_kind: kind, p_version: version }));
  },

  saveUniversity: async (userId, universityId) => {
    await request((db) => db.from('profiles').update({ university_id: universityId }).eq('id', userId));
  },
};
