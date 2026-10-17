import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NumberedStep, PhaseTiles, ScreenHeader } from '@/components/blocks';
import { Button, Card, ChipBadge } from '@/components/ui';
import { techniqueById } from '@/data/techniques';
import { useTheme } from '@/theme';

/** Экран техники: название, длительность и метки, схема, шаги, «почему это работает» и переход к таймеру. */
export function TechniqueScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const technique = techniqueById(id);

  // Неизвестная техника (старая ссылка) или Pomodoro, у которого вместо экрана таймер, — возвращаем к списку.
  if (!technique || technique.opens) return <Redirect href="/?s=techniques" />;

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title="Техника"
        leadingLabel="Назад к техникам"
        onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/?s=techniques'))}
        onSosPress={() => router.push('/sos')}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + t.space.xl }}>
        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
          <Text accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
            {technique.title}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.xs }}>
            <ChipBadge>{technique.duration}</ChipBadge>
            {technique.tags.map((tag) => (
              <ChipBadge key={tag}>{tag}</ChipBadge>
            ))}
          </View>
        </View>

        {technique.phases ? (
          <View style={{ paddingTop: t.space.lg, paddingHorizontal: t.space.screen }}>
            <PhaseTiles phases={technique.phases} />
          </View>
        ) : null}

        <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
          <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
            Как делать
          </Text>
          {technique.steps.map((step, i) => (
            <NumberedStep key={i} number={i + 1}>
              {step}
            </NumberedStep>
          ))}
        </View>

        <View style={{ paddingTop: t.space.lg, paddingHorizontal: t.space.screen }}>
          <Card>
            <View style={{ gap: t.space.xxs }}>
              <Text accessibilityRole="header" style={[t.type.bodyStrong, { color: t.color.text }]}>
                Почему это работает
              </Text>
              <Text style={[t.type.caption, { color: t.color.textMuted }]}>{technique.why}</Text>
            </View>
          </Card>
        </View>

        {technique.breathScheme ? (
          <View style={{ marginTop: 'auto', paddingTop: t.space.xl, paddingHorizontal: t.space.screen }}>
            <Button
              size="lg"
              icon="breath"
              fullWidth
              onPress={() => router.push(`/meditation?from=technique&scheme=${technique.breathScheme}`)}
            >
              Перейти к таймеру
            </Button>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
