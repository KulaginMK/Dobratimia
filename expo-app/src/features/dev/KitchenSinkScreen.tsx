import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AdviceCard,
  AnatomyFigure,
  AnswerOption,
  BulletItem,
  CareNote,
  CheckPoint,
  ContactAction,
  ContactRow,
  DangerButton,
  EmergencyCard,
  EmergencyStrip,
  FeatureRow,
  FeedScheme,
  GestureRow,
  GoogleButton,
  GroupLabel,
  HeroIcon,
  HistoryChart,
  InfoNote,
  InlineLink,
  LevelBar,
  LikeStamp,
  LinkRow,
  ListItemCard,
  LoudnessWave,
  MapIllustration,
  MapKind,
  MicButton,
  MicOffBadge,
  MoodCalendar,
  MoodEntryRow,
  MoodPicker,
  MoodWeekBars,
  NextTestNote,
  NumberedStep,
  PeakNumber,
  PhraseCard,
  PhaseTiles,
  PrincipleRow,
  PrivacyNote,
  ProfileHead,
  PullHint,
  ReactionCard,
  ReactionScale,
  RoundAction,
  ScaleBar,
  ScreamButton,
  ScreenHeader,
  SectionLetter,
  SettingsGroup,
  SettingsRow,
  SosAction,
  SosRound,
  SpecialistCard,
  SpecialistPhoto,
  StatTile,
  StepsHeader,
  StopButton,
  SuccessBanner,
  Ticker,
  TimerRing,
  TomatoDots,
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
  Slider,
  Switch,
  TextField,
  ToastView,
  cardColors,
  useToast,
} from '@/components/ui';
import { ORGANS, type OrganId } from '@/data/anatomy';
import { PSYCH_HELPLINE } from '@/data/emergency';
import { demoSpecialist, demoUniversityService } from '@/data/mocks/demo';
import { mockUser } from '@/data/mocks/user';
import { ThemeProvider, useTheme, useThemePreference, type ThemePreference } from '@/theme';

// Экран разработчика: размеры ниже — только для этой витрины, как на handoff/reference/kitchen-sink.png.
const COLUMN_MIN_WIDTH = 360;
const LOGO_SMALL = 32;
const LOGO_MARK = 48;
const TIMKA_SIZE = 104;
const SHEET_LONG_ROWS = 24;
// Уровни громкости для волны КРИКа: тихо — крик — затихание.
const DEMO_LEVELS = Array.from({ length: 60 }, (_, i) => Math.round(30 + 70 * Math.sin((Math.PI * i) / 59)));

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

