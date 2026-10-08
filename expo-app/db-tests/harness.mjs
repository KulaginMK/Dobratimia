// Тесты базы идут на PGlite — настоящем Postgres, собранном для Node: ни Docker, ни установленной базы не нужно.
// Здесь воспроизводится то, что в проекте Supabase уже есть до наших миграций: роли, схемы auth и storage и права по умолчанию.
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

export const SUPABASE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'supabase');

const SUPABASE_BASELINE = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;

  create schema auth;
  create table auth.users (
    id uuid primary key default gen_random_uuid(),
    email text,
    email_confirmed_at timestamptz default now(),
    raw_user_meta_data jsonb not null default '{}'
  );
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
  $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;

  -- Хранилище файлов: в Supabase эти таблицы уже есть, права ролям выданы, доступ решает RLS.
  create schema storage;
  create table storage.buckets (
    id text primary key,
    name text not null,
    public boolean default false,
    file_size_limit bigint,
    allowed_mime_types text[]
  );
  create table storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text references storage.buckets (id),
    name text
  );
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable as $$
    select (string_to_array(name, '/'))[1 : array_length(string_to_array(name, '/'), 1) - 1];
  $$;
  grant usage on schema storage to anon, authenticated, service_role;
  grant all on storage.objects to anon, authenticated, service_role;
  grant execute on function storage.foldername(text) to anon, authenticated, service_role;

  -- Supabase по умолчанию выдаёт ролям приложения все права на новые объекты схемы public
  -- и рассчитывает на RLS. Миграции должны быть безопасны именно при таких умолчаниях.
  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`;

export function migrationFiles() {
  const dir = join(SUPABASE_DIR, 'migrations');
  return readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => join(dir, name));
}

export const readSql = (...parts) => readFileSync(join(SUPABASE_DIR, ...parts), 'utf8');

/** Чистая база с миграциями, справочником вузов и вымышленными данными из demo.sql. */
export async function createDatabase() {
  const db = new PGlite();
  await db.exec(SUPABASE_BASELINE);
  for (const file of migrationFiles()) await db.exec(readFileSync(file, 'utf8'));
  await db.exec(readSql('seed.sql'));
  await db.exec(readSql('demo.sql'));
  return db;
}

/** Новый аккаунт, как после входа через Google. Возвращает id. */
export async function createUser(db, email, name = 'Тест') {
  const { rows } = await db.query(
    'insert into auth.users (email, raw_user_meta_data) values ($1, $2) returning id',
    [email, JSON.stringify({ full_name: name })],
  );
  return rows[0].id;
}

/**
 * Выполнить запросы от имени пользователя приложения: userId — вошедший (роль authenticated),
 * null — человек без входа (роль anon). Так запросы приходят в базу из приложения.
 */
export async function as(db, userId, run) {
  await db.exec(`set role ${userId ? 'authenticated' : 'anon'}`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId ?? '']);
  try {
    return await run((sql, params) => db.query(sql, params).then((result) => result.rows));
  } finally {
    await db.exec("reset role; select set_config('request.jwt.claim.sub', '', false);");
  }
}

/** Запрос от имени владельца базы — так работает администратор в Supabase Studio. */
export const asOwner = (db, sql, params) => db.query(sql, params).then((result) => result.rows);

export const OLGA = 'd0000000-0000-4000-8000-000000000001';
export const DMITRY = 'd0000000-0000-4000-8000-000000000002';
export const PHRASE = 'd0000000-0000-4000-8000-000000000201';
