import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AnatomyFigure,
  BulletItem,
  ContactRow,
  EmergencyCard,
  EmergencyStrip,
  LinkRow,
  ListItemCard,
  MoodCalendar,
  MoodEntryRow,
  MoodPicker,
  MoodWeekBars,
  NumberedStep,
  PhaseTiles,
  PullHint,
  RoundAction,
  ScaleBar,
  ScreamButton,
  ScreenHeader,
  SosAction,
  SosRound,
  SpecialistCard,
  Ticker,
  type MoodLevel,
  type ScaleLevel,
} from '@/components/blocks';
import { Icon, Logo, Timka, iconNames } from '@/components/brand';
import {
  BottomSheet,
  Button,
  ButtonRow,
  Card,
  Chip,
  ChipBadge,
  EmptyState,
  ProgressBar,
  RadioCard,
  ScreenIndicator,
  SegmentedControl,
  Skeleton,
  Switch,
  TextField,
  ToastView,
  cardColors,
  useToast,
} from '@/components/ui';
import { ORGANS, type OrganId } from '@/data/anatomy';
import { PSYCH_HELPLINE } from '@/data/emergency';
import { demoSpecialist, demoUniversityService } from '@/data/mocks/demo';
import { ThemeProvider, useTheme, useThemePreference, type ThemePreference } from '@/theme';

// Экран разработчика: размеры ниже — только для этой витрины, как на handoff/reference/kitchen-sink.png.
const COLUMN_MIN_WIDTH = 360;
const LOGO_SMALL = 32;
const LOGO_MARK = 48;
const TIMKA_SIZE = 104;
const SHEET_LONG_ROWS = 24;

const PREFERENCES: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
  { value: 'system', label: 'Как в системе' },
];

const SCALE_DEMO: { title: string; score: number; level: ScaleLevel }[] = [
  { title: 'Стресс', score: 6, level: 'normal' },
  { title: 'Депрессия', score: 12, level: 'mild' },
  { title: 'Тревога', score: 12, level: 'moderate' },
  { title: 'Стресс', score: 28, level: 'high' },
  { title: 'Депрессия', score: 36, level: 'extreme' },
];

/** Витрина готовых компонентов в двух темах. Только в dev-сборке. */
export default function KitchenSink() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  if (!__DEV__) return <Redirect href="/" />;

  // На широком экране темы стоят рядом, на телефоне — друг под другом.
  const sideBySide = width >= COLUMN_MIN_WIDTH * 2;

  return (
    <ScrollView keyboardShouldPersistTaps="handled">
      <AppThemeSwitch padTop={insets.top} />
      <View style={{ flexDirection: sideBySide ? 'row' : 'column' }}>
        <ThemeProvider preference="light">
          <Showcase grow={sideBySide} padBottom={sideBySide ? insets.bottom : 0} />
        </ThemeProvider>
        <ThemeProvider preference="dark">
          <Showcase grow={sideBySide} padBottom={insets.bottom} />
        </ThemeProvider>
      </View>
    </ScrollView>
  );
}

