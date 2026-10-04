import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadThemePreference, saveThemePreference } from '@/data/local/themePreference';
import { ThemeProvider, type ThemePreference } from './ThemeProvider';

type ThemePreferenceValue = {
  /** «Светлая», «Тёмная» или «Как в системе». */
  preference: ThemePreference;
  /** false, пока сохранённая настройка читается с устройства: в это время держится сплэш. */
  ready: boolean;
  setPreference: (next: ThemePreference) => void;
};

const ThemePreferenceContext = createContext<ThemePreferenceValue>({
  preference: 'system',
  ready: false,
  setPreference: () => {},
});

/** ThemeProvider с настройкой темы, которая хранится на устройстве. Оборачивает всё приложение. */
export function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    loadThemePreference().then((stored) => {
      if (!alive) return;
      setPreferenceState(stored);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    // Не сохранилось — тема всё равно применится до перезапуска.
    saveThemePreference(next).catch(() => {});
  };

  return (
    <ThemePreferenceContext.Provider value={{ preference, ready, setPreference }}>
      <ThemeProvider preference={preference}>{children}</ThemeProvider>
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference(): ThemePreferenceValue {
  return useContext(ThemePreferenceContext);
}
