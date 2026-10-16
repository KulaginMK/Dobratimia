# Политика конфиденциальности: на чём основан каждый пункт

Опись к `legal/privacy-policy.md`. Составлена по коду ветки `main` на 16 октября 2026 года (коммит `1579930`). Пути — от корня репозитория. Если код изменится, строки могут сдвинуться: ищите по цитате. Строки с пометкой «платформа» описывают поведение Supabase, GitHub или Google, которого в репозитории не видно, — их нужно проверить в панелях этих сервисов.

## Данные на сервере

| Данные | Пункт политики | Где подтверждается |
|---|---|---|
| Профиль: имя из Google (один раз, при создании), роль, вуз, дата создания | 3.2 | `supabase/migrations/20261005000001_tables.sql:20–26`; `supabase/migrations/20261005000003_functions.sql:6` (триггер, `on conflict do nothing`) |
| Человек меняет в профиле только имя и вуз; в приложении меняется только вуз | 3.2, 11.1 | `supabase/migrations/20261005000002_access.sql:40`; `expo-app/src/data/supabase/auth.ts:157` |
| Сведения из Google: имя, почта, подтверждение почты, идентификатор, ссылка на фото | 3.2 | Панель Supabase, запрос от 16 октября 2026 года: ключи `auth.users.raw_user_meta_data`; имя приложение читает из `user_metadata` (`expo-app/src/data/supabase/auth.ts:38`) |
| Сессии входа с IP-адресом и браузером; выход закрывает текущую сессию | 3.2, 8, 10.4 | Панель Supabase, запрос от 16 октября 2026 года: колонки `auth.sessions.ip`, `user_agent` заполнены у 7 из 7; `expo-app/src/data/supabase/auth.ts:144` |
| Журнал входа в базу не пишется | заметки | Панель Supabase: `auth.audit_log_entries` — 0 строк |
| Журналы платформы — 1 день, резервных копий нет (тариф Free) | 6.1, 8, 10.3 | supabase.com/pricing, проверено 16 октября 2026 года |
| GitHub Pages записывает IP-адреса посетителей | 6.1, 8 | docs.github.com, «What is GitHub Pages?», раздел «Data collection» |
| Отметки «Нравится»: пользователь, специалист, дата | 3.2 | `supabase/migrations/20261005000001_tables.sql:87`; `expo-app/src/data/supabase/specialists.ts:97` |
| Сердечки фразам | 3.2 | `supabase/migrations/20261005000001_tables.sql:107`; `expo-app/src/data/supabase/phrases.ts:58` |
| «Был сегодня»: день и пользователь; старше двух дней удаляются внутри `mark_presence()` | 3.2, 8 | `supabase/migrations/20261005000001_tables.sql:116`; `supabase/migrations/20261005000003_functions.sql:183`, `:194`; вызов — `expo-app/src/data/supabase/presence.ts:8` при открытии Главной (`expo-app/src/features/home/HomePage.tsx:36`) |
| Почта специалиста — в отдельной таблице, студентам не видна | 3.3, 9 | `supabase/migrations/20261005000001_tables.sql:64`; `supabase/migrations/20261005000002_access.sql:57` |
| Карточка специалиста (поля) | 3.3 | `supabase/migrations/20261005000001_tables.sql:41–58` |
| Карточки видны и без входа | 3.3 | `supabase/migrations/20261015000001_guest_read.sql:5` |
| Контакты — только после «Нравится» и при согласии | 3.3, 9 | `supabase/migrations/20261005000002_access.sql:65` |
| Черновики и комментарий администратора; черновик удаляется после одобрения | 3.3, 8 | `supabase/migrations/20261005000001_tables.sql:78–84`; `supabase/migrations/20261005000003_functions.sql:178` |
| Статистика отметок без имён | 3.3 | `supabase/migrations/20261005000003_functions.sql:66` |
| Фото: публичное хранилище, JPEG до 2 МБ, файл нельзя заменить или удалить | 3.3, 8 | `supabase/migrations/20261008000002_photos.sql:6`, `:9`; загрузка — `expo-app/src/data/supabase/cabinet.ts:131` |
| Фото уменьшается до 1080 px и пересохраняется в JPEG | 3.3 | `expo-app/src/features/cabinet/photo.ts:29–34` |
| Старые фото никто не удаляет | 8, 10.3 | `expo-app/src/data/supabase/cabinet.ts:127` |
| Сотрудники служб вузов: имя, должность, формат, телефон — видны без входа | 3.4 | `supabase/migrations/20261005000001_tables.sql:29`; `supabase/migrations/20261005000002_access.sql:34`; `expo-app/src/data/supabase/universities.ts:78` |
| Контакты сотрудников — только с официальных сайтов вузов | 3.4 | Решение владельца от 16 октября 2026 года |
| Сейчас сотрудники в базе вымышленные | заметки, решения владельца | `supabase/demo.sql:13`; `TODO.md`, раздел 4 |
| Диплом специалиста смотрят, копию не хранят | 3.3 | Решение владельца от 16 октября 2026 года; в приложении загрузки диплома нет |
| Доступ к панели Supabase — только у владельца | 6.2 | Решение владельца от 16 октября 2026 года |
| Письма хранятся не дольше года | 8 | Решение владельца от 16 октября 2026 года; удаляются вручную |
| Регион сервера — Франкфурт | 6.1, 7 | `supabase/README.md:33` |

