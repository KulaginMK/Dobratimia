import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EmergencyCard, LinkRow, ScreenHeader } from '@/components/blocks';
import { Button } from '@/components/ui';
import { AMBULANCE, PSYCH_HELPLINE } from '@/data/emergency';
import type { University } from '@/data/repos';
import { useSelectedUniversity } from '@/features/university/SelectedUniversity';
import { UniversityPickerSheet } from '@/features/university/UniversityPickerSheet';
import { useCallPhone } from '@/lib/phone';
import { useTheme } from '@/theme';

/** Что написано в строке «Помощь в моём вузе»: приглашение выбрать вуз или уже выбранный вуз. */
function universityRow(university: University | null) {
  if (!university) {
    return { title: 'Выберите свой вуз', caption: 'Покажем психологическую службу и её специалистов' };
  }
  if (university.id === 'other') {
    return { title: university.shortName, caption: 'Общий список служб' };
  }
  return {
    title: `${university.shortName} · ${university.city}`,
    caption: university.service?.name ?? 'Контакты службы пока проверяются',
  };
}

/** SOS: экстренные номера и помощь в своём вузе. Работает без входа и без сети. Здесь нет шуток и Тимки. */
export function SosScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const call = useCallPhone();
  const { universityId, byId, select } = useSelectedUniversity();
  const [pickerOpen, setPickerOpen] = useState(false);
  const row = universityRow(byId(universityId));

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader title="SOS" onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + t.space.xl }}>
        <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.xl, gap: t.space.xs }}>
          <Text accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
            Вы не одни
          </Text>
          <Text style={[t.type.body, { color: t.color.textMuted }]}>
            Если сейчас очень тяжело — позвоните. Вас выслушают и помогут разобраться, что делать дальше.
          </Text>
        </View>

        <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
          <EmergencyCard
            label="Экстренная психологическая помощь"
            number={PSYCH_HELPLINE}
            onCall={() => call(PSYCH_HELPLINE)}
          />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space.sm,
              paddingVertical: t.space.sm,
              paddingLeft: t.space.lg,
              paddingRight: t.space.sm,
              borderRadius: t.radius.xl,
              backgroundColor: t.color.surface,
              boxShadow: t.shadow.sm,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={[t.type.bodyStrong, { color: t.color.text }]}>{`Угроза жизни — ${AMBULANCE}`}</Text>
              <Text style={[t.type.caption, { color: t.color.textMuted }]}>Скорая медицинская помощь</Text>
            </View>
            <Button
              variant="outline"
              icon="phone"
              accessibilityLabel={`Позвонить ${AMBULANCE}`}
              onPress={() => call(AMBULANCE)}
            >
              {AMBULANCE}
            </Button>
          </View>
        </View>

        <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
          <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
            Помощь в моём вузе
          </Text>
          <LinkRow
            icon="specialist"
            title={row.title}
            caption={row.caption}
            onPress={() => (universityId ? router.push('/sos/university') : setPickerOpen(true))}
          />
        </View>

        <View style={{ marginTop: 'auto', paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.xs }}>
          <Text style={[t.type.caption, { color: t.color.textMuted, textAlign: 'center' }]}>
            Пока ждёте ответа, можно подышать вместе
          </Text>
          <Button
            variant="secondary"
            icon="breath"
            fullWidth
            onPress={() => router.push('/meditation?scheme=4-6&cycles=12&from=sos')}
          >
            {'Дыхание · 2 минуты'}
          </Button>
        </View>
      </ScrollView>

      <UniversityPickerSheet
        open={pickerOpen}
        selectedId={universityId}
        onClose={() => setPickerOpen(false)}
        onSelect={(id) => {
          select(id);
          setPickerOpen(false);
          router.push('/sos/university');
        }}
      />
    </View>
  );
}
