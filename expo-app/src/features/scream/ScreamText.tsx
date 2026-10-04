import React, { useEffect, useEffectEvent, useRef, useState } from 'react';
import { Keyboard, Text, View, type TextInput } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Button, Chip, TextField } from '@/components/ui';
import { useTheme } from '@/theme';

// Текст растворяется 600 мс (docs/07).
const RELEASE_MS = 600;
const ROWS = 9;

// Чип вставляет начало фразы, чтобы было с чего начать.
const PROMPTS = [
  { label: 'Что бесит больше всего?', starter: 'Больше всего меня бесит ' },
  { label: 'Кому бы вы это сказали?', starter: 'Хочу сказать это ' },
];

type Props = {
  /** Текст живёт только в памяти открытого экрана: ни на диск, ни на сервер он не попадает. */
  text: string;
  onChangeText: (text: string) => void;
  /** «Отпустить»: текст уже исчез. */
  onReleased: () => void;
  /** «Стереть и выйти». */
  onErase: () => void;
};

/** ScreamText: выплеснуть текстом. */
export function ScreamText({ text, onChangeText, onReleased, onErase }: Props) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const inputRef = useRef<TextInput>(null);
  const [releasing, setReleasing] = useState(false);
  const fade = useSharedValue(0);
  const fadeStyle = useAnimatedStyle(() => ({
    opacity: 1 - fade.get(),
    transform: [{ translateY: -fade.get() * t.space.md }],
  }));

  // Анимация только показывает уход текста; сам текст стирается по таймеру, даже если кадры не идут.
  const finish = useEffectEvent(onReleased);
  useEffect(() => {
    if (!releasing) return;
    const timer = setTimeout(finish, reduced ? 0 : RELEASE_MS);
    return () => clearTimeout(timer);
  }, [releasing, reduced]);

  const release = () => {
    Keyboard.dismiss();
    setReleasing(true);
    // При «Уменьшить движение» текст просто исчезает (docs/09).
    if (!reduced) fade.set(withTiming(1, { duration: RELEASE_MS, easing: Easing.out(Easing.cubic) }));
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
      <Animated.View
        style={[
          { paddingTop: t.space.sm, paddingHorizontal: t.space.screen, pointerEvents: releasing ? 'none' : 'auto' },
          fadeStyle,
        ]}
      >
        <TextField
          inputRef={inputRef}
          label="Ваш текст"
          hint="Текст не сохраняется и исчезнет, когда вы нажмёте «Отпустить»"
          multiline
          rows={ROWS}
          sensitive
          value={text}
          onChange={onChangeText}
        />
      </Animated.View>
      <View
        style={{ marginTop: 'auto', paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}
      >
        <Button size="lg" fullWidth disabled={releasing || text.trim() === ''} onPress={release}>
          Отпустить
        </Button>
        <Button variant="text" fullWidth disabled={releasing} onPress={onErase}>
          Стереть и выйти
        </Button>
      </View>
    </>
  );
}
