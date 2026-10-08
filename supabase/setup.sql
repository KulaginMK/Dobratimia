-- «Добратимия»: вся база одним файлом — таблицы, правила доступа, функции и справочник вузов.
-- Файл собран автоматически из supabase/migrations и supabase/seed.sql (npm run db:bundle) — руками не править.
-- Вставьте его целиком в SQL Editor нового проекта Supabase и нажмите Run. Запускать один раз.

-- ===== 20261005000001_tables.sql =====

-- Таблицы «Добратимии» (handoff/docs/08-data-and-backend.md).
-- Данные о здоровье — дневник настроения, ответы DASS-21, результаты КРИКа — на сервер не попадают:
-- здесь для них нет таблиц и быть не должно.

-- Справочник вузов. Читается без входа: нужен экрану SOS.
create table public.universities (
  id text primary key,                -- 'vsmu', 'bsmu', 'grsmu', 'gomsmu', 'other'
  short_name text not null,           -- «ВГМУ»
  full_name text not null,
  city text,                          -- у строки 'other' («Другой вуз») города нет
  service_name text,                  -- «Психологическая служба ВГМУ»; пусто — контакты ещё не проверены
  service_address text,
  service_hours text,
  service_phone text,
  verified_at date,                   -- «Контакты проверяет администратор. Обновлено …»
  sort_order int not null default 0   -- порядок в списке выбора вуза
);

-- Профиль пользователя. Роли: student (по умолчанию), specialist, admin.
create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  role text not null default 'student' check (role in ('student', 'specialist', 'admin')),
  university_id text references public.universities (id) on delete set null,
  created_at timestamptz not null default now()
);

-- «Специалисты службы» на экране «Помощь в моём вузе».
create table public.university_staff (
  id uuid primary key default gen_random_uuid(),
  university_id text not null references public.universities (id) on delete cascade,
  name text not null,
  name_dative text,                   -- «Наталье Бусько» — для подписи «Позвонить …»
  role text,
  format text,
  phone text,
  sort_order int not null default 0
);

-- Опубликованная версия карточки специалиста: её видят студенты. Контактов здесь нет.
create table public.specialists (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  name_dative text not null,          -- «Ольге Мирошник» — для «Позвонить …»
  gender text check (gender in ('f', 'm')),  -- «добавлена / добавлен»
  title text,                         -- «Психолог», «Психотерапевт»
  experience text,                    -- «8 лет»
  education text,
  specializations text[] not null default '{}' check (cardinality(specializations) <= 5),
  quote text check (char_length(quote) <= 140),
  about text,
  format_online boolean not null default false,
  format_offline boolean not null default false,
  city text,
  photo_path text,                    -- хранилище, bucket specialist-photos (этап 13)
  published boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Связь карточки с аккаунтом. Отдельная таблица: почта специалиста студентам не видна.
create table public.specialist_accounts (
  specialist_id uuid primary key references public.specialists on delete cascade,
  email text not null unique,         -- почта Google-аккаунта специалиста; её вписывает администратор
  user_id uuid unique references auth.users on delete set null
);

-- Контакты. Отдельная таблица: читаются только после отметки «Нравится» и с согласия специалиста.
create table public.specialist_contacts (
  specialist_id uuid primary key references public.specialists on delete cascade,
  phone text,
  telegram text,
  booking_url text,
  consent boolean not null default false  -- «Согласие на публикацию контактов»; без него не отдаются никому
);

-- Правки из кабинета специалиста: ждут проверки администратором.
create table public.specialist_drafts (
  specialist_id uuid primary key references public.specialists on delete cascade,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'changes_requested')),
  admin_comment text,
  submitted_at timestamptz not null default now()
);

-- Отметки «Нравится» специалистам. Открывают контакты; специалист видит только их число.
create table public.likes (
  user_id uuid not null references auth.users on delete cascade,
  specialist_id uuid not null references public.specialists on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, specialist_id)
);
create index likes_by_specialist on public.likes (specialist_id, created_at);

-- Фразы «Доброго слова».
create table public.phrases (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  tone text not null check (tone in ('sweet', 'spicy')),
  author_specialist_id uuid references public.specialists on delete set null,
  published boolean not null default true,
  created_at timestamptz not null default now()
);

-- Сердечки фразам. Это не закладки: пользователю список не показывается,
-- команда видит только число отметок у каждой фразы (представление phrase_like_stats).
create table public.phrase_likes (
  user_id uuid not null references auth.users on delete cascade,
  phrase_id uuid not null references public.phrases on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, phrase_id)
);
create index phrase_likes_by_phrase on public.phrase_likes (phrase_id);

