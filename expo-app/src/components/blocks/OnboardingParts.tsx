import React from 'react';
import { Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Icon, type IconName } from '@/components/brand';
import { IconButton } from '@/components/ui/IconButton';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';
import { useTopInset } from './useTopInset';

// Размеры из макетов Main, OnbWarning, OnbGestures, OnbSignIn и About
// (.steps, .skip, .feat, .point, .dot, .tile, .sub, .ges, .gi, .gbtn, .gmark).
const HEAD_HEIGHT = 56;
const HEAD_PAD_BACK = 4;
const HEAD_PAD_SKIP = 12;
const HEAD_GAP = 12;
const HEAD_GAP_SKIP = 16;
const BACK_ICON = 26;
const STEP_HEIGHT = 6;
const STEP_GAP = 6;
const SKIP_PAD_H = 12;
const SKIP_FONT = 15;
const SKIP_LINE = 20;
const ROW_GAP = 14;
const FEATURE_BOX = 48;
const FEATURE_RADIUS = 14;
const FEATURE_ICON = 28;
const HERO_BOX = 72;
const HERO_RADIUS = 24;
const HERO_ICON = 40;
const POINT_DOT = 40;
const POINT_ICON = 22;
const TEXT_GAP = 2;
const NOTE_FONT = 15;
const NOTE_LINE = 22;
const NOTE_GAP = 6;
const NOTE_PAD_V = 18;
const NOTE_PAD_H = 20;
const NOTE_PLAIN_PAD_V = 14;
const NOTE_PLAIN_PAD_H = 18;
const NOTE_PLAIN_RADIUS = 20;
const SCHEME_PAD_TOP = 18;
const SCHEME_PAD_H = 10;
const SCHEME_PAD_BOTTOM = 16;
const SCHEME_GAP = 8;
const TILE_HEIGHT = 96;
const TILE_RADIUS = 12;
const TILE_PAD = 4;
const TILE_GAP = 6;
const TILE_ICON = 22;
const TILE_FONT = 11;
const TILE_LINE = 14;
const SUB_HEIGHT = 52;
const SUB_BORDER = 1.5;
// Ширина схемы в макете (экран 412 без полей) с запасом: на экране у́же подписи уменьшаются вместе с ней.
const SCHEME_DESIGN_WIDTH = 360;
const SCHEME_SIDE = 60;
const GESTURE_BOX = 44;
const GESTURE_RADIUS = 14;
const GESTURE_CHEVRON = 18;
const GESTURE_DOWN = 22;
const GESTURE_DOT = 6;
const GESTURE_DASH = 14;
const GESTURE_DOT_GAP = 4;
const GOOGLE_HEIGHT = 56;
const GOOGLE_BORDER = 1.5;
const GOOGLE_GAP = 12;
const GOOGLE_MARK = 28;
const GOOGLE_MARK_FONT = 13;

type StepsHeaderProps = {
  /** Номер шага, с единицы. */
  step: number;
  total: number;
  /** Стрелка «Назад» слева. Без обработчика её нет: первый шаг и экран входа после выхода из аккаунта. */
  onBack?: () => void;
  /** «Пропустить» справа — только на первом шаге. */
  onSkip?: () => void;
};

