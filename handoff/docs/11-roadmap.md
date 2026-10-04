# 11. План работ и готовые промпты

Как пользоваться: один этап — один разговор с Claude Code. Скопируйте промпт целиком. После этапа проверьте результат по пункту «Готово, когда…», закоммитьте и только потом переходите дальше. Если что-то выглядит не так — пришлите скриншот и название эталона из `handoff/reference/screens-png/`.

## Этап 0. Подготовка (делает владелец)

1. Распакуйте архив в корень репозитория `KulaginMK/Dobratimia`: в корне появятся `CLAUDE.md` и папка `handoff/`. Закоммитьте.
2. Установите Node.js LTS. Для телефона — приложение Expo Go (на первых этапах) и включённый режим разработчика на Android.
3. Запустите Claude Code в папке репозитория.

## Этап 1. Каркас приложения

```
Прочитай CLAUDE.md и handoff/docs/01-product.md, 03-tokens.md, 06-navigation.md.
Создай Expo-приложение в папке expo-app: Expo SDK 57, TypeScript strict, expo-router.
Поставь через npx expo install: react-native-svg, expo-font, @expo-google-fonts/nunito,
@expo-google-fonts/golos-text, react-native-gesture-handler, react-native-reanimated,
@react-native-async-storage/async-storage, expo-haptics, expo-splash-screen, expo-status-bar,
react-dom, react-native-web.
Скопируй handoff/src в expo-app/src, handoff/assets/app/* в expo-app/assets/images,
настрой app.json по разделу «app.json» в 03-tokens.md, алиас @/ → src.
Корневой app/_layout.tsx: загрузка шрифтов (сплэш держится до загрузки), ThemeProvider с
настройкой темы из AsyncStorage, GestureHandlerRootView, StatusBar по теме.
Сделай app/dev/kitchen-sink.tsx: Logo во всех вариантах, Timka в трёх позах, все Icon, все
варианты Button — в светлой и тёмной теме рядом.
В конце объясни мне простыми словами, как запустить это на телефоне и в браузере.
```

Готово, когда: kitchen-sink в браузере и на телефоне выглядит как `handoff/reference/kitchen-sink.png`; `npx tsc --noEmit` без ошибок.

## Этап 2. UI-кит

```
Прочитай handoff/docs/04-components.md и handoff/design-system/web-reference/*.md.
Напиши компоненты Card, TextField, Switch, Chip, ScreenIndicator, BottomSheet, Toast
(+ ToastProvider и useToast), EmptyState, Skeleton и повторяющиеся куски: ScreenHeader,
SosRound, SegmentedControl, PullHint, MoodPicker, SpecialistCard, ContactRow, ProgressBar, ScaleBar.
Точные размеры и цвета бери из handoff/design-system/web-reference/bundle.css, только через токены.
Добавь их все в kitchen-sink в двух темах. Для BottomSheet сравни @gorhom/bottom-sheet и свою
реализацию на Reanimated и объясни мне выбор.
```

Готово, когда: все компоненты есть в kitchen-sink, работают с TalkBack и клавиатурой в вебе.

## Этап 3. Навигация и лента

```
Прочитай handoff/docs/05-screens.md и 06-navigation.md.
Создай все маршруты из карты маршрутов с экранами-заглушками (заголовок + ScreenHeader с SOS).
Сделай FeedPager на app/(app)/index.tsx: 5 экранов, свайпы, индикатор, параметр ?s=,
стрелки на клавиатуре в вебе, упор на краях. Свайп вниз с Техник открывает meditation,
с Подбора — favorites, сверху; свайп вверх закрывает. Системная кнопка «Назад» — по таблице
в 06-navigation.md. Учти «Уменьшить движение».
```

Готово, когда: по ленте можно пройти пальцем, точками и стрелками; «Назад» ведёт как в таблице; SOS открывается с любого экрана.

## Этап 4. SOS

```
Сделай sos/index.tsx и sos/university.tsx по эталонам Sos.png, SosDark.png, SosUni.png
(тексты дословно из handoff/reference/screens-html). Звонки через tel:. Данные вузов — в
src/data/mocks/universities.ts (сейчас заглушки, пометь // ЗАГЛУШКА); выбранный вуз храни локально. Выбор вуза — BottomSheet.
SOS должен открываться без входа и без интернета.
```

## Этап 5. Главная и дневник

```
Сделай Главную (Home.png, HomeMarked.png, HomeDark.png) и Дневник (Diary.png) по
handoff/docs/07-features.md, раздел «Отметка настроения и дневник». Бегущая строка — пока
со значением из заглушки. Данные дневника — локально, через репозиторий src/data/local/mood.ts.
```

