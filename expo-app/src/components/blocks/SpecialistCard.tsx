import React from 'react';
import { Image, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Icon, svgA11y } from '@/components/brand';
import { ChipBadge } from '@/components/ui/Chip';
import { useTheme, type Theme } from '@/theme';

// Размеры из макетов Match и CabCard (.spec, .photo, .counter).
const PHOTO_HEIGHT = 200;
const SILHOUETTE_WIDTH = 200;
const SILHOUETTE_HEIGHT = 180;
const COUNTER_INSET = 12;
const COUNTER_PAD_V = 4;
const COUNTER_PAD_H = 10;
const BODY_PAD_TOP = 16;
const BODY_PAD = 18;
const BODY_GAP = 10;
const NAME_GAP = 2;
const TAGS_GAP = 6;
const QUOTE_LINE = 25;
const FORMAT_ICON = 20;
const MAX_TAGS = 3;

/** Цвет заглушки фото: у соседних карточек он разный, чтобы колода не сливалась. */
export type PhotoTone = 'primary' | 'neutral' | 'growth';

/** Фон и цвет силуэта. В макетах есть primary (Match) и neutral (нижняя карточка MatchSwipe); growth — по аватарам Favorites. */
export function photoColors(t: Theme, tone: PhotoTone = 'primary') {
  switch (tone) {
    case 'neutral':
      return { bg: t.color.surfaceAlt, figure: t.logo.apricot };
    case 'growth':
      return { bg: t.color.growthSoft, figure: t.logo.leaf };
    default:
      return { bg: t.color.primarySoft, figure: t.logo.warm };
  }
}

type SilhouetteProps = { width: number; height: number; tone?: PhotoTone };

/** Силуэт вместо фотографии специалиста. */
export function Silhouette({ width, height, tone }: SilhouetteProps) {
  const t = useTheme();
  const { figure } = photoColors(t, tone);
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${SILHOUETTE_WIDTH} ${SILHOUETTE_HEIGHT}`} {...svgA11y()}>
      <Circle cx={100} cy={66} r={42} fill={figure} />
      <Path d="M24 180 Q24 118 100 118 Q176 118 176 180Z" fill={figure} />
    </Svg>
  );
}

type Props = {
  name: string;
  /** Роль и опыт: «Психолог · опыт 8 лет». */
  subtitle?: string;
  /** Специализации. В карточке показываются первые три. */
  specializations?: string[];
  /** Цитата специалиста, уже в кавычках-ёлочках. */
  quote?: string;
  /** Формат и город: «Онлайн и очно · Витебск». */
  format?: string;
  /** Счётчик колоды: «3 из 12». В кабинете специалиста его нет. */
  counter?: string;
  /** Фото специалиста. Пока его нет — силуэт. */
  photoUri?: string;
  /** Высота фото: 200 в подборе, 170 в кабинете. */
  photoHeight?: number;
  tone?: PhotoTone;
  /** Слой поверх фото: штамп «НРАВИТСЯ», пока карточку тянут вправо. */
  photoOverlay?: React.ReactNode;
};

/** Карточка специалиста: фото или силуэт, имя, роль, специализации, цитата, формат. */
export function SpecialistCard({
  name,
  subtitle,
  specializations = [],
  quote,
  format,
  counter,
  photoUri,
  photoHeight = PHOTO_HEIGHT,
  tone,
  photoOverlay,
}: Props) {
  const t = useTheme();
  return (
    <View
      style={{
        borderRadius: t.radius['2xl'],
        backgroundColor: t.color.surface,
        boxShadow: t.shadow.md,
        overflow: 'hidden',
      }}
    >
      <View
        accessible
        accessibilityRole="image"
        accessibilityLabel={`Фото: ${name}`}
        style={{
          height: photoHeight,
          backgroundColor: photoColors(t, tone).bg,
          alignItems: 'center',
          justifyContent: 'flex-end',
        }}
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} resizeMode="cover" style={{ width: '100%', height: '100%' }} />
        ) : (
          <Silhouette width={SILHOUETTE_WIDTH} height={Math.min(SILHOUETTE_HEIGHT, photoHeight)} tone={tone} />
        )}
        {counter ? (
          <View
            style={{
              position: 'absolute',
              top: COUNTER_INSET,
              right: COUNTER_INSET,
              paddingVertical: COUNTER_PAD_V,
              paddingHorizontal: COUNTER_PAD_H,
              borderRadius: t.radius.full,
              backgroundColor: t.color.surface,
            }}
          >
            <Text style={[t.type.label, { fontFamily: t.fontFamily.text[600], color: t.color.text }]}>{counter}</Text>
          </View>
        ) : null}
        {photoOverlay}
      </View>
      <View style={{ paddingTop: BODY_PAD_TOP, paddingHorizontal: BODY_PAD, paddingBottom: BODY_PAD, gap: BODY_GAP }}>
        <View style={{ gap: NAME_GAP }}>
          {/* Имя — h2 (22/28), как на скриншоте-эталоне; в docs/04 указан h3. Решение владельца. */}
          <Text accessibilityRole="header" style={[t.type.h2, { color: t.color.text }]}>
            {name}
          </Text>
          {subtitle ? <Text style={[t.type.caption, { color: t.color.textMuted }]}>{subtitle}</Text> : null}
        </View>
        {specializations.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: TAGS_GAP }}>
            {specializations.slice(0, MAX_TAGS).map((tag) => (
              <ChipBadge key={tag}>{tag}</ChipBadge>
            ))}
          </View>
        ) : null}
        {quote ? <Text style={[t.type.bodyLarge, { lineHeight: QUOTE_LINE, color: t.color.text }]}>{quote}</Text> : null}
        {format ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.xs }}>
            <Icon name="message" size={FORMAT_ICON} color={t.color.textMuted} />
            <Text style={[t.type.caption, { flexShrink: 1, color: t.color.textMuted }]}>{format}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
