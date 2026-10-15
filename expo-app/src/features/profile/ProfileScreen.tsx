import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DangerButton, GroupLabel, ProfileHead, ScreenHeader, SettingsGroup, SettingsRow } from '@/components/blocks';
import { BottomSheet, Button, SegmentedControl, Switch, useToast } from '@/components/ui';
import { CONSENT_URL, PRIVACY_URL } from '@/data/mocks/links';
import { NEXT_TEST_DAYS, useDassHistory } from '@/features/dass/DassHistory';
import { useMoodDiary } from '@/features/mood/MoodDiary';
import {
  syncDassReminder,
  syncDiaryReminders,
  useAllowNotifications,
  useReminders,
} from '@/features/reminders/reminders';
import { useSession } from '@/features/session/Session';
import { useSelectedUniversity } from '@/features/university/SelectedUniversity';
import { UniversityPickerSheet } from '@/features/university/UniversityPickerSheet';
import { APP_VERSION } from '@/lib/appVersion';
import { addDays, dayAndMonth, toDateKey } from '@/lib/dates';
import { DOCUMENT_PENDING, useOpenLink } from '@/lib/links';
import { useTheme, useThemePreference, type ThemePreference } from '@/theme';

const THEMES: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
  { value: 'system', label: 'Как в системе' },
];

// Локальные уведомления по расписанию в вебе не работают: вместо переключателей — строка (docs/07).
const REMINDERS_AVAILABLE = Platform.OS !== 'web';
// Данные лежат на устройстве: в вебе это браузер, а не телефон.
const DEVICE = Platform.OS === 'web' ? 'в этом браузере' : 'на этом телефоне';

