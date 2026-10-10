// Правила доступа к базе (handoff/docs/08-data-and-backend.md). Запуск: npm run test:db.
// Главное обещание: контакты специалиста сервер отдаёт только тому, кто отметил его «Нравится».
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { before, describe, test } from 'node:test';
import { buildSetupSql } from './bundle.mjs';
import { DMITRY, OLGA, PHRASE, SUPABASE_DIR, as, asOwner, createDatabase, createUser } from './harness.mjs';

const DENIED = /permission denied/;
const contactsOf = (q, specialistId) =>
  q('select phone, telegram, booking_url from specialist_contacts where specialist_id = $1', [specialistId]);

describe('контакты специалиста', () => {
  let db;
  let anna;
  let boris;
  before(async () => {
    db = await createDatabase();
    anna = await createUser(db, 'anna@example.com', 'Анна Кравец');
    boris = await createUser(db, 'boris@example.com', 'Борис');
  });

  test('без отметки «Нравится» не читаются', async () => {
    assert.deepEqual(await as(db, anna, (q) => contactsOf(q, OLGA)), []);
    assert.deepEqual(await as(db, anna, (q) => q('select * from specialist_contacts')), []);
  });

  test('открываются после отметки — и только отметившему', async () => {
    await as(db, anna, (q) => q('insert into likes (user_id, specialist_id) values ($1, $2)', [anna, OLGA]));

    const [contacts] = await as(db, anna, (q) => contactsOf(q, OLGA));
    assert.equal(contacts.phone, '+375 29 555-12-34');
    assert.equal(contacts.telegram, '@miroshnik_psy');

    // Отметка открывает контакты одного специалиста, а не всех.
    assert.deepEqual(await as(db, anna, (q) => contactsOf(q, DMITRY)), []);
    // Другому человеку чужая отметка ничего не открывает.
    assert.deepEqual(await as(db, boris, (q) => contactsOf(q, OLGA)), []);
  });

  test('снова закрываются, когда отметка снята', async () => {
    await as(db, anna, (q) => q('delete from likes where specialist_id = $1', [OLGA]));
    assert.deepEqual(await as(db, anna, (q) => contactsOf(q, OLGA)), []);
  });

  test('не отдаются без согласия специалиста на публикацию', async () => {
    await as(db, anna, (q) => q('insert into likes (user_id, specialist_id) values ($1, $2)', [anna, DMITRY]));
    assert.equal((await as(db, anna, (q) => contactsOf(q, DMITRY))).length, 1);

    await asOwner(db, 'update specialist_contacts set consent = false where specialist_id = $1', [DMITRY]);
    assert.deepEqual(await as(db, anna, (q) => contactsOf(q, DMITRY)), []);
    await asOwner(db, 'update specialist_contacts set consent = true where specialist_id = $1', [DMITRY]);
  });

  test('не отдаются, если карточку сняли с публикации', async () => {
    await asOwner(db, 'update specialists set published = false where id = $1', [DMITRY]);
    assert.deepEqual(await as(db, anna, (q) => contactsOf(q, DMITRY)), []);
    await asOwner(db, 'update specialists set published = true where id = $1', [DMITRY]);
  });

  test('без входа недоступны совсем', async () => {
    await assert.rejects(as(db, null, (q) => q('select * from specialist_contacts')), DENIED);
    await assert.rejects(as(db, null, (q) => q('select * from specialists')), DENIED);
  });

  test('студент не может изменить контакты и карточку', async () => {
    await assert.rejects(as(db, anna, (q) => q("update specialist_contacts set phone = '1'")), DENIED);
    await assert.rejects(as(db, anna, (q) => q("update specialists set first_name = 'X'")), DENIED);
    await assert.rejects(as(db, anna, (q) => q('delete from specialists')), DENIED);
  });
});