/** Настройка темы всего приложения: сохраняется на устройстве и переживает перезапуск. */
function AppThemeSwitch({ padTop }: { padTop: number }) {
  const t = useTheme();
  const { preference, setPreference } = useThemePreference();
  return (
    <View
      style={{
        backgroundColor: t.color.background,
        paddingHorizontal: t.space.screen,
        paddingTop: t.space.md + padTop,
        paddingBottom: t.space.md,
        gap: t.space.xs,
      }}
    >
      <StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} />
      <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
        Тема приложения
      </Text>
      <SegmentedControl
        accessibilityLabel="Тема оформления"
        options={PREFERENCES}
        value={preference}
        onChange={setPreference}
      />
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.space.sm }}>
      <Text accessibilityRole="header" style={[t.type.overline, { color: t.color.textMuted }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Showcase({ grow, padBottom }: { grow: boolean; padBottom: number }) {
  const t = useTheme();
  const toast = useToast();
  const [tone, setTone] = useState<'sweet' | 'spicy'>('sweet');
  const [screen, setScreen] = useState(2);
  const [tab, setTab] = useState(0);
  const [mood, setMood] = useState<MoodLevel | null>(4);
  const [sheet, setSheet] = useState<'short' | 'long' | null>(null);
  const [notify, setNotify] = useState(true);
  const [radio, setRadio] = useState(0);
  const [organ, setOrgan] = useState<OrganId>('heart');
  const soft = cardColors(t, 'soft');
  const sos = cardColors(t, 'sos');

  return (
    <View
      style={{
        flex: grow ? 1 : undefined,
        backgroundColor: t.color.background,
        paddingHorizontal: t.space.screen,
        paddingTop: t.space.xl,
        paddingBottom: t.space['3xl'] + padBottom,
        gap: t.space.xl,
      }}
    >
      <Section title="Бренд">
        <Logo size={LOGO_SMALL} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: t.space.md }}>
          <Logo variant="mark" size={LOGO_MARK} />
          <Logo variant="stacked" size={LOGO_SMALL} />
          <Logo size={LOGO_SMALL} mono={t.color.text} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.xs }}>
          <Timka pose="hello" size={TIMKA_SIZE} />
          <Timka pose="breathe" size={TIMKA_SIZE} />
          <Timka pose="sleep" size={TIMKA_SIZE} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.sm }}>
          {iconNames.map((name) => (
            <Icon key={name} name={name} color={t.color.primary} title={name} />
          ))}
        </View>
        <Text style={[t.type.h1, { color: t.color.text }]}>Как вы сегодня?</Text>
        <Text style={[t.type.body, { color: t.color.textMuted }]}>Голос не записываем — только громкость</Text>
        <Text style={[t.type.overline, { color: t.color.text }]}>От психотерапевта</Text>
      </Section>

      <Section title="Button">
        <Button fullWidth>Начать</Button>
        <ButtonRow>
          <Button variant="secondary">Позже</Button>
          <Button variant="outline" icon="close">
            Не подходит
          </Button>
        </ButtonRow>
        <Button variant="text" style={{ alignSelf: 'flex-start' }}>
          Подробнее
        </Button>
        <Button variant="sos" size="lg" icon="phone" fullWidth>
          Позвонить 133
        </Button>
        <Button variant="deep" iconRight="chevronRight" fullWidth>
          {'Тест DASS-21 · 5 минут'}
        </Button>
        <ButtonRow>
          <Button disabled>Нельзя</Button>
          <Button variant="outline" icon="heart" accessibilityLabel="Сохранить фразу" />
        </ButtonRow>
      </Section>

      <Section title="Card">
        <Card>
          <Text style={[t.type.bodyStrong, { color: t.color.text }]}>Дыхание 4-7-8</Text>
        </Card>
        <Card variant="soft">
          <Text style={[t.type.body, { color: soft.fg }]}>Вы не обязаны быть продуктивным каждый день.</Text>
        </Card>
        <Card variant="outline">
          <Text style={[t.type.body, { color: t.color.text }]}>Политика конфиденциальности</Text>
        </Card>
        <Card variant="sos">
          <Text style={[t.type.bodyStrong, { color: sos.fg }]}>
            Возможно, сейчас стоит поговорить со специалистом
          </Text>
        </Card>
        <Card interactive onPress={() => toast.show({ message: 'Карточка нажата' })}>
          <Text style={[t.type.bodyStrong, { color: t.color.text }]}>Нажимается целиком</Text>
        </Card>
      </Section>

      <Section title="TextField">
        <TextField label="Поиск" placeholder="Имя или специализация" />
        <TextField label="Телефон" type="tel" defaultValue="+375 29" error="Не хватает цифр — проверьте номер" />
        <TextField label="О себе" multiline rows={3} hint="До 140 знаков" />
        <TextField label="Почта" defaultValue="Недоступно" disabled />
      </Section>

      <Section title="Switch">
        <Switch
          label="Напоминать о дневнике"
          description="Каждый день в 21:00"
          checked={notify}
          onChange={setNotify}
        />
        <Switch label="Уведомить о перерыве" />
        <Switch label="Недоступно" defaultChecked disabled />
      </Section>

      <Section title="Chip">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.xs }}>
          <Chip defaultSelected>Все</Chip>
          <Chip>{'До 3 минут'}</Chip>
          <Chip icon="message">Онлайн</Chip>
          <Chip disabled>Недоступно</Chip>
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.xs }}>
          <ChipBadge>Тревога</ChipBadge>
          <ChipBadge>Выгорание</ChipBadge>
          <ChipBadge>Сон</ChipBadge>
        </View>
      </Section>

      <Section title="SegmentedControl">
        <SegmentedControl
          accessibilityLabel="Тон фраз"
          options={[
            { value: 'sweet', label: 'Сахарный' },
            { value: 'spicy', label: 'С перчиком' },
          ]}
          value={tone}
          onChange={setTone}
        />
      </Section>

      <Section title="ScreenIndicator">
        <ScreenIndicator current={screen} onSelect={setScreen} />
        <ScreenIndicator variant="dots" current={screen} onSelect={setScreen} />
        <ScreenIndicator
          screens={['Моя карточка', 'Статистика']}
          itemNoun="вкладка"
          current={tab}
          onSelect={setTab}
        />
      </Section>

      <Section title="ScreenHeader · SosRound · PullHint">
        <ScreenHeader
          title="Дыхание 4-7-8"
          leadingLabel="Назад к техникам"
          onLeadingPress={() => toast.show({ message: 'Назад' })}
          onSosPress={() => toast.show({ message: 'SOS' })}
        />
        <ScreenHeader title="DASS-21" leading="close" leadingLabel="Прервать тест" onSosPress={() => {}} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.md }}>
          <SosRound />
          <SosRound size="lg" />
        </View>
        <PullHint label="Потяните вниз — медитации и Pomodoro" />
        <PullHint variant="handle" label="Свайп вверх — к техникам" accessibilityLabel="Назад к техникам" />
      </Section>

      <Section title="Ticker · ScreamButton · RoundAction">
        <Ticker icon="specialist" text="Сегодня вы не одни: " strong={'128\u00A0человек'} />
        <View style={{ alignItems: 'center' }}>
          <ScreamButton onPress={() => {}} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: t.space['3xl'] }}>
          <RoundAction icon="map" label="Карта" onPress={() => {}} />
          <SosAction label="Помощь" onPress={() => {}} />
        </View>
      </Section>

      <Section title="MoodPicker">
        <Card style={{ paddingHorizontal: t.space.sm }}>
          <MoodPicker value={mood} onChange={setMood} />
        </Card>
      </Section>

      <Section title="MoodWeekBars · MoodCalendar · MoodEntryRow">
        <Card>
          <MoodWeekBars
            days={[2, 1, 2, 3, 3, 4, null].map((level, i) => ({
              key: String(i),
              weekday: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'][i],
              level,
              color: [t.color.secondary, t.logo.warm, t.color.accent, t.logo.leaf][(level ?? 1) - 1],
              accessibilityLabel: `День ${i + 1}`,
            }))}
          />
        </Card>
        <Card style={{ paddingHorizontal: t.space.sm, paddingVertical: t.space.sm }}>
          <MoodCalendar
            year={2026}
            month={8}
            todayKey="2026-09-24"
            marks={{
              '2026-09-22': { color: t.color.accent, label: 'ровно' },
              '2026-09-23': { color: t.logo.leaf, label: 'хорошо' },
              '2026-09-24': { color: t.logo.leaf, label: 'хорошо' },
            }}
            legend={[
              { label: 'Ровно', color: t.color.accent },
              { label: 'Хорошо', color: t.logo.leaf },
            ]}
            onPrev={() => {}}
            onNext={() => {}}
            nextDisabled
          />
        </Card>
        <MoodEntryRow color={t.logo.leaf} title="Сегодня, 14:20 · Хорошо" onPress={() => {}} />
      </Section>

      <Section title="ListItemCard · PhaseTiles · NumberedStep · BulletItem">
        <ListItemCard icon="breath" title="Дыхание 4-7-8" caption={'2\u00A0минуты · при тревоге и перед сном'} onPress={() => {}} />
        <ListItemCard icon="diary" tone="neutral" title="Дневник мыслей" caption={'5\u00A0минут · разобрать, что тревожит'} onPress={() => {}} />
        <PhaseTiles
          phases={[
            { value: '4', label: 'вдох носом' },
            { value: '7', label: 'задержка' },
            { value: '8', label: 'выдох ртом' },
          ]}
        />
        <NumberedStep number={1}>Сядьте удобно, плечи опустите. Кончик языка — за верхними зубами.</NumberedStep>
        <BulletItem>Выдох длиннее вдоха — например, дыхание 4-7-8</BulletItem>
      </Section>

      <Section title="AnatomyFigure">
        <AnatomyFigure organs={ORGANS} selected={organ} onSelect={setOrgan} />
      </Section>

      <Section title="SpecialistCard">
        <SpecialistCard
          name={demoSpecialist.name}
          subtitle={demoSpecialist.subtitle}
          specializations={demoSpecialist.specializations}
          quote={demoSpecialist.quote}
          format={demoSpecialist.format}
          counter="3 из 12"
        />
      </Section>

      <Section title="ContactRow">
        <View>
          <ContactRow
            name={demoUniversityService.name}
            caption={demoUniversityService.caption}
            avatarIcon="sos"
            avatarTone="sos"
            callLabel={demoUniversityService.callLabel}
            divider
          />
          <ContactRow
            name={demoSpecialist.name}
            caption={demoSpecialist.caption}
            initials={demoSpecialist.initials}
            avatarTone="primary"
            callLabel={`Позвонить ${demoSpecialist.nameDative}`}
          />
        </View>
      </Section>

      <Section title="EmergencyCard · EmergencyStrip · LinkRow">
        <EmergencyCard label="Экстренная психологическая помощь" number={PSYCH_HELPLINE} onCall={() => {}} />
        <EmergencyStrip label="Экстренная психологическая помощь" number={PSYCH_HELPLINE} onCall={() => {}} />
        <LinkRow
          icon="specialist"
          title="Выберите свой вуз"
          caption="Покажем психологическую службу и её специалистов"
          onPress={() => {}}
        />
      </Section>

      <Section title="RadioCard">
        <View accessibilityRole="radiogroup" accessibilityLabel="Вуз" style={{ gap: t.space.sm }}>
          <RadioCard
            title="ВГМУ"
            description="Витебский государственный медицинский университет"
            selected={radio === 0}
            onPress={() => setRadio(0)}
          />
          <RadioCard
            title="Другой вуз"
            description="Укажу позже или выберу общий список служб"
            selected={radio === 1}
            onPress={() => setRadio(1)}
          />
        </View>
      </Section>

      <Section title="ProgressBar · ScaleBar">
        <ProgressBar value={7} max={21} accessibilityLabel="Прогресс теста" />
        {SCALE_DEMO.map((scale) => (
          <ScaleBar key={scale.level} title={scale.title} score={scale.score} max={42} level={scale.level} />
        ))}
      </Section>

      <Section title="Toast">
        <ToastView message="Отметка сохранена в дневник" tone="success" actionLabel="Отменить" />
        <ToastView message="Нет интернета. Отметка сохранится, когда сеть вернётся" tone="error" actionLabel="Повторить" />
        <ToastView message="Ссылка скопирована" />
        <ButtonRow>
          <Button
            variant="secondary"
            onPress={() =>
              toast.show({ message: 'Отметка сохранена в дневник', tone: 'success', actionLabel: 'Отменить' })
            }
          >
            Показать тост
          </Button>
          <Button
            variant="outline"
            onPress={() => toast.show({ message: 'Нет интернета', tone: 'error', actionLabel: 'Повторить' })}
          >
            Ошибка
          </Button>
        </ButtonRow>
      </Section>

      <Section title="BottomSheet">
        <ButtonRow>
          <Button variant="secondary" onPress={() => setSheet('short')}>
            Короткая
          </Button>
          <Button variant="outline" onPress={() => setSheet('long')}>
            Длинная
          </Button>
        </ButtonRow>
        <BottomSheet open={sheet === 'short'} title="Прервать тест?" onClose={() => setSheet(null)}>
          <View style={{ gap: t.space.md }}>
            <Text style={[t.type.body, { color: t.color.text }]}>Ответы не сохранятся.</Text>
            <Button fullWidth onPress={() => setSheet(null)}>
              Продолжить тест
            </Button>
            <Button variant="outline" fullWidth onPress={() => setSheet(null)}>
              Прервать
            </Button>
          </View>
        </BottomSheet>
        <BottomSheet open={sheet === 'long'} title="Длинное содержимое" onClose={() => setSheet(null)}>
          <View style={{ gap: t.space.sm }}>
            {Array.from({ length: SHEET_LONG_ROWS }, (_, i) => (
              <Text key={i} style={[t.type.body, { color: t.color.text }]}>
                Строка {i + 1}
              </Text>
            ))}
          </View>
        </BottomSheet>
      </Section>

      <Section title="EmptyState">
        <EmptyState title="Здесь пока пусто" text="Отметьте настроение на главной — и запись появится здесь." actionLabel="Отметить настроение" />
        <EmptyState icon="specialist" title="Специалисты закончились" text="Вы посмотрели всех, кто сейчас принимает." />
      </Section>

      <Section title="Skeleton">
        <Skeleton />
        <Skeleton variant="listItem" />
        <Skeleton variant="card" height={96} />
        <Skeleton variant="circle" />
      </Section>
    </View>
  );
}
