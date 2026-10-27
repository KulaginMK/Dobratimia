// Сгенерировано из design-system/tokens.json. Не правьте руками — меняйте tokens.json и перегенерируйте.
// Имена совпадают с токенами дизайн-системы: color.primary → theme.color.primary.

export type SchemeName = 'light' | 'dark';

const lightPalette = {
  color: {
    /** Фон экрана */
    background: '#FBF5EE',
    /** Карточки, поля ввода, нижние шторки */
    surface: '#FFFFFF',
    /** Невыбранные чипы, фон иконки в списке, вложенные блоки */
    surfaceAlt: '#F5ECE3',
    /** Декоративные разделители и рамки карточек. Не для границ элементов управления — для них color.borderStrong. */
    border: '#EADCD0',
    /** Границы полей ввода, вторичных кнопок, выключенного переключателя: не меньше 3:1 к color.surface и color.background в обеих темах. */
    borderStrong: '#9C8072',
    /** Основной текст и иконки на color.background, color.surface, color.surfaceAlt. */
    text: '#2C1F1A',
    /** Подписи, подсказки, неактивные пункты индикатора на color.background и color.surface (6.4:1 и выше). */
    textMuted: '#6A554C',
    /** Терракота. Главная кнопка, КРИК, активный пункт индикатора, ссылки. Текст на ней — color.onPrimary (5.0:1 / 7.7:1). */
    primary: '#B4532F',
    /** Нажатое состояние главной кнопки. Текст — color.onPrimary. */
    primaryPressed: '#8E3B22',
    /** Текст и иконки на color.primary и color.primaryPressed. */
    onPrimary: '#FFFFFF',
    /** Мягкая заливка: выбранный чип, кольцо вокруг КРИКа, аватар, бейджи. Текст на ней — color.onPrimarySoft (8.2:1 / 9.8:1). */
    primarySoft: '#F8DCCD',
    /** Текст и иконки на color.primarySoft. */
    onPrimarySoft: '#6B2A12',
    /** Шоколад. Вторая крупная кнопка (DASS-21), тосты, тёмные акцентные блоки. Текст — color.onSecondary (9.3:1 / 8.5:1). */
    secondary: '#6B3A2A',
    /** Текст и иконки на color.secondary. */
    onSecondary: '#FFFFFF',
    /** Мёд. Маленькие радости: отметки, звёздочки, голова в знаке. Только заливкой, текст на нём — color.onAccent (7.4:1). */
    accent: '#E8B04A',
    /** Текст на color.accent. */
    onAccent: '#3A2600',
    /** Зелень ростка: листья в знаке, прогресс заботы о себе, иконки роста. 3.9:1 на светлом — только для иконок и крупных элементов, не для мелкого текста. */
    growth: '#6E8A4E',
    /** Мягкая зелёная заливка: «норма» в шкалах DASS-21, отметка «готово». Текст — color.text. */
    growthSoft: '#E3EAD6',
    /** Малиновый, только для SOS и экстренной помощи. Заметный, но не «аварийный» красный; отличается от color.error и тоном, и светлотой. Текст — color.onSos. */
    sos: '#C2185B',
    /** Текст и иконки на color.sos (5.9:1 / 7.7:1). */
    onSos: '#FFFFFF',
    /** Бережный блок «Возможно, стоит поговорить со специалистом». Текст — color.onSosSoft. */
    sosSoft: '#FBE3EA',
    /** Заголовок и текст на color.sosSoft (7.7:1 / 9.7:1). */
    onSosSoft: '#8A1240',
    /** Успех: «Сохранено», «Готово». Всегда со словом или галочкой. 5.2:1 на color.surface. */
    success: '#3B7A3A',
    /** Предупреждение: «Высокий уровень» в DASS-21. Всегда со словом. 5.8:1 на color.surface. */
    warning: '#8E5A00',
    /** Ошибки полей и сети. Всегда с текстом ошибки. 6.5:1 на color.surface. */
    error: '#B3261E',
    /** Кольцо фокуса 2 px с отступом 2 px вокруг любого интерактивного элемента: 4.6:1 и выше на фоне и поверхности в обеих темах. */
    focus: '#B4532F',
    /** Заглушки загрузки (скелетоны). */
    skeleton: '#F0E4D9',
    /** Затемнение под нижней шторкой и диалогом. */
    scrim: 'rgba(44, 31, 26, 0.45)',
  },
  logo: {
    /** Знак: верх левой половины (градиент logo.deep → logo.warm). */
    deep: '#8E3B22',
    /** Знак: низ левой половины. */
    warm: '#C8623A',
    /** Знак: верх правой половины и основание ростка. */
    orange: '#E07B39',
    /** Знак: низ правой половины; тело Тимки. */
    apricot: '#F2B28A',
    /** Знак: голова человека (мёд). */
    head: '#E8B04A',
    /** Росток в знаке и листья Тимки, середина градиента. */
    leaf: '#8FA66B',
    /** Кончики листьев ростка, тёмный лист Тимки. */
    leafDeep: '#6E8A4E',
  },
  mascot: {
    /** Румянец Тимки (с прозрачностью 50%). */
    cheek: '#E07A5F',
    /** Облачка воздуха у Тимки на вдохе и выдохе. */
    puff: '#D9A88F',
  },
} as const;

