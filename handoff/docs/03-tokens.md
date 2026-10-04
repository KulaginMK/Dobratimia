# 03. Токены

Источник правды — `design-system/tokens.json`. Из него сгенерирован `src/theme/tokens.ts`. Если меняется токен — правится `tokens.json`, затем:

```
python3 handoff/tools/gen_theme.py handoff/design-system/tokens.json expo-app/src/theme
```

## Как пользоваться в коде

```tsx
import { useTheme } from '@/theme';

function Card({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{
      backgroundColor: t.color.surface,
      padding: t.space.lg,
      borderRadius: t.radius.xl,
      boxShadow: t.shadow.sm,
    }}>
      <Text style={[t.type.h3, { color: t.color.text }]}>{children}</Text>
    </View>
  );
}
```

- Корень приложения оборачивается в `<ThemeProvider preference={...}>`. `preference` — настройка «Тема» в профиле: `light`, `dark` или `system` (по умолчанию). Храните её в AsyncStorage.
- Имена совпадают с токенами дизайн-системы: `color.primary` → `t.color.primary`, `space.2xl` → `t.space['2xl']`.
- Тени — строкой `boxShadow` (RN 0.76+, новая архитектура, работает на Android и в вебе). Если где-то не отрисуется — фолбэк `elevation: t.elevation.sm`.
- Шрифты: стиль `t.type.*` уже содержит нужное семейство. **Не задавайте `fontWeight`** с кастомными шрифтами: на Android это ломает начертание. Нужен другой вес — берите `t.fontFamily.text[600]` и т. п.
- Статусбар: `expo-status-bar` со `style="dark"` в светлой теме и `"light"` в тёмной. Android работает в режиме edge-to-edge (цвет системных панелей не задаётся): фон экрана `color.background` должен уходить под панели, отступы содержимого — через `react-native-safe-area-context`.

## Цвет

Все пары «текст + фон» проходят WCAG AA. Цифры контраста — в `tokens.json` (поле `usage`).

