import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DangerButton, GroupLabel, ProfileHead, ScreenHeader, SettingsGroup, SettingsRow } from '@/components/blocks';
import { BottomSheet, Button, SegmentedControl, Switch, useToast } from '@/components/ui';
import { DEFAULT_REMINDERS, loadReminders, saveReminders, type Reminders } from '@/data/local/reminders';
import { CONSENT_URL, PRIVACY_URL } from '@/data/mocks/links';
import { NEXT_TEST_DAYS, useDassHistory } from '@/features/dass/DassHistory';
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

/** Переключатели напоминаний. Пока только запоминают выбор: сами уведомления появятся на этапе 14. */
function useReminders() {
  const [reminders, setReminders] = useState<Reminders>(DEFAULT_REMINDERS);
  useEffect(() => {
    let alive = true;
    loadReminders().then((stored) => {
      if (alive) setReminders(stored);
    });
    return () => {
      alive = false;
    };
  }, []);
  const change = (next: Reminders) => {
    setReminders(next);
    // Не сохранилось — выбор всё равно действует до перезапуска.
    saveReminders(next).catch(() => {});
  };
  return [reminders, change] as const;
}

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
  const [reminders, setReminders] = useReminders();
  const [sheet, setSheet] = useState<'university' | 'signOut' | 'delete' | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const university = byId(universityId);
  // Следующий тест — через 14 дней после последнего; если этот день уже прошёл, дату не показываем.
  const latest = entries[entries.length - 1];
  const nextTest = latest ? addDays(latest.date, NEXT_TEST_DAYS) : null;
  const dassSchedule =
    nextTest && nextTest >= toDateKey(new Date())
      ? `Раз в ${NEXT_TEST_DAYS} дней · следующий ${dayAndMonth(nextTest)}`
      : `Раз в ${NEXT_TEST_DAYS} дней`;

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
          <ProfileHead name={user.name} email={user.email} />
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
                onChange={(diary) => setReminders({ ...reminders, diary })}
              />
              <Switch
                label="Тест DASS-21"
                description={dassSchedule}
                checked={reminders.dass}
                onChange={(dass) => setReminders({ ...reminders, dass })}
              />
            </SettingsGroup>
          ) : (
            <Text style={[t.type.caption, { paddingHorizontal: t.space.xxs, color: t.color.textMuted }]}>
              Напоминания работают в приложении для Android
            </Text>
          )}
        </View>

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
            {user.role === 'specialist' ? (
              <SettingsRow title="Кабинет специалиста" onPress={() => router.push('/cabinet')} />
            ) : null}
            <SettingsRow title="Политика конфиденциальности" onPress={() => openLink(PRIVACY_URL, DOCUMENT_PENDING)} />
            <SettingsRow title="Согласие на обработку данных" onPress={() => openLink(CONSENT_URL, DOCUMENT_PENDING)} />
            <SettingsRow title="О проекте" onPress={() => router.push('/about')} />
          </SettingsGroup>
        </View>

        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen, gap: t.space.xxs }}>
          <Button variant="outline" fullWidth onPress={() => setSheet('signOut')}>
            Выйти из аккаунта
          </Button>
          <DangerButton onPress={() => setSheet('delete')}>Удалить мои данные</DangerButton>
        </View>

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
          {/* После выхода (app) сам отправит на экран входа. */}
          <Button fullWidth onPress={() => signOut()}>
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
