import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdviceCard, BulletItem, ListItemCard, ScreenHeader } from '@/components/blocks';
import { Button } from '@/components/ui';
import { situationById } from '@/data/situations';
import { techniqueById } from '@/data/techniques';
import { useTheme } from '@/theme';

/** Трудная ситуация: что происходит, что может помочь, когда идти к специалисту и подходящая техника. */
export function SituationScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const situation = situationById(id);
  const technique = techniqueById(situation?.techniqueId);

  // Неизвестная ситуация (старая ссылка) — возвращаем к экрану «Анатомия».
  if (!situation) return <Redirect href="/?s=anatomy" />;

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title="Ситуации"
        leadingLabel="Назад к ситуациям"
        onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/?s=anatomy'))}
        onSosPress={() => router.push('/sos')}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + t.space.xl }}>
        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
          <Text accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
            {situation.title}
          </Text>
          <Text style={[t.type.body, { color: t.color.text }]}>{situation.intro}</Text>
        </View>

        <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
          <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
            Что может помочь
          </Text>
          {situation.help.map((item) => (
            <BulletItem key={item}>{item}</BulletItem>
          ))}
        </View>

        {technique ? (
          <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
            <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
              Попробуйте технику
            </Text>
            <ListItemCard
              icon={technique.icon}
              tone="neutral"
              title={technique.title}
              caption={`${technique.duration} · ${technique.summary}`}
              onPress={() =>
                router.push(
                  technique.opens === 'pomodoro' ? '/meditation?tab=pomodoro' : `/technique/${technique.id}`,
                )
              }
            />
          </View>
        ) : null}

        <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen }}>
          <AdviceCard tone="soft" title="Когда стоит поговорить со специалистом" body={situation.seekHelp}>
            <Button icon="specialist" fullWidth onPress={() => router.dismissTo('/?s=match')}>
              Подобрать специалиста
            </Button>
            <Button variant="outline" fullWidth onPress={() => router.push('/sos/university')}>
              Помощь в моём вузе
            </Button>
          </AdviceCard>
        </View>
      </ScrollView>
    </View>
  );
}