describe('отметки «Нравится»', () => {
  let db;
  let anna;
  let boris;
  let olgaUser;
  before(async () => {
    db = await createDatabase();
    anna = await createUser(db, 'anna@example.com');
    boris = await createUser(db, 'boris@example.com');
    olgaUser = await createUser(db, 'olga@example.com', 'Ольга Мирошник');
    await asOwner(db, 'insert into specialist_accounts (specialist_id, email) values ($1, $2)', [
      OLGA,
      'Olga@Example.com',
    ]);
    await as(db, anna, (q) => q('insert into likes (user_id, specialist_id) values ($1, $2)', [anna, OLGA]));
    await as(db, boris, (q) => q('insert into likes (user_id, specialist_id) values ($1, $2)', [boris, OLGA]));
  });

  test('человек видит только свои отметки', async () => {
    const mine = await as(db, anna, (q) => q('select user_id, specialist_id from likes'));
    assert.deepEqual(mine, [{ user_id: anna, specialist_id: OLGA }]);
  });

  test('нельзя поставить отметку от чужого имени', async () => {
    await assert.rejects(
      as(db, anna, (q) => q('insert into likes (user_id, specialist_id) values ($1, $2)', [boris, DMITRY])),
      /row-level security/,
    );
  });

  test('нельзя отметить неопубликованную карточку', async () => {
    await asOwner(db, 'update specialists set published = false where id = $1', [DMITRY]);
    await assert.rejects(
      as(db, anna, (q) => q('insert into likes (user_id, specialist_id) values ($1, $2)', [anna, DMITRY])),
      /row-level security/,
    );
    await asOwner(db, 'update specialists set published = true where id = $1', [DMITRY]);
  });

  test('чужую отметку нельзя снять, свою нельзя переписать', async () => {
    await as(db, anna, (q) => q('delete from likes where user_id = $1', [boris]));
    assert.equal((await asOwner(db, 'select count(*)::int as n from likes'))[0].n, 2);
    await assert.rejects(as(db, anna, (q) => q('update likes set created_at = now()')), DENIED);
  });

  test('почта специалиста студентам не видна', async () => {
    assert.deepEqual(await as(db, anna, (q) => q('select * from specialist_accounts')), []);
  });

  test('вход специалиста привязывает карточку и даёт роль', async () => {
    assert.equal((await as(db, anna, (q) => q('select link_specialist() as role')))[0].role, 'student');
    // Почта сравнивается без учёта регистра.
    assert.equal((await as(db, olgaUser, (q) => q('select link_specialist() as role')))[0].role, 'specialist');

    const [account] = await as(db, olgaUser, (q) => q('select specialist_id, user_id from specialist_accounts'));
    assert.deepEqual(account, { specialist_id: OLGA, user_id: olgaUser });
  });

  test('специалист видит число отметок, но не тех, кто их поставил', async () => {
    assert.deepEqual(await as(db, olgaUser, (q) => q('select * from likes')), []);

    const [{ stats }] = await as(db, olgaUser, (q) => q('select specialist_like_stats() as stats'));
    assert.equal(stats.total, 2);
    assert.equal(stats.last7days, 2);
    assert.equal(stats.weeks.length, 8);
    assert.equal(stats.weeks[7], 2);
    assert.deepEqual(stats.weeks.slice(0, 7), [0, 0, 0, 0, 0, 0, 0]);
  });

  test('статистика считает по неделям и не достаётся студенту', async () => {
    await asOwner(db, "update likes set created_at = now() - interval '15 days' where user_id = $1", [boris]);
    const [{ stats }] = await as(db, olgaUser, (q) => q('select specialist_like_stats() as stats'));
    assert.equal(stats.total, 2);
    assert.equal(stats.last7days, 1);
    assert.equal(stats.weeks[7], 1);
    assert.equal(
      stats.weeks.reduce((sum, n) => sum + n, 0),
      2,
    );

    await assert.rejects(as(db, anna, (q) => q('select specialist_like_stats()')), /только специалисту/);
  });

  test('если администратор убрал связь, кабинет закрывается', async () => {
    await asOwner(db, 'delete from specialist_accounts where specialist_id = $1', [OLGA]);
    assert.equal((await as(db, olgaUser, (q) => q('select link_specialist() as role')))[0].role, 'student');
  });
});