| Токен | Светлая | Тёмная | Где |
|---|---|---|---|
| `color.background` | `#FBF5EE` | `#1B1412` | Фон экрана |
| `color.surface` | `#FFFFFF` | `#261C19` | Карточки, поля ввода, нижние шторки |
| `color.surfaceAlt` | `#F5ECE3` | `#31241F` | Невыбранные чипы, фон иконки в списке, вложенные блоки |
| `color.border` | `#EADCD0` | `#3D2E28` | Декоративные разделители и рамки карточек. Не для границ элементов управления — для них color.borderStrong. |
| `color.borderStrong` | `#9C8072` | `#8C7568` | Границы полей ввода, вторичных кнопок, выключенного переключателя: не меньше 3:1 к color.surface и color.background в обеих темах. |
| `color.text` | `#2C1F1A` | `#F6EAE2` | Основной текст и иконки на color.background, color.surface, color.surfaceAlt. |
| `color.textMuted` | `#6A554C` | `#C2ACA1` | Подписи, подсказки, неактивные пункты индикатора на color.background и color.surface (6.4:1 и выше). |
| `color.primary` | `#B4532F` | `#F2A07A` | Терракота. Главная кнопка, КРИК, активный пункт индикатора, ссылки. Текст на ней — color.onPrimary (5.0:1 / 7.7:1). |
| `color.primaryPressed` | `#8E3B22` | `#F6C3A6` | Нажатое состояние главной кнопки. Текст — color.onPrimary. |
| `color.onPrimary` | `#FFFFFF` | `#3D1505` | Текст и иконки на color.primary и color.primaryPressed. |
| `color.primarySoft` | `#F8DCCD` | `#4A2A1E` | Мягкая заливка: выбранный чип, кольцо вокруг КРИКа, аватар, бейджи. Текст на ней — color.onPrimarySoft (8.2:1 / 9.8:1). |
| `color.onPrimarySoft` | `#6B2A12` | `#FFD9C7` | Текст и иконки на color.primarySoft. |
| `color.secondary` | `#6B3A2A` | `#E0B9A3` | Шоколад. Вторая крупная кнопка (DASS-21), тосты, тёмные акцентные блоки. Текст — color.onSecondary (9.3:1 / 8.5:1). |
| `color.onSecondary` | `#FFFFFF` | `#3A1D12` | Текст и иконки на color.secondary. |
| `color.accent` | `#E8B04A` | `#E8B04A` | Мёд. Маленькие радости: отметки, звёздочки, голова в знаке. Только заливкой, текст на нём — color.onAccent (7.4:1). |
| `color.onAccent` | `#3A2600` | `#2E1E00` | Текст на color.accent. |
| `color.growth` | `#6E8A4E` | `#9DB77A` | Зелень ростка: листья в знаке, прогресс заботы о себе, иконки роста. 3.9:1 на светлом — только для иконок и крупных элементов, не для мелкого текста. |
| `color.growthSoft` | `#E3EAD6` | `#2C3523` | Мягкая зелёная заливка: «норма» в шкалах DASS-21, отметка «готово». Текст — color.text. |
| `color.sos` | `#C2185B` | `#FF8FA3` | Малиновый, только для SOS и экстренной помощи. Заметный, но не «аварийный» красный; отличается от color.error и тоном, и светлотой. Текст — color.onSos. |
| `color.onSos` | `#FFFFFF` | `#45001C` | Текст и иконки на color.sos (5.9:1 / 7.7:1). |
| `color.sosSoft` | `#FBE3EA` | `#4A1626` | Бережный блок «Возможно, стоит поговорить со специалистом». Текст — color.onSosSoft. |
| `color.onSosSoft` | `#8A1240` | `#FFC2CF` | Заголовок и текст на color.sosSoft (7.7:1 / 9.7:1). |
| `color.success` | `#3B7A3A` | `#9AD39A` | Успех: «Сохранено», «Готово». Всегда со словом или галочкой. 5.2:1 на color.surface. |
| `color.warning` | `#8E5A00` | `#F0C064` | Предупреждение: «Высокий уровень» в DASS-21. Всегда со словом. 5.8:1 на color.surface. |
| `color.error` | `#B3261E` | `#FF8C82` | Ошибки полей и сети. Всегда с текстом ошибки. 6.5:1 на color.surface. |
| `color.focus` | `#B4532F` | `#F2A07A` | Кольцо фокуса 2 px с отступом 2 px вокруг любого интерактивного элемента: 4.6:1 и выше на фоне и поверхности в обеих темах. |
| `color.skeleton` | `#F0E4D9` | `#33261F` | Заглушки загрузки (скелетоны). |
| `color.scrim` | `rgba(44, 31, 26, 0.45)` | `rgba(0, 0, 0, 0.6)` | Затемнение под нижней шторкой и диалогом. |
| `logo.deep` | `#8E3B22` | `#C8623A` | Знак: верх левой половины (градиент logo.deep → logo.warm). |
| `logo.warm` | `#C8623A` | `#E8946A` | Знак: низ левой половины. |
| `logo.orange` | `#E07B39` | `#F2A07A` | Знак: верх правой половины и основание ростка. |
| `logo.apricot` | `#F2B28A` | `#F6C7A4` | Знак: низ правой половины; тело Тимки. |
| `logo.head` | `#E8B04A` | `#E8B04A` | Знак: голова человека (мёд). |
| `logo.leaf` | `#8FA66B` | `#8FA66B` | Росток в знаке и листья Тимки, середина градиента. |
| `logo.leafDeep` | `#6E8A4E` | `#9DB77A` | Кончики листьев ростка, тёмный лист Тимки. |
| `mascot.cheek` | `#E07A5F` | `#E07A5F` | Румянец Тимки (с прозрачностью 50%). |

Правила:

- На экране одна кнопка `color.primary` (главное действие). Исключения: главная, где ею выделен КРИК, и круглые кнопки звонка в списках контактов (Избранные, SOS вуза) — это не главное действие, а элемент строки.
- `color.sos` — только SOS и звонок в экстренную помощь. Для ошибок — `color.error`.
- `color.growth` на светлом фоне — только иконки и крупные элементы (3,9:1), не мелкий текст.
- `color.textMuted` — не мельче 13 dp.
- Фиолетового в бренде нет.

