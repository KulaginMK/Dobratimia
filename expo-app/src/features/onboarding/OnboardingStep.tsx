import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StepsHeader } from '@/components/blocks';
import { useTheme } from '@/theme';

/** Шаги онбординга: что это · честно о главном · жесты · вход · вуз. */
export const ONBOARDING_STEPS = 5;

/** «Назад» на шаге: если шаг открыли по ссылке и возвращаться некуда — к предыдущему шагу. */
export function useStepBack(previous: Href): () => void {
  const router = useRouter();
  return () => (router.canGoBack() ? router.back() : router.replace(previous));
}

type Props = {
  step: number;
  onBack?: () => void;
  onSkip?: () => void;
  /** Кнопки внизу экрана. Они не прокручиваются вместе с содержимым: «Дальше» видно на любом телефоне. */
  footer: React.ReactNode;
  children: React.ReactNode;
};

/** Каркас шага онбординга: шапка с полосками шагов, прокручиваемое содержимое и кнопки, прижатые к низу. */
export function OnboardingStep({ step, onBack, onSkip, footer, children }: Props) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <StepsHeader step={step} total={ONBOARDING_STEPS} onBack={onBack} onSkip={onSkip} />
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: t.space.md }}>
        {children}
      </ScrollView>
      <View
        style={{
          paddingTop: t.space.xs,
          paddingHorizontal: t.space.screen,
          paddingBottom: insets.bottom + t.space.xl,
        }}
      >
        {footer}
      </View>
    </View>
  );
}
