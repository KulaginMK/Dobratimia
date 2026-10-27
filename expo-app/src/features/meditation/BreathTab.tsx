import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useIsFocused, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { BreathCircle } from '@/components/blocks';
import { Button, Chip, Slider, Switch } from '@/components/ui';
import type { BreathScheme } from '@/data/techniques';
import { plural } from '@/lib/plural';
import { useTheme } from '@/theme';
import { BREATH_SCHEME_IDS, PHASE_TEXT, type BreathPhaseKind } from './breath';
import { useBreathSession } from './useBreathSession';

type SoundId = 'rain' | 'wind' | 'forest' | 'silence';

// Записи BigSoundBank (Joseph Sardin), лицензия CC0: №1019, №0907, №2713. Петли по 2 минуты, assets/sounds/README.md.
const SOUNDS: { id: SoundId; label: string; file: number | null }[] = [
  { id: 'rain', label: 'Дождь', file: require('../../../assets/sounds/rain.m4a') },
  { id: 'wind', label: 'Ветер', file: require('../../../assets/sounds/wind.m4a') },
  { id: 'forest', label: 'Лес', file: require('../../../assets/sounds/forest.m4a') },
  { id: 'silence', label: 'Тишина', file: null },
];
const DEFAULT_VOLUME = 60;

type Signal = BreathPhaseKind | 'done';
// Сигналы фаз синтезированы для приложения, чужих записей в них нет: assets/sounds/README.md.
const SIGNALS: Record<Signal, number> = {
  inhale: require('../../../assets/sounds/breath-inhale.m4a'),
  hold: require('../../../assets/sounds/breath-hold.m4a'),
  exhale: require('../../../assets/sounds/breath-exhale.m4a'),
  done: require('../../../assets/sounds/breath-done.m4a'),
};
// На «Готово» фон затихает за 2 секунды, а не обрывается.
const FADE_MS = 2000;
const FADE_STEPS = 10;
const KEEP_AWAKE_TAG = 'breath';

const warn = (error: unknown) => {
  if (__DEV__) console.warn('Звук дыхания:', error);
};

type Props = {
  initialScheme: BreathScheme;
  cycles: number;
};

