# 08. Данные и бэкенд

## Главный принцип: чувствительное — только на устройстве

Состояние психического здоровья — особая категория персональных данных. Чтобы не хранить её на сервере вообще:

| Данные | Где | Почему |
|---|---|---|
| Ответы и баллы DASS-21, история | Устройство | Данные о здоровье |
| Дневник настроения, заметки | Устройство | Данные о здоровье |
| Результаты КРИКа | Устройство | Не нужны серверу |
| Текст «Выплеснуть текстом» | Нигде | Обещано: «Текст никто не прочитает» |
| Голос | Нигде | Обещано: «Мы не записываем ваш голос» |
| Отклонённые специалисты, сохранённые фразы, настройки | Устройство | Не нужны серверу |
| Аккаунт (Google: имя, почта) | Сервер | Вход |
| Выбранный вуз | Сервер + копия на устройстве | SOS вуза должен работать без входа и без сети |
| Лайки специалистам | Сервер | Открытие контактов, счётчик для специалиста |
| «Я сегодня здесь» | Сервер | Счётчик на главной, без истории действий |

Локальное хранилище: `@react-native-async-storage/async-storage` (работает в Android и вебе), обёрнутое в репозитории `src/data/local/*`. Данных мало, база не нужна. Ключи личных данных — с id пользователя (`user:<id>:mood`, `user:<id>:dass`), общие — без (`app:onboarded`, `app:theme`, `app:university`). Выход из аккаунта личные данные не стирает (другой аккаунт их не видит), «Удалить мои данные» — стирает (docs/07).

Все обращения к данным — через интерфейсы-репозитории (`SpecialistsRepo`, `PhrasesRepo`, `UniversitiesRepo`, `LikesRepo`, `PresenceRepo`). Сначала пишется реализация на моках (`src/data/mocks/`), затем серверная. Экраны о сервере не знают.

## Бэкенд: рекомендация

**Supabase** (Postgres + Auth + Row Level Security + Edge Functions), бесплатный тариф. Почему: вход через Google из коробки, правила доступа к строкам на уровне базы (контакты нельзя «вытащить» в обход приложения), админка-таблицы для владельца без отдельной разработки.

Перед подключением **[решить, владелец]**:

1. Проверить доступность сервиса и входа Google из Беларуси.
2. Закон Республики Беларусь «О защите персональных данных» (2021): согласие на обработку, где физически хранятся данные, трансграничная передача. Показать схему данных юристу. Схема выше специально минимизирует то, что попадает на сервер.
3. Альтернатива с похожей схемой — Firebase (Auth + Firestore + Security Rules).

## Модель данных (Postgres)

```sql
create table universities (
  id text primary key,              -- 'vsmu', 'bsmu', 'grsmu', 'gomsmu'
  short_name text not null,         -- 'ВГМУ'
  full_name text not null,
  city text not null,
  service_name text,                -- 'Психологическая служба ВГМУ'
  service_address text,
  service_hours text,
  service_phone text,
  verified_at date                  -- «Контакты проверяет администратор. Обновлено …»
);
-- плюс строка id = 'other' («Другой вуз») без службы

-- роли: student (по умолчанию), specialist, admin
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  role text not null default 'student' check (role in ('student','specialist','admin')),
  university_id text references universities(id),
  created_at timestamptz default now()
);

create table university_staff (      -- «Специалисты службы» на SosUni
  id uuid primary key default gen_random_uuid(),
  university_id text references universities(id) on delete cascade,
  name text not null, role text, format text, phone text
);

create table specialists (           -- опубликованная версия карточки (её видят студенты)
  id uuid primary key default gen_random_uuid(),
  first_name text not null, last_name text not null,
  name_dative text not null,        -- «Ольге Мирошник» — для «Позвонить …»
  gender text check (gender in ('f','m')),  -- «добавлена / добавлен»
  title text,                       -- «Психолог», «Психотерапевт»
  experience text,                  -- «8 лет»
  education text,
  specializations text[] check (cardinality(specializations) <= 5),
  quote text check (char_length(quote) <= 140),
  about text,
  format_online boolean, format_offline boolean, city text,
  photo_path text,                  -- Storage: bucket specialist-photos
  published boolean default false,
  updated_at timestamptz default now()
);

create table specialist_accounts (   -- связь с аккаунтом; студентам не видна
  specialist_id uuid primary key references specialists on delete cascade,
  email text unique not null,       -- почта Google-аккаунта специалиста
  user_id uuid unique references auth.users on delete set null
);

create table specialist_contacts (   -- отдельно: читаются только после лайка
  specialist_id uuid primary key references specialists on delete cascade,
  phone text, telegram text, booking_url text,
  consent boolean not null default false  -- «Согласие на публикацию контактов»; false — не отдаются никому
);

create table specialist_drafts (     -- правки из кабинета, ждут проверки
  specialist_id uuid primary key references specialists on delete cascade,
  payload jsonb not null,
  status text not null default 'pending' check (status in ('pending','changes_requested')),
  admin_comment text,
  submitted_at timestamptz default now()
);

create table likes (
  user_id uuid references auth.users on delete cascade,
  specialist_id uuid references specialists on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, specialist_id)
);

create table phrases (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  tone text not null check (tone in ('sweet','spicy')),
  author_specialist_id uuid references specialists,
  published boolean default true
);

create table daily_presence (        -- только факт «был сегодня»
  day date not null,
  user_id uuid not null references auth.users on delete cascade,
  primary key (day, user_id)
);
```

