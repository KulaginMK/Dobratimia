import React from 'react';
import { Linking, Platform, Text, View } from 'react-native';
import {
  LevelBar,
  LoudnessWave,
  MicButton,
  MicOffBadge,
  NumberedStep,
  PeakNumber,
  PrivacyNote,
  ReactionCard,
  ReactionScale,
  StatTile,
  StopButton,
} from '@/components/blocks';
import { Button } from '@/components/ui';
import { plural } from '@/lib/plural';
import { useTheme } from '@/theme';
import { MAX_LEVEL, calmLevel, timeLabel } from './loudness';
import { REACTIONS, reactionFor } from './reactions';
import type { ScreamLive, ScreamResult } from './useScreamSession';

const UNIT = 'усл. дБ';
// Обещание должно быть правдой: звук с микрофона не пишется ни на диск, ни на сервер (useLoudnessMeter).
const PRIVACY = 'Мы не записываем ваш голос — анализируется только громкость';
const SCALE_ROWS = REACTIONS.map((reaction) => ({
  range: reaction.range,
  text: reaction.short,
  accent: reaction.accent,
}));

// Телефон: путь в настройках Android.
const SETTINGS_STEPS = [
  'Нажмите «Открыть настройки»',
  'Разрешения → Микрофон',
  'Выберите «Разрешить во время использования»',
];
// Веб: открыть настройки сайта из приложения нельзя — только подсказать, где они (docs/07).
const WEB_SETTINGS_HINT = 'Разрешите микрофон в настройках сайта: значок слева от адреса';

/** Строка с обещанием внизу экрана: прижата к низу, пока хватает места. */
function VoicePromise() {
  const t = useTheme();
  return (
    <View style={{ marginTop: 'auto', paddingTop: t.space.xl, paddingHorizontal: t.space.xl, paddingBottom: t.space.xs }}>
      <PrivacyNote>{PRIVACY}</PrivacyNote>
    </View>
  );
}

/** Scream: готов к замеру. */
export function ScreamReady({ starting, onStart }: { starting: boolean; onStart: () => void }) {
  const t = useTheme();
  return (
    <>
      <View style={{ alignItems: 'center', paddingTop: t.space['2xl'] }}>
        <MicButton onPress={onStart} disabled={starting} />
      </View>
      <View
        style={{
          alignItems: 'center',
          gap: t.space.xs,
          paddingTop: t.space.xl,
          paddingHorizontal: t.space['2xl'],
        }}
      >
        <Text accessibilityRole="header" style={[t.type.h2, { color: t.color.text, textAlign: 'center' }]}>
          Крикните так громко, как хочется
        </Text>
        <Text style={[t.type.caption, { color: t.color.textMuted, textAlign: 'center' }]}>
          Нажмите на микрофон. Замер идёт до 10 секунд.
        </Text>
      </View>
      <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen }}>
        <ReactionScale title="Шкала реакций" rows={SCALE_ROWS} />
      </View>
      <VoicePromise />
    </>
  );
}

/** ScreamLive: идёт замер. */
export function ScreamMeasuring({ live, onStop }: { live: ScreamLive; onStop: () => void }) {
  const t = useTheme();
  const caption = [t.type.caption, { color: t.color.textMuted }];
  const level = calmLevel(live.levels);
  return (
    <>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: t.space.xl,
          paddingHorizontal: t.space.xl,
        }}
      >
        {/* Числа меняются 10 раз в секунду — скринридеру их вслух не объявляем (docs/09). */}
        <View accessible accessibilityLabel={`Время: ${timeLabel(live.elapsedMs)} из 10 секунд`}>
          <Text style={caption}>Время</Text>
          <Text style={[t.type.metric, { color: t.color.text }]}>{timeLabel(live.elapsedMs)}</Text>
          <Text style={caption}>из 10 секунд</Text>
        </View>
        <View
          accessible
          accessibilityLabel={`Сейчас: ${level} условных децибел`}
          style={{ alignItems: 'flex-end' }}
        >
          <Text style={caption}>Сейчас</Text>
          <Text style={[t.type.metric, { color: t.color.primary }]}>{level}</Text>
          <Text style={caption}>{UNIT}</Text>
        </View>
      </View>
      <View
        style={{
          marginTop: t.space.xl,
          marginHorizontal: t.space.screen,
          padding: t.space.md,
          borderRadius: t.radius.xl,
          backgroundColor: t.color.surface,
          boxShadow: t.shadow.sm,
          gap: t.space.md,
        }}
      >
        <LoudnessWave variant="live" levels={live.levels} max={MAX_LEVEL} accessibilityLabel="Волна громкости" />
        <LevelBar level={level} max={MAX_LEVEL} />
      </View>
      <View style={{ alignItems: 'center', paddingTop: t.space['2xl'] }}>
        <StopButton onPress={onStop} />
      </View>
      <VoicePromise />
    </>
  );
}