const darkPalette = {
  color: {
    /** Фон экрана */
    background: '#1B1412',
    /** Карточки, поля ввода, нижние шторки */
    surface: '#261C19',
    /** Невыбранные чипы, фон иконки в списке, вложенные блоки */
    surfaceAlt: '#31241F',
    /** Декоративные разделители и рамки карточек. Не для границ элементов управления — для них color.borderStrong. */
    border: '#3D2E28',
    /** Границы полей ввода, вторичных кнопок, выключенного переключателя: не меньше 3:1 к color.surface и color.background в обеих темах. */
    borderStrong: '#8C7568',
    /** Основной текст и иконки на color.background, color.surface, color.surfaceAlt. */
    text: '#F6EAE2',
    /** Подписи, подсказки, неактивные пункты индикатора на color.background и color.surface (6.4:1 и выше). */
    textMuted: '#C2ACA1',
    /** Терракота. Главная кнопка, КРИК, активный пункт индикатора, ссылки. Текст на ней — color.onPrimary (5.0:1 / 7.7:1). */
    primary: '#F2A07A',
    /** Нажатое состояние главной кнопки. Текст — color.onPrimary. */
    primaryPressed: '#F6C3A6',
    /** Текст и иконки на color.primary и color.primaryPressed. */
    onPrimary: '#3D1505',
    /** Мягкая заливка: выбранный чип, кольцо вокруг КРИКа, аватар, бейджи. Текст на ней — color.onPrimarySoft (8.2:1 / 9.8:1). */
    primarySoft: '#4A2A1E',
    /** Текст и иконки на color.primarySoft. */
    onPrimarySoft: '#FFD9C7',
    /** Шоколад. Вторая крупная кнопка (DASS-21), тосты, тёмные акцентные блоки. Текст — color.onSecondary (9.3:1 / 8.5:1). */
    secondary: '#E0B9A3',
    /** Текст и иконки на color.secondary. */
    onSecondary: '#3A1D12',
    /** Мёд. Маленькие радости: отметки, звёздочки, голова в знаке. Только заливкой, текст на нём — color.onAccent (7.4:1). */
    accent: '#E8B04A',
    /** Текст на color.accent. */
    onAccent: '#2E1E00',
    /** Зелень ростка: листья в знаке, прогресс заботы о себе, иконки роста. 3.9:1 на светлом — только для иконок и крупных элементов, не для мелкого текста. */
    growth: '#9DB77A',
    /** Мягкая зелёная заливка: «норма» в шкалах DASS-21, отметка «готово». Текст — color.text. */
    growthSoft: '#2C3523',
    /** Малиновый, только для SOS и экстренной помощи. Заметный, но не «аварийный» красный; отличается от color.error и тоном, и светлотой. Текст — color.onSos. */
    sos: '#FF8FA3',
    /** Текст и иконки на color.sos (5.9:1 / 7.7:1). */
    onSos: '#45001C',
    /** Бережный блок «Возможно, стоит поговорить со специалистом». Текст — color.onSosSoft. */
    sosSoft: '#4A1626',
    /** Заголовок и текст на color.sosSoft (7.7:1 / 9.7:1). */
    onSosSoft: '#FFC2CF',
    /** Успех: «Сохранено», «Готово». Всегда со словом или галочкой. 5.2:1 на color.surface. */
    success: '#9AD39A',
    /** Предупреждение: «Высокий уровень» в DASS-21. Всегда со словом. 5.8:1 на color.surface. */
    warning: '#F0C064',
    /** Ошибки полей и сети. Всегда с текстом ошибки. 6.5:1 на color.surface. */
    error: '#FF8C82',
    /** Кольцо фокуса 2 px с отступом 2 px вокруг любого интерактивного элемента: 4.6:1 и выше на фоне и поверхности в обеих темах. */
    focus: '#F2A07A',
    /** Заглушки загрузки (скелетоны). */
    skeleton: '#33261F',
    /** Затемнение под нижней шторкой и диалогом. */
    scrim: 'rgba(0, 0, 0, 0.6)',
  },
  logo: {
    /** Знак: верх левой половины (градиент logo.deep → logo.warm). */
    deep: '#C8623A',
    /** Знак: низ левой половины. */
    warm: '#E8946A',
    /** Знак: верх правой половины и основание ростка. */
    orange: '#F2A07A',
    /** Знак: низ правой половины; тело Тимки. */
    apricot: '#F6C7A4',
    /** Знак: голова человека (мёд). */
    head: '#E8B04A',
    /** Росток в знаке и листья Тимки, середина градиента. */
    leaf: '#8FA66B',
    /** Кончики листьев ростка, тёмный лист Тимки. */
    leafDeep: '#9DB77A',
  },
  mascot: {
    /** Румянец Тимки (с прозрачностью 50%). */
    cheek: '#E07A5F',
    /** Облачка воздуха у Тимки на вдохе и выдохе. */
    puff: '#D9A88F',
  },
} as const;

