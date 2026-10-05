import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { CareNote, CheckPoint, HeroIcon, InlineLink } from '@/components/blocks';
import { Button } from '@/components/ui';
import { PSYCH_HELPLINE } from '@/data/emergency';
import { useCallPhone } from '@/lib/phone';
import { useTheme } from '@/theme';
import { OnboardingStep, useStepBack } from './OnboardingStep';

// Размеры из макета OnbWarning.
const HEAD_GAP = 14;
const POINTS_GAP = 18;

/** Шаг 2 (эталон OnbWarning): приложение не заменяет специалиста. Кнопки SOS в шапке нет — номер 133 в тексте. */
export function OnboardingWarningScreen() {
  const t = useTheme();
  const router = useRouter();
  const back = useStepBack('/onboarding');
  const call = useCallPhone();
  return (
    <OnboardingStep
      step={2}
      onBack={back}
      footer={
        <Button size="lg" fullWidth onPress={() => router.push('/onboarding/gestures')}>
          Понятно
        </Button>
      }
    >
      <View style={{ paddingTop: t.space['2xl'] + t.space.xs, paddingHorizontal: t.space.xl, gap: HEAD_GAP }}>
        <HeroIcon icon="heart" />
        <Text accessibilityRole="header" style={[t.type.display, { color: t.color.text }]}>
          Честно о главном
        </Text>
        <Text style={[t.type.body, { color: t.color.text }]}>
          Добратимия помогает заботиться о себе, но не заменяет врача, психолога или психотерапевта и не ставит
          диагнозов.
        </Text>
      </View>
      <View style={{ paddingTop: t.space.xl + t.space.xxs, paddingHorizontal: t.space.xl, gap: POINTS_GAP }}>
        <CheckPoint
          title="Тесты — это ориентир"
          text="DASS-21 подсказывает, на что обратить внимание. Это не медицинское заключение."
        />
        <CheckPoint
          title="Мы собираем минимум"
          text="Без переписки внутри приложения. Ваши ответы и отметки видны только вам."
        />
      </View>
      <View style={{ paddingTop: t.space.xl + t.space.xxs, paddingHorizontal: t.space.screen }}>
        <CareNote title="Если очень тяжело прямо сейчас">
          {'Звоните на номер экстренной психологической помощи '}
          <InlineLink strong onPress={() => call(PSYCH_HELPLINE)}>
            {PSYCH_HELPLINE}
          </InlineLink>
          {' или в службу своего вуза. Кнопка SOS есть на каждом экране.'}
        </CareNote>
      </View>
    </OnboardingStep>
  );
}
