import React from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Icon, type IconName } from '@/components/brand';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';

// Размеры из макетов Profile (.box, .lbl, .row, аватар), About (.pr, .pi) и MapStub (иллюстрация, .kind, .kd).
const HEAD_GAP = 14;
const AVATAR = 60;
const NAME_SIZE = 20;
const NAME_LINE = 26;
const LABEL_SIZE = 13;
const LABEL_LINE = 16;
const GROUP_PAD_H = 16;
const GROUP_RADIUS = 20;
const ROW_MIN_HEIGHT = 52;
const ROW_GAP = 12;
const CHEVRON = 18;
const DANGER_FONT = 15;
const DANGER_LINE = 20;
const PRINCIPLE_GAP = 12;
const PRINCIPLE_BOX = 36;
const PRINCIPLE_ICON = 20;
const PRINCIPLE_FONT = 15;
const PRINCIPLE_LINE = 22;
const MAP_WIDTH = 372;
const MAP_HEIGHT = 300;
const MAP_GREEN_OPACITY = 0.45;
const KIND_GAP = 10;
const KIND_DOT = 12;
const KIND_FONT = 15;
const KIND_LINE = 22;

/** Аватар-инициалы, имя и почта вошедшего пользователя. */
export function ProfileHead({ name, email }: { name: string; email: string }) {
  const t = useTheme();
  const initials = name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
  const display = { fontFamily: t.fontFamily.display[800], fontSize: NAME_SIZE, lineHeight: NAME_LINE };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: HEAD_GAP }}>
      <View
        style={{
          width: AVATAR,
          height: AVATAR,
          borderRadius: t.radius.full,
          backgroundColor: t.color.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {/* Инициалы повторяют имя — скринридеру они не нужны. */}
        <Text
          accessibilityElementsHidden
          importantForAccessibility="no"
          style={[display, { color: t.color.onPrimarySoft }]}
        >
          {initials}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[display, { color: t.color.text }]}>{name}</Text>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>{email}</Text>
      </View>
    </View>
  );
}

/** Подпись над группой настроек: «Мой вуз», «Напоминания», «Тема». */
export function GroupLabel({ children }: { children: string }) {
  const t = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={{
        fontFamily: t.fontFamily.text[600],
        fontSize: LABEL_SIZE,
        lineHeight: LABEL_LINE,
        color: t.color.textMuted,
      }}
    >
      {children}
    </Text>
  );
}

