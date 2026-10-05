// Адрес проекта Supabase и его открытый ключ. Лежат в expo-app/.env.local (образец — .env.example).
// Оба значения не секретные: они попадают в приложение, а данные защищают правила доступа в базе.
// Имена переменных Expo подставляет при сборке, поэтому обращаться к ним можно только так, целиком.
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** false — сервер не подключён: приложение работает на заглушках из src/data/mocks. */
export const SUPABASE_CONFIGURED = SUPABASE_URL !== '' && SUPABASE_ANON_KEY !== '';
