// specialists.sql: настоящие специалисты вместо вымышленных, аккаунт владельца — на карточке Тимки.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OLGA, asOwner, createDatabase, readSql } from './harness.mjs';

const TIMKA = 'b0000000-0000-4000-8000-000000000100';

test('specialists.sql заменяет вымышленных и переносит аккаунт владельца на Тимку', async () => {
  const db = await createDatabase();
  await asOwner(db, 'insert into specialist_accounts (specialist_id, email) values ($1, $2)', [OLGA, 'owner@example.com']);

  await db.exec(readSql('specialists.sql'));
  // Повторный запуск ничего не ломает.
  await db.exec(readSql('specialists.sql'));

  const [{ count }] = await asOwner(db, 'select count(*)::int as count from specialists where published');
  assert.equal(count, 12);
  assert.deepEqual(await asOwner(db, "select id from specialists where id::text like 'd0000000%'"), []);
  const [account] = await asOwner(db, 'select specialist_id from specialist_accounts');
  assert.equal(account.specialist_id, TIMKA);
});
