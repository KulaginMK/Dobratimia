import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { BreathCircle } from '@/components/blocks';
import { Button, Chip, Slider } from '@/components/ui';
import type { BreathScheme } from '@/data/techniques';
import { plural } from '@/lib/plural';
import { useTheme } from '@/theme';
import { BREATH_SCHEME_IDS, PHASE_TEXT } from './breath';
import { useBreathSession } from './useBreathSession';

type SoundId = 'rain' | 'wind' | 'forest' | 'silence';

// Звуковых файлов пока нет (лицензия не решена, docs/07): работает только выбор и громкость.
const SOUNDS: { id: SoundId; label: string }[] = [
  { id: 'rain', label: 'Дождь' },
  { id: 'wind', label: 'Ветер' },
  { id: 'forest', label: 'Лес' },
  { id: 'silence', label: 'Тишина' },
];
const DEFAULT_VOLUME = 60;

type Props = {
  initialScheme: BreathScheme;
  cycles: number;
};

/** Вкладка «Дыхание»: схема, дыхательный круг с Тимкой, фоновый звук, пауза и сброс. */
export function BreathTab({ initialScheme, cycles }: Props) {
  const t = useTheme();
  const router = useRouter();
  const [scheme, setScheme] = useState(initialScheme);
  const [sound, setSound] = useState<SoundId>('rain');
  const [volume, setVolume] = useState(DEFAULT_VOLUME);
  const session = useBreathSession(scheme, cycles, { haptics: sound !== 'silence' && volume > 0 });
  const { position } = session;
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

      <View style={{ gap: t.space.xs, paddingHorizontal: t.space.screen }}>
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
              {session.running ? 'Пауза' : 'Продолжить'}
            </Button>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Button variant="outline" size="lg" fullWidth onPress={session.restart}>
            {position.done ? 'Повторить' : 'Сброс'}
          </Button>
        </View>
      </View>
    </View>
  );
}
