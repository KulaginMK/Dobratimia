// Push «Появился новый специалист» (supabase/migrations/20261017000001_push.sql). Запуск: npm run test:db.
// Запросы к Expo Push здесь не уходят: заглушка net.http_post складывает их в net.sent.
import assert from 'node:assert/strict';
import { before, beforeEach, describe, test } from 'node:test';
import { OLGA, as, asOwner, createDatabase, createUser } from './harness.mjs';

const DENIED = /permission denied/;
const tokenOf = (n) => `ExponentPushToken[test-${n}]`;
const register = (db, user, token) => as(db, user, (q) => q('select register_push_token($1)', [token]));
const tokens = (db) => asOwner(db, 'select token, user_id from push_tokens order by token');
const sent = (db) => asOwner(db, 'select url, body, headers from net.sent');
const newCard = (db, published) =>
  asOwner(
    db,
    `insert into specialists (first_name, last_name, name_dative, title, published)
     values ('Инна', 'Котова', 'Инне Котовой', 'Психолог', $1) returning id`,
    [published],
  ).then(([row]) => row.id);

describe('push о новом специалисте', () => {
  let db;
  let anna;
  let boris;
  before(async () => {
    db = await createDatabase();
    anna = await createUser(db, 'anna@example.com', 'Анна');
    boris = await createUser(db, 'boris@example.com', 'Борис');
  });
  beforeEach(async () => {
    await db.exec('delete from push_tokens; delete from net.sent; delete from vault.decrypted_secrets');
  });

  test('токен сохраняет только вошедший, а прочитать или поменять таблицу из приложения нельзя', async () => {
    await assert.rejects(register(db, null, tokenOf(1)), DENIED);
    await register(db, anna, tokenOf(1));
    assert.deepEqual(await tokens(db), [{ token: tokenOf(1), user_id: anna }]);

    for (const user of [anna, null]) {
      await assert.rejects(as(db, user, (q) => q('select * from push_tokens')), DENIED);
      await assert.rejects(
        as(db, user, (q) => q('insert into push_tokens (token, user_id) values ($1, $2)', [tokenOf(2), anna])),
        DENIED,
      );
    }
  });

  test('принимаются только токены Expo Push', async () => {
    for (const bad of ['', 'abc', 'ExponentPushToken[]', 'ExponentPushToken[a b]', `ExponentPushToken[${'x'.repeat(200)}]`]) {
      await assert.rejects(register(db, anna, bad), /push_tokens_token_check/, bad);
    }
    await register(db, anna, 'ExpoPushToken[xXx_1-2]');
  });

  test('тот же телефон с другим аккаунтом — токен переходит; у аккаунта не больше пяти телефонов', async () => {
    await register(db, anna, tokenOf(1));
    await register(db, boris, tokenOf(1));
    assert.deepEqual(await tokens(db), [{ token: tokenOf(1), user_id: boris }]);

    // Пять телефонов, подключённых в разные дни: второй — самый старый.
    await asOwner(
      db,
      `insert into push_tokens (token, user_id, created_at)
       select 'ExponentPushToken[test-' || n || ']', $1, now() - (10 - n) * interval '1 day' from generate_series(2, 6) n`,
      [anna],
    );
    await register(db, anna, tokenOf(7));
    const annas = (await tokens(db)).filter((row) => row.user_id === anna).map((row) => row.token);
    assert.deepEqual(annas, [3, 4, 5, 6, 7].map(tokenOf));
  });

  test('удалить можно только свой токен; удаление аккаунта удаляет и токены', async () => {
    await register(db, anna, tokenOf(1));
    await register(db, boris, tokenOf(2));
    await as(db, boris, (q) => q('select unregister_push_token($1)', [tokenOf(1)]));
    await as(db, boris, (q) => q('select unregister_push_token($1)', [tokenOf(2)]));
    assert.deepEqual(await tokens(db), [{ token: tokenOf(1), user_id: anna }]);

    const carl = await createUser(db, 'carl@example.com', 'Карл');
    await register(db, carl, tokenOf(3));
    await as(db, carl, (q) => q('select delete_account()'));
    assert.deepEqual(await tokens(db), [{ token: tokenOf(1), user_id: anna }]);
  });

  test('первая публикация карточки рассылает push всем токенам — один раз', async () => {
    await register(db, anna, tokenOf(1));
    await register(db, boris, tokenOf(2));
    await asOwner(db, "insert into vault.decrypted_secrets values ('expo_access_token', 'secret')");

    const id = await newCard(db, false);
    assert.deepEqual(await sent(db), [], 'черновая карточка не объявляется');

    await asOwner(db, 'update specialists set published = true where id = $1', [id]);
    const [request] = await sent(db);
    assert.equal(request.url, 'https://exp.host/--/api/v2/push/send');
    assert.equal(request.headers.Authorization, 'Bearer secret');
    assert.deepEqual(
      request.body.map((message) => message.to),
      [tokenOf(1), tokenOf(2)],
    );
    assert.deepEqual(request.body[0], {
      to: tokenOf(1),
      title: 'Появился новый специалист',
      body: 'Инна Котова, психолог. Карточка уже в подборе.',
      data: { url: '/?s=match' },
      channelId: 'specialists',
      sound: 'default',
    });

    // Сняли с публикации и вернули — второй раз не объявляется.
    await asOwner(db, 'update specialists set published = false where id = $1', [id]);
    await asOwner(db, 'update specialists set published = true where id = $1', [id]);
    assert.equal((await sent(db)).length, 1);
  });

  test('карточка, опубликованная сразу, тоже объявляется; уже опубликованные — нет', async () => {
    await register(db, anna, tokenOf(1));
    await newCard(db, true);
    await asOwner(db, "update specialists set published = true, about = 'Новое' where id = $1", [OLGA]);
    const all = await sent(db);
    assert.equal(all.length, 1);
    assert.equal(all[0].headers.Authorization, undefined, 'без токена доступа в Vault заголовка нет');
  });

  test('больше ста токенов — несколько запросов по сто', async () => {
    await asOwner(
      db,
      `insert into push_tokens (token, user_id)
       select 'ExponentPushToken[bulk-' || lpad(n::text, 3, '0') || ']', $1 from generate_series(1, 201) n`,
      [anna],
    );
    await newCard(db, true);
    assert.deepEqual((await sent(db)).map((request) => request.body.length).sort(), [1, 100, 100]);
  });

  test('если отправить не удалось, карточка всё равно публикуется', async () => {
    await register(db, anna, tokenOf(1));
    await asOwner(db, 'alter function net.http_post rename to http_post_ok');
    try {
      const id = await newCard(db, false);
      await asOwner(db, 'update specialists set published = true where id = $1', [id]);
      const [card] = await asOwner(db, 'select published, announced_at from specialists where id = $1', [id]);
      assert.equal(card.published, true);
      assert.ok(card.announced_at);
    } finally {
      await asOwner(db, 'alter function net.http_post_ok rename to http_post');
    }
  });
});