/** Профиль и настройки (эталон Profile): вуз, напоминания, тема, документы, выход и удаление данных. */
export function ProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const openLink = useOpenLink();
  const { user, signOut, deleteData } = useSession();
  const { universityId, byId, select } = useSelectedUniversity();
  const { preference, setPreference } = useThemePreference();
  const { entries } = useDassHistory();
  const mood = useMoodDiary();
  const [reminders, setReminders] = useReminders();
  const allowNotifications = useAllowNotifications();
  const [sheet, setSheet] = useState<'university' | 'signOut' | 'delete' | null>(null);
  const [deleting, setDeleting] = useState(false);

  const university = byId(universityId);
  // Следующий тест — через 14 дней после последнего; если этот день уже прошёл, дату не показываем.
  const latest = entries[entries.length - 1];
  const nextTest = latest ? addDays(latest.date, NEXT_TEST_DAYS) : null;
  const dassSchedule =
    nextTest && nextTest >= toDateKey(new Date())
      ? `Раз в ${NEXT_TEST_DAYS} дней · следующий ${dayAndMonth(nextTest)}`
      : `Раз в ${NEXT_TEST_DAYS} дней`;

  // Разрешение на уведомления спрашиваем здесь, при включении, а не при запуске приложения (docs/07).
  const remindDiary = async (diary: boolean) => {
    if (diary && !(await allowNotifications())) return;
    await setReminders({ ...reminders, diary, diarySince: diary ? mood.todayKey : null });
    syncDiaryReminders(mood.entries[mood.entries.length - 1]?.date ?? null);
  };
  const remindDass = async (dass: boolean) => {
    if (dass && !(await allowNotifications())) return;
    await setReminders({ ...reminders, dass });
    syncDassReminder(latest?.date ?? null);
  };

  const onDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteData();
      toast.show({ message: 'Данные удалены', tone: 'success' });
    } catch {
      setDeleting(false);
      setSheet(null);
      toast.show({ message: 'Не удалось удалить данные. Проверьте интернет и попробуйте ещё раз.', tone: 'error' });
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title="Профиль"
        onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        onSosPress={() => router.push('/sos')}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + t.space.lg }}>
        <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen }}>
          {user ? (
            <ProfileHead name={user.name} email={user.email} />
          ) : (
            // Вход необязателен (решение владельца от 14 октября 2026 года): гостю — что даёт вход.
            <View style={{ gap: t.space.sm }}>
              <Text style={[t.type.body, { color: t.color.textMuted }]}>
                Вы не вошли. Тест, техники, специалисты и «Доброе слово» доступны и так, а дневник, результаты
                тестов и избранные специалисты сохраняются, когда вы войдёте через Google.
              </Text>
              <Button fullWidth onPress={() => router.push('/onboarding/sign-in')}>
                Войти через Google
              </Button>
            </View>
          )}
        </View>

        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.xl }}>
          <GroupLabel>Мой вуз</GroupLabel>
        </View>
        <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen }}>
          <SettingsGroup>
            <SettingsRow
              title={
                university
                  ? university.city
                    ? `${university.shortName} · ${university.city}`
                    : university.shortName
                  : 'Вуз не выбран'
              }
              action={university ? 'Сменить' : 'Выбрать'}
              onPress={() => setSheet('university')}
            />
          </SettingsGroup>
        </View>

        {/* Напоминания — о дневнике и тесте, которые гость не сохраняет. */}
        {user ? (
          <>
            <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.xl }}>
              <GroupLabel>Напоминания</GroupLabel>
            </View>
            <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen }}>
              {REMINDERS_AVAILABLE ? (
                <SettingsGroup>
                  <Switch
                    label="Дневник настроения"
                    description="Каждый день в 21:00"
                    checked={reminders.diary}
                    onChange={remindDiary}
                  />
                  <Switch
                    label="Тест DASS-21"
                    description={dassSchedule}
                    checked={reminders.dass}
                    onChange={remindDass}
                  />
                </SettingsGroup>
              ) : (
                <Text style={[t.type.caption, { paddingHorizontal: t.space.xxs, color: t.color.textMuted }]}>
                  Напоминания работают в приложении для Android
                </Text>
              )}
            </View>
          </>
        ) : null}

        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.xl }}>
          <GroupLabel>Тема</GroupLabel>
        </View>
        <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen }}>
          <SegmentedControl
            dense
            accessibilityLabel="Тема оформления"
            options={THEMES}
            value={preference}
            onChange={setPreference}
          />
        </View>

        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen }}>
          <SettingsGroup>
            {/* Кабинет виден только специалисту: его почту указал администратор (docs/07). */}
            {user?.role === 'specialist' ? (
              <SettingsRow title="Кабинет специалиста" onPress={() => router.push('/cabinet')} />
            ) : null}
            <SettingsRow title="Политика конфиденциальности" onPress={() => openLink(PRIVACY_URL, DOCUMENT_PENDING)} />
            <SettingsRow title="Согласие на обработку данных" onPress={() => openLink(CONSENT_URL, DOCUMENT_PENDING)} />
            <SettingsRow title="Обратная связь" onPress={() => router.push('/feedback')} />
            <SettingsRow title="О проекте" onPress={() => router.push('/about')} />
          </SettingsGroup>
        </View>

        {user ? (
          <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen, gap: t.space.xxs }}>
            <Button variant="outline" fullWidth onPress={() => setSheet('signOut')}>
              Выйти из аккаунта
            </Button>
            <DangerButton onPress={() => setSheet('delete')}>Удалить мои данные</DangerButton>
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
          {`Добратимия ${APP_VERSION} · сделано для студентов медвузов Беларуси`}
        </Text>
      </ScrollView>

      <UniversityPickerSheet
        open={sheet === 'university'}
        selectedId={universityId}
        onClose={() => setSheet(null)}
        onSelect={(id) => {
          select(id);
          setSheet(null);
        }}
      />

      <BottomSheet open={sheet === 'signOut'} title="Выйти из аккаунта?" onClose={() => setSheet(null)}>
        <View style={{ gap: t.space.md }}>
          <Text style={[t.type.body, { color: t.color.text }]}>
            {`Дневник и результаты останутся ${DEVICE} и вернутся, когда вы снова войдёте.`}
          </Text>
          {/* После выхода — экран входа: там можно войти снова или продолжить без входа. */}
          <Button
            fullWidth
            onPress={async () => {
              await signOut();
              router.replace('/onboarding/sign-in');
            }}
          >
            Выйти
          </Button>
          <Button variant="outline" fullWidth onPress={() => setSheet(null)}>
            Остаться
          </Button>
        </View>
      </BottomSheet>

      <BottomSheet open={sheet === 'delete'} title="Удалить все ваши данные?" onClose={() => setSheet(null)}>
        <View style={{ gap: t.space.md }}>
          <Text style={[t.type.body, { color: t.color.text }]}>
            Дневник, результаты тестов, избранные и аккаунт будут удалены без возможности восстановления.
          </Text>
          <Button fullWidth onPress={() => setSheet(null)}>
            Не удалять
          </Button>
          <DangerButton onPress={onDelete}>Удалить всё</DangerButton>
        </View>
      </BottomSheet>
    </View>
  );
}
