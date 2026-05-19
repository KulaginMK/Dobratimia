# Добратимия

Платформа самодиагностики и самопомощи для студентов медицинских вузов (дипломный проект).

## Структура репозитория

```
Dobratimia/
├── index.html              # Точка входа (выбор desktop / mobile)
├── NUMDOBRA.html           # Десктоп-версия (основная)
├── dobratimia-mobile.html  # Мобильная версия
├── assets/                 # Медиа по разделам
│   ├── images/sections/    # Картинки: home, scream, dass-21, meditation…
│   ├── sounds/             # UI, крик, ambient (дождь, ветер…)
│   ├── animations/gifs/    # GIF-анимации
│   └── cursor/             # Кастомный курсор (.cur / .png)
├── css/                    # Стили компонентов
├── js/                     # Логика модулей
└── data/                   # JSON-данные (анатомия стресса и т.д.)
```

## Запуск локально

Откройте `index.html` или `NUMDOBRA.html` в браузере (Chrome/Edge рекомендуются для голосового ввода).

```bash
# Опционально — простой сервер (нужен для некоторых API в будущем)
npx --yes serve .
```

## Публикация на GitHub

```bash
git init
git add .
git commit -m "Initial structure: Dobratimia platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Dobratimia.git
git push -u origin main
```

Включите **GitHub Pages** (Settings → Pages → Source: `main` / root) для бесплатного хостинга статики.

## Куда класть файлы

| Тип | Папка | Пример |
|-----|--------|--------|
| Логотип | `assets/images/brand/` | `logo.png` |
| Иллюстрации раздела | `assets/images/sections/<раздел>/` | `assets/images/sections/meditation/breathing.png` |
| Звук «Отпустить» | `assets/sounds/scream/` | `release.mp3` |
| Ambient подкасты | `assets/sounds/ambient/` | `rain.mp3`, `wind.mp3` |
| GIF | `assets/animations/gifs/` | `calm-loop.gif` |
| Курсор | `assets/cursor/` | `pointer.png` + `pointer.cur` |

## Разделы приложения

| Раздел | ID | Описание |
|--------|-----|----------|
| Главная | `home` | Карусель методик |
| Крик | `scream` | Анонимный выплеск + голос + звук отпускания |
| DASS-21 | `dass` | Шкала депрессии, тревоги, стресса |
| Медитации | `meditation` | Дыхание, сон, ambient-звуки |
| Техники | `techniques` | Самопомощь |
| Психообразование | `psychoeducation` | Анатомия стресса (интерактив) |
| Доброе слово | `goodword` | Поддерживающие фразы |
| Карта | `map` | Бережные места |
| О проекте | `about` | Описание и статистика |

## Идеи для развития

- **Дневник настроения** — график за неделю после DASS-21
- **SOS-кнопка** — быстрый вызов телефонов из сайдбара
- **PWA** — установка на телефон как приложение
- **Экспорт PDF** — результаты теста для визита к психологу
- **Таймер учёбы** — Pomodoro в разделе «Техники»
- **Дыхание по камере** — опционально, с согласия пользователя

## Лицензия

Учебный проект. Не заменяет профессиональную психологическую помощь.
