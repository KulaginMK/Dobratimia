import { Platform } from 'react-native';
import type { SvgProps } from 'react-native-svg';

/**
 * Доступность для <Svg>. С title картинка читается скринридером, без него — скрыта как декоративная.
 * В вебе <Svg> отдаёт пропсы прямо в DOM: нативные accessibility-пропсы там не работают и дают ошибки в консоли.
 */
export function svgA11y(title?: string): SvgProps {
  if (Platform.OS === 'web') {
    return title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true };
  }
  return {
    accessible: !!title,
    accessibilityLabel: title,
    accessibilityElementsHidden: !title,
    importantForAccessibility: title ? 'yes' : 'no-hide-descendants',
  };
}
