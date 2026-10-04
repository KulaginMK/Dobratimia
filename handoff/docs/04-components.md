# 04. Компоненты

UI-кит пишется на React Native заново, с теми же именами и пропсами, что в веб-эталоне (`design-system/web-reference/index.d.ts`). Веб-эталон (`bundle.js` + `bundle.css`) — источник точных размеров и цветов; его можно открыть в браузере, но в приложение он не копируется.

Отличия от веба во всех компонентах: `onClick` → `onPress`; `aria-label` → `accessibilityLabel`; `href` не нужен — навигация через `router.push()`.

## Уже готово (`src/`: TypeScript проверен в Expo SDK 57, отрисовка проверена в веб-сборке; на Android запустить на этапе 1)

| Компонент | Файл | Что умеет |
|---|---|---|
| `ThemeProvider`, `useTheme` | `src/theme/ThemeProvider.tsx` | Светлая/тёмная/как в системе, все токены |
| `appFonts` | `src/theme/fonts.ts` | Набор для `useFonts()` |
| `Icon` | `src/components/brand/Icon.tsx` | 19 иконок, `size`, `color`, `title` |
| `Logo` | `src/components/brand/Logo.tsx` | `horizontal` / `stacked` / `mark`, `mono` |
| `Timka` | `src/components/brand/Timka.tsx` | `hello` / `breathe` / `sleep` |
| `Button` | `src/components/ui/Button.tsx` | 6 вариантов, `md`/`lg`, иконки слева/справа, только иконка, `disabled` |

Фигуры SVG для них сгенерированы в `src/components/brand/shapes.ts` из `assets/svg/`.

## Нужно написать

Для каждого: сверить с веб-эталоном (`web-reference/<Имя>.md`, `bundle.css`) и со скриншотами экранов, где он используется. Собрать все компоненты на одном экране `app/dev/kitchen-sink.tsx` (только в dev-сборке) в двух темах.

### Card
- `variant`: `surface` (фон `color.surface`, тень `shadow.sm`) · `soft` (`color.primarySoft`, текст `onPrimarySoft`) · `outline` (`color.surface` + рамка 1 `color.border`) · `sos` (`color.sosSoft`, текст `onSosSoft`).
- Радиус `radius.xl`, отступ `space.lg`.
- `interactive` + `onPress` → `Pressable` с `accessibilityRole="button"`; нажатие — тень `shadow.md`, масштаб 0,99.

### TextField
- Подпись сверху (14/20, 600, `color.text`) — всегда видна, плейсхолдер подписью не считается. Отступ между подписью, полем и подсказкой — 6.
- Поле: высота ≥ 52, радиус `radius.md`, рамка 1,5 `color.borderStrong`, фон `color.surface`, текст `body`. Фокус — рамка `color.focus` 2.
- `hint` под полем (`caption`, `textMuted`); `error` заменяет подсказку, красит рамку и текст в `color.error`, объявляется скринридеру.
- `multiline` + `rows` (минимальная высота ≈ rows × 24 + 28). `type`: `tel` → `keyboardType="phone-pad"`, `email`, `url`.
- Контролируемый (`value`+`onChange`) и неконтролируемый (`defaultValue`) режимы.

### Switch
- Строка ≥ 56: слева `label` (16/22) и `description` (`caption`, `textMuted`), справа трек 56×32.
- Выключен: рамка 1,5 `color.borderStrong`, бегунок `color.borderStrong`. Включён: трек `color.primary`, бегунок `color.onPrimary` с галочкой цвета `color.primary`. Состояние видно не только по цвету.
- Вся строка нажимается. `accessibilityRole="switch"`, `accessibilityState={{ checked }}`.

### Chip
- Высота 40 видимая, область касания 48 (`hitSlop`). Радиус `full`. Невыбранный — фон `color.surfaceAlt`, рамка 1,5 `color.border`. Выбранный — `color.primarySoft`, рамка `color.primary`, текст `onPrimarySoft` 600, галочка слева.
- `icon` — иконка вместо галочки. В карточке специалиста чипы только показывают специализации: вариант без нажатия (бейдж).

### ScreenIndicator
- Лента: Анатомия · Техники · Главная · Специалисты · Слово.
- `variant="labels"`: 5 равных пунктов 48×52, точка 8×8 `color.textMuted` над подписью (Golos Text 500, 12/16; `maxFontSizeMultiplier={1.3}`). Активный: точка становится полоской 24×8 `color.primary` (анимация ширины 200 мс), подпись `color.primary` 700.
- `variant="dots"`: только точки, активный экран подписан справа от точки.
- Пропс `screens` — свои подписи: так индикатор работает вкладками в кабинете специалиста («Моя карточка · Статистика»).
- `current` + `onSelect(index)`. У активного `accessibilityState={{ selected: true }}`, у всех `accessibilityRole="tab"`, подпись «Главная, экран 3 из 5».
- Над индикатором — граница 1 `color.border`. Индикатор не прячется на «Подборе специалиста».

