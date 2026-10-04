import { useRouter } from 'expo-router';
import React, { useEffect, useEffectEvent, useState } from 'react';
import { BackHandler, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/blocks';
import { SegmentedControl } from '@/components/ui';
import { useTheme } from '@/theme';
import { ScreamText } from './ScreamText';
import { ScreamMeasuring, ScreamNoMic, ScreamOutcome, ScreamReady } from './ScreamVoice';
import { useScreamSession } from './useScreamSession';

type Mode = 'voice' | 'text';

const MODES: { value: Mode; label: string }[] = [
  { value: 'voice', label: 'Голосом' },
  { value: 'text', label: 'Выплеснуть текстом' },
];

/**
 * КРИК: выпустить пар голосом или текстом. Одно состояние за раз (docs/05):
 * Scream → ScreamLive → ScreamResult, ScreamNoMic при отказе в микрофоне и ScreamText.
 */
export function ScreamScreen({ userId }: { userId: string }) {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const session = useScreamSession(userId);
  const [mode, setMode] = useState<Mode>('voice');
  // Текст «Выплеснуть текстом» есть только здесь, в памяти открытого экрана: его нет ни на диске,
  // ни на сервере, и после ухода с экрана он пропадает вместе с экраном (docs/07).
  const [text, setText] = useState('');

  const voice = mode === 'voice';
  const measuring = voice && session.phase === 'live';
  const outcome = voice && session.phase === 'result' ? session.result : null;

  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // Системная «Назад» во время замера останавливает его без результата (docs/06).
  const cancelMeasuring = useEffectEvent(session.cancel);
  useEffect(() => {
    if (!measuring) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      cancelMeasuring();
      return true;
    });
    return () => subscription.remove();
  }, [measuring]);

  const changeMode = (next: Mode) => {
    setMode(next);
    // Повторное «Голосом» после отказа в доступе — ещё одна попытка.
    if (next === 'voice' && session.phase === 'nomic') session.reset();
    if (next === 'text') session.cancel();
  };

  const content = !voice ? (
    <ScreamText
      text={text}
      onChangeText={setText}
      onReleased={() => {
        setText('');
        leave();
      }}
      onErase={() => {
        setText('');
        leave();
      }}
    />
  ) : measuring ? (
    <ScreamMeasuring live={session.live} onStop={session.stop} />
  ) : outcome ? (
    <ScreamOutcome
      result={outcome}
      onAgain={session.reset}
      onMarkMood={() => router.dismissTo({ pathname: '/', params: { s: 'home', focus: 'mood' } })}
    />
  ) : session.phase === 'nomic' ? (
    <ScreamNoMic onText={() => changeMode('text')} />
  ) : (
    <ScreamReady starting={session.phase === 'starting'} onStart={session.start} />
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title="КРИК"
        leading={outcome ? 'close' : 'back'}
        onLeadingPress={measuring ? session.cancel : leave}
        onSosPress={() => {
          // Уходим на SOS — микрофон выключаем.
          session.cancel();
          router.push('/sos');
        }}
      />
      {measuring || outcome ? null : (
        <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen }}>
          <SegmentedControl accessibilityLabel="Как выпустить пар" options={MODES} value={mode} onChange={changeMode} />
        </View>
      )}
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + t.space.xl }}
        >
          {content}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