describe('профиль', () => {
  let db;
  let anna;
  let boris;
  before(async () => {
    db = await createDatabase();
    anna = await createUser(db, 'anna@example.com', 'Анна Кравец');
    boris = await createUser(db, 'boris@example.com', 'Борис');
  });

  test('создаётся вместе с аккаунтом, имя — из Google', async () => {
    const [profile] = await as(db, anna, (q) => q('select id, display_name, role, university_id from profiles'));
    assert.deepEqual(profile, { id: anna, display_name: 'Анна Кравец', role: 'student', university_id: null });
  });

  test('человек читает только свой профиль', async () => {
    assert.equal((await as(db, anna, (q) => q('select id from profiles'))).length, 1);
  });

  test('можно сменить вуз, но не роль', async () => {
    await as(db, anna, (q) => q("update profiles set university_id = 'vsmu' where id = $1", [anna]));
    assert.equal((await as(db, anna, (q) => q('select university_id from profiles')))[0].university_id, 'vsmu');

    await assert.rejects(as(db, anna, (q) => q("update profiles set role = 'admin' where id = $1", [anna])), DENIED);
  });

  test('чужой профиль не меняется', async () => {
    await as(db, anna, (q) => q("update profiles set university_id = 'bsmu' where id = $1", [boris]));
    const [profile] = await asOwner(db, 'select university_id from profiles where id = $1', [boris]);
    assert.equal(profile.university_id, null);
  });

  test('«Удалить мои данные» удаляет аккаунт и всё, что с ним связано', async () => {
    await as(db, boris, async (q) => {
      await q('insert into likes (user_id, specialist_id) values ($1, $2)', [boris, OLGA]);
      await q('insert into phrase_likes (user_id, phrase_id) values ($1, $2)', [boris, PHRASE]);
      await q('select mark_presence()');
    });

    await as(db, boris, (q) => q('select delete_account()'));

    for (const table of ['auth.users', 'profiles']) {
      assert.deepEqual(await asOwner(db, `select 1 from ${table} where id = $1`, [boris]), [], table);
    }
    for (const table of ['likes', 'phrase_likes', 'daily_presence']) {
      assert.deepEqual(await asOwner(db, `select 1 from ${table} where user_id = $1`, [boris]), [], table);
    }
    // Чужой аккаунт на месте.
    assert.equal((await asOwner(db, 'select 1 from auth.users where id = $1', [anna])).length, 1);
  });
});

