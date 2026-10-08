import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/brand';
import { Button } from '@/components/ui/Button';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';
import { Silhouette } from './SpecialistCard';

// Размеры из макетов CabCard (плашка статуса, строка откликов), CabStats (карточка числа, столбики) и CabEdit (фото).
const STATUS_PAD_V = 10;
const STATUS_PAD_H = 14;
const STATUS_GAP = 10;
const STATUS_ICON = 18;
const LINK_PAD_V = 14;
const LINK_PAD_H = 16;
const LINK_RADIUS = 20;
const LINK_GAP = 14;
const LINK_ICON_BOX = 48;
const LINK_ICON_RADIUS = 14;
const LINK_ICON = 26;
const LINK_TITLE = { size: 22, line: 28 };
const LINK_CHEVRON = 20;
const TOTAL_PAD_V = 22;
const TOTAL_PAD_H = 20;
const TOTAL_GAP = 6;
const TOTAL_NUMBER = 72;
const TOTAL_TEXT = { size: 16, line: 22 };
const TOTAL_BADGE_MARGIN = 8;
const TOTAL_BADGE_PAD_V = 5;
const TOTAL_BADGE_PAD_H = 12;
const BARS_PAD = 18;
const BARS_RADIUS = 24;
const BARS_GAP = 14;
const BARS_HEIGHT = 190;
const BARS_COLUMN_GAP = 8;
const BARS_VALUE_GAP = 6;
const BARS_VALUE = { size: 14, line: 20 };
// В макете столбик растёт на 18 за отклик; самый высокий — 8 откликов. Когда откликов больше, шаг уменьшается.
const BAR_STEP = 18;
const BAR_MAX = 144;
const BAR_MIN = 4;
const BAR_RADIUS_TOP = 10;
const BAR_RADIUS_BOTTOM = 4;
const BAR_LABEL = { size: 12, line: 16 };
const PHOTO = 88;
const PHOTO_FIGURE = { width: 80, height: 72 };
const PHOTO_GAP = 16;
const PHOTO_TEXT_GAP = 2;

export type CardStatusTone = 'published' | 'pending' | 'changes' | 'hidden';

/** Плашка состояния карточки. Смысл несёт текст и иконка, цвет его только поддерживает. */
export function CardStatus({ tone, text }: { tone: CardStatusTone; text: string }) {
  const t = useTheme();
  const look: Record<CardStatusTone, { bg: string; icon: IconName; color: string }> = {
    published: { bg: t.color.growthSoft, icon: 'check', color: t.color.success },
    pending: { bg: t.color.primarySoft, icon: 'diary', color: t.color.onPrimarySoft },
    changes: { bg: t.color.surfaceAlt, icon: 'message', color: t.color.warning },
    hidden: { bg: t.color.surfaceAlt, icon: 'sprout', color: t.color.textMuted },
  };
  const { bg, icon, color } = look[tone];
  return (
    <View
      style={{
        paddingVertical: STATUS_PAD_V,
        paddingHorizontal: STATUS_PAD_H,
        borderRadius: t.radius.lg,
        backgroundColor: bg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: STATUS_GAP,
      }}
    >
      <Icon name={icon} size={STATUS_ICON} color={color} />
      <Text style={[t.type.caption, { flex: 1, color: t.color.text }]}>{text}</Text>
    </View>
  );
}

type LikesLinkProps = {
  /** «37 откликов». */
  title: string;
  /** «+5 за эту неделю». */
  caption: string;
  onPress: () => void;
};