type ResultProps = {
  result: ScreamResult;
  onAgain: () => void;
  onMarkMood: () => void;
};

/** ScreamResult: пик, реакция, волна и три числа. */
export function ScreamOutcome({ result, onAgain, onMarkMood }: ResultProps) {
  const t = useTheme();
  const reaction = reactionFor(result.peak);
  const seconds = result.durationSec;
  return (
    <>
      <View style={{ paddingTop: t.space['2xl'] }}>
        <PeakNumber label="Ваш пик" value={result.peak} unit={UNIT} />
      </View>
      <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen }}>
        <ReactionCard overline={`${reaction.range} ${UNIT}`} title={reaction.title} body={reaction.body} />
      </View>
      <View
        style={{
          marginTop: t.space.md,
          marginHorizontal: t.space.screen,
          paddingVertical: t.space.sm,
          paddingHorizontal: t.space.md,
          borderRadius: t.radius.lg,
          backgroundColor: t.color.surface,
          boxShadow: t.shadow.sm,
        }}
      >
        <LoudnessWave
          variant="result"
          levels={result.levels}
          max={MAX_LEVEL}
          accessibilityLabel={`Запись громкости за ${seconds} ${plural(seconds, 'секунду', 'секунды', 'секунд')}`}
        />
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: t.space.xs,
          paddingTop: t.space.md,
          paddingHorizontal: t.space.screen,
        }}
      >
        <StatTile label="Длительность" value={`${seconds} с`} />
        <StatTile label="В среднем" value={String(result.avg)} />
        <StatTile label="Рекорд недели" value={String(result.weekRecord)} />
      </View>
      <View
        style={{ marginTop: 'auto', paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}
      >
        <Button size="lg" icon="scream" fullWidth onPress={onAgain}>
          Крикнуть ещё раз
        </Button>
        <Button variant="outline" fullWidth onPress={onMarkMood}>
          Отметить, как вы теперь
        </Button>
      </View>
    </>
  );
}

/** ScreamNoMic: доступа к микрофону нет. */
export function ScreamNoMic({ onText }: { onText: () => void }) {
  const t = useTheme();
  const web = Platform.OS === 'web';
  return (
    <>
      <View style={{ alignItems: 'center', paddingTop: t.space['3xl'] }}>
        <MicOffBadge />
      </View>
      <View style={{ alignItems: 'center', gap: t.space.xs, paddingTop: t.space.xl, paddingHorizontal: t.space.xl }}>
        <Text accessibilityRole="header" style={[t.type.h1, { color: t.color.text, textAlign: 'center' }]}>
          Нет доступа к микрофону
        </Text>
        <Text style={[t.type.body, { color: t.color.textMuted, textAlign: 'center' }]}>
          Чтобы измерить громкость крика, разрешите доступ к микрофону. Звук не записывается и никуда не
          отправляется.
        </Text>
      </View>
      <View
        style={{
          marginTop: t.space.xl,
          marginHorizontal: t.space.screen,
          padding: t.space.md,
          borderRadius: t.radius.xl,
          backgroundColor: t.color.surface,
          boxShadow: t.shadow.sm,
          gap: t.space.sm,
        }}
      >
        {web ? (
          <Text style={[t.type.body, { color: t.color.text }]}>{WEB_SETTINGS_HINT}</Text>
        ) : (
          SETTINGS_STEPS.map((step, i) => (
            <NumberedStep key={step} number={i + 1} tone="plain">
              {step}
            </NumberedStep>
          ))
        )}
      </View>
      <View
        style={{ marginTop: 'auto', paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}
      >
        {web ? null : (
          <Button size="lg" fullWidth onPress={() => Linking.openSettings().catch(() => {})}>
            Открыть настройки
          </Button>
        )}
        <Button variant="outline" fullWidth onPress={onText}>
          Выплеснуть текстом
        </Button>
      </View>
    </>
  );
}