/** Белая карточка со строками настроек; между строками — тонкие разделители. */
export function SettingsGroup({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  const rows = React.Children.toArray(children);
  return (
    <View
      style={{
        paddingHorizontal: GROUP_PAD_H,
        borderRadius: GROUP_RADIUS,
        backgroundColor: t.color.surface,
        boxShadow: t.shadow.sm,
      }}
    >
      {rows.map((row, i) => (
        <View key={i} style={i > 0 ? { borderTopWidth: 1, borderTopColor: t.color.border } : undefined}>
          {row}
        </View>
      ))}
    </View>
  );
}

type SettingsRowProps = {
  title: string;
  /** Тихая подпись перед стрелкой: «Сменить». */
  action?: string;
  onPress: () => void;
};

/** Строка-переход внутри SettingsGroup: название, подпись действия и стрелка. */
export function SettingsRow({ title, action, onPress }: SettingsRowProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={action ? `${title}. ${action}` : title}
      style={(state) => [
        {
          minHeight: ROW_MIN_HEIGHT,
          paddingVertical: t.space.xs,
          flexDirection: 'row',
          alignItems: 'center',
          gap: ROW_GAP,
          borderRadius: t.radius.sm,
          opacity: state.pressed ? 0.6 : 1,
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      <Text style={[t.type.body, { flex: 1, color: t.color.text }]}>{title}</Text>
      {action ? <Text style={[t.type.caption, { color: t.color.textMuted }]}>{action}</Text> : null}
      <Icon name="chevronRight" size={CHEVRON} color={t.color.text} />
    </Pressable>
  );
}

/** Текстовая кнопка цвета color.error: «Удалить мои данные». Перед действием — всегда подтверждение. */
export function DangerButton({ children, onPress }: { children: string; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={(state) => [
        {
          minHeight: t.size.touch,
          paddingHorizontal: t.space.sm,
          borderRadius: t.radius.lg,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: state.pressed ? t.color.surfaceAlt : 'transparent',
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      <Text
        style={{
          fontFamily: t.fontFamily.text[600],
          fontSize: DANGER_FONT,
          lineHeight: DANGER_LINE,
          color: t.color.error,
          textAlign: 'center',
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

/** Принцип проекта на «О проекте»: иконка в мягком квадрате и фраза. */
export function PrincipleRow({ icon, children }: { icon: IconName; children: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: PRINCIPLE_GAP }}>
      <View
        style={{
          width: PRINCIPLE_BOX,
          height: PRINCIPLE_BOX,
          borderRadius: t.radius.md,
          backgroundColor: t.color.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} size={PRINCIPLE_ICON} color={t.color.onPrimarySoft} />
      </View>
      <Text
        style={{
          flex: 1,
          fontFamily: t.type.body.fontFamily,
          fontSize: PRINCIPLE_FONT,
          lineHeight: PRINCIPLE_LINE,
          color: t.color.text,
        }}
      >
        {children}
      </Text>
    </View>
  );
}

// Метка на карте: капля с точкой. Координаты — из макета MapStub.
function Pin({ x, y, fill, dot }: { x: number; y: number; fill: string; dot: string }) {
  return (
    <>
      <Path
        d={`M${x} ${y} C${x - 8} ${y} ${x - 13} ${y + 6} ${x - 13} ${y + 13} C${x - 13} ${y + 22} ${x} ${y + 35} ${x} ${y + 35} C${x} ${y + 35} ${x + 13} ${y + 22} ${x + 13} ${y + 13} C${x + 13} ${y + 6} ${x + 8} ${y} ${x} ${y}Z`}
        fill={fill}
      />
      <Circle cx={x} cy={y + 13} r={5} fill={dot} />
    </>
  );
}

/** Иллюстрация карты с отмеченными местами. Настоящей карты в приложении пока нет (docs/07). */
export function MapIllustration() {
  const t = useTheme();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel="Иллюстрация карты с отмеченными местами"
      style={{
        height: MAP_HEIGHT,
        borderRadius: t.radius['2xl'],
        overflow: 'hidden',
        backgroundColor: t.color.growthSoft,
      }}
    >
      <Svg
        width="100%"
        height={MAP_HEIGHT}
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
      >
        <Path
          d="M-10 210 Q120 170 200 200 T390 160"
          fill="none"
          stroke={t.color.surface}
          strokeWidth={22}
          strokeLinecap="round"
        />
        <Path d="M120 -10 Q140 120 110 310" fill="none" stroke={t.color.surface} strokeWidth={16} strokeLinecap="round" />
        <Path d="M250 -10 Q230 90 290 310" fill="none" stroke={t.color.surface} strokeWidth={14} strokeLinecap="round" />
        <Circle cx={320} cy={60} r={44} fill={t.logo.leaf} opacity={MAP_GREEN_OPACITY} />
        <Circle cx={54} cy={70} r={30} fill={t.logo.leaf} opacity={MAP_GREEN_OPACITY} />
        <Pin x={180} y={64} fill={t.color.primary} dot={t.color.onPrimary} />
        <Pin x={70} y={136} fill={t.color.accent} dot={t.color.onAccent} />
        <Pin x={300} y={186} fill={t.color.growth} dot={t.color.surface} />
        <Pin x={200} y={236} fill={t.color.primary} dot={t.color.onPrimary} />
      </Svg>
    </View>
  );
}

type MapKindProps = {
  /** Цвет меток этого вида на иллюстрации. */
  tone: 'primary' | 'growth' | 'accent';
  children: string;
};

/** Строка легенды карты: цветная точка и вид мест. Цвет дублируется словами. */
export function MapKind({ tone, children }: MapKindProps) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: KIND_GAP }}>
      <View
        style={{
          width: KIND_DOT,
          height: KIND_DOT,
          borderRadius: t.radius.full,
          backgroundColor: t.color[tone],
          flexShrink: 0,
        }}
      />
      <Text
        style={{
          flex: 1,
          fontFamily: t.type.body.fontFamily,
          fontSize: KIND_FONT,
          lineHeight: KIND_LINE,
          color: t.color.text,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