## Данные только на устройстве

| Данные | Пункт политики | Где подтверждается |
|---|---|---|
| Хранилище — AsyncStorage; в вебе это `localStorage` | 4.2, 12.1 | `handoff/docs/08-data-and-backend.md:20`; `expo-app/node_modules/@react-native-async-storage/async-storage/lib/commonjs/AsyncStorage.js:26` |
| DASS-21: ответы, баллы, история | 4.1 | `expo-app/src/data/local/dass.ts:36` |
| Дневник: день, время, уровень, заметка до 200 знаков | 4.1 | `expo-app/src/data/local/mood.ts:7–18` |
| КРИК: день, пик, среднее, длительность, без звука | 4.1, 4.5 | `expo-app/src/data/local/scream.ts:5–16` |
| Пропущенные специалисты | 4.1 | `expo-app/src/data/local/match.ts:18` |
| Напоминания, Pomodoro, вуз, кеш вузов и фраз | 4.1 | `expo-app/src/data/local/reminders.ts:4`; `expo-app/src/data/local/pomodoro.ts:5`; `expo-app/src/data/local/university.ts`; `expo-app/src/data/supabase/phrases.ts:11` |
| Копия отметок и очередь неотправленных | 3.2 | `expo-app/src/data/sync/syncedSet.ts:46–49`; `expo-app/src/data/repos/index.ts:27` |
| Ключи входа и копия имени и почты | 3.2 | `expo-app/src/data/supabase/client.ts:20`; `expo-app/src/data/local/session.ts:18` |
| Резервная копия Android выключена | 4.3 | `expo-app/app.json:12` |
| Экспорт: меню «Поделиться» или скачивание | 4.4 | `expo-app/src/lib/textFile.ts:14`; `expo-app/src/lib/textFile.web.ts:7`; `expo-app/src/features/profile/ProfileScreen.tsx:184` |
| Голос не записывается | 4.5, 5 | `expo-app/src/features/scream/ScreamVoice.tsx:25`; `expo-app/src/features/scream/useLoudnessMeter.web.ts:25`; `expo-app/app.json:48` |
| Текст КРИКа не сохраняется | 4.5 | `expo-app/src/features/scream/ScreamText.tsx:73` |
| Местоположение, контакты, камера не запрашиваются | 4.5, 5 | в `expo-app/package.json` нет `expo-location`, `expo-contacts`, `expo-camera`; `expo-app/app.json:66` (`cameraPermission: false`) |

## Разрешения