-- «Сегодня вы не одни»: только факт «был сегодня», без истории действий. Старые строки удаляются.
create table public.daily_presence (
  day date not null,
  user_id uuid not null references auth.users on delete cascade,
  primary key (day, user_id)
);

-- ===== 20261005000002_access.sql =====

-- Правила доступа (handoff/docs/08-data-and-backend.md, «Правила доступа (RLS)»).
-- Порядок везде один: включить RLS, забрать у ролей приложения все права, выдать только нужные.
-- anon — человек без входа, authenticated — вошедший. Администратор в первой версии работает
-- в Supabase Studio (там правила доступа не действуют), поэтому прав на запись через приложение у него нет.

-- Помощники для правил. security definer: читают служебные таблицы в обход RLS,
-- но наружу отдают только «да/нет» или id собственной карточки.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = (select auth.uid()) and role = 'admin');
$$;

create function public.my_specialist_id() returns uuid
language sql stable security definer set search_path = ''
as $$
  select specialist_id from public.specialist_accounts where user_id = (select auth.uid());
$$;

revoke all on function public.is_admin() from public, anon;
revoke all on function public.my_specialist_id() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_specialist_id() to authenticated;

-- Вузы и сотрудники служб: читают все, в том числе без входа (SOS).
alter table public.universities enable row level security;
revoke all on table public.universities from anon, authenticated;
grant select on table public.universities to anon, authenticated;
create policy universities_read on public.universities for select to anon, authenticated using (true);

alter table public.university_staff enable row level security;
revoke all on table public.university_staff from anon, authenticated;
grant select on table public.university_staff to anon, authenticated;
create policy university_staff_read on public.university_staff for select to anon, authenticated using (true);

-- Профиль: человек читает свою строку и меняет в ней только имя и вуз. Роль меняет администратор в Studio.
alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (display_name, university_id) on table public.profiles to authenticated;
create policy profiles_read on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.is_admin());
create policy profiles_update_own on public.profiles for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Карточки специалистов: вошедшие видят опубликованные; специалист — ещё и свою, даже неопубликованную.
alter table public.specialists enable row level security;
revoke all on table public.specialists from anon, authenticated;
grant select on table public.specialists to authenticated;
create policy specialists_read on public.specialists for select to authenticated
  using (published or id = public.my_specialist_id() or public.is_admin());

-- Связь с аккаунтом (здесь почта специалиста): специалист видит только свою строку.
alter table public.specialist_accounts enable row level security;
revoke all on table public.specialist_accounts from anon, authenticated;
grant select on table public.specialist_accounts to authenticated;
create policy specialist_accounts_read on public.specialist_accounts for select to authenticated
  using (user_id = (select auth.uid()) or public.is_admin());

-- Контакты: только тому, кто отметил специалиста «Нравится», и только если специалист согласился
-- на публикацию и его карточка опубликована. Сам специалист свои контакты видит всегда.
alter table public.specialist_contacts enable row level security;
revoke all on table public.specialist_contacts from anon, authenticated;
grant select on table public.specialist_contacts to authenticated;
create policy specialist_contacts_read on public.specialist_contacts for select to authenticated
  using (
    (
      consent
      and exists (
        select 1 from public.likes l
        where l.user_id = (select auth.uid()) and l.specialist_id = specialist_contacts.specialist_id
      )
      and exists (
        select 1 from public.specialists s
        where s.id = specialist_contacts.specialist_id and s.published
      )
    )
    or specialist_id = public.my_specialist_id()
    or public.is_admin()
  );

-- Черновики: специалист читает свой. Пишет только через submit_draft(), одобряет администратор через approve_draft().
alter table public.specialist_drafts enable row level security;
revoke all on table public.specialist_drafts from anon, authenticated;
grant select on table public.specialist_drafts to authenticated;
create policy specialist_drafts_read on public.specialist_drafts for select to authenticated
  using (specialist_id = public.my_specialist_id() or public.is_admin());

-- Отметки «Нравится»: человек видит, ставит и снимает только свои. Изменить отметку нельзя — только снять.
-- Специалист строк не читает: число отдаёт specialist_like_stats().
alter table public.likes enable row level security;
revoke all on table public.likes from anon, authenticated;
grant select, insert, delete on table public.likes to authenticated;
create policy likes_read_own on public.likes for select to authenticated
  using (user_id = (select auth.uid()));