describe('справочники и фразы', () => {
  let db;
  let anna;
  let boris;
  before(async () => {
    db = await createDatabase();
    anna = await createUser(db, 'anna@example.com');
    boris = await createUser(db, 'boris@example.com');
  });

  test('вузы и сотрудники служб читаются без входа — они нужны SOS', async () => {
    const universities = await as(db, null, (q) => q('select id from universities order by sort_order'));
    assert.deepEqual(
      universities.map((u) => u.id),
      ['vsmu', 'bsmu', 'grsmu', 'gomsmu', 'other'],
    );
    assert.equal((await as(db, null, (q) => q('select name from university_staff'))).length, 2);
    await assert.rejects(as(db, null, (q) => q("update universities set service_phone = '1'")), DENIED);
    await assert.rejects(as(db, anna, (q) => q("update universities set service_phone = '1'")), DENIED);
  });

  test('фразы читают только вошедшие и только опубликованные', async () => {
    await assert.rejects(as(db, null, (q) => q('select * from phrases')), DENIED);
    assert.equal((await as(db, anna, (q) => q('select id from phrases'))).length, 6);

    await asOwner(db, 'update phrases set published = false where id = $1', [PHRASE]);
    assert.equal((await as(db, anna, (q) => q('select id from phrases'))).length, 5);
    await asOwner(db, 'update phrases set published = true where id = $1', [PHRASE]);
  });

  test('сердечко фразе — только своё, а число сердечек видит только команда', async () => {
    await as(db, anna, (q) => q('insert into phrase_likes (user_id, phrase_id) values ($1, $2)', [anna, PHRASE]));
    await as(db, boris, (q) => q('insert into phrase_likes (user_id, phrase_id) values ($1, $2)', [boris, PHRASE]));

    assert.deepEqual(await as(db, anna, (q) => q('select user_id from phrase_likes')), [{ user_id: anna }]);
    await assert.rejects(
      as(db, anna, (q) => q('insert into phrase_likes (user_id, phrase_id) values ($1, $2)', [boris, PHRASE])),
      /row-level security|duplicate key/,
    );
    await assert.rejects(as(db, anna, (q) => q('select * from phrase_like_stats')), DENIED);
    await assert.rejects(as(db, null, (q) => q('select * from phrase_like_stats')), DENIED);

    const [top] = await asOwner(db, 'select id, likes::int as likes from phrase_like_stats limit 1');
    assert.deepEqual(top, { id: PHRASE, likes: 2 });
  });

  test('«Сегодня вы не одни» считает разных людей и не открывает, кто был', async () => {
    await as(db, anna, (q) => q('select mark_presence()'));
    await as(db, anna, (q) => q('select mark_presence()'));
    await as(db, boris, (q) => q('select mark_presence()'));

    assert.equal((await as(db, anna, (q) => q('select today_count() as n')))[0].n, 2);
    await assert.rejects(as(db, anna, (q) => q('select * from daily_presence')), DENIED);
    await assert.rejects(as(db, null, (q) => q('select today_count()')), DENIED);
    await assert.rejects(as(db, null, (q) => q('select mark_presence()')), DENIED);
  });

  test('старые отметки «был сегодня» удаляются', async () => {
    await asOwner(db, "insert into daily_presence (day, user_id) values (current_date - 10, $1)", [anna]);
    await as(db, boris, (q) => q('select mark_presence()'));
    assert.deepEqual(await asOwner(db, 'select 1 from daily_presence where day < current_date - 3'), []);
  });
});

