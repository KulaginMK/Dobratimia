# Добратимия

Платформа самодиагностики и самопомощи для студентов медицинских вузов.

## Запуск

```bash
cd web
npm install
npm.cmd run dev
```

Откройте http://localhost:5173

> В PowerShell, если `npm` не работает: используйте `npm.cmd` вместо `npm`.

## Сборка

```bash
cd web
npm.cmd run build
npm.cmd run preview
```

## Репозиторий

```text
Dobratimia/
├── web/                 # React + TypeScript + Tailwind
│   ├── src/             # код приложения
│   └── public/          # данные, звуки, модели
├── index.html           # ссылка на web/
├── README.md
└── .gitignore
```

## GitHub

Remote: https://github.com/sh4d0wwq/Dobratimia.git

```bash
git add .
git commit -m "React app: remove legacy HTML prototypes"
git push
```

## GitHub Pages (опционально)

В Settings → Pages: Source **GitHub Actions** или публикуйте содержимое `web/dist` после `npm run build`.

## Медиа

- `web/public/data/anatomy-stress.json` — тексты органов
- `web/public/assets/sounds/` — MP3 (см. README в папке)

Не заменяет профессиональную психологическую помощь.
