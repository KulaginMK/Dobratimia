import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, RadioCard, TextField } from '@/components/ui';
import { universitiesRepo, type University, type UniversityId } from '@/data/repos';
import { useSelectedUniversity } from '@/features/university/SelectedUniversity';
import { useTheme } from '@/theme';
import { OnboardingStep } from './OnboardingStep';

// Отступы из макета OnbUniversity.
const SEARCH_PAD_TOP = 18;
const LIST_GAP = 10;

/** Вуз подходит под запрос: ищем в коротком и полном названии и в городе. «Другой вуз» виден всегда. */
function matches(university: University, query: string): boolean {
  if (!query || university.id === 'other') return true;
  return [university.shortName, university.fullName, university.city ?? ''].some((text) =>
    text.toLowerCase().includes(query),
  );
}

/**
 * Шаг 5 (эталон OnbUniversity): выбор вуза — от него зависит «Помощь в моём вузе» в SOS.
 * Вуз заранее не отмечен: «Готово» включается после выбора, а «Выберу позже» ведёт на Главную без вуза.
 */
export function OnboardingUniversityScreen() {
  const t = useTheme();
  const router = useRouter();
  const { universityId, select } = useSelectedUniversity();
  const [picked, setPicked] = useState<UniversityId | null>(universityId);
  const [query, setQuery] = useState('');
  const shown = universitiesRepo.all().filter((university) => matches(university, query.trim().toLowerCase()));

  // Весь онбординг — один экран корневого стека: замена убирает его целиком, «Назад» с Главной сюда не вернёт.
  const enter = () => router.replace('/?s=home');

  return (
    <OnboardingStep
      step={5}
      onBack={router.canGoBack() ? () => router.back() : undefined}
      footer={
        <View style={{ gap: t.space.xxs }}>
          <Button
            size="lg"
            fullWidth
            disabled={!picked}
            onPress={() => {
              if (!picked) return;
              select(picked);
              enter();
            }}
          >
            Готово
          </Button>
          <Button variant="text" fullWidth onPress={enter}>
            Выберу позже
          </Button>
        </View>
      }
    >
      <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.xs }}>
        <Text accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
          Где вы учитесь?
        </Text>
        <Text style={[t.type.body, { color: t.color.textMuted }]}>
          Покажем контакты психологической службы вашего вуза в SOS. Поменять можно в профиле.
        </Text>
      </View>
      <View style={{ paddingTop: SEARCH_PAD_TOP, paddingHorizontal: t.space.screen }}>
        <TextField label="Поиск" placeholder="Название или город" value={query} onChange={setQuery} />
      </View>
      <View
        accessibilityRole="radiogroup"
        accessibilityLabel="Вуз"
        style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen, gap: LIST_GAP }}
      >
        {shown.map((university) => (
          <RadioCard
            key={university.id}
            title={university.shortName}
            description={university.fullName}
            selected={university.id === picked}
            onPress={() => setPicked(university.id)}
          />
        ))}
      </View>
    </OnboardingStep>
  );
}