describe('черновик карточки специалиста', () => {
  let db;
  let anna;
  let olgaUser;
  let admin;
  const draft = {
    quote: 'Новая цитата',
    specializations: ['Тревога', 'Сон'],
    phone: '+375 29 555-12-34',
    telegram: null,
    consent: false,
  };
  before(async () => {
    db = await createDatabase();
    anna = await createUser(db, 'anna@example.com');
    olgaUser = await createUser(db, 'olga@example.com');
    admin = await createUser(db, 'admin@example.com');
    await asOwner(db, "update profiles set role = 'admin' where id = $1", [admin]);
    await asOwner(db, 'insert into specialist_accounts (specialist_id, email) values ($1, $2)', [
      OLGA,
      'olga@example.com',
    ]);
    await as(db, olgaUser, (q) => q('select link_specialist()'));
  });

  test('отправить черновик может только специалист, и только через submit_draft', async () => {
    await assert.rejects(as(db, anna, (q) => q('select submit_draft($1)', [draft])), /только специалист/);
    await assert.rejects(
      as(db, olgaUser, (q) => q('insert into specialist_drafts (specialist_id, payload) values ($1, $2)', [OLGA, draft])),
      DENIED,
    );

    await as(db, olgaUser, (q) => q('select submit_draft($1)', [draft]));
    const [mine] = await as(db, olgaUser, (q) => q('select specialist_id, status from specialist_drafts'));
    assert.deepEqual(mine, { specialist_id: OLGA, status: 'pending' });
    assert.deepEqual(await as(db, anna, (q) => q('select * from specialist_drafts')), []);
  });

  test('пока черновик не одобрен, студенты видят прежнюю карточку', async () => {
    const [card] = await as(db, anna, (q) => q('select quote from specialists where id = $1', [OLGA]));
    assert.match(card.quote, /^Тревога перед экзаменом/);
  });

  test('одобрить черновик не может ни студент, ни сам специалист', async () => {
    for (const user of [anna, olgaUser]) {
      await assert.rejects(as(db, user, (q) => q('select approve_draft($1)', [OLGA])), /только администратор/);
    }
    await assert.rejects(as(db, null, (q) => q('select approve_draft($1)', [OLGA])), DENIED);
  });

  test('после одобрения карточка и контакты обновляются, черновик исчезает', async () => {
    await as(db, admin, (q) => q('select approve_draft($1)', [OLGA]));

    const [card] = await asOwner(db, 'select quote, specializations, first_name from specialists where id = $1', [OLGA]);
    assert.deepEqual(card, { quote: 'Новая цитата', specializations: ['Тревога', 'Сон'], first_name: 'Ольга' });

    const [contacts] = await asOwner(
      db,
      'select phone, telegram, booking_url, consent from specialist_contacts where specialist_id = $1',
      [OLGA],
    );
    // telegram в черновике пуст — убран; booking_url в черновике не было — остался прежним.
    assert.deepEqual(contacts, {
      phone: '+375 29 555-12-34',
      telegram: null,
      booking_url: 'https://example.com/',
      consent: false,
    });
    assert.deepEqual(await asOwner(db, 'select 1 from specialist_drafts'), []);
  });

  test('администратор в Supabase Studio одобряет той же функцией', async () => {
    await as(db, olgaUser, (q) => q('select submit_draft($1)', [{ quote: 'Ещё одна' }]));
    await asOwner(db, 'select approve_draft($1)', [OLGA]);
    assert.equal((await asOwner(db, 'select quote from specialists where id = $1', [OLGA]))[0].quote, 'Ещё одна');
  });

  test('ограничения карточки действуют и для черновика', async () => {
    await as(db, olgaUser, (q) => q('select submit_draft($1)', [{ specializations: ['1', '2', '3', '4', '5', '6'] }]));
    await assert.rejects(asOwner(db, 'select approve_draft($1)', [OLGA]), /check constraint/);
  });

  test('черновик с посторонним полем или слишком большой база не принимает', async () => {
    await assert.rejects(
      as(db, olgaUser, (q) => q('select submit_draft($1)', [{ quote: 'Цитата', role: 'admin' }])),
      /payload_fields/,
    );
    await assert.rejects(
      as(db, olgaUser, (q) => q('select submit_draft($1)', [{ about: 'я'.repeat(20001) }])),
      /payload_size/,
    );
    await as(db, olgaUser, (q) => q('select submit_draft($1)', [{ about: 'я'.repeat(5000) }]));
  });

  test('ссылка «Записаться» — только обычная веб-страница', async () => {
    for (const url of ['javascript:alert(1)', 'example.com', 'https://example.com/ и текст']) {
      await as(db, olgaUser, (q) => q('select submit_draft($1)', [{ booking_url: url }]));
      await assert.rejects(asOwner(db, 'select approve_draft($1)', [OLGA]), /booking_url_web/, url);
    }
    await as(db, olgaUser, (q) => q('select submit_draft($1)', [{ booking_url: 'https://example.com/zapis' }]));
    await asOwner(db, 'select approve_draft($1)', [OLGA]);
    // Ссылку можно и убрать.
    await as(db, olgaUser, (q) => q('select submit_draft($1)', [{ booking_url: null }]));
    await asOwner(db, 'select approve_draft($1)', [OLGA]);
    const [contacts] = await asOwner(db, 'select booking_url from specialist_contacts where specialist_id = $1', [OLGA]);
    assert.equal(contacts.booking_url, null);
  });
});