create policy likes_insert_own on public.likes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.specialists s where s.id = likes.specialist_id and s.published)
  );
create policy likes_delete_own on public.likes for delete to authenticated
  using (user_id = (select auth.uid()));

-- Фразы: вошедшие читают опубликованные.
alter table public.phrases enable row level security;
revoke all on table public.phrases from anon, authenticated;
grant select on table public.phrases to authenticated;
create policy phrases_read on public.phrases for select to authenticated
  using (published or public.is_admin());

-- Сердечки фразам: человек видит, ставит и снимает только свои.
alter table public.phrase_likes enable row level security;
revoke all on table public.phrase_likes from anon, authenticated;
grant select, insert, delete on table public.phrase_likes to authenticated;
create policy phrase_likes_read_own on public.phrase_likes for select to authenticated
  using (user_id = (select auth.uid()));
create policy phrase_likes_insert_own on public.phrase_likes for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.phrases p where p.id = phrase_likes.phrase_id and p.published)
  );
create policy phrase_likes_delete_own on public.phrase_likes for delete to authenticated
  using (user_id = (select auth.uid()));

-- Число сердечек у каждой фразы — для команды, смотреть в Supabase Studio. Приложению недоступно.
create view public.phrase_like_stats with (security_invoker = true) as
  select p.id, p.tone, p.text, p.published, count(pl.user_id) as likes
  from public.phrases p
  left join public.phrase_likes pl on pl.phrase_id = p.id
  group by p.id
  order by likes desc, p.created_at;
revoke all on table public.phrase_like_stats from anon, authenticated;

-- «Был сегодня»: напрямую таблица недоступна никому, только через mark_presence() и today_count().
alter table public.daily_presence enable row level security;
revoke all on table public.daily_presence from anon, authenticated;

-- ===== 20261005000003_functions.sql =====

-- Функции «Добратимии». Все — security definer с пустым search_path: работают с таблицами в обход RLS,
-- поэтому каждая сама проверяет, кто её вызвал, и делает только одно узкое дело.
-- Вызывать их может только вошедший человек (authenticated); человеку без входа они недоступны.

-- Новый аккаунт → строка профиля. Имя берётся из Google-аккаунта.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Вызывается после каждого входа. Если почту вошедшего администратор вписал в specialist_accounts,
-- привязывает карточку к аккаунту и даёт роль specialist. Возвращает роль.
-- Работает и когда специалист вошёл раньше, чем администратор его создал: связь появится при следующем входе.
create function public.link_specialist() returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_email text;
  v_linked boolean;
  v_role text;
begin
  if v_uid is null then
    raise exception 'Нужен вход в аккаунт' using errcode = '28000';
  end if;

  insert into public.profiles (id) values (v_uid) on conflict (id) do nothing;

  -- Только подтверждённая почта: вход идёт через Google, он её подтверждает.
  select lower(u.email) into v_email
  from auth.users u
  where u.id = v_uid and u.email_confirmed_at is not null;

  if v_email is not null then
    update public.specialist_accounts a
    set user_id = v_uid
    where lower(a.email) = v_email and a.user_id is null;
  end if;

  select exists (select 1 from public.specialist_accounts a where a.user_id = v_uid) into v_linked;
  if v_linked then
    update public.profiles set role = 'specialist' where id = v_uid and role = 'student';
  else
    -- Администратор убрал карточку или почту — кабинет закрывается.
    update public.profiles set role = 'student' where id = v_uid and role = 'specialist';
  end if;

  select p.role into v_role from public.profiles p where p.id = v_uid;
  return v_role;
end;
$$;

-- Статистика для кабинета специалиста: только числа и только по своей карточке.
-- total — всего отметок; last7days — за последние 7 дней; weeks — по 8 календарным неделям
-- (Europe/Minsk, с понедельника), от самой давней к текущей.
create function public.specialist_like_stats() returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_sid uuid := public.my_specialist_id();
  v_week_start timestamp := date_trunc('week', now() at time zone 'Europe/Minsk');
begin
  if v_sid is null then
    raise exception 'Статистика доступна только специалисту' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total', (select count(*) from public.likes l where l.specialist_id = v_sid),
    'last7days', (
      select count(*) from public.likes l
      where l.specialist_id = v_sid and l.created_at >= now() - interval '7 days'
    ),
    'weeks', (
      select jsonb_agg(w.likes order by w.n)
      from (
        select g.n, (
          select count(*) from public.likes l
          where l.specialist_id = v_sid
            and (l.created_at at time zone 'Europe/Minsk') >= v_week_start - (7 - g.n) * interval '7 days'
            and (l.created_at at time zone 'Europe/Minsk') < v_week_start - (6 - g.n) * interval '7 days'
        ) as likes
        from generate_series(0, 7) as g (n)
      ) w
    )
  );
