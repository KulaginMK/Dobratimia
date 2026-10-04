import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import {
  palettes,
  shadows,
  space,
  size,
  radius,
  typography,
  fontFamily,
  motion,
  elevation,
  type Palette,
  type SchemeName,
} from './tokens';

/** Настройка «Тема» в профиле: «Светлая», «Тёмная», «Как в системе». */
export type ThemePreference = 'light' | 'dark' | 'system';

export type Theme = Palette & {
  scheme: SchemeName;
  space: typeof space;
  size: typeof size;
  radius: typeof radius;
  shadow: { sm: string; md: string; lg: string };
  elevation: typeof elevation;
  type: typeof typography;
  fontFamily: typeof fontFamily;
  motion: typeof motion;
};

export function buildTheme(scheme: SchemeName): Theme {
  return {
    ...palettes[scheme],
    scheme,
    space,
    size,
    radius,
    shadow: shadows[scheme],
    elevation,
    type: typography,
    fontFamily,
    motion,
  };
}

const ThemeContext = createContext<Theme>(buildTheme('light'));

type Props = {
  /** Значение настройки из профиля. Хранение (AsyncStorage и т. п.) — на стороне приложения. */
  preference?: ThemePreference;
  children: React.ReactNode;
};

export function ThemeProvider({ preference = 'system', children }: Props) {
  const system = useColorScheme();
  const scheme: SchemeName =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  const theme = useMemo(() => buildTheme(scheme), [scheme]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** theme.color.primary, theme.space.md, theme.radius.xl, theme.type.h1 … */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/** Достаёт токен по пути вида 'logo.apricot' или 'color.border'. */
export function tokenByPath(theme: Theme, path: string): string | undefined {
  const [group, name] = path.split('.');
  const g = (theme as unknown as Record<string, Record<string, unknown>>)[group];
  const v = g?.[name];
  return typeof v === 'string' ? v : undefined;
}
