import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { CardStatus, LikesLink, SpecialistCard, type CardStatusTone } from '@/components/blocks';
import { Button } from '@/components/ui';
import type { Cabinet } from '@/data/repos';
import { formatAndCity, fullName, roleAndExperience } from '@/features/specialists/labels';
import { useTheme } from '@/theme';
import { CabinetFallback, likesCount, likesThisWeek, useCabinet } from './Cabinet';

// Высота фото в превью — из макета CabCard (.photo); в подборе она больше.
const PHOTO_HEIGHT = 170;

function statusOf({ draft, published }: Cabinet): { tone: CardStatusTone; text: string } {
  if (draft?.status === 'changes_requested') {
    return { tone: 'changes', text: draft.comment ? `Есть замечания: ${draft.comment}` : 'Есть замечания' };
  }
  if (draft) {
    return {
      tone: 'pending',
      text: published
        ? 'На проверке. Пока студенты видят прежнюю версию карточки.'
        : 'На проверке. Карточка появится у студентов после проверки.',
    };
  }
  return published
    ? { tone: 'published', text: 'Опубликована и проверена администратором' }
    : { tone: 'hidden', text: 'Карточка пока не опубликована. Заполните её и отправьте на проверку.' };
}

/** «Моя карточка» (эталон CabCard): статус, карточка глазами студентов, отклики и переход к редактированию. */
export function CabinetCardScreen() {
  const t = useTheme();
  const router = useRouter();
  const { cabinet } = useCabinet();
  if (!cabinet) return <CabinetFallback />;
  const { card, stats } = cabinet;
  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: t.space.screen, paddingBottom: t.space.xl }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          // В макете заголовок и кнопка в одну строку; с настоящим шрифтом они не помещаются, и кнопка переходит ниже.
          gap: t.space.sm,
          paddingTop: t.space.xs,
        }}
      >
        <Text accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
          Моя карточка
        </Text>
        <Button variant="outline" onPress={() => router.push('/cabinet/edit')}>
          Редактировать
        </Button>
      </View>
      <View style={{ paddingTop: t.space.md }}>
        <CardStatus {...statusOf(cabinet)} />
      </View>
      <Text
        style={[
          t.type.caption,
          { paddingTop: t.space.md, paddingHorizontal: t.space.xxs, paddingBottom: t.space.xs, color: t.color.textMuted },
        ]}
      >
        Так вашу карточку видят студенты:
      </Text>
      <SpecialistCard
        name={fullName(card)}
        subtitle={roleAndExperience(card)}
        specializations={card.specializations}
        quote={card.quote ? `«${card.quote}».` : undefined}
        format={formatAndCity(card)}
        photoUri={card.photoUri}
        photoHeight={PHOTO_HEIGHT}
      />
      <View style={{ paddingTop: t.space.md }}>
        <LikesLink
          title={likesCount(stats.total)}
          caption={likesThisWeek(stats.weeks)}
          onPress={() => router.replace('/cabinet/stats')}
        />
      </View>
    </ScrollView>
  );
}
