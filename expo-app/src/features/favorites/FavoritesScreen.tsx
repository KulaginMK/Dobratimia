import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { ContactRow, SectionLetter } from '@/components/blocks';
import { TextField } from '@/components/ui';
import { universitiesRepo } from '@/data/repos';
import { MATCH_INDEX } from '@/features/feed/feedScreens';
import { SlideFromTopScreen } from '@/features/navigation/SlideFromTopScreen';
import { useSpecialists } from '@/features/specialists/Specialists';
import { fullName, initials, roleAndFormat } from '@/features/specialists/labels';
import { useSelectedUniversity } from '@/features/university/SelectedUniversity';
import { useCallPhone } from '@/lib/phone';
import { useTheme } from '@/theme';

/** Избранные контакты: служба вуза первой, дальше отмеченные специалисты по алфавиту. Выезжают сверху над Подбором. */
export function FavoritesScreen() {
  const t = useTheme();
  const router = useRouter();
  const call = useCallPhone();
  const { universityId } = useSelectedUniversity();
  const { liked, toneOf, contactsOf } = useSpecialists();
  const [query, setQuery] = useState('');

  const needle = query.trim().toLowerCase();
  const matches = (...fields: string[]) => needle === '' || fields.some((field) => field.toLowerCase().includes(needle));

  const service = universitiesRepo.byId(universityId)?.service ?? null;
  const showService = service !== null && matches(service.name);
  // По алфавиту — по фамилии; буква-разделитель тоже по ней (docs/07).
  const found = liked
    .filter((specialist) => matches(fullName(specialist), ...specialist.specializations))
    .sort((a, b) => a.lastName.localeCompare(b.lastName, 'ru'));
  // В вебе звонок с компьютера может не открыться — номер виден текстом (docs/07).
  const phoneNote = (phone: string | undefined) => (Platform.OS === 'web' ? phone : undefined);

  return (
    <SlideFromTopScreen hint="Свайп вверх — к подбору" hintAccessibilityLabel="Назад к подбору" feedIndex={MATCH_INDEX}>
      <View style={{ paddingTop: t.space.xs, paddingHorizontal: t.space.screen, gap: t.space.xxs }}>
        <Text accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
          Избранные контакты
        </Text>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>Звонок — в одно касание</Text>
      </View>
      <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen }}>
        <TextField label="Поиск" placeholder="Имя или специализация" value={query} onChange={setQuery} />
      </View>
      <View style={{ paddingTop: t.space.xxs, paddingHorizontal: t.space.screen }}>
        {showService ? (
          <>
            <SectionLetter>Служба вашего вуза</SectionLetter>
            <ContactRow
              name={service.name}
              caption={`${service.hours} · очно`}
              note={phoneNote(service.phone)}
              avatarIcon="sos"
              avatarTone="sos"
              callLabel={`Позвонить: ${service.name}`}
              onCall={() => call(service.phone)}
              onPress={() => router.push('/sos/university')}
              divider
            />
          </>
        ) : null}
        {found.map((specialist, i) => {
          const phone = contactsOf(specialist.id)?.phone;
          const letter = specialist.lastName[0].toUpperCase();
          const first = i === 0 || found[i - 1].lastName[0].toUpperCase() !== letter;
          return (
            <React.Fragment key={specialist.id}>
              {first ? <SectionLetter>{letter}</SectionLetter> : null}
              <ContactRow
                name={fullName(specialist)}
                caption={roleAndFormat(specialist)}
                note={phoneNote(phone)}
                initials={initials(specialist)}
                avatarTone={toneOf(specialist.id)}
                callLabel={`Позвонить ${specialist.nameDative}`}
                onCall={phone ? () => call(phone) : undefined}
                onPress={() => router.push(`/specialist/${specialist.id}?from=favorites`)}
                divider
              />
            </React.Fragment>
          );
        })}
        {needle !== '' && !showService && found.length === 0 ? (
          <Text style={[t.type.body, { paddingTop: t.space.lg, color: t.color.textMuted }]}>
            Ничего не нашлось. Попробуйте другое имя или специализацию.
          </Text>
        ) : null}
        {needle === '' && liked.length === 0 ? (
          <Text style={[t.type.body, { paddingTop: t.space.lg, color: t.color.textMuted }]}>
            Здесь появятся специалисты, которых вы отметите «Нравится».
          </Text>
        ) : null}
      </View>
    </SlideFromTopScreen>
  );
}
