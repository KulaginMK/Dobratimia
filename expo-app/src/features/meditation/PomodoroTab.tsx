import React, { useEffect, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { TimerRing, TomatoDots } from '@/components/blocks';
import { Button, Chip, Switch } from '@/components/ui';
import { loadPomodoroNotify, savePomodoroNotify } from '@/data/local/pomodoro';
import { syncPomodoroBreaks, syncPomodoroCountdown, useAllowNotifications } from '@/features/reminders/reminders';
import { notificationsAllowed } from '@/lib/notifications';
import { plural } from '@/lib/plural';
import { useTheme } from '@/theme';
import { TOMATOES, clock, type PomodoroMode } from './pomodoro';
import { MODE_LABEL, usePomodoro } from './usePomodoro';

const MODES: PomodoroMode[] = ['focus', 'break'];

function spokenTime(ms: number): string {
  const seconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `Осталось ${minutes} ${plural(minutes, 'минута', 'минуты', 'минут')} ${rest} ${plural(rest, 'секунда', 'секунды', 'секунд')}`;
}

/** Вкладка Pomodoro: фокус 25 минут, перерыв 5, четыре «помидора». */
export function PomodoroTab() {
  const t = useTheme();
  const allowNotifications = useAllowNotifications();
  const [notify, setNotify] = useState(false);
  // Уведомления стоят на конец каждого оставшегося фокуса и пересчитываются, только когда человек сам меняет
  // таймер. Когда фаза сменяется сама, их не трогаем: иначе отменили бы то, что система ещё не успела показать.
  const pomodoro = usePomodoro((next) => {
    syncPomodoroCountdown(next);
    if (notify) syncPomodoroBreaks(next);
  });
  const { state } = pomodoro;

  useEffect(() => {
    let alive = true;
    Promise.all([loadPomodoroNotify(), notificationsAllowed()]).then(([stored, allowed]) => {
      // Уведомления запретили в настройках телефона — переключатель показан выключенным.
      if (alive) setNotify(stored && allowed);
    });
    return () => {
      alive = false;
    };
  }, []);

  if (!pomodoro.ready) return null;

  return (
    <View style={{ gap: t.space.md }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: t.space.xs, paddingHorizontal: t.space.screen }}>
        {MODES.map((mode) => (
          <Chip key={mode} selected={state.mode === mode} onChange={() => pomodoro.select(mode)}>
            {MODE_LABEL[mode]}
          </Chip>
        ))}
      </View>

      <View style={{ alignItems: 'center', paddingTop: t.space.xs }}>
        <TimerRing
          remaining={pomodoro.remainingShare}
          time={clock(pomodoro.remaining)}
          caption={state.mode === 'focus' ? 'до перерыва' : 'до конца перерыва'}
          accessibilityLabel={spokenTime(pomodoro.remaining)}
        />
      </View>

      <View style={{ alignItems: 'center' }}>
        <TomatoDots
          total={TOMATOES}
          done={state.mode === 'focus' ? state.tomato - 1 : state.tomato}
          label={`Помидор ${state.tomato} из ${TOMATOES}`}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: t.space.sm, paddingTop: t.space.xs, paddingHorizontal: t.space.screen }}>
        <View style={{ flex: 2 }}>
          <Button size="lg" icon={pomodoro.running ? 'pause' : 'play'} fullWidth onPress={pomodoro.toggle}>
            {pomodoro.running ? 'Пауза' : pomodoro.untouched ? 'Начать' : 'Продолжить'}
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button variant="outline" size="lg" fullWidth onPress={pomodoro.skip}>
            Пропустить
          </Button>
        </View>
      </View>

      {Platform.OS === 'web' ? (
        // В вебе уведомления по расписанию не работают (docs/07).
        <Text style={[t.type.caption, { paddingHorizontal: t.space.screen, color: t.color.textMuted }]}>
          Напоминания работают в приложении для Android
        </Text>
      ) : (
        <View
          style={{
            marginHorizontal: t.space.screen,
            paddingVertical: t.space.xxs,
            paddingHorizontal: t.space.md,
            borderRadius: t.radius.xl,
            backgroundColor: t.color.surface,
            boxShadow: t.shadow.sm,
          }}
        >
          <Switch
            label="Уведомить о перерыве"
            description="Звук и вибрация, даже если экран выключен"
            checked={notify}
            onChange={async (next) => {
              // Разрешение спрашиваем при включении переключателя (docs/07).
              if (next && !(await allowNotifications())) return;
              setNotify(next);
              savePomodoroNotify(next).catch(() => {});
              syncPomodoroBreaks(next ? state : null);
              // Уведомления только что разрешили — идущему таймеру нужен отсчёт в шторке.
              if (next) syncPomodoroCountdown(state);
            }}
          />
        </View>
      )}
    </View>
  );
}
