# Условия использования: на чём основан каждый пункт

Опись к `legal/terms-of-service.md`. Составлена по коду ветки `main` на 16 октября 2026 года (коммит `1579930`). Пути — от корня репозитория. Если код изменится, строки могут сдвинуться: ищите по цитате.

## Что делает сервис и кто им пользуется

| Факт | Пункт условий | Где подтверждается |
|---|---|---|
| Бесплатно: нет покупок, подписок и рекламы | 2.2 | `handoff/docs/01-product.md:21`; в `expo-app/package.json` нет библиотек оплаты и рекламы |
| Нет переписки, записи и оплаты внутри приложения | 2.3 | `handoff/docs/01-product.md:17`, `:35` |
| Только Беларусь, только русский | 4.3 | `handoff/docs/01-product.md:13` |
| Возраст — с 18 лет; проверки возраста в приложении нет | 4.1 | Решение владельца от 16 октября 2026 года; `PUBLISH.md:164`. Спецификация называла аудиторию 17–25 лет (`handoff/docs/01-product.md:5`) |
| Владелец — физическое лицо | 1.1, 10.1, 18 | Решение владельца от 16 октября 2026 года |
| Студенческий статус не проверяется, есть «Другой вуз» | 4.2 | `handoff/docs/01-product.md:13`; `expo-app/src/data/mocks/universities.ts` |
| Не заменяет врача, не ставит диагнозов | 3.1 | `expo-app/src/features/onboarding/OnboardingWarningScreen.tsx:37`; `expo-app/src/features/about/AboutScreen.tsx:65` |
| DASS-21 — ориентир, не заключение | 3.2 | `OnboardingWarningScreen.tsx:44`; `expo-app/src/features/dass/score.ts:59` |
| Экстренные номера 133 и 103 | 3.3, 14.2 | `expo-app/src/data/emergency.ts:7`, `:10` |

## Вход и данные

| Факт | Пункт условий | Где подтверждается |
|---|---|---|
| Вход необязателен, «Продолжить без входа» | 1.2, 5.1 | `expo-app/src/features/onboarding/OnboardingSignInScreen.tsx:24` |
| Что открыто гостю; результат теста гостя не сохраняется | 5.1 | `TODO.md:373` («Вход необязателен»), `:359`; `expo-app/src/features/dass/DassResultScreen.tsx:134`; `supabase/migrations/20261015000001_guest_read.sql:5` |
| Вход только через Google, пароля нет | 5.2 | `expo-app/src/data/supabase/auth.ts:93` |
| Под кнопкой входа — только политика и согласие, условий нет | 1.2, заметка «в приложении» 1 | `OnboardingSignInScreen.tsx:74`; `expo-app/src/features/profile/ProfileScreen.tsx:201` |
| Политики и согласия пока нет | 1.3, заметка 2 | `expo-app/src/data/mocks/links.ts:5` |
| Профиль: имя из Google, роль, вуз; человек меняет только имя и вуз | 5.3 | `supabase/migrations/20261005000003_functions.sql:6`; `supabase/migrations/20261005000002_access.sql:40`; `supabase/migrations/20261005000001_tables.sql:23` |
| DASS-21, дневник, КРИК, настройки — только на устройстве | 5.3, 3.3 | `handoff/docs/08-data-and-backend.md` (таблица в начале), `:20`; `expo-app/src/data/local/` |
| Голос не записывается, только громкость | 5.3 | `expo-app/src/features/scream/ScreamVoice.tsx:25`; `expo-app/src/features/scream/useLoudnessMeter.web.ts:25`; `expo-app/app.json:48` |
| Текст «Выплеснуть текстом» никто не прочитает | 5.3 | `expo-app/src/features/scream/ScreamText.tsx:73` |
| На сервере: отметки «Нравится», сердечки фраз, «был сегодня» | 5.3 | `supabase/migrations/20261005000001_tables.sql:107`, `:116`; `supabase/migrations/20261005000002_access.sql:96` |
| Отметки «был сегодня» старше двух дней удаляются автоматически, когда кто-нибудь открывает Главную | 5.3 | `supabase/migrations/20261005000003_functions.sql:194` (удаление внутри `mark_presence()`) |
| Сессии входа на сервере хранят IP-адрес и браузер | 5.3 | Панель Supabase, запрос от 16 октября 2026 года; подробно — `legal/privacy-evidence.md` |
| Резервная копия Android выключена | 5.4 | `expo-app/app.json:12` |
| Скачать и загрузить дневник файлом; файл до 2 МБ | 5.4 | `expo-app/src/features/profile/ProfileScreen.tsx:184`; `expo-app/src/features/backup/backup.ts:15` |
| Сервер — Supabase, регион Франкфурт | 11.1, заметка 10 | `supabase/README.md:33` |