export const palettes = { light: lightPalette, dark: darkPalette };
export type Palette = { [G in keyof typeof lightPalette]: { [K in keyof (typeof lightPalette)[G]]: string } };

export const space = {
  /** Между иконкой и подписью внутри чипа. */
  xxs: 4,
  /** Между связанными элементами: заголовок и подзаголовок, чипы в ряду. */
  xs: 8,
  /** Внутренние отступы чипов и тостов по вертикали. */
  sm: 12,
  /** Отступ внутри карточки, между карточками в списке. */
  md: 16,
  /** Внутренние отступы крупных карточек и шторок. */
  lg: 20,
  /** Боковые поля экрана 412 dp. */
  screen: 20,
  /** Между блоками экрана. */
  xl: 24,
  /** Между крупными секциями, над пустым состоянием. */
  '2xl': 32,
  /** Верхний отступ онбординга и результатов. */
  '3xl': 48,
} as const;

export const size = {
  /** Минимальная область касания любого элемента. */
  touch: 48,
  /** Высота обычной кнопки. */
  button: 52,
  /** Высота крупной кнопки (DASS-21, «Позвонить»). */
  buttonLarge: 64,
  /** Иконка в интерфейсе. */
  icon: 24,
  /** Иконка в карточке-списке. */
  iconLarge: 32,
  /** Аватар профиля в шапке. */
  avatar: 48,
  /** Круглые кнопки «Карта» и «SOS» на главной. */
  roundAction: 72,
  /** Кнопка КРИК; кольцо вокруг — 236px. */
  scream: 188,
} as const;

