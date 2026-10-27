import React from 'react';
import { Text, View } from 'react-native';
import { Icon, Timka, type IconName, type TimkaMotion, type TimkaPose } from '@/components/brand';
import { useTheme } from '@/theme';
import { Button } from './Button';

// Размеры из веб-эталона bundle.css (.dt-empty) и макета MatchEmpty.
const GAP = 10;
const PAD_V = 24;
const TITLE_SIZE = 20;
const TITLE_LINE = 26;
const TITLE_MARGIN_TOP = 6;
const TEXT_SIZE = 15;
const TEXT_LINE = 22;
const TEXT_MAX_WIDTH = 300;
const TEXT_MARGIN_BOTTOM = 8;
const TIMKA_SIZE = 140;
const ICON_CIRCLE = 128;
const ICON_SIZE = 64;

type Props = {
  /** Что здесь будет: «Здесь пока пусто», «Специалисты закончились». */
  title: string;
  /** Одна тёплая фраза, что сделать дальше. */
  text?: string;
  /** Поза Тимки. Обычно sleep; hello — если пусто, потому что это первый вход. */
  pose?: TimkaPose;
  illustrationSize?: number;
  /** Иконка в круге вместо Тимки: там, где Тимки быть не должно («Специалисты закончились»). */
  icon?: IconName;
  actionLabel?: string;
  onAction?: () => void;
  /** false — экран сейчас не виден: Тимка стоит и не тратит батарею. */
  active?: boolean;
};

// Спящий Тимка дышит во сне, приветливый — машет (TIMKA-MOTION.md, пункты 3 и 6).
const MOTION: Partial<Record<TimkaPose, TimkaMotion>> = { sleep: 'sleepy', hello: 'wave' };

/** Пустое состояние: Тимка, заголовок, одна фраза и одно действие. */
export function EmptyState({
  title,
  text,
  pose = 'sleep',
  illustrationSize = TIMKA_SIZE,
  icon,
  actionLabel,
  onAction,
  active,
}: Props) {
  const t = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: GAP, paddingVertical: PAD_V, paddingHorizontal: t.space.lg }}>
      {icon ? (
        <View
          style={{
            width: ICON_CIRCLE,
            height: ICON_CIRCLE,
            borderRadius: t.radius.full,
            backgroundColor: t.color.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={ICON_SIZE} color={t.color.onPrimarySoft} />
        </View>
      ) : (
        <Timka pose={pose} size={illustrationSize} motion={MOTION[pose]} active={active} />
      )}
      <Text
        accessibilityRole="header"
        style={{
          marginTop: TITLE_MARGIN_TOP,
          fontFamily: t.fontFamily.display[800],
          fontSize: TITLE_SIZE,
          lineHeight: TITLE_LINE,
          color: t.color.text,
          textAlign: 'center',
        }}
      >
        {title}
      </Text>
      {text ? (
        <Text
          style={{
            maxWidth: TEXT_MAX_WIDTH,
            marginBottom: TEXT_MARGIN_BOTTOM,
            fontFamily: t.type.body.fontFamily,
            fontSize: TEXT_SIZE,
            lineHeight: TEXT_LINE,
            color: t.color.textMuted,
            textAlign: 'center',
          }}
        >
          {text}
        </Text>
      ) : null}
      {actionLabel ? <Button onPress={onAction}>{actionLabel}</Button> : null}
    </View>
  );
}