/** Вкладка «Дыхание»: схема, дыхательный круг с Тимкой, фоновый звук, сигналы фаз, пауза и сброс. */
export function BreathTab({ initialScheme, cycles }: Props) {
  const t = useTheme();
  const router = useRouter();
  const [scheme, setScheme] = useState(initialScheme);
  const [sound, setSound] = useState<SoundId>('rain');
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const [signals, setSignals] = useState(true);
  // Звук идёт, только пока идёт практика и экран на виду: под открытым поверх SOS он замолкает.
  const focused = useIsFocused();
  const signalPlayers = useRef(new Map<Signal, AudioPlayer>());
  const session = useBreathSession(scheme, cycles, {
    haptics: (sound !== 'silence' || signals) && volume > 0,
    onPhase: (phase) => {
      const signal = signalPlayers.current.get(phase);
      if (!signal || !signals || !focused) return;
      signal.volume = volume / 100;
      signal.seekTo(0).catch(warn);
      signal.play();
    },
  });
  const { position } = session;
  const playing = session.running && focused;
  const file = SOUNDS.find((item) => item.id === sound)?.file ?? null;
  // Плеер в ref, а не из useAudioPlayer: громкость и петля у expo-audio — свойства, а значения хуков менять нельзя.
  const player = useRef<AudioPlayer | null>(null);

  useEffect(() => {
    if (file === null) return;
    const created = createAudioPlayer(file);
    created.loop = true;
    player.current = created;
    return () => {
      // На Android remove() только вычёркивает плеер из списка модуля, а звук останавливает release().
      created.remove();
      created.release();
      player.current = null;
    };
  }, [file]);

  useEffect(() => {
    const background = player.current;
    if (!background) return;
    background.volume = volume / 100;
    if (playing) background.play();
    else if (!position.done) background.pause();
    else {
      let step = 0;
      const timer = setInterval(() => {
        step += 1;
        background.volume = (volume / 100) * (1 - step / FADE_STEPS);
        if (step < FADE_STEPS) return;
        clearInterval(timer);
        background.pause();
      }, FADE_MS / FADE_STEPS);
      return () => clearInterval(timer);
    }
  }, [file, volume, playing, position.done]);

  // Сигналы загружаются заранее: на смене фазы звук должен начаться сразу.
  useEffect(() => {
    const created = new Map(
      (Object.keys(SIGNALS) as Signal[]).map((phase) => [phase, createAudioPlayer(SIGNALS[phase])] as const),
    );
    signalPlayers.current = created;
    return () => {
      created.forEach((signal) => {
        signal.remove();
        signal.release();
      });
      signalPlayers.current = new Map();
    };
  }, []);

  // Пока идёт практика, экран не гаснет: с закрытыми глазами его не трогают,
  // а погасший экран Android считает уходом из приложения и глушит звук.
  useEffect(() => {
    if (!playing) return;
    const awake = activateKeepAwakeAsync(KEEP_AWAKE_TAG);
    awake.catch(warn);
    return () => {
      awake.then(() => deactivateKeepAwake(KEEP_AWAKE_TAG), () => {}).catch(warn);
    };
  }, [playing]);
  const label = { fontFamily: t.fontFamily.text[600], color: t.color.textMuted };

  return (
    <View style={{ gap: t.space.md }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          columnGap: t.space.xs,
          paddingHorizontal: t.space.screen,
        }}
      >
        <Text style={[t.type.label, label]}>Схема</Text>
        {BREATH_SCHEME_IDS.map((id) => (
          <Chip
            key={id}
            selected={id === scheme}
            onChange={() => {
              setScheme(id);
              session.restart();
            }}
          >
            {id}
          </Chip>
        ))}
      </View>

      <View style={{ alignItems: 'center' }}>
        <BreathCircle scale={session.scale} />
      </View>

      <View style={{ alignItems: 'center', gap: t.space.xxs, paddingHorizontal: t.space.screen }}>
        <Text accessibilityRole="header" style={[t.type.h2, { color: t.color.text, textAlign: 'center' }]}>
          {position.done ? 'Готово' : `${PHASE_TEXT[position.kind].name} · ${position.secondsLeft}`}
        </Text>
        <Text style={[t.type.caption, { color: t.color.textMuted, textAlign: 'center' }]}>
          {position.done
            ? `Вы сделали ${cycles} ${plural(cycles, 'цикл', 'цикла', 'циклов')}`
            : `Цикл ${position.cycle} из ${cycles} · ${PHASE_TEXT[position.kind].hint}`}
        </Text>
      </View>

      {/* Ряд с ползунком выше макета на 16 (область касания 48 вместо 32): по 8 сверху и снизу уходят в отступы. */}
      <View style={{ paddingHorizontal: t.space.screen, marginBottom: -t.space.xs }}>
        <View
          accessibilityLabel="Фоновый звук"
          style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: t.space.xs }}
        >
          {SOUNDS.map((item) => (
            <Chip key={item.id} selected={item.id === sound} onChange={() => setSound(item.id)}>
              {item.label}
            </Chip>
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.sm }}>
          <Text style={[t.type.label, label]}>Громкость</Text>
          <Slider value={volume} onChange={setVolume} accessibilityLabel="Громкость звука" />
        </View>
        <Switch
          label="Сигналы на смену фазы"
          description="Можно дышать с закрытыми глазами"
          checked={signals}
          onChange={setSignals}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: t.space.sm, paddingHorizontal: t.space.screen }}>
        <View style={{ flex: 2 }}>
          {position.done ? (
            <Button
              size="lg"
              fullWidth
              onPress={() => router.dismissTo({ pathname: '/', params: { s: 'home', focus: 'mood' } })}
            >
              Отметить, как вы теперь
            </Button>
          ) : (
            <Button size="lg" icon={session.running ? 'pause' : 'play'} fullWidth onPress={session.toggle}>
              {session.running ? 'Пауза' : session.untouched ? 'Начать' : 'Продолжить'}
            </Button>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Button variant="outline" size="lg" fullWidth onPress={() => session.restart(position.done)}>
            {position.done ? 'Повторить' : 'Сброс'}
          </Button>
        </View>
      </View>
    </View>
  );
}
