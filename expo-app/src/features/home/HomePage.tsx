import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { MoodPicker, RoundAction, ScreamButton, SosAction, Ticker } from '@/components/blocks';
import { useTopInset } from '@/components/blocks/useTopInset';
import { Logo } from '@/components/brand';
import { Button, useToast } from '@/components/ui';
import type { MoodLevel } from '@/data/local/mood';
import { mockUser } from '@/data/mocks/user';
import { presenceRepo } from '@/data/repos';
import type { FeedPageProps } from '@/features/feed/FeedPager';
import { useMoodDiary } from '@/features/mood/MoodDiary';
import { moodLabel } from '@/features/mood/moodMeta';
import { plural } from '@/lib/plural';
import { useTheme } from '@/theme';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
}

/** Сколько человек открыли приложение сегодня. null — число ещё не пришло или нет сети: строку не показываем. */
function usePresenceCount(): number | null {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    presenceRepo
      .todayCount()
      .then((value) => {
        if (alive) setCount(value);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return count;
}

/** Главная: КРИК, отметка настроения, «Карта», SOS и тест DASS-21. Центр ленты, с неё открывается приложение. */
export function HomePage({ active }: FeedPageProps) {
  const t = useTheme();
  const router = useRouter();
  const toast = useToast();
  const topInset = useTopInset();
  const { today, mark, restore } = useMoodDiary();
  const count = usePresenceCount();

  // ?focus=mood — пришли из напоминания о дневнике или после КРИКа: прокручиваем к лицам (docs/06).
  const { focus } = useLocalSearchParams<{ focus?: string }>();
  const scrollRef = useRef<ScrollView>(null);
  const moodTitleRef = useRef<Text>(null);
  const moodTop = useRef(0);
  useEffect(() => {
    if (focus !== 'mood' || !active) return;
    scrollRef.current?.scrollTo({ y: moodTop.current, animated: true });
    if (Platform.OS !== 'web' && moodTitleRef.current) {
      AccessibilityInfo.sendAccessibilityEvent(moodTitleRef.current, 'focus');
    }
    router.setParams({ focus: undefined });
  }, [focus, active, router]);

  const onMood = (level: MoodLevel) => {
    const change = mark(level);
    if (!change) return;
    toast.show({
      message: 'Отметка сохранена в дневник',
      tone: 'success',
      actionLabel: 'Отменить',
      onAction: () => restore(change.date, change.previous),
    });
  };

  return (
    <ScrollView
      ref={scrollRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: t.space.xl }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: topInset,
          paddingHorizontal: t.space.screen,
        }}
      >
        <Pressable
          onPress={() => router.push('/about')}
          accessibilityRole="button"
          accessibilityLabel="Добратимия — о проекте"
          style={{ minHeight: t.size.touch, justifyContent: 'center' }}
        >
          <Logo />
        </Pressable>
        <Pressable
          onPress={() => router.push('/profile')}
          accessibilityRole="button"
          accessibilityLabel="Профиль и настройки"
          style={{
            width: t.size.avatar,
            height: t.size.avatar,
            borderRadius: t.radius.full,
            backgroundColor: t.color.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={[t.type.bodyStrong, { fontFamily: t.fontFamily.text[700], color: t.color.onPrimarySoft }]}>
            {initials(mockUser.name)}
          </Text>
        </Pressable>
      </View>

      {count !== null ? (
        <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen }}>
          <Ticker
            icon="specialist"
            text="Сегодня вы не одни: "
            strong={`${count} ${plural(count, 'человек', 'человека', 'человек')}`}
            active={active}
          />
        </View>
      ) : null}

      <View style={{ alignItems: 'center', gap: t.space.sm, paddingTop: t.space.lg }}>
        <ScreamButton onPress={() => router.push('/scream')} />
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>Голос не записываем — только громкость</Text>
      </View>

      <View
        onLayout={(e) => {
          moodTop.current = e.nativeEvent.layout.y;
        }}
        style={{
          marginTop: t.space.lg,
          marginHorizontal: t.space.screen,
          paddingTop: t.space.md,
          paddingHorizontal: t.space.sm,
          paddingBottom: t.space.sm,
          borderRadius: t.radius.xl,
          backgroundColor: t.color.surface,
          boxShadow: t.shadow.sm,
          gap: t.space.xs,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: t.space.sm,
            paddingHorizontal: t.space.xs,
          }}
        >
          <Text
            ref={moodTitleRef}
            accessibilityRole="header"
            style={[t.type.h3, { flexShrink: 1, color: t.color.text }]}
          >
            {today ? `Сегодня вам ${moodLabel(today.level).toLowerCase()}` : 'Как вы сегодня?'}
          </Text>
          <Pressable
            onPress={() => router.push('/diary')}
            accessibilityRole="link"
            hitSlop={t.space.md}
          >
            <Text
              style={{
                fontFamily: t.fontFamily.text[600],
                fontSize: t.type.caption.fontSize,
                lineHeight: t.type.caption.lineHeight,
                color: t.color.primary,
              }}
            >
              Дневник
            </Text>
          </Pressable>
        </View>
        <MoodPicker value={today?.level ?? null} onChange={onMood} />
        {today ? (
          <Text style={[t.type.caption, { paddingHorizontal: t.space.xs, color: t.color.textMuted }]}>
            {`Отмечено в ${today.time}. Нажмите на другое лицо, чтобы изменить.`}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: t.space['3xl'] + t.space.xl,
          paddingTop: t.space.lg,
        }}
      >
        <RoundAction icon="map" label="Карта" onPress={() => router.push('/map')} />
        <SosAction label="Помощь" onPress={() => router.push('/sos')} />
      </View>

      <View style={{ paddingTop: t.space.lg, paddingHorizontal: t.space.screen, gap: t.space.xs }}>
        <Button
          variant="deep"
          size="lg"
          icon="diary"
          iconRight="chevronRight"
          fullWidth
          onPress={() => router.push('/dass')}
        >
          {'Тест DASS-21 · 5 минут'}
        </Button>
        {__DEV__ ? (
          <Button variant="text" onPress={() => router.push('/dev/kitchen-sink')}>
            Витрина компонентов
          </Button>
        ) : null}
      </View>
    </ScrollView>
  );
}