## Специалисты

| Факт | Пункт условий | Где подтверждается |
|---|---|---|
| Порядок колоды: город вуза, затем онлайн, внутри — случайно, но стабильно за день | 6.1 | `expo-app/src/features/specialists/deck.ts:23` |
| Контакты — только после «Нравится», только с согласием и у опубликованной карточки | 6.2, 7.4 | `supabase/migrations/20261005000002_access.sql:65` |
| Специалист видит только число отметок | 6.2, 7.7 | `supabase/migrations/20261005000003_functions.sql:66`; `expo-app/src/features/cabinet/CabinetStatsScreen.tsx:44` |
| Администратор технически видит, кто кого отметил | заметка «в приложении» 4 | `handoff/docs/08-data-and-backend.md:130` |
| Аккаунт специалиста создаёт администратор, привязка по почте при входе | 6.3, 7.1 | `supabase/migrations/20261005000003_functions.sql:24`; `handoff/docs/01-product.md:16` |
| Специалиста добавляют после проверки диплома | 6.3, 7.1 | Решение владельца от 16 октября 2026 года; в коде проверки нет, её делает администратор до создания аккаунта |
| Правки проверяет администратор | 6.3, 7.3 | `expo-app/src/features/cabinet/CabinetEditScreen.tsx:258`; `supabase/migrations/20261005000003_functions.sql:126` |
| Карточка без публикации не видна | 15.2 | `supabase/migrations/20261005000001_tables.sql:57` |
| «Согласие на публикацию контактов» | 7.4 | `CabinetEditScreen.tsx:247` |
| Фото доступно по прямой ссылке, JPEG до 2 МБ | 7.4, 7.6 | `supabase/migrations/20261008000002_photos.sql:5` |
| До 5 специализаций, цитата до 140 знаков | 7.6 | `supabase/migrations/20261005000001_tables.sql:50`, `:51` |
| Ссылка на запись — только http(s) | 6.4, 7.6 | `supabase/migrations/20261008000001_booking_url.sql:5` |
| Черновик до 20 000 знаков | 7.6 | `supabase/migrations/20261010000001_draft_limits.sql:13` |
| После удаления аккаунта карточка остаётся | 7.8 | `supabase/migrations/20261005000003_functions.sql:208` |

## Удаление, блокировка, работа без сети

| Факт | Пункт условий | Где подтверждается |
|---|---|---|
| «Удалить мои данные»: аккаунт и связанные строки на сервере удаляются каскадом | 15.1 | `supabase/migrations/20261005000003_functions.sql:209`; `on delete cascade` в `20261005000001_tables.sql` |
| Сначала сервер, потом устройство; тема остаётся | 15.1 | `expo-app/src/features/session/Session.tsx:155`; `expo-app/src/data/local/session.ts:20` |
| Перед удалением — предупреждение и «Скачать дневник и результаты» | 15.1 | `expo-app/src/features/profile/ProfileScreen.tsx:267` |
| Блокировки и ограничения частоты в коде нет; администратор работает в панели Supabase | 15.2, заметка «в приложении» 7 | `handoff/docs/08-data-and-backend.md`, раздел «Админ-панель» |
| Что работает без сети | 13.2 | `handoff/docs/08-data-and-backend.md:150`, `:151` |

## Сторонние сервисы и автоматические подсказки

| Факт | Пункт условий | Где подтверждается |
|---|---|---|
| Почта и страницы проекта, «Карта бережных мест» | 11.1, 18 | `expo-app/src/data/team.ts:3`, `:6`, `:13` |
| Обратная связь — письмом из своей почты, текст не хранится | 9.2 | `expo-app/src/features/feedback/mail.ts:5` |
| Веб-версия на GitHub Pages | 11.1 | `.github/workflows/deploy.yml` |
| ИИ нет; баллы DASS-21 по ключу, пороги авторов шкалы, подсказки по уровню | 12.1 | `handoff/docs/07-features.md:46`, `:59`; `expo-app/src/features/dass/score.ts` |
| Условные децибелы, шкала реакций — игра | 12.1 | `handoff/docs/07-features.md:22` |
| Напоминания локальные, push-токенов нет; в вебе напоминаний нет | 12.2 | `expo-app/src/features/reminders/`; `ProfileScreen.tsx:156`; поиск `getExpoPushTokenAsync` в `expo-app/src` ничего не находит |
| DASS-21 — общественное достояние, перевод Золотаревой | 10.3 | `TODO.md:400` |
| Репозиторий открыт и создан без лицензии | 10.2 | `PUBLISH.md:28` |