describe('фото специалиста', () => {
  let db;
  let anna;
  let olgaUser;
  const RLS = /row-level security/;
  const upload = (q, name, bucket = 'specialist-photos') =>
    q('insert into storage.objects (bucket_id, name) values ($1, $2)', [bucket, name]);
  before(async () => {
    db = await createDatabase();
    anna = await createUser(db, 'anna@example.com');
    olgaUser = await createUser(db, 'olga@example.com');
    await asOwner(db, 'insert into specialist_accounts (specialist_id, email) values ($1, $2)', [
      OLGA,
      'olga@example.com',
    ]);
    await as(db, olgaUser, (q) => q('select link_specialist()'));
    await asOwner(db, "insert into storage.buckets (id, name) values ('other', 'other')");
  });

  test('специалист загружает фото только в свою папку', async () => {
    await as(db, olgaUser, (q) => upload(q, `${OLGA}/1.jpg`));
    await assert.rejects(as(db, olgaUser, (q) => upload(q, `${DMITRY}/1.jpg`)), RLS);
    await assert.rejects(as(db, olgaUser, (q) => upload(q, '1.jpg')), RLS);
    await assert.rejects(as(db, olgaUser, (q) => upload(q, `${OLGA}/1.jpg`, 'other')), RLS);
  });

  test('студент и человек без входа загрузить ничего не могут', async () => {
    await assert.rejects(as(db, anna, (q) => upload(q, `${OLGA}/2.jpg`)), RLS);
    await assert.rejects(as(db, null, (q) => upload(q, `${OLGA}/2.jpg`)), RLS);
  });

  test('загруженный файл нельзя ни заменить, ни удалить; чужих файлов в списке нет', async () => {
    await as(db, olgaUser, (q) => q("update storage.objects set name = 'x'"));
    await as(db, olgaUser, (q) => q('delete from storage.objects'));
    assert.deepEqual(await asOwner(db, 'select name from storage.objects'), [{ name: `${OLGA}/1.jpg` }]);
    assert.deepEqual(await as(db, anna, (q) => q('select name from storage.objects')), []);
    assert.equal((await as(db, olgaUser, (q) => q('select name from storage.objects'))).length, 1);
  });

  test('в карточку попадает только фото из её же папки — и только после одобрения', async () => {
    await as(db, olgaUser, (q) => q('select submit_draft($1)', [{ photo_path: `${DMITRY}/1.jpg` }]));
    await assert.rejects(asOwner(db, 'select approve_draft($1)', [OLGA]), /photo_path_own/);

    await as(db, olgaUser, (q) => q('select submit_draft($1)', [{ photo_path: `${OLGA}/1.jpg` }]));
    const photoOf = () => asOwner(db, 'select photo_path from specialists where id = $1', [OLGA]);
    assert.equal((await photoOf())[0].photo_path, null);
    await asOwner(db, 'select approve_draft($1)', [OLGA]);
    assert.equal((await photoOf())[0].photo_path, `${OLGA}/1.jpg`);

    // Черновик без фото его не трогает.
    await as(db, olgaUser, (q) => q('select submit_draft($1)', [{ quote: 'Без фото' }]));
    await asOwner(db, 'select approve_draft($1)', [OLGA]);
    assert.equal((await photoOf())[0].photo_path, `${OLGA}/1.jpg`);
  });
});

test('supabase/setup.sql собран из актуальных миграций', () => {
  const onDisk = readFileSync(join(SUPABASE_DIR, 'setup.sql'), 'utf8');
  assert.equal(onDisk, buildSetupSql(), 'Запустите npm run db:bundle');
});

test('demo_remove.sql убирает все вымышленные данные', async () => {
  const db = await createDatabase();
  await db.exec(readFileSync(join(SUPABASE_DIR, 'demo_remove.sql'), 'utf8'));
  for (const table of ['specialists', 'specialist_contacts', 'university_staff', 'phrases']) {
    assert.deepEqual(await asOwner(db, `select 1 from ${table}`), [], table);
  }
  assert.deepEqual(await asOwner(db, 'select 1 from universities where service_phone is not null'), []);
  assert.equal((await asOwner(db, 'select 1 from universities')).length, 5);
});