| Разрешение | Пункт политики | Где подтверждается |
|---|---|---|
| Микрофон | 5 | `expo-app/app.json:48` |
| Уведомления, запуск после перезагрузки | 5 | `expo-app/app.json` (плагин `expo-notifications`); `expo-app/src/lib/notifications.ts:6`; `TODO.md`, раздел «Этап 16», список оставшихся разрешений |
| Фото — для карточки специалиста | 5 | `expo-app/app.json:65` |
| Память и «поверх окон» заблокированы | 5 | `expo-app/app.json:13` |
| В вебе напоминаний нет | 5 | `expo-app/src/features/profile/ProfileScreen.tsx:156` |

## Сторонние сервисы и отсутствие слежки

| Факт | Пункт политики | Где подтверждается |
|---|---|---|
| Вход через Google, PKCE, ключи не в адресе | 6.1, 9 | `expo-app/src/data/supabase/auth.ts:93`; `expo-app/src/data/supabase/client.ts:37` |
| Веб-версия на GitHub Pages | 6.1 | `.github/workflows/deploy.yml` |
| Письма — через почту человека на Gmail; в письме версия и платформа | 3.5 | `expo-app/src/features/feedback/mail.ts:5–11`; `expo-app/src/data/team.ts:3` |
| Ссылки на Telegram, Instagram, Threads, Google Maps | 6.1, 6.3 | `expo-app/src/data/team.ts:6`, `:13` |
| Нет аналитики, рекламы, отчётов об ошибках | 2, 6.1 | в `expo-app/package.json` и `package-lock.json` нет Firebase, Sentry, Amplitude, PostHog и рекламных SDK; `handoff/docs/01-product.md:38` |
| Push с сервера нет, уведомления локальные | 5 | поиск `getExpoPushTokenAsync` в `expo-app/src` ничего не находит |
| Администратор видит, кто кого отметил | 6.2 | `handoff/docs/08-data-and-backend.md:130` |
| Лендинг без cookies и чужих запросов | 12.1 | `landing/index.html` (шрифты и картинки лежат рядом) |

## Удаление и права

| Факт | Пункт политики | Где подтверждается |
|---|---|---|
| «Удалить мои данные»: сначала сервер, потом устройство; при ошибке устройство не трогается | 10.1 | `expo-app/src/features/session/Session.tsx:155` |
| На сервере удаление каскадом | 10.1 | `supabase/migrations/20261005000003_functions.sql:209`; `on delete cascade` в `20261005000001_tables.sql` |
| На устройстве стирается всё, кроме темы | 10.1 | `expo-app/src/data/local/session.ts:20`, `:93` |
| Перед удалением — предложение скачать файл | 10.1 | `expo-app/src/features/profile/ProfileScreen.tsx:267` |
| Карточка специалиста остаётся | 10.3 | `supabase/migrations/20261005000003_functions.sql:208` |
| «Выйти» ничего не удаляет | 10.4 | `expo-app/src/features/profile/ProfileScreen.tsx` (шторка «Выйти из аккаунта?») |
| Согласие на публикацию контактов | 11.1 | `expo-app/src/features/cabinet/CabinetEditScreen.tsx:247` |
| Ссылки на политику и согласие (у специалиста — свои) | 1.3 | `expo-app/src/data/team.ts`; `expo-app/src/features/profile/ProfileScreen.tsx` |
| Согласие — отдельная отметка перед входом; у специалиста свой экран и своё согласие | 3.2, заметки юристу 2 | `expo-app/src/features/onboarding/OnboardingSignInScreen.tsx`; `expo-app/src/features/onboarding/OnboardingSpecialistScreen.tsx`; `expo-app/src/components/blocks/OnboardingParts.tsx` (`ConsentCheck`) |
| Сервер хранит редакцию и время согласия; ставит их сам | 3.2 | `supabase/migrations/20261016000001_consent.sql`; `expo-app/src/features/session/Session.tsx` (`recordPendingConsent`) |