### BottomSheet
- Поверх всего окна, затемнение `color.scrim`, верхние углы `radius.2xl`, ручка 40×4 `color.borderStrong`, тень `shadow.lg`, отступы `space.lg`.
- Заголовок Nunito 800 20/26 и крестик 48×48. Закрывается крестиком, тапом по затемнению, свайпом вниз и системной кнопкой «Назад».
- Высота по содержимому, не больше 88% экрана; если больше — содержимое прокручивается. Появление 320 мс.
- Реализация: `@gorhom/bottom-sheet` (проверьте совместимость с SDK 57 и вебом) или свой на Reanimated + Gesture Handler. Выбор обоснуйте владельцу.

### Toast
- Внизу экрана над индикатором ленты, фон `color.secondary`, текст `color.onSecondary`, радиус `radius.lg`, тень `shadow.md`.
- `tone`: `neutral`; `success` — круг 24 `growthSoft` с галочкой `success`; `error` — круг `sosSoft` с крестиком `error`.
- Одно действие (`actionLabel`, подчёркнутый текст 600). Исчезает через 4 с, с действием — через 6 с.
- Глобальный `ToastProvider` + `useToast().show({...})`. Для `error` — `accessibilityLiveRegion="assertive"`, иначе `"polite"`.

### EmptyState
- По центру: Тимка (`pose`, обычно `sleep`, размер 140), заголовок Nunito 800 20/26, текст 15/22 `textMuted` (до 300 dp), кнопка `primary`.
- Исключение: «Специалисты закончились» — вместо Тимки иконка `specialist` в круге `color.primarySoft` (см. MatchEmpty.png).

### Skeleton
- `text` (строки 14, радиус 8, отступ 10, последняя строка 60%), `listItem` (квадрат 48 радиус 12 + две строки), `card` (`height`, радиус `xl`), `circle` (`size`).
- Цвет `color.skeleton`, пульсация прозрачности 1,6 с; при «Уменьшить движение» — без пульсации.
- Показывать, только если загрузка дольше 300 мс.

## Повторяющиеся куски экранов (тоже вынести в компоненты)

| Компонент | Где | Описание |
|---|---|---|
| `ScreenHeader` | Все экраны вне ленты | Назад (chevronLeft 48×48) или Закрыть (close), заголовок `h3`, справа кнопка SOS: высота 48, радиус full, `color.sos`, иконка sos + «SOS» 15/700 |
| `SosRound` | Экраны ленты | Круглая 48×48 `color.sos` с текстом «SOS» Nunito 900 13; `accessibilityLabel="SOS — экстренная помощь"` |
| `SegmentedControl` | Доброе слово, КРИК, Медитации, Профиль (тема) | Фон `surfaceAlt`, отступ 4, сегменты ≥ 48 (в макетах 44 — увеличить до нормы касания), выбранный — `surface` + `shadow.sm`, `accessibilityRole="tab"`. В `web-reference/Chip.md` режим «Сахарный / С перчиком» назван чипами — это устарело, используйте SegmentedControl |
| `PullHint` | Техники, Подбор, Медитации, Избранные | Ручка 40×4 + подпись `caption` «Потяните вниз — …» / «Свайп вверх — …»; нажимается как кнопка |
| `MoodPicker` | Главная | 5 лиц (Тяжело, Грустно, Ровно, Хорошо, Отлично), кружки 52 `color.primarySoft`; выбранное — `color.primary` и двойное кольцо (3 цвета фона + 2 `color.primary`); подпись `label`; `accessibilityRole="radio"` |
| `SpecialistCard` | Подбор, кабинет | Фото/силуэт сверху, имя `h3`, роль и опыт `caption`, до 3 чипов-бейджей, цитата, формат и город; счётчик «3 из 12» |
| `ContactRow` | SOS, Избранные, профиль специалиста | Аватар-инициалы 48, имя 16/600, подпись `caption`, кнопка-звонок 48 `color.primary` с `accessibilityLabel="Позвонить <имя>"` |
| `ProgressBar` | DASS-21 | Высота 8, фон `surfaceAlt`, заполнение `color.primary`, `accessibilityRole="progressbar"` |
| `ScaleBar` | Результат DASS-21 | Пять сегментов «Норма → Крайне высокий», уровень словом рядом |
