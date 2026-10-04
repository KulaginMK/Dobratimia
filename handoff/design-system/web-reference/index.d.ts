import type { ReactNode } from 'react';

export type IconName = 'home' | 'scream' | 'breath' | 'techniques' | 'diary' | 'specialist' | 'map' | 'sos' | 'phone' | 'message' | 'heart' | 'sprout' | 'bell' | 'close' | 'chevronRight' | 'chevronLeft' | 'check' | 'play' | 'pause';

/** Знак «Две половины» с надписью или без. Цвета берутся из токенов logo.*. */
export interface LogoProps {
  /** horizontal — знак и надпись в строку; stacked — надпись под знаком; mark — только знак. */
  variant?: 'horizontal' | 'stacked' | 'mark';
  /** Высота знака в px. Не меньше 24. По умолчанию 40. */
  size?: number;
  /** Один цвет для монохромной версии, например '#2C1F1A' или '#FFFFFF'. */
  mono?: string;
}

/** Маскот Тимка. */
export interface TimkaProps {
  /** hello — онбординг, breathe — медитации, sleep — пустые состояния. */
  pose?: 'hello' | 'breathe' | 'sleep';
  /** Размер в px. По умолчанию 160. */
  size?: number;
  /** Альтернативный текст. По умолчанию описывает позу. */
  title?: string;
}

/** Иконка в стиле «мягкие формы». Цвет — currentColor. */
export interface IconProps {
  name: IconName;
  /** Размер в px. По умолчанию 24. */
  size?: number;
  /** Цвет, если не наследуется от родителя. */
  color?: string;
  /** Текст для скринридера. Без него иконка декоративная. */
  title?: string;
  className?: string;
}

/** Кнопка. Высота 52 (md) или 64 (lg), область касания не меньше 48. */
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'text' | 'sos' | 'deep';
  size?: 'md' | 'lg';
  /** Иконка слева. */
  icon?: IconName;
  /** Иконка справа, например chevronRight. */
  iconRight?: IconName;
  fullWidth?: boolean;
  disabled?: boolean;
  /** Если задан — кнопка рендерится ссылкой. */
  href?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  /** Обязателен для кнопки только с иконкой. */
  'aria-label'?: string;
  children?: ReactNode;
}

/** Карточка-контейнер. */
export interface CardProps {
  variant?: 'surface' | 'soft' | 'outline' | 'sos';
  /** Нажимается целиком: поднимается при наведении. */
  interactive?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}

/** Поле ввода с подписью, подсказкой и ошибкой. */
export interface TextFieldProps {
  label?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  /** Подсказка под полем. */
  hint?: string;
  /** Текст ошибки: заменяет подсказку и красит поле. */
  error?: string;
  multiline?: boolean;
  rows?: number;
  type?: 'text' | 'tel' | 'email' | 'url';
  disabled?: boolean;
  onChange?: (value: string) => void;
}

/** Переключатель с подписью. */
export interface SwitchProps {
  label: string;
  /** Вторая строка, например расписание: «Каждый день в 21:00». */
  description?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

/** Чип-переключатель: специализации, фильтры, режимы. */
export interface ChipProps {
  selected?: boolean;
  defaultSelected?: boolean;
  icon?: IconName;
  disabled?: boolean;
  onChange?: (selected: boolean) => void;
  children: ReactNode;
}

/** Индикатор ленты экранов внизу. */
export interface ScreenIndicatorProps {
  /** Названия экранов слева направо. По умолчанию: Анатомия, Техники, Главная, Специалисты, Слово. */
  screens?: string[];
  /** Индекс текущего экрана. */
  current?: number;
  defaultCurrent?: number;
  /** labels — подписи под точками; dots — точки, активный экран подписан. */
  variant?: 'labels' | 'dots';
  onSelect?: (index: number) => void;
  /** Ссылки на экраны в том же порядке: пункты становятся ссылками (веб и прототип). */
  hrefs?: string[];
}

/** Нижняя шторка с затемнением. */
export interface BottomSheetProps {
  open?: boolean;
  title?: string;
  onClose?: () => void;
  /** Рисовать внутри родителя (position: absolute) вместо всего окна. */
  inline?: boolean;
  children?: ReactNode;
}

/** Короткое уведомление внизу экрана. */
export interface ToastProps {
  message: string;
  tone?: 'neutral' | 'success' | 'error';
  actionLabel?: string;
  onAction?: () => void;
}

/** Пустое состояние с Тимкой. */
export interface EmptyStateProps {
  title: string;
  text?: string;
  pose?: 'hello' | 'breathe' | 'sleep';
  illustrationSize?: number;
  actionLabel?: string;
  onAction?: () => void;
}

/** Заглушка загрузки. */
export interface SkeletonProps {
  variant?: 'text' | 'listItem' | 'card' | 'circle';
  /** Число строк для variant="text". */
  lines?: number;
  /** Высота для variant="card". */
  height?: number;
  /** Диаметр для variant="circle". */
  size?: number;
}