/** Шапка онбординга: «Назад», полоски шагов и «Пропустить». Кнопки SOS здесь нет (docs/06). */
export function StepsHeader({ step, total, onBack, onSkip }: StepsHeaderProps) {
  const t = useTheme();
  const topInset = useTopInset();
  return (
    <View
      style={{
        paddingTop: topInset,
        paddingLeft: onBack ? HEAD_PAD_BACK : t.space.screen,
        paddingRight: onSkip ? HEAD_PAD_SKIP : t.space.screen,
      }}
    >
      <View
        style={{ height: HEAD_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: onSkip ? HEAD_GAP_SKIP : HEAD_GAP }}
      >
        {onBack ? (
          <IconButton icon="chevronLeft" iconSize={BACK_ICON} accessibilityLabel="Назад" onPress={onBack} />
        ) : null}
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={`Шаг ${step} из ${total}`}
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={step}
          style={{ flex: 1, flexDirection: 'row', gap: STEP_GAP }}
        >
          {Array.from({ length: total }, (_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                height: STEP_HEIGHT,
                borderRadius: STEP_HEIGHT / 2,
                backgroundColor: i < step ? t.color.primary : t.color.border,
              }}
            />
          ))}
        </View>
        {onSkip ? (
          <Pressable
            onPress={onSkip}
            accessibilityRole="button"
            style={(state) => [
              {
                minHeight: t.size.touch,
                paddingHorizontal: SKIP_PAD_H,
                borderRadius: t.radius.md,
                justifyContent: 'center',
                backgroundColor: state.pressed ? t.color.surfaceAlt : 'transparent',
              },
              focusRing(t, isFocused(state)),
            ]}
          >
            <Text
              style={{
                fontFamily: t.fontFamily.text[600],
                fontSize: SKIP_FONT,
                lineHeight: SKIP_LINE,
                color: t.color.primary,
              }}
            >
              Пропустить
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/** Что есть в приложении: иконка в мягком квадрате и строка текста. */
export function FeatureRow({ icon, children }: { icon: IconName; children: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: ROW_GAP }}>
      <View
        style={{
          width: FEATURE_BOX,
          height: FEATURE_BOX,
          borderRadius: FEATURE_RADIUS,
          backgroundColor: t.color.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={FEATURE_ICON} color={t.color.onPrimarySoft} />
      </View>
      <Text style={[t.type.body, { flex: 1, color: t.color.text }]}>{children}</Text>
    </View>
  );
}

/** Крупная иконка над заголовком шага. */
export function HeroIcon({ icon }: { icon: IconName }) {
  const t = useTheme();
  return (
    <View
      style={{
        width: HERO_BOX,
        height: HERO_BOX,
        borderRadius: HERO_RADIUS,
        backgroundColor: t.color.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={HERO_ICON} color={t.color.onPrimarySoft} />
    </View>
  );
}

/** Пункт с галочкой: заголовок и пояснение. */
export function CheckPoint({ title, text }: { title: string; text: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: ROW_GAP }}>
      <View
        style={{
          width: POINT_DOT,
          height: POINT_DOT,
          borderRadius: t.radius.full,
          backgroundColor: t.color.growthSoft,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="check" size={POINT_ICON} color={t.color.success} />
      </View>
      <View style={{ flex: 1, gap: TEXT_GAP }}>
        <Text style={[t.type.h3, { color: t.color.text }]}>{title}</Text>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>{text}</Text>
      </View>
    </View>
  );
}

type InlineLinkProps = {
  children: string;
  /** Без onPress — просто выделение: нажимается весь блок вокруг (номер 133 в CareNote). */
  onPress?: () => void;
  /** По умолчанию — цвет окружающего текста. */
  color?: string;
  /** Полужирная: номер телефона внутри фразы. */
  strong?: boolean;
};

/** Ссылка внутри текста: номер 133, политика конфиденциальности. Ставится внутрь Text. */
export function InlineLink({ children, onPress, color, strong }: InlineLinkProps) {
  const t = useTheme();
  return (
    <Text
      accessibilityRole={onPress ? 'link' : undefined}
      onPress={onPress}
      style={[
        { textDecorationLine: 'underline' },
        color ? { color } : null,
        strong ? { fontFamily: t.fontFamily.text[600] } : null,
      ]}
    >
      {children}
    </Text>
  );
}

type CareNoteProps = {
  /** С заголовком — крупный блок онбординга; без него — строка-предупреждение на «О проекте». */
  title?: string;
  /** Текст; номер внутри выделяется InlineLink без onPress. */
  children: React.ReactNode;
  /** Нажимается весь блок: номер в строке мельче 48 dp, попасть в него трудно (docs/09). */
  onPress: () => void;
  /** Что сделает нажатие, для скринридера: «Позвонить на номер 133». */
  accessibilityHint: string;
};

/** Бережный блок color.sosSoft: что делать, если очень тяжело. Нажатие — звонок. */
export function CareNote({ title, children, onPress, accessibilityHint }: CareNoteProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityHint={accessibilityHint}
      style={(state) => [
        {
          paddingVertical: title ? NOTE_PAD_V : NOTE_PLAIN_PAD_V,
          paddingHorizontal: title ? NOTE_PAD_H : NOTE_PLAIN_PAD_H,
          borderRadius: title ? t.radius.xl : NOTE_PLAIN_RADIUS,
          backgroundColor: t.color.sosSoft,
          gap: NOTE_GAP,
          transform: [{ scale: state.pressed ? 0.98 : 1 }],
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      {title ? <Text style={[t.type.h3, { color: t.color.onSosSoft }]}>{title}</Text> : null}
      <Text
        style={{
          fontFamily: t.type.body.fontFamily,
          fontSize: NOTE_FONT,
          lineHeight: NOTE_LINE,
          color: t.color.onSosSoft,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

// Лента слева направо и то, что открывается свайпом вниз (docs/06).
const SCHEME: { icon: IconName; label: string; below?: string }[] = [
  { icon: 'heart', label: 'Анатомия' },
  { icon: 'techniques', label: 'Техники', below: 'Медитации' },
  { icon: 'home', label: 'Главная' },
  { icon: 'specialist', label: 'Специалисты', below: 'Избранные' },
  { icon: 'sprout', label: 'Доброе\nслово' },
];
const SCHEME_MAIN = 2;
const SCHEME_LABEL =
  'Схема: пять экранов в ряд — Анатомия, Техники, Главная, Специалисты, Доброе слово. ' +
  'Под Техниками — Медитации, под Специалистами — Избранные.';

/**
 * Схема ленты: пять экранов в ряд, под «Техниками» и «Специалистами» — то, что открывается свайпом вниз.
 * Это картинка: для скринридера у неё одно описание, а подписи не растут с системным шрифтом.
 * Колонки берут ширину по самой длинной подписи — «Специалисты» в плитку одинаковой ширины не помещаются.
 */
export function FeedScheme() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const scale = Math.min(1, (width - SCHEME_SIDE) / SCHEME_DESIGN_WIDTH);
  const font = {
    fontFamily: t.fontFamily.text[600],
    fontSize: TILE_FONT * scale,
    lineHeight: TILE_LINE * scale,
    textAlign: 'center' as const,
  };
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={SCHEME_LABEL}
      style={{
        flexDirection: 'row',
        gap: TILE_GAP,
        paddingTop: SCHEME_PAD_TOP,
        paddingHorizontal: SCHEME_PAD_H,
        paddingBottom: SCHEME_PAD_BOTTOM,
        borderRadius: t.radius.xl,
        backgroundColor: t.color.surfaceAlt,
      }}
    >
      {SCHEME.map((screen, i) => {
        const main = i === SCHEME_MAIN;
        const color = main ? t.color.onPrimary : t.color.textMuted;
        return (
          <View key={screen.label} style={{ flexGrow: 1, gap: SCHEME_GAP }}>
            <View
              style={{
                height: TILE_HEIGHT,
                padding: TILE_PAD,
                borderRadius: TILE_RADIUS,
                backgroundColor: main ? t.color.primary : t.color.surface,
                boxShadow: t.shadow.sm,
                alignItems: 'center',
                justifyContent: 'center',
                gap: TILE_GAP,
              }}
            >
              <Icon name={screen.icon} size={TILE_ICON} color={color} />
              <Text allowFontScaling={false} style={[font, { color }]}>
                {screen.label}
              </Text>
            </View>
            {screen.below ? (
              <View
                style={{
                  height: SUB_HEIGHT,
                  paddingHorizontal: TILE_PAD,
                  borderRadius: TILE_RADIUS,
                  borderWidth: SUB_BORDER,
                  borderStyle: 'dashed',
                  borderColor: t.color.borderStrong,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text allowFontScaling={false} style={[font, { color: t.color.textMuted }]}>
                  {screen.below}
                </Text>
              </View>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

type GestureRowProps = {
  /** sides — свайп влево и вправо; down — свайп вниз; dots — точки индикатора. */
  kind: 'sides' | 'down' | 'dots';
  title: string;
  text: string;
};

/** Пояснение жеста: значок, название и что он делает. */
export function GestureRow({ kind, title, text }: GestureRowProps) {
  const t = useTheme();
  const color = t.color.onPrimarySoft;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: ROW_GAP }}>
      <View
        style={{
          width: GESTURE_BOX,
          height: GESTURE_BOX,
          borderRadius: GESTURE_RADIUS,
          backgroundColor: t.color.primarySoft,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: kind === 'dots' ? GESTURE_DOT_GAP : 0,
          flexShrink: 0,
        }}
      >
        {kind === 'sides' ? (
          <>
            <Icon name="chevronLeft" size={GESTURE_CHEVRON} color={color} />
            <Icon name="chevronRight" size={GESTURE_CHEVRON} color={color} />
          </>
        ) : kind === 'down' ? (
          <View style={{ transform: [{ rotate: '90deg' }] }}>
            <Icon name="chevronRight" size={GESTURE_DOWN} color={color} />
          </View>
        ) : (
          [GESTURE_DOT, GESTURE_DASH, GESTURE_DOT].map((dotWidth, i) => (
            <View
              key={i}
              style={{ width: dotWidth, height: GESTURE_DOT, borderRadius: GESTURE_DOT / 2, backgroundColor: color }}
            />
          ))
        )}
      </View>
      <View style={{ flex: 1, gap: TEXT_GAP }}>
        <Text style={[t.type.h3, { color: t.color.text }]}>{title}</Text>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>{text}</Text>
      </View>
    </View>
  );
}

type GoogleButtonProps = {
  children: string;
  disabled?: boolean;
  onPress: () => void;
};

/**
 * ЗАГЛУШКА: кнопка «Войти через Google» из макета со знаком «G» в пунктирном кружке. Перед публикацией её
 * заменит официальная кнопка Google Sign-In (handoff/docs/10-placeholders.md, TODO.md).
 */
export function GoogleButton({ children, disabled, onPress }: GoogleButtonProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      aria-disabled={!!disabled}
      style={(state) => [
        {
          minHeight: GOOGLE_HEIGHT,
          paddingHorizontal: t.space.md,
          borderRadius: t.radius.lg,
          borderWidth: GOOGLE_BORDER,
          borderColor: t.color.borderStrong,
          backgroundColor: state.pressed || disabled ? t.color.surfaceAlt : t.color.surface,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: GOOGLE_GAP,
          transform: [{ scale: state.pressed ? 0.98 : 1 }],
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      <View
        style={{
          width: GOOGLE_MARK,
          height: GOOGLE_MARK,
          borderRadius: t.radius.full,
          borderWidth: GOOGLE_BORDER,
          borderStyle: 'dashed',
          borderColor: t.color.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontFamily: t.fontFamily.text[700], fontSize: GOOGLE_MARK_FONT, color: t.color.textMuted }}>
          G
        </Text>
      </View>
      <Text style={[t.type.button, { flexShrink: 1, color: disabled ? t.color.textMuted : t.color.text }]}>
        {children}
      </Text>
    </Pressable>
  );
}
