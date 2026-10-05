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
