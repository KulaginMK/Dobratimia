import React, { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Keyboard, Platform, Text, View, type TextInput } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { Button, Chip, TextField } from '@/components/ui';
import { useTheme } from '@/theme';
import { TextRelease } from './TextRelease';
import { nextReleaseEffect, type ReleaseEffect } from './release';

const ROWS = 9;
// Страховка: если анимация почему-то не сообщила о конце, текст всё равно стирается.
const RELEASE_LIMIT_MS = 6000;

// Чип вставляет начало фразы, чтобы было с чего начать.
const PROMPTS = [
  { label: 'Что бесит больше всего?', starter: 'Больше всего меня бесит ' },
  { label: 'Кому бы вы это сказали?', starter: 'Хочу сказать это ' },
];

type Props = {
  /** Текст живёт только в памяти открытого экрана: ни на диск, ни на сервер он не попадает. */
  text: string;
  onChangeText: (text: string) => void;
  /** «Отпустить»: анимация закончилась — текст пора стереть. Экран остаётся открытым: можно писать снова. */
  onReleased: () => void;
  /** «Стереть и выйти». */
  onErase: () => void;
};

/** ScreamText: выплеснуть текстом. */
export function ScreamText({ text, onChangeText, onReleased, onErase }: Props) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const inputRef = useRef<TextInput>(null);
  const [release, setRelease] = useState<{ effect: ReleaseEffect; scrollTop: number } | null>(null);
  const releasing = release !== null;

  const finish = () => {
    setRelease(null);
    onReleased();
  };
  const onLimit = useEffectEvent(finish);
  useEffect(() => {
    if (!release) return;
    const timer = setTimeout(onLimit, RELEASE_LIMIT_MS);
    return () => clearTimeout(timer);
  }, [release]);

  const letGo = () => {
    Keyboard.dismiss();
    // При «Уменьшить движение» текст просто исчезает (docs/09).
    if (reduced) {
      onReleased();
      return;
    }
    // В вебе длинный текст прокручивается внутри поля — анимация начинается с того места, которое видно.
    const field = inputRef.current as unknown as { scrollTop?: number } | null;
    const scrollTop = Platform.OS === 'web' ? (field?.scrollTop ?? 0) : 0;
    setRelease({ effect: nextReleaseEffect(), scrollTop });
  };

  const insert = (starter: string) => {
    onChangeText(text.trim() ? `${text.trimEnd()}\n${starter}` : starter);
    inputRef.current?.focus();
  };

  return (
    <>
      <View style={{ gap: t.space.xs, paddingTop: t.space.xl, paddingHorizontal: t.space.screen }}>
        <Text accessibilityRole="header" style={[t.type.h2, { color: t.color.text }]}>
          Напишите всё, что накипело
        </Text>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>
          Без цензуры и без адресата. Текст никто не прочитает.
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          columnGap: t.space.xs,
          paddingTop: t.space.sm,
          paddingHorizontal: t.space.screen,
        }}
      >
        {PROMPTS.map((prompt) => (
          <Chip key={prompt.label} selected={false} disabled={releasing} onChange={() => insert(prompt.starter)}>
            {prompt.label}
          </Chip>
        ))}
      </View>
      {/* zIndex: улетающие куски текста проходят над кнопками внизу. */}
      <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen, zIndex: releasing ? 1 : 0 }}>
        <TextField
          inputRef={inputRef}
          label="Ваш текст"
          hint="Текст не сохраняется и исчезнет, когда вы нажмёте «Отпустить»"
          multiline
          rows={ROWS}
          sensitive
          value={text}
          onChange={onChangeText}
          overlay={
            release ? (
              <TextRelease text={text} effect={release.effect} scrollTop={release.scrollTop} onDone={finish} />
            ) : undefined
          }
        />
      </View>
      <View
        style={{ marginTop: 'auto', paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}
      >
        <Button size="lg" fullWidth disabled={releasing || text.trim() === ''} onPress={letGo}>
          Отпустить
        </Button>
        <Button variant="text" fullWidth disabled={releasing} onPress={onErase}>
          Стереть и выйти
        </Button>
      </View>
    </>
  );
}