end;
$$;

-- «Сохранить» в кабинете: черновик уходит на проверку. Студенты видят прежнюю карточку, пока его не одобрят.
create function public.submit_draft(p_payload jsonb) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_sid uuid := public.my_specialist_id();
begin
  if v_sid is null then
    raise exception 'Черновик может отправить только специалист' using errcode = '42501';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Черновик должен быть объектом с полями карточки' using errcode = '22023';
  end if;

  insert into public.specialist_drafts (specialist_id, payload, status, admin_comment, submitted_at)
  values (v_sid, p_payload, 'pending', null, now())
  on conflict (specialist_id) do update
    set payload = excluded.payload, status = 'pending', admin_comment = null, submitted_at = now();
end;
$$;

-- Одобрить черновик: переносит его поля в карточку и контакты и удаляет черновик.
-- Вызывает администратор: из Supabase Studio (select public.approve_draft('<id карточки>');)
-- или из приложения — тогда у вызвавшего должна быть роль admin.
-- Поля черновика называются как колонки: first_name, last_name, name_dative, gender, title, experience,
-- education, specializations, quote, about, format_online, format_offline, city, photo_path,
-- phone, telegram, booking_url, consent. Чего в черновике нет — не меняется.
create function public.approve_draft(p_specialist_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  d jsonb;
begin
  -- В Studio входа в приложение нет (auth.uid() пуст) — это администратор базы. Из приложения — только роль admin.
  if (select auth.uid()) is not null and not public.is_admin() then
    raise exception 'Одобрять черновики может только администратор' using errcode = '42501';
  end if;

  select payload into d from public.specialist_drafts where specialist_id = p_specialist_id;
  if d is null then
    raise exception 'Черновика для этой карточки нет' using errcode = 'P0002';
  end if;

  update public.specialists s set
    first_name = coalesce(nullif(d ->> 'first_name', ''), s.first_name),
    last_name = coalesce(nullif(d ->> 'last_name', ''), s.last_name),
    name_dative = coalesce(nullif(d ->> 'name_dative', ''), s.name_dative),
    gender = case when d ? 'gender' then d ->> 'gender' else s.gender end,
    title = case when d ? 'title' then d ->> 'title' else s.title end,
    experience = case when d ? 'experience' then d ->> 'experience' else s.experience end,
    education = case when d ? 'education' then d ->> 'education' else s.education end,
    specializations = case
      when jsonb_typeof(d -> 'specializations') = 'array'
        then array(select jsonb_array_elements_text(d -> 'specializations'))
      else s.specializations
    end,
    quote = case when d ? 'quote' then d ->> 'quote' else s.quote end,
    about = case when d ? 'about' then d ->> 'about' else s.about end,
    format_online = coalesce((d ->> 'format_online')::boolean, s.format_online),
    format_offline = coalesce((d ->> 'format_offline')::boolean, s.format_offline),
    city = case when d ? 'city' then d ->> 'city' else s.city end,
    photo_path = case when d ? 'photo_path' then d ->> 'photo_path' else s.photo_path end,
    updated_at = now()
  where s.id = p_specialist_id;

  insert into public.specialist_contacts as c (specialist_id, phone, telegram, booking_url, consent)
  values (
    p_specialist_id,
    d ->> 'phone',
    d ->> 'telegram',
    d ->> 'booking_url',
    coalesce((d ->> 'consent')::boolean, false)
  )
  on conflict (specialist_id) do update set
    phone = case when d ? 'phone' then excluded.phone else c.phone end,
    telegram = case when d ? 'telegram' then excluded.telegram else c.telegram end,
    booking_url = case when d ? 'booking_url' then excluded.booking_url else c.booking_url end,
    consent = case when d ? 'consent' then excluded.consent else c.consent end;

  delete from public.specialist_drafts where specialist_id = p_specialist_id;
end;
$$;

-- «Я сегодня здесь»: клиент вызывает раз в день. Хранится только факт; строки старше двух дней удаляются тут же.
create function public.mark_presence() returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_today date := (now() at time zone 'Europe/Minsk')::date;
begin
  if v_uid is null then
    raise exception 'Нужен вход в аккаунт' using errcode = '28000';
  end if;
  insert into public.daily_presence (day, user_id) values (v_today, v_uid) on conflict do nothing;
  delete from public.daily_presence where day < v_today - 2;
end;
$$;

-- «Сегодня вы не одни: N человек» — сколько разных людей открыли приложение сегодня (Europe/Minsk).
create function public.today_count() returns integer
language sql stable security definer set search_path = ''
as $$
  select count(*)::integer
  from public.daily_presence
  where day = (now() at time zone 'Europe/Minsk')::date;
$$;

-- «Удалить мои данные»: удаляет аккаунт вызвавшего. Профиль, отметки «Нравится», сердечки и «был сегодня»
-- удаляются следом (on delete cascade); карточка специалиста остаётся, но отвязывается от аккаунта.
create function public.delete_account() returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'Нужен вход в аккаунт' using errcode = '28000';
  end if;
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.link_specialist() from public, anon;
revoke all on function public.specialist_like_stats() from public, anon;
revoke all on function public.submit_draft(jsonb) from public, anon;
revoke all on function public.approve_draft(uuid) from public, anon;
revoke all on function public.mark_presence() from public, anon;
revoke all on function public.today_count() from public, anon;
revoke all on function public.delete_account() from public, anon;

grant execute on function public.link_specialist() to authenticated;
grant execute on function public.specialist_like_stats() to authenticated;
grant execute on function public.submit_draft(jsonb) to authenticated;
grant execute on function public.approve_draft(uuid) to authenticated;
grant execute on function public.mark_presence() to authenticated;
grant execute on function public.today_count() to authenticated;
grant execute on function public.delete_account() to authenticated;

-- ===== 20261008000001_booking_url.sql =====

-- Ссылку «Записаться» вписывает сам специалист в кабинете, а приложение открывает её по нажатию.
-- Поэтому в контактах может лежать только адрес обычной веб-страницы: другой вид адреса
-- (например, javascript:…) не пройдёт ни из черновика, ни при правке в Studio.
alter table public.specialist_contacts
  add constraint specialist_contacts_booking_url_web
  check (booking_url ~* '^https?://[^[:space:]]+$');

-- ===== 20261008000002_photos.sql =====

-- Фото специалистов (handoff/docs/08): хранилище Supabase Storage, bucket specialist-photos.
-- Читают все по прямой ссылке (bucket публичный): фото показывается на карточке в подборе.
-- Приложение перед загрузкой уменьшает снимок и сохраняет его как JPEG, поэтому другие форматы
-- и файлы больше 2 МБ хранилище не принимает.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('specialist-photos', 'specialist-photos', true, 2097152, array['image/jpeg'])
on conflict (id) do nothing;

-- Загружает только специалист и только в папку со своим id. Заменить или удалить файл нельзя:
-- прежнее фото остаётся на карточке, пока администратор не одобрит черновик с новым.
create policy specialist_photos_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'specialist-photos'
    and (storage.foldername(name))[1] = public.my_specialist_id()::text
  );