/** Строка «37 откликов · +5 за эту неделю» на карточке кабинета: ведёт к статистике. */
export function LikesLink({ title, caption, onPress }: LikesLinkProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}, ${caption}. Открыть статистику`}
      style={(state) => [
        {
          paddingVertical: LINK_PAD_V,
          paddingHorizontal: LINK_PAD_H,
          borderRadius: LINK_RADIUS,
          backgroundColor: state.pressed ? t.color.surfaceAlt : t.color.surface,
          boxShadow: t.shadow.sm,
          flexDirection: 'row',
          alignItems: 'center',
          gap: LINK_GAP,
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      <View
        style={{
          width: LINK_ICON_BOX,
          height: LINK_ICON_BOX,
          borderRadius: LINK_ICON_RADIUS,
          backgroundColor: t.color.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="heart" size={LINK_ICON} color={t.color.onPrimarySoft} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: t.fontFamily.display[900],
            fontSize: LINK_TITLE.size,
            lineHeight: LINK_TITLE.line,
            color: t.color.text,
          }}
        >
          {title}
        </Text>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>{caption}</Text>
      </View>
      <Icon name="chevronRight" size={LINK_CHEVRON} color={t.color.text} />
    </Pressable>
  );
}

type LikesTotalProps = {
  count: number;
  /** «откликов «Нравится» за всё время». */
  label: string;
  /** «+5 за эту неделю». */
  badge: string;
};

/** Крупное число откликов на экране статистики. */
export function LikesTotal({ count, label, badge }: LikesTotalProps) {
  const t = useTheme();
  return (
    <View
      accessible
      accessibilityLabel={`${count} ${label}. ${badge}`}
      style={{
        paddingVertical: TOTAL_PAD_V,
        paddingHorizontal: TOTAL_PAD_H,
        borderRadius: t.radius['2xl'],
        backgroundColor: t.color.primarySoft,
        gap: TOTAL_GAP,
      }}
    >
      <Text
        style={{
          fontFamily: t.fontFamily.display[900],
          fontSize: TOTAL_NUMBER,
          lineHeight: TOTAL_NUMBER,
          color: t.color.onPrimarySoft,
        }}
      >
        {count}
      </Text>
      <Text
        style={{
          fontFamily: t.type.body.fontFamily,
          fontSize: TOTAL_TEXT.size,
          lineHeight: TOTAL_TEXT.line,
          color: t.color.onPrimarySoft,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          alignSelf: 'flex-start',
          marginTop: TOTAL_BADGE_MARGIN,
          paddingVertical: TOTAL_BADGE_PAD_V,
          paddingHorizontal: TOTAL_BADGE_PAD_H,
          borderRadius: t.radius.full,
          backgroundColor: t.color.surface,
        }}
      >
        <Text style={[t.type.caption, { fontFamily: t.fontFamily.text[600], color: t.color.text }]}>{badge}</Text>
      </View>
    </View>
  );
}

export type WeekLikes = {
  /** Понедельник недели под столбиком: «3.08». */
  label: string;
  count: number;
};

type WeekLikesBarsProps = {
  title: string;
  /** «8 недель». */
  caption: string;
  /** От самой давней недели к текущей; текущая — последняя. */
  weeks: WeekLikes[];
  /** Для скринридера: весь график одной фразой. */
  accessibilityLabel: string;
};

/** Столбики откликов по неделям. Текущая неделя выделена цветом и жирной датой; числа подписаны над столбиками. */
export function WeekLikesBars({ title, caption, weeks, accessibilityLabel }: WeekLikesBarsProps) {
  const t = useTheme();
  const step = Math.min(BAR_STEP, BAR_MAX / Math.max(1, ...weeks.map((week) => week.count)));
  return (
    <View
      style={{
        padding: BARS_PAD,
        borderRadius: BARS_RADIUS,
        backgroundColor: t.color.surface,
        boxShadow: t.shadow.sm,
        gap: BARS_GAP,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
          {title}
        </Text>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>{caption}</Text>
      </View>
      <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel} style={{ gap: BARS_GAP }}>
        <View style={{ height: BARS_HEIGHT, flexDirection: 'row', alignItems: 'flex-end', gap: BARS_COLUMN_GAP }}>
          {weeks.map((week, i) => (
            <View key={week.label} style={{ flex: 1, alignItems: 'center', gap: BARS_VALUE_GAP }}>
              <Text
                style={{
                  fontFamily: t.fontFamily.display[800],
                  fontSize: BARS_VALUE.size,
                  lineHeight: BARS_VALUE.line,
                  color: t.color.text,
                }}
              >
                {week.count}
              </Text>
              <View
                style={{
                  alignSelf: 'stretch',
                  height: Math.max(BAR_MIN, Math.round(week.count * step)),
                  borderTopLeftRadius: BAR_RADIUS_TOP,
                  borderTopRightRadius: BAR_RADIUS_TOP,
                  borderBottomLeftRadius: BAR_RADIUS_BOTTOM,
                  borderBottomRightRadius: BAR_RADIUS_BOTTOM,
                  backgroundColor: i === weeks.length - 1 ? t.color.secondary : t.logo.warm,
                }}
              />
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: BARS_COLUMN_GAP }}>
          {weeks.map((week, i) => {
            const current = i === weeks.length - 1;
            return (
              <Text
                key={week.label}
                numberOfLines={1}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  fontFamily: current ? t.fontFamily.text[700] : t.type.caption.fontFamily,
                  fontSize: BAR_LABEL.size,
                  lineHeight: BAR_LABEL.line,
                  color: current ? t.color.text : t.color.textMuted,
                }}
              >
                {week.label}
              </Text>
            );
          })}
        </View>
      </View>
    </View>
  );
}

type PhotoRowProps = {
  /** Чьё фото — для скринридера. */
  name: string;
  /** Фото специалиста. Пока его нет — силуэт. */
  photoUri?: string;
  actionLabel: string;
  hint: string;
  /** Пока фото загружается, заменить его ещё раз нельзя. */
  disabled?: boolean;
  onAction: () => void;
};

/** Фото в редактировании карточки: круг с фото или силуэтом, кнопка замены и подсказка. */
export function PhotoRow({ name, photoUri, actionLabel, hint, disabled, onAction }: PhotoRowProps) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: PHOTO_GAP }}>
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Фото: ${name}`}
        style={{
          width: PHOTO,
          height: PHOTO,
          borderRadius: t.radius.full,
          backgroundColor: t.color.primarySoft,
          alignItems: 'center',
          justifyContent: 'flex-end',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} resizeMode="cover" style={{ width: PHOTO, height: PHOTO }} />
        ) : (
          <Silhouette width={PHOTO_FIGURE.width} height={PHOTO_FIGURE.height} />
        )}
      </View>
      <View style={{ flexShrink: 1, alignItems: 'flex-start', gap: PHOTO_TEXT_GAP }}>
        <Button variant="outline" disabled={disabled} onPress={onAction}>
          {actionLabel}
        </Button>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>{hint}</Text>
      </View>
    </View>
  );
}
