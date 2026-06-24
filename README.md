# Добратимия

Платформа самодиагностики и самопомощи для студентов медицинских вузов.

## Запуск

```bash
cd web
npm install
npm.cmd run dev
```

Откройте http://localhost:5173

> В PowerShell, если `npm` не работает: используйте `npm.cmd`.

## Сборка

```bash
cd web
npm.cmd run build
npm.cmd run preview
```

## Структура

```text
Dobratimia/
├── web/                 # React + TypeScript + Tailwind
│   ├── src/             # код приложения
│   └── public/          # данные, звуки, 3D-модели
└── index.html           # редирект на web/
```

Не заменяет профессиональную психологическую помощь.
