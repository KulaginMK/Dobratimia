import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContactRow, EmergencyStrip, LinkRow, ScreenHeader } from '@/components/blocks';
import { Button, Card, Chip } from '@/components/ui';
import { PSYCH_HELPLINE } from '@/data/emergency';
import { TEAM_EMAIL } from '@/data/mocks/universities';
import type { University, UniversityService } from '@/data/repos';
import { useSelectedUniversity } from '@/features/university/SelectedUniversity';
import { UniversityPickerSheet } from '@/features/university/UniversityPickerSheet';
import { formatLongDate } from '@/lib/formatDate';
import { useCallPhone } from '@/lib/phone';
import { useTheme } from '@/theme';

// С компьютера звонок по ссылке может не открыться — в вебе номер показан текстом рядом с кнопкой (docs/07).
const SHOW_NUMBERS = Platform.OS === 'web';

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
}

/** «Помощь в моём вузе»: служба выбранного вуза и её специалисты. Работает без входа и без сети. */
export function SosUniversityScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const call = useCallPhone();
  const { universityId, ready, byId, select } = useSelectedUniversity();
  const [pickerOpen, setPickerOpen] = useState(false);
  const university = byId(universityId);

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader title="SOS" onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/sos'))} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + t.space.xl }}>
        <View style={{ paddingTop: t.space.xs, paddingHorizontal: t.space.screen }}>
          <EmergencyStrip
            label="Экстренная психологическая помощь"
            number={PSYCH_HELPLINE}
            onCall={() => call(PSYCH_HELPLINE)}
          />
        </View>

        <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
          <Text accessibilityRole="header" style={[t.type.h2, { color: t.color.text }]}>
            Помощь в моём вузе
          </Text>
          {university ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.space.sm }}>
              <Chip selected onChange={() => setPickerOpen(true)}>
                {university.city ? `${university.shortName} · ${university.city}` : university.shortName}
              </Chip>
              <Button variant="text" onPress={() => setPickerOpen(true)}>
                Сменить вуз
              </Button>
            </View>
          ) : ready ? (
            <LinkRow
              icon="specialist"
              title="Выберите свой вуз"
              caption="Покажем психологическую службу и её специалистов"
              onPress={() => setPickerOpen(true)}
            />
          ) : null}
        </View>

        {university ? <UniversityHelp university={university} onCall={call} /> : null}
      </ScrollView>

      <UniversityPickerSheet
        open={pickerOpen}
        selectedId={universityId}
        onClose={() => setPickerOpen(false)}
        onSelect={(id) => {
          select(id);
          setPickerOpen(false);
        }}
      />
    </View>
  );
}

function UniversityHelp({ university, onCall }: { university: University; onCall: (phone: string) => void }) {
  const t = useTheme();
  const { universities } = useSelectedUniversity();

  // «Другой вуз»: службы всех вузов из справочника с городами.
  if (university.id === 'other') {
    const withService = universities.filter((item) => item.service);
    return (
      <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
        <View>
          {withService.map((item, i) => (
            <ContactRow
              key={item.id}
              name={item.service!.name}
              caption={`${item.city} · ${item.service!.hours}`}
              note={SHOW_NUMBERS ? item.service!.phone : undefined}
              avatarIcon="sos"
              avatarTone="sos"
              callLabel={`Позвонить: ${item.service!.name}`}
              onCall={() => onCall(item.service!.phone)}
              divider={i < withService.length - 1}
            />
          ))}
        </View>
        {/* Пока почты команды нет (заглушка), фраза остаётся текстом без ссылки. */}
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>
          {TEAM_EMAIL
            ? `Вашего вуза пока нет в списке — напишите нам: ${TEAM_EMAIL}`
            : 'Вашего вуза пока нет в списке — напишите нам'}
        </Text>
      </View>
    );
  }

  if (!university.service) {
    return (
      <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen }}>
        <Card variant="outline">
          <Text style={[t.type.body, { color: t.color.text }]}>
            Контакты службы этого вуза пока проверяются. Мы добавим их, как только убедимся, что они верны.
          </Text>
        </Card>
      </View>
    );
  }

  return <ServiceDetails service={university.service} onCall={onCall} />;
}

function ServiceDetails({ service, onCall }: { service: UniversityService; onCall: (phone: string) => void }) {
  const t = useTheme();
  return (
    <>
      <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen }}>
        <Card>
          <View style={{ gap: t.space.sm }}>
            <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
              {service.name}
            </Text>
            <View style={{ gap: t.space.xxs }}>
              <Text style={[t.type.body, { color: t.color.text }]}>{service.address}</Text>
              <Text style={[t.type.caption, { color: t.color.textMuted }]}>{service.hours}</Text>
              {SHOW_NUMBERS ? <Text style={[t.type.caption, { color: t.color.textMuted }]}>{service.phone}</Text> : null}
            </View>
            <Button icon="phone" fullWidth onPress={() => onCall(service.phone)}>
              Позвонить в службу
            </Button>
          </View>
        </Card>
      </View>

      {service.staff.length > 0 ? (
        <View style={{ paddingTop: t.space.lg, paddingHorizontal: t.space.screen }}>
          <Text accessibilityRole="header" style={[t.type.h3, { paddingBottom: t.space.xxs, color: t.color.text }]}>
            Специалисты службы
          </Text>
          {service.staff.map((person, i) => (
            <ContactRow
              key={person.id}
              name={person.name}
              caption={`${person.role} · ${person.format}`}
              note={SHOW_NUMBERS ? person.phone : undefined}
              initials={initials(person.name)}
              callLabel={person.nameDative ? `Позвонить ${person.nameDative}` : `Позвонить: ${person.name}`}
              onCall={() => onCall(person.phone)}
              divider={i < service.staff.length - 1}
            />
          ))}
        </View>
      ) : null}

      <Text
        style={[
          t.type.caption,
          {
            marginTop: 'auto',
            paddingTop: t.space.xl,
            paddingHorizontal: t.space.xl,
            color: t.color.textMuted,
            textAlign: 'center',
          },
        ]}
      >
        {`Контакты проверяет администратор. Обновлено ${formatLongDate(service.verifiedAt)}.`}
      </Text>
    </>
  );
}
