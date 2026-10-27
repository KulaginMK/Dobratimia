import { useIsFocused, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { FeedScheme, GestureRow, type SchemeGesture } from '@/components/blocks';
import { Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { OnboardingStep, useStepBack } from './OnboardingStep';

// Отступ из макета OnbGestures.
const HEAD_GAP = 10;

/** Шаг 3 (эталон OnbGestures): как устроена лента экранов и какие жесты в ней работают. */
export function OnboardingGesturesScreen() {
  const t = useTheme();
  const router = useRouter();
  const back = useStepBack('/onboarding/warning');
  const focused = useIsFocused();
  const [gesture, setGesture] = useState<SchemeGesture | null>(null);
  return (
    <OnboardingStep
      step={3}
      onBack={back}
      footer={
        <Button size="lg" fullWidth onPress={() => router.push('/onboarding/sign-in')}>
          Понятно
        </Button>
      }
    >
      <View style={{ paddingTop: t.space.xl + t.space.xxs, paddingHorizontal: t.space.xl, gap: HEAD_GAP }}>
        <Text accessibilityRole="header" style={[t.type.display, { color: t.color.text }]}>
          Как здесь всё устроено
        </Text>
        <Text style={[t.type.body, { color: t.color.textMuted }]}>
          Экраны стоят в ряд, как карточки на столе. Главная — в центре.
        </Text>
      </View>
      <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen }}>
        <FeedScheme demo={focused} onGesture={setGesture} />
      </View>
      <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.xl, gap: t.space.md }}>
        <GestureRow kind="sides" active={gesture === 'sides'} title="Влево и вправо" text="Свайп переносит на соседний экран." />
        <GestureRow
          kind="down"
          active={gesture === 'down'}
          title="Вниз"
          text="На «Техниках» откроются медитации, на «Специалистах» — избранные контакты."
        />
        <GestureRow
          kind="dots"
          title="Точки внизу"
          text="Показывают, где вы, и тоже переключают экраны. На «Подборе специалиста» свайп листает карточки, а уйти можно через точки."
        />
      </View>
    </OnboardingStep>
  );
}
