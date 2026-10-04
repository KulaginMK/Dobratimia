import { useRouter, type Href } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenHeader } from '@/components/blocks';
import { Button } from '@/components/ui';
import { useTheme } from '@/theme';

export type PlaceholderLink = {
  label: string;
  href: Href;
  /** push — открыть поверх (по умолчанию); replace — заменить текущий экран; dismissTo — вернуться к экрану в стеке. */
  action?: 'push' | 'replace' | 'dismissTo';
};

type NoteProps = {
  /** Этап из docs/11-roadmap.md, на котором экран будет свёрстан. */
  stage: number;
  /** Имя эталона в handoff/reference/screens-png. */
  etalon: string;
  /** Переходы с этого экрана — чтобы уже сейчас пройти по всем маршрутам. */
  links?: PlaceholderLink[];
};

/** Пометка «экран ещё не свёрстан» и кнопки переходов. Временная: исчезает вместе с заглушками. */
export function PlaceholderNote({ stage, etalon, links = [] }: NoteProps) {
  const t = useTheme();
  const router = useRouter();
  return (
    <View style={{ padding: t.space.screen, gap: t.space.sm }}>
      <Text style={[t.type.caption, { color: t.color.textMuted }]}>
        Заглушка: экран появится на этапе {stage}. Эталон — {etalon}.png
      </Text>
      {links.map((link) => (
        <Button
          key={link.label}
          variant="outline"
          fullWidth
          onPress={() => router[link.action ?? 'push'](link.href)}
        >
          {link.label}
        </Button>
      ))}
    </View>
  );
}

type Props = NoteProps & {
  title: string;
  leading?: 'back' | 'close' | 'none';
  leadingLabel?: string;
  /** false — экран без кнопки SOS: онбординг, сам SOS, кабинет специалиста. */
  sos?: boolean;
};

/** Экран-заглушка этапа 3: шапка с «Назад» и SOS, под ней пометка и переходы. */
export function PlaceholderScreen({ title, leading = 'back', leadingLabel, sos = true, ...note }: Props) {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title={title}
        leading={leading}
        leadingLabel={leadingLabel}
        onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        onSosPress={sos ? () => router.push('/sos') : undefined}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom }}>
        <PlaceholderNote {...note} />
      </ScrollView>
    </View>
  );
}