-- Свои файлы специалист видит в списке хранилища; чужих — нет. Показу фото по прямой ссылке это правило не нужно.
create policy specialist_photos_read_own on storage.objects for select to authenticated
  using (
    bucket_id = 'specialist-photos'
    and (storage.foldername(name))[1] = public.my_specialist_id()::text
  );

-- Путь к фото приходит из черновика специалиста, поэтому в карточке может стоять только файл из её же папки.
alter table public.specialists
  add constraint specialists_photo_path_own
  check (photo_path ~ ('^' || id::text || '/[A-Za-z0-9_-]+\.jpg$'));

-- ===== seed.sql =====

-- Справочник вузов: названия и города настоящие. Контактов психологических служб здесь нет —
-- их вписывает администратор после проверки (Table Editor → universities, university_staff).
insert into public.universities (id, short_name, full_name, city, sort_order) values
  ('vsmu', 'ВГМУ', 'Витебский государственный медицинский университет', 'Витебск', 1),
  ('bsmu', 'БГМУ', 'Белорусский государственный медицинский университет', 'Минск', 2),
  ('grsmu', 'ГрГМУ', 'Гродненский государственный медицинский университет', 'Гродно', 3),
  ('gomsmu', 'ГомГМУ', 'Гомельский государственный медицинский университет', 'Гомель', 4),
  ('other', 'Другой вуз', 'Укажу позже или выберу общий список служб', null, 5)
on conflict (id) do nothing;
