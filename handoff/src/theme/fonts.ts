import {
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
} from '@expo-google-fonts/nunito';
import {
  GolosText_400Regular,
  GolosText_500Medium,
  GolosText_600SemiBold,
  GolosText_700Bold,
} from '@expo-google-fonts/golos-text';

/**
 * Передайте в useFonts() в корневом _layout.tsx и держите сплэш, пока шрифты не загрузились:
 *   const [loaded] = useFonts(appFonts);
 * Nunito — заголовки и крупные числа, Golos Text — текст. Обе гарнитуры OFL, полная кириллица с «Ё».
 */
export const appFonts = {
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Nunito_900Black,
  GolosText_400Regular,
  GolosText_500Medium,
  GolosText_600SemiBold,
  GolosText_700Bold,
};
