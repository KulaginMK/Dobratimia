import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CareNote, GroupLabel, InlineLink, PrincipleRow, ScreenHeader, SettingsGroup, SettingsRow } from '@/components/blocks';
import { Logo } from '@/components/brand';
import { Button, Card } from '@/components/ui';
import { PSYCH_HELPLINE } from '@/data/emergency';
import { SOCIAL_LINKS, TEAM_EMAIL } from '@/data/team';
import { APP_VERSION } from '@/lib/appVersion';
import { useOpenLink } from '@/lib/links';
import { useCallPhone } from '@/lib/phone';
import { useTheme } from '@/theme';

// Размеры из макета About.
const LOGO_SIZE = 96;
const PRINCIPLES_GAP = 14;

/** «О проекте» (эталон About): что это за приложение, его принципы и как написать команде. */
export function AboutScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const call = useCallPhone();
  const openLink = useOpenLink();

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title="О проекте"
        onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        onSosPress={() => router.push('/sos')}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + t.space.xl }}>
        <View style={{ alignItems: 'center', paddingTop: t.space.lg }}>
          <Logo variant="stacked" size={LOGO_SIZE} maxWidth={width - t.space.screen * 2} />
        </View>
        <Text
          style={[
            t.type.body,
            { paddingTop: t.space.lg, paddingHorizontal: t.space.xl, color: t.color.text, textAlign: 'center' },
          ]}
        >
          Бесплатное приложение для студентов медицинских вузов Беларуси. Его делают люди, которые знают, как даются
          сессии, ночные смены и страх ошибиться.
        </Text>

        <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen }}>
          <Card>
            <View style={{ gap: PRINCIPLES_GAP }}>
              <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
                Наши принципы
              </Text>
              <PrincipleRow icon="heart">Добрый, тёплый тон — без нотаций и стыда</PrincipleRow>
              <PrincipleRow icon="check">Минимум данных и никакой переписки внутри приложения</PrincipleRow>
              <PrincipleRow icon="diary">Никаких диагнозов и медицинских обещаний</PrincipleRow>
              <PrincipleRow icon="sos">Экстренная помощь доступна с любого экрана</PrincipleRow>
            </View>
          </Card>
        </View>

        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen }}>
          <CareNote onPress={() => call(PSYCH_HELPLINE)} accessibilityHint={`Позвонить на номер ${PSYCH_HELPLINE}`}>
            {'Приложение не заменяет медицинскую и психологическую помощь. Если тяжело — звоните '}
            <InlineLink strong>{PSYCH_HELPLINE}</InlineLink>.
          </CareNote>
        </View>

        {/* Страниц проекта в макете нет — добавлены по просьбе владельца (15 октября 2026 года). */}
        <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.xl }}>
          <GroupLabel>Мы в соцсетях</GroupLabel>
        </View>
        <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen }}>
          <SettingsGroup>
            {SOCIAL_LINKS.map((link) => (
              <SettingsRow key={link.url} title={link.title} action={link.handle} onPress={() => openLink(link.url)} />
            ))}
          </SettingsGroup>
        </View>

        <View style={{ marginTop: 'auto', paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.xs }}>
          <Button variant="outline" icon="message" fullWidth onPress={() => router.push('/feedback')}>
            Написать команде
          </Button>
          <Text selectable style={[t.type.caption, { color: t.color.textMuted, textAlign: 'center' }]}>
            {`Версия ${APP_VERSION} · ${TEAM_EMAIL}`}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
