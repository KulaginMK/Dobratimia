import { Redirect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, Logo, Timka, iconNames } from '@/components/brand';
import { Button, ButtonRow } from '@/components/ui/Button';
import { ThemeProvider, useTheme, useThemePreference, type ThemePreference } from '@/theme';

// Экран разработчика: размеры ниже — только для этой витрины, как на handoff/reference/kitchen-sink.png.
const COLUMN_MIN_WIDTH = 360;
const LOGO_SMALL = 32;
const LOGO_MARK = 48;
const TIMKA_SIZE = 104;

const PREFERENCES: { value: ThemePreference; label: string }[] = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
  { value: 'system', label: 'Как в системе' },
];

/** Витрина готовых компонентов в двух темах. Только в dev-сборке. */
export default function KitchenSink() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  if (!__DEV__) return <Redirect href="/" />;

  // На широком экране темы стоят рядом, на телефоне — друг под другом.
  const sideBySide = width >= COLUMN_MIN_WIDTH * 2;

  return (
    <ScrollView>
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
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: t.space.xs }}>
        {PREFERENCES.map(({ value, label }) => (
          <Button
            key={value}
            variant={preference === value ? 'secondary' : 'outline'}
            icon={preference === value ? 'check' : undefined}
            onPress={() => setPreference(value)}
          >
            {label}
          </Button>
        ))}
      </View>
    </View>
  );
}

function Showcase({ grow, padBottom }: { grow: boolean; padBottom: number }) {
  const t = useTheme();
  return (
    <View
      style={{
        flex: grow ? 1 : undefined,
        backgroundColor: t.color.background,
        paddingHorizontal: t.space.screen,
        paddingTop: t.space.xl,
        paddingBottom: t.space['3xl'] + padBottom,
        gap: t.space.md,
      }}
    >
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
      <Text style={[t.type.body, { color: t.color.textMuted }]}>
        Голос не записываем — только громкость
      </Text>
      <Text style={[t.type.overline, { color: t.color.text }]}>От психотерапевта</Text>

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

      <View
        style={{
          backgroundColor: t.color.surface,
          padding: t.space.lg,
          borderRadius: t.radius.xl,
          boxShadow: t.shadow.sm,
        }}
      >
        <Text style={[t.type.bodyStrong, { color: t.color.text }]}>Дыхание 4-7-8</Text>
      </View>
    </View>
  );
}