/** Витрина готовых компонентов в двух темах. Открывается только при разработке: см. app/dev/kitchen-sink.tsx. */
export function KitchenSinkScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

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
  const [waveKey, setWaveKey] = useState(0);
  const [sheet, setSheet] = useState<'short' | 'long' | null>(null);
  const [notify, setNotify] = useState(true);
  const [radio, setRadio] = useState(0);
  const [organ, setOrgan] = useState<OrganId>('heart');
  const [volume, setVolume] = useState(60);
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.xs }}>
          <Timka key={waveKey} pose="hello" size={TIMKA_SIZE} motion="wave" />
          <Timka pose="hello" size={TIMKA_SIZE} motion="idle" />
          <Timka pose="sleep" size={TIMKA_SIZE} motion="sleepy" />
        </View>
        <Button variant="text" onPress={() => setWaveKey((k) => k + 1)}>
          Помахать ещё раз
        </Button>
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
        <NumberedStep number={2} tone="plain">
          Разрешения → Микрофон
        </NumberedStep>
        <BulletItem>Выдох длиннее вдоха — например, дыхание 4-7-8</BulletItem>
      </Section>

      <Section title="Slider · TimerRing · TomatoDots">
        <View style={{ flexDirection: 'row' }}>
          <Slider value={volume} onChange={setVolume} accessibilityLabel="Громкость звука" />
        </View>
        <View style={{ alignItems: 'center', gap: t.space.md }}>
          <TimerRing remaining={0.64} time="16:05" caption="до перерыва" accessibilityLabel="Осталось 16 минут 5 секунд" />
          <TomatoDots total={4} done={1} label="Помидор 2 из 4" />
        </View>
      </Section>

      <Section title="КРИК: MicButton · StopButton · LoudnessWave · LevelBar">
        <View style={{ alignItems: 'center', gap: t.space.md }}>
          <MicButton onPress={() => {}} />
          <StopButton onPress={() => {}} />
        </View>
        <Card>
          <View style={{ gap: t.space.md }}>
            <LoudnessWave variant="live" levels={DEMO_LEVELS.slice(0, 24)} max={110} accessibilityLabel="Волна громкости" />
            <LevelBar level={87} max={110} />
          </View>
        </Card>
        <Card>
          <LoudnessWave variant="result" levels={DEMO_LEVELS} max={110} accessibilityLabel="Запись громкости за 6 секунд" />
        </Card>
      </Section>

      <Section title="КРИК: PeakNumber · ReactionCard · StatTile · ReactionScale · MicOffBadge · PrivacyNote">
        <PeakNumber label="Ваш пик" value={87} unit="усл. дБ" />
        <ReactionCard
          overline="80–99 усл. дБ"
          title="Поздравляем, вы, вероятно, разбудили соседа по комнате"
          body="Если пар ещё остался — можно повторить. Соседу потом расскажете, что это была дыхательная практика."
        />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.xs }}>
          <StatTile label="Длительность" value="6 с" />
          <StatTile label="В среднем" value="71" />
          <StatTile label="Рекорд недели" value="94" />
        </View>
        <ReactionScale
          title="Шкала реакций"
          rows={[
            { range: 'до 60', text: 'Шёпот в библиотеке' },
            { range: '80–99', text: 'Сосед по комнате проснулся', accent: true },
          ]}
        />
        <View style={{ alignItems: 'center' }}>
          <MicOffBadge />
        </View>
        <PrivacyNote>Мы не записываем ваш голос — анализируется только громкость</PrivacyNote>
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

      <Section title="Подбор и профиль: LikeStamp · SuccessBanner · SpecialistPhoto · ContactAction · InfoNote">
        <SpecialistCard
          name={demoSpecialist.name}
          subtitle={demoSpecialist.subtitle}
          specializations={demoSpecialist.specializations}
          tone="neutral"
          photoOverlay={<LikeStamp />}
        />
        <SuccessBanner lead="Контакты открыты." text="Ольга добавлена в избранные." />
        <SpecialistPhoto name={demoSpecialist.name} tone="growth" />
        <Card>
          <ContactAction
            icon="phone"
            title="+375 29 555-12-34"
            caption="Телефон"
            actionLabel="Позвонить"
            primary
            divider
            onAction={() => {}}
          />
          <ContactAction icon="message" title="@miroshnik_psy" caption="Telegram" actionLabel="Написать" onAction={() => {}} />
        </Card>
        <InfoNote
          icon="sos"
          text="Нужна помощь сегодня? Загляните в "
          linkLabel="службу вашего вуза"
          tail="."
          onLinkPress={() => {}}
        />
      </Section>

      <Section title="Доброе слово: PhraseCard">
        <PhraseCard tone="sweet" text="Вы не обязаны быть продуктивным каждый день. Отдых — тоже часть учёбы." />
        <PhraseCard
          tone="spicy"
          badge="От психотерапевта"
          text="Перестаньте сравнивать свой черновик с чужим чистовиком. Особенно в сторис однокурсников."
          author="— Ирина Ракович, психотерапевт"
          onAuthorPress={() => {}}
        />
      </Section>

      <Section title="ContactRow · SectionLetter">
        <SectionLetter>М</SectionLetter>
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

      <Section title="Онбординг: StepsHeader · FeatureRow · HeroIcon · CheckPoint · CareNote">
        <StepsHeader step={1} total={5} onSkip={() => {}} />
        <StepsHeader step={3} total={5} onBack={() => {}} />
        <FeatureRow icon="diary">Тест DASS-21 и дневник настроения</FeatureRow>
        <HeroIcon icon="heart" />
        <CheckPoint
          title="Тесты — это ориентир"
          text="DASS-21 подсказывает, на что обратить внимание. Это не медицинское заключение."
        />
        <CareNote
          title="Если очень тяжело прямо сейчас"
          onPress={() => toast.show({ message: 'Звонок 133' })}
          accessibilityHint="Позвонить на номер 133"
        >
          {'Звоните на номер экстренной психологической помощи '}
          <InlineLink strong>{PSYCH_HELPLINE}</InlineLink>
          {' или в службу своего вуза. Кнопка SOS есть на каждом экране.'}
        </CareNote>
        <CareNote onPress={() => toast.show({ message: 'Звонок 133' })} accessibilityHint="Позвонить на номер 133">
          Приложение не заменяет медицинскую и психологическую помощь.
        </CareNote>
      </Section>

      <Section title="Онбординг: FeedScheme · GestureRow · GoogleButton">
        <FeedScheme />
        <GestureRow kind="sides" title="Влево и вправо" text="Свайп переносит на соседний экран." />
        <GestureRow
          kind="down"
          title="Вниз"
          text="На «Техниках» откроются медитации, на «Специалистах» — избранные контакты."
        />
        <GestureRow kind="dots" title="Точки внизу" text="Показывают, где вы, и тоже переключают экраны." />
        <GoogleButton onPress={() => {}}>Войти через Google</GoogleButton>
      </Section>

      <Section title="Профиль: ProfileHead · GroupLabel · SettingsGroup · SettingsRow · DangerButton">
        <ProfileHead name={mockUser.name} email={mockUser.email} />
        <GroupLabel>Мой вуз</GroupLabel>
        <SettingsGroup>
          <SettingsRow title="ВГМУ · Витебск" action="Сменить" onPress={() => {}} />
        </SettingsGroup>
        <SettingsGroup>
          <Switch label="Дневник настроения" description="Каждый день в 21:00" defaultChecked />
          <SettingsRow title="Политика конфиденциальности" onPress={() => {}} />
          <SettingsRow title="О проекте" onPress={() => {}} />
        </SettingsGroup>
        <DangerButton onPress={() => {}}>Удалить мои данные</DangerButton>
      </Section>

      <Section title="О проекте и карта: PrincipleRow · MapIllustration · MapKind">
        <PrincipleRow icon="heart">Добрый, тёплый тон — без нотаций и стыда</PrincipleRow>
        <MapIllustration />
        <MapKind tone="primary">Тихие кафе и коворкинги</MapKind>
        <MapKind tone="growth">Парки и скверы</MapKind>
        <MapKind tone="accent">Психологические службы вузов</MapKind>
      </Section>

      <Section title="ProgressBar · ScaleBar">
        <ProgressBar value={7} max={21} accessibilityLabel="Прогресс теста" />
        {SCALE_DEMO.map((scale) => (
          <ScaleBar key={scale.level} title={scale.title} score={scale.score} max={42} level={scale.level} />
        ))}
      </Section>

      <Section title="DASS-21: AnswerOption · AdviceCard · HistoryChart · NextTestNote">
        <AnswerOption text="Совсем не подходило" score={0} selected={false} onPress={() => {}} />
        <AnswerOption text="Подходило заметно или часто" score={2} selected onPress={() => {}} />
        <AdviceCard
          tone="sos"
          title="Возможно, сейчас стоит поговорить со специалистом"
          body="Тревога и стресс сейчас выше обычного. Это не приговор — но разговор с психологом часто заметно облегчает состояние. Вы не обязаны справляться в одиночку."
        >
          <Button icon="specialist" fullWidth onPress={() => {}}>
            Подобрать специалиста
          </Button>
        </AdviceCard>
        <AdviceCard tone="soft" body="Мягкая карточка при умеренном уровне: текст напишет психолог." />
        <Card>
          <HistoryChart
            max={42}
            dates={['30 июл', '27 авг', '24 сен']}
            accessibilityLabel="График за 5 тестов: стресс — с 18 до 28, тревога — с 10 до 18, депрессия — с 8 до 12"
            series={[
              { key: 'stress', label: 'Стресс', color: t.color.primary, values: [18, 20, 22, 24, 28] },
              { key: 'anxiety', label: 'Тревога', color: t.color.text, values: [10, 11, 12, 13, 18] },
              { key: 'depression', label: 'Депрессия', color: t.color.textMuted, dashed: true, values: [8, 9, 12, 11, 12] },
            ]}
          />
        </Card>
        <NextTestNote>Следующий тест — 8 октября.</NextTestNote>
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