## Этап 6. Техники, техника, анатомия

```
Сделай Techniques, Technique (technique/[id]) и Anatomy по эталонам и 07-features.md.
Данные — src/data/techniques.ts и src/data/anatomy.ts. Где текста нет — оставь
«[ТЕКСТ НУЖЕН]» и составь мне список недостающих текстов.
```

## Этап 7. Медитации и Pomodoro

```
Сделай meditation.tsx с вкладками «Дыхание» и «Pomodoro» по Meditation.png, Pomodoro.png
и 07-features.md. Дыхательный круг — Reanimated, строго по секундам схемы. Pomodoro считает
от endsAt. Звуки — пока без файлов, только переключатель (файлы добавим, когда решим с лицензией).
```

## Этап 8. КРИК

```
Сделай scream.tsx со всеми состояниями (Scream, ScreamLive, ScreamResult, ScreamNoMic,
ScreamText) по 07-features.md, раздел «КРИК». Сначала сравни react-native-audio-api и
expo-audio для замера громкости без сохранения звука, проверь работу в вебе и объясни мне,
что выбираешь и нужна ли dev-сборка. Текст из «Выплеснуть текстом» нигде не сохраняй.
```

## Этап 9. DASS-21

```
Сделай dass/index.tsx и dass/result.tsx по DassQuestion.png, DassResult.png и 07-features.md,
раздел «DASS-21». Утверждения пока «Утверждение 1…21» — настоящий текст пришлю отдельно.
Подсчёт вынеси в src/features/dass/score.ts и покрой тестами (jest-expo) все границы уровней.
История — локально.
```

## Этап 10. Доброе слово, подбор, избранное, профиль специалиста

```
Сделай GoodWord (+ шторка автора), Match (колода со свайпом, MatchEmpty), specialist/[id]
и favorites по эталонам и 07-features.md. Данные — через репозитории на моках
(src/data/mocks). Свайп карточки не должен двигать ленту.
```

Готово, когда: главный путь из docs/01 проходится целиком на моках.

## Этап 11. Онбординг, профиль, «О проекте», карта

```
Сделай onboarding/* (5 шагов, показывается один раз), profile.tsx, about.tsx, map.tsx
по эталонам. Вход через Google пока имитируй кнопкой (настоящий — на этапе 12).
«Удалить мои данные» очищает локальное хранилище.
```

## Этап 12. Бэкенд и вход

```
Прочитай handoff/docs/08-data-and-backend.md. Подготовь миграции Supabase (таблицы, RLS,
функции specialist_like_stats, approve_draft, today_count) в папке supabase/ и пошаговую
инструкцию для меня: что нажать в панели Supabase и Google Cloud. Подключи вход через Google
(Android и веб), серверные реализации репозиториев, очередь лайков без сети. Напиши тест,
что контакты специалиста не читаются без лайка.
```

## Этап 13. Кабинет специалиста

```
Сделай cabinet/index, edit, stats по CabCard.png, CabEdit.png, CabStats.png и 07-features.md.
Черновик → проверка администратором. Пункт «Кабинет специалиста» в профиле — только для роли specialist.
```

## Этап 14. Уведомления

```
Подключи expo-notifications: напоминание о дневнике (ежедневно 21:00), DASS-21 раз в 14 дней,
перерыв Pomodoro. Разрешение спрашивай при включении переключателя. Нажатие на уведомление
открывает нужный экран (глубокие ссылки из 06-navigation.md).
```

## Этап 15. Проверка качества

```
Пройди чек-лист из handoff/docs/09-accessibility.md и сравни каждый экран со скриншотом-эталоном
в светлой и тёмной теме. Составь список расхождений и исправь их. Проверь, что в коде нет
hex-цветов вне src/theme и что список заглушек совпадает с handoff/docs/10-placeholders.md.
```

## Этап 16. Публикация

```
Подготовь публикацию: EAS Build для Android (aab), внутреннее тестирование в Google Play,
веб-сборку npx expo export -p web (output single, baseUrl /Dobratimia, копия index.html
в 404.html — см. 03-tokens.md) и деплой на GitHub Pages вместо старой версии
(обнови .github/workflows/deploy.yml). Объясни мне по шагам, что сделать в Google Play Console,
включая «Безопасность данных» и декларации для приложений о здоровье.
```

Перед публикацией: список в docs/10-placeholders.md пуст, тексты проверены психологом и юристом.