### Правила доступа (RLS) — ключевые

- `specialists` (published = true), `universities`, `university_staff`, `phrases` (published = true) — читают все вошедшие; `universities` и `university_staff` — и без входа (нужны SOS).
- `specialist_contacts` — читает пользователь, у которого есть строка в `likes` для этого специалиста, и только при `consent = true`; сам специалист (через `specialist_accounts.user_id = auth.uid()`); админ.
- `specialist_accounts` — читает и пишет только админ; специалист читает свою строку. Почта специалиста студентам не видна (RLS работает по строкам, а не по колонкам, поэтому почта вынесена в отдельную таблицу).
- `likes` — пользователь вставляет и удаляет только свои строки и читает только свои. Специалист построчно `likes` не читает: число отдаёт функция `specialist_like_stats()` (security definer): всего, за 7 дней, по 8 неделям, только для своего `specialist_id`.
- **Важно про обещание на CabStats** «Кто именно отметил вас, не видно ни вам, ни администратору»: RLS действует в приложении, но Supabase Studio подключается с правами владельца базы и видит все строки. Варианты **[решить]**: (а) поменять текст на «…не видно ни вам, ни другим пользователям»; (б) хранить в `likes` не `user_id`, а `hmac(user_id, секрет)` из Edge Function — тогда и администратор не свяжет лайк с человеком. Рекомендация для первой версии — (а), честно.
- `specialist_drafts` — специалист пишет и читает свой; админ читает все и одобряет функцией `approve_draft(id)`, которая копирует `payload` в `specialists` и `specialist_contacts`.
- `daily_presence` — вставка своей строки за сегодня; число отдаёт функция `today_count()`; строки старше 2 дней удаляются по расписанию.
- `profiles`: пользователь читает свою строку и меняет только `display_name` и `university_id` — через `grant update (display_name, university_id) on profiles to authenticated` (RLS не ограничивает колонки). `role` меняет только админ.
- Связь специалиста с аккаунтом: функция `link_specialist()` (security definer) вызывается после каждого входа: если почта `auth.users` есть в `specialist_accounts.email`, заполняет `user_id` и ставит `profiles.role = 'specialist'`. Так работает и случай, когда специалист вошёл раньше, чем админ его создал: связь появится при следующем входе (кнопка «Обновить» в профиле или перезапуск).
- Фото: Storage bucket `specialist-photos` — публичное чтение; запись — только специалист в папку со своим `specialist_id` и админ.
- Удаление аккаунта («Удалить мои данные»): Edge Function `delete-account` с service role — удаляет `auth.users` текущего пользователя, остальное удаляется каскадом (`profiles`, `likes`, `daily_presence`).

## Вход через Google

- Android: `@react-native-google-signin/google-signin` → `idToken` → `supabase.auth.signInWithIdToken({ provider: 'google', token })`. Нужна dev-сборка (Expo Go не подходит) и SHA-1 ключа подписи в Google Cloud Console.
- Веб: `supabase.auth.signInWithOAuth({ provider: 'google' })` с редиректом.
- Кнопка — официальный вид кнопки Google Sign-In (в макете заглушка).

## Админ-панель

В первой версии — таблицы Supabase Studio: создать специалиста (почта, имя), одобрить черновик, править вузы и фразы. Отдельный интерфейс администратора не проектировался; если понадобится — простой раздел `/admin` в веб-версии.

## Без сети

- Работает полностью: SOS (контакты вузов из встроенного JSON), КРИК, дыхание, Pomodoro, техники, анатомия, дневник, DASS-21, «Доброе слово» (из кеша).
- Нужна сеть: подбор и лайки, обновление контактов, счётчик, кабинет. Без сети — Toast «Нет интернета» с «Повторить», лайк не теряется: очередь отправки.