## Типографика

| Стиль | Шрифт | Кегль/строка | Где |
|---|---|---|---|
| `display` | Nunito 900 | 34/40 | Онбординг, крупные числа |
| `h1` | Nunito 900 | 28/36 | Заголовок экрана |
| `h2` | Nunito 800 | 22/28 | Раздел, карточка техники |
| `h3` | Nunito 800 | 18/24 | Заголовок карточки, шапка экрана |
| `metric` | Nunito 900 | 40/44 | Громкость КРИКа, таймер, баллы |
| `bodyLarge` | Golos Text 400 | 17/26 | Фраза «Доброго слова», вопросы DASS-21 |
| `body` | Golos Text 400 | 16/24 | Основной текст |
| `bodyStrong` | Golos Text 600 | 16/24 | Выделенный текст |
| `button` | Golos Text 600 | 16/20 | Кнопки |
| `caption` | Golos Text 400 | 14/20 | Подписи |
| `label` | Golos Text 500 | 13/16 | Подписи настроения (в индикаторе ленты — 12/16, см. docs/04) |
| `overline` | Golos Text 600 | 12/16, заглавные | Бейдж «ОТ ПСИХОТЕРАПЕВТА» |

Не мельче 12 dp. Поддерживайте системный масштаб шрифта: не отключайте `allowFontScaling`, проверяйте вёрстку при 130%.

## Отступы, размеры, радиусы

- Сетка 4/8: `space.xxs` 4 · `xs` 8 · `sm` 12 · `md` 16 · `lg` 20 · `xl` 24 · `2xl` 32 · `3xl` 48. Боковые поля экрана — `space.screen` (20).
- Внутри карточки — `space.lg`; между карточками — `space.md`; между блоками экрана — `space.xl`.
- `size.touch` 48 (минимум касания) · `size.button` 52 · `size.buttonLarge` 64 · `size.icon` 24 · `size.iconLarge` 32 · `size.avatar` 48 · `size.roundAction` 72 (Карта и SOS на главной) · `size.scream` 188 (кнопка КРИК, кольцо 236).
- `radius.sm` 8 · `md` 12 (поля) · `lg` 16 (кнопки, тосты) · `xl` 22 (карточки) · `2xl` 28 (шторка, карточка специалиста) · `full` (чипы, круглые кнопки).

## app.json: иконка и сплэш

Файлы — `assets/app/`. Скопируйте в `expo-app/assets/images/`.

```json
{
  "expo": {
    "name": "Добратимия",
    "slug": "dobratimia",
    "scheme": "dobratimia",
    "userInterfaceStyle": "automatic",
    "icon": "./assets/images/icon.png",
    "android": {
      "package": "by.dobratimia.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon-foreground.png",
        "monochromeImage": "./assets/images/adaptive-icon-monochrome.png",
        "backgroundColor": "#FBF5EE"
      }
    },
    "web": { "favicon": "./assets/images/favicon.png", "bundler": "metro", "output": "single" },
    "experiments": { "baseUrl": "/Dobratimia" },
    "plugins": [
      "expo-router",
      "expo-font",
      ["expo-splash-screen", {
        "image": "./assets/images/splash-icon.png",
        "imageWidth": 160,
        "backgroundColor": "#FBF5EE",
        "dark": { "image": "./assets/images/splash-icon-dark.png", "backgroundColor": "#1B1412" }
      }]
    ]
  }
}
```

`"output": "single"` — одностраничная веб-сборка: статическая (`static`) не подходит, потому что id специалистов известны только на сервере, а AsyncStorage и проверка входа не работают при пререндере. `baseUrl` нужен для GitHub Pages (`kulaginmk.github.io/Dobratimia`); при своём домене — убрать. Для GitHub Pages также скопируйте `dist/index.html` в `dist/404.html`, чтобы прямые ссылки открывались.

`package` (`by.dobratimia.app`) — предложение; владелец может выбрать другой, но после первой публикации в Google Play его не поменять. Иконка для карточки в Google Play — `play-store-icon-512.png`.
