import React, { createContext, useContext, useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Skeleton, useSkeletonVisible } from '@/components/ui';
import { OfflineError, cabinetRepo, type Cabinet, type CardFields } from '@/data/repos';
import { plural } from '@/lib/plural';
import { useTheme } from '@/theme';

type CabinetValue = {
  /** null — ещё грузится или не загрузился (см. failure). */
  cabinet: Cabinet | null;
  /** offline — нет сети, действие можно повторить; error — сервер отказал. */
  failure: 'offline' | 'error' | null;
  reload: () => void;
  /** «Сохранить»: отправить правки на проверку. Отклоняется, если отправить не удалось. */
  submit: (fields: CardFields) => Promise<void>;
};

const CabinetContext = createContext<CabinetValue>({
  cabinet: null,
  failure: null,
  reload: () => {},
  submit: async () => {},
});

/** Данные кабинета: одна загрузка на все три экрана. Кабинет работает только с сетью (docs/08). */
export function CabinetProvider({ children }: { children: React.ReactNode }) {
  const [cabinet, setCabinet] = useState<Cabinet | null>(null);
  const [failure, setFailure] = useState<CabinetValue['failure']>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    cabinetRepo.load().then(
      (loaded) => {
        if (alive) setCabinet(loaded);
      },
      (error: unknown) => {
        if (alive) setFailure(error instanceof OfflineError ? 'offline' : 'error');
      },
    );
    return () => {
      alive = false;
    };
  }, [attempt]);

  const reload = () => {
    setFailure(null);
    setAttempt((n) => n + 1);
  };

  const submit = async (fields: CardFields) => {
    await cabinetRepo.submit(fields);
    // Сервер принял черновик: он на проверке, прежние замечания сняты. Студенты видят прежнюю карточку.
    setCabinet((prev) => prev && { ...prev, draft: { status: 'pending' }, fields });
  };

  return <CabinetContext.Provider value={{ cabinet, failure, reload, submit }}>{children}</CabinetContext.Provider>;
}

export function useCabinet(): CabinetValue {
  return useContext(CabinetContext);
}

/** «37 откликов». */
export const likesCount = (n: number) => `${n} ${plural(n, 'отклик', 'отклика', 'откликов')}`;

/** «+5 за эту неделю»: текущая календарная неделя — последний столбик графика. */
export const likesThisWeek = (weeks: number[]) => `+${weeks[weeks.length - 1] ?? 0} за эту неделю`;

const LOADING_HEIGHT = 320;

/** Что показать, пока кабинета нет: загрузку или «Нет интернета» с «Повторить». */
export function CabinetFallback() {
  const t = useTheme();
  const { failure, reload } = useCabinet();
  const skeleton = useSkeletonVisible(!failure);
  if (!failure) {
    return (
      <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen }}>
        {skeleton ? <Skeleton variant="card" height={LOADING_HEIGHT} /> : null}
      </View>
    );
  }
  return (
    <View style={{ paddingTop: t.space['3xl'], paddingHorizontal: t.space.screen, gap: t.space.sm }}>
      <Text accessibilityRole="header" style={[t.type.h2, { color: t.color.text, textAlign: 'center' }]}>
        {failure === 'offline' ? 'Нет интернета' : 'Не удалось открыть кабинет'}
      </Text>
      <Text style={[t.type.body, { color: t.color.textMuted, textAlign: 'center' }]}>
        {failure === 'offline' ? 'Кабинет специалиста работает только с сетью.' : 'Попробуйте ещё раз чуть позже.'}
      </Text>
      <Button fullWidth onPress={reload}>
        Повторить
      </Button>
    </View>
  );
}