export const radius = {
  /** Скелетон строки, мелкие бейджи. */
  sm: 8,
  /** Поля ввода, иконка в списке. */
  md: 12,
  /** Кнопки, тосты. */
  lg: 16,
  /** Карточки. */
  xl: 22,
  /** Верх нижней шторки, крупная карточка специалиста. */
  '2xl': 28,
  /** Чипы, переключатели, круглые кнопки, аватары. */
  full: 999,
} as const;

/** Тени: строка boxShadow (React Native 0.76+, новая архитектура; работает на Android и в вебе). */
export const shadows = {
  light: {
    sm: '0 1px 2px rgba(44, 31, 26, 0.06), 0 2px 6px rgba(44, 31, 26, 0.06)',
    md: '0 6px 18px rgba(44, 31, 26, 0.12)',
    lg: '0 -8px 32px rgba(44, 31, 26, 0.16)',
  },
  dark: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.4)',
    md: '0 6px 18px rgba(0, 0, 0, 0.5)',
    lg: '0 -8px 32px rgba(0, 0, 0, 0.6)',
  },
} as const;

/** Фолбэк для старых устройств/старой архитектуры: elevation на Android. */
export const elevation = { sm: 2, md: 6, lg: 16 } as const;

/** Имена семейств после загрузки через expo-font (см. fonts.ts). На кастомных шрифтах не задавайте fontWeight — вес уже в имени семейства. */
export const fontFamily = {
  display: { 700: 'Nunito_700Bold', 800: 'Nunito_800ExtraBold', 900: 'Nunito_900Black' },
  text: { 400: 'GolosText_400Regular', 500: 'GolosText_500Medium', 600: 'GolosText_600SemiBold', 700: 'GolosText_700Bold' },
} as const;

export const typography = {
  /** Онбординг, крупные числа в результатах. */
  display: { fontFamily: 'Nunito_900Black', fontSize: 34, lineHeight: 40, letterSpacing: -0.34 },
  /** Заголовок экрана. */
  h1: { fontFamily: 'Nunito_900Black', fontSize: 28, lineHeight: 36 },
  /** Заголовок раздела, карточки техники. */
  h2: { fontFamily: 'Nunito_800ExtraBold', fontSize: 22, lineHeight: 28 },
  /** Заголовок карточки, шторки. */
  h3: { fontFamily: 'Nunito_800ExtraBold', fontSize: 18, lineHeight: 24 },
  /** Крупные числа: громкость КРИКа, таймер, баллы. */
  metric: { fontFamily: 'Nunito_900Black', fontSize: 40, lineHeight: 44 },
  /** Фраза «Доброго слова», вопросы DASS-21. */
  bodyLarge: { fontFamily: 'GolosText_400Regular', fontSize: 17, lineHeight: 26 },
  /** Основной текст. */
  body: { fontFamily: 'GolosText_400Regular', fontSize: 16, lineHeight: 24 },
  /** Выделение внутри текста, заголовки тостов. */
  bodyStrong: { fontFamily: 'GolosText_600SemiBold', fontSize: 16, lineHeight: 24 },
  /** Текст кнопок. */
  button: { fontFamily: 'GolosText_600SemiBold', fontSize: 16, lineHeight: 20 },
  /** Подписи, подсказки полей. */
  caption: { fontFamily: 'GolosText_400Regular', fontSize: 14, lineHeight: 20 },
  /** Подписи индикатора ленты, чипы-метки, подписи настроения. */
  label: { fontFamily: 'GolosText_500Medium', fontSize: 13, lineHeight: 16 },
  /** Бейджи и надзаголовки, всегда заглавными. */
  overline: { fontFamily: 'GolosText_600SemiBold', fontSize: 12, lineHeight: 16, letterSpacing: 0.72, textTransform: 'uppercase' as const },
} as const;

/** Длительности анимаций, мс. Кривая — ease-out, без пружин. */
export const motion = { press: 160, toast: 240, feed: 240, sheet: 320 } as const;
