import { useIsFocused, useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { FeatureRow } from '@/components/blocks';
import { Timka } from '@/components/brand';
import { Button } from '@/components/ui';
import { useTheme } from '@/theme';
import { OnboardingStep } from './OnboardingStep';

// Размеры из макета Main.
const TIMKA_SIZE = 210;
const FEATURES_GAP = 14;

/** Шаг 1 (эталон Main): что такое Добратимия. «Пропустить» ведёт сразу ко входу. */
export function OnboardingIntroScreen() {
  const t = useTheme();
  const router = useRouter();
  const focused = useIsFocused();
  return (
    <OnboardingStep
      step={1}
      onSkip={() => router.push('/onboarding/sign-in')}
      footer={
        <Button size="lg" fullWidth onPress={() => router.push('/onboarding/warning')}>
          Дальше
        </Button>
      }
    >
      <View style={{ alignItems: 'center', paddingTop: t.space.md }}>
        <Timka pose="hello" size={TIMKA_SIZE} motion="wave" active={focused} />
      </View>
      <View style={{ paddingTop: t.space.xs, paddingHorizontal: t.space.xl, gap: t.space.sm }}>
        <Text accessibilityRole="header" style={[t.type.display, { color: t.color.text }]}>
          Здесь можно выдохнуть
        </Text>
        <Text style={[t.type.body, { color: t.color.textMuted }]}>
          Добратимия — бесплатное приложение для студентов медвузов Беларуси. Следите за своим состоянием, снимайте
          напряжение и находите психологов в одном месте.
        </Text>
      </View>
      <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.xl, gap: FEATURES_GAP }}>
        <FeatureRow icon="diary">Тест DASS-21 и дневник настроения</FeatureRow>
        <FeatureRow icon="scream">КРИК, дыхание, медитации и техники</FeatureRow>
        <FeatureRow icon="specialist">Психологи и служба вашего вуза</FeatureRow>
      </View>
    </OnboardingStep>
  );
}
