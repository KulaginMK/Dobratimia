// Собирает supabase/setup.sql — один файл, который владелец вставляет в SQL Editor нового проекта Supabase:
// все миграции по порядку и справочник вузов. Запуск: npm run db:bundle.
import { readFileSync, writeFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SUPABASE_DIR, migrationFiles, readSql } from './harness.mjs';

const HEADER = `-- «Добратимия»: вся база одним файлом — таблицы, правила доступа, функции и справочник вузов.
-- Файл собран автоматически из supabase/migrations и supabase/seed.sql (npm run db:bundle) — руками не править.
-- Вставьте его целиком в SQL Editor нового проекта Supabase и нажмите Run. Запускать один раз.
`;

export function buildSetupSql() {
  const parts = migrationFiles().map(
    (file) => `-- ===== ${basename(file)} =====\n\n${readFileSync(file, 'utf8').trim()}\n`,
  );
  parts.push(`-- ===== seed.sql =====\n\n${readSql('seed.sql').trim()}\n`);
  return `${HEADER}\n${parts.join('\n')}`;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  writeFileSync(join(SUPABASE_DIR, 'setup.sql'), buildSetupSql());
  console.log('supabase/setup.sql обновлён');
}
