import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Icon, svgA11y, type IconName } from '@/components/brand';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme';
import { Silhouette, photoColors, type PhotoTone } from './SpecialistCard';

// Размеры из макетов MatchSwipe (.stamp), SpecialistProfile (плашка, фото, .ct, .cti),
// MatchEmpty (строка про службу вуза), Favorites (.letter) и GoodWord / GoodWordAuthor (карточка фразы).
const STAMP_TOP = 28;
const STAMP_LEFT = 22;
const STAMP_PAD_V = 6;
const STAMP_PAD_H = 16;
const STAMP_RADIUS = 14;
const STAMP_BORDER = 4;
const STAMP_FONT = 26;
const STAMP_LINE = 29;
const STAMP_SPACING = 1.56;
const STAMP_ROTATE = '-14deg';
const BANNER_PAD_V = 12;
const BANNER_PAD_H = 16;
const BANNER_RADIUS = 18;
const BANNER_CHECK = 32;
const BANNER_ICON = 18;
const BANNER_FONT = 15;
const BANNER_LINE = 21;
const PHOTO_HEIGHT = 240;
const PHOTO_FIGURE_WIDTH = 240;
const PHOTO_FIGURE_HEIGHT = 216;
const CONTACT_PAD_V = 12;
const CONTACT_GAP = 12;
const CONTACT_ICON_BOX = 44;
const CONTACT_ICON_RADIUS = 14;
const NOTE_PAD_V = 14;
const NOTE_PAD_H = 16;
const NOTE_RADIUS = 18;
const NOTE_FONT = 15;
const NOTE_LINE = 22;
const LETTER_FONT = 15;
const LETTER_LINE = 20;
const LETTER_PAD_TOP = 14;
const LETTER_PAD_H = 4;
const LETTER_PAD_BOTTOM = 4;
const PHRASE_MIN_HEIGHT = 470;
const PHRASE_RADIUS = 32;
const PHRASE_PAD_V = 32;
const PHRASE_PAD_H = 30;
const PHRASE_GAP = 18;
const PHRASE_SWEET = { size: 27, line: 36 };
const PHRASE_SPICY = { size: 25, line: 34 };
const PHRASE_BADGE_PAD_V = 5;
const PHRASE_BADGE_PAD_H = 12;
const PHRASE_CIRCLE_TOP = { size: 180, offset: -40, opacity: 0.55 };
const PHRASE_CIRCLE_BOTTOM = { size: 120, left: -30, bottom: -36, opacity: 0.45 };

/** Штамп «НРАВИТСЯ» на фото карточки, пока её тянут вправо. Кладётся в photoOverlay карточки специалиста. */
export function LikeStamp() {
  const t = useTheme();
  return (
    <View
      style={{
        position: 'absolute',
        top: STAMP_TOP,
        left: STAMP_LEFT,
        paddingVertical: STAMP_PAD_V,
        paddingHorizontal: STAMP_PAD_H,
        borderRadius: STAMP_RADIUS,
        borderWidth: STAMP_BORDER,
        borderColor: t.color.growth,
        backgroundColor: t.color.surface,
        transform: [{ rotate: STAMP_ROTATE }],
      }}
    >
      <Text
        style={{
          fontFamily: t.fontFamily.display[900],
          fontSize: STAMP_FONT,
          lineHeight: STAMP_LINE,
          letterSpacing: STAMP_SPACING,
          color: t.color.growth,
        }}
      >
        НРАВИТСЯ
      </Text>
    </View>
  );
}

/** Плашка успеха с галочкой: «Контакты открыты. Ольга добавлена в избранные.» */
export function SuccessBanner({ lead, text }: { lead: string; text: string }) {
  const t = useTheme();
  const font = { fontSize: BANNER_FONT, lineHeight: BANNER_LINE, color: t.color.text };
  return (
    <View
      role="status"
      accessibilityLiveRegion="polite"
      style={{
        paddingVertical: BANNER_PAD_V,
        paddingHorizontal: BANNER_PAD_H,
        borderRadius: BANNER_RADIUS,
        backgroundColor: t.color.growthSoft,
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.sm,
      }}
    >
      <View
        style={{
          width: BANNER_CHECK,
          height: BANNER_CHECK,
          borderRadius: t.radius.full,
          backgroundColor: t.color.surface,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name="check" size={BANNER_ICON} color={t.color.success} />
      </View>
      <Text style={[{ flex: 1, fontFamily: t.type.body.fontFamily }, font]}>
        <Text style={[{ fontFamily: t.fontFamily.text[700] }, font]}>{lead}</Text> {text}
      </Text>
    </View>
  );
}

/** Фото специалиста в профиле: пока фотографии нет — силуэт. */
export function SpecialistPhoto({ name, tone }: { name: string; tone?: PhotoTone }) {
  const t = useTheme();
  return (
    <View
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Фото: ${name}`}
      style={{
        height: PHOTO_HEIGHT,
        borderRadius: t.radius['2xl'],
        backgroundColor: photoColors(t, tone).bg,
        alignItems: 'center',
        justifyContent: 'flex-end',
        overflow: 'hidden',
      }}
    >
      <Silhouette width={PHOTO_FIGURE_WIDTH} height={PHOTO_FIGURE_HEIGHT} tone={tone} />
    </View>
  );
}

type ContactActionProps = {
  icon: IconName;
  /** Сам контакт: «+375 29 555-12-34», «@miroshnik_psy». Виден текстом — его можно набрать вручную. */
  title: string;
  /** «Телефон», «Telegram». */
  caption: string;
  /** «Позвонить», «Написать», «Записаться». */
  actionLabel: string;
  /** Для скринридера: «Позвонить Ольге Мирошник». */
  accessibilityLabel?: string;
  /** primary — главный способ связи (звонок). */
  primary?: boolean;
  divider?: boolean;
  onAction: () => void;
};

/** Строка блока «Контакты» в профиле специалиста: иконка, контакт и кнопка действия. */
export function ContactAction({
  icon,
  title,
  caption,
  actionLabel,
  accessibilityLabel,
  primary,
  divider,
  onAction,
}: ContactActionProps) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: CONTACT_GAP,
        paddingVertical: CONTACT_PAD_V,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: t.color.border,
      }}
    >
      <View
        style={{
          width: CONTACT_ICON_BOX,
          height: CONTACT_ICON_BOX,
          borderRadius: CONTACT_ICON_RADIUS,
          backgroundColor: t.color.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon name={icon} color={t.color.onPrimarySoft} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[t.type.bodyStrong, { fontFamily: t.fontFamily.text[700], color: t.color.text }]}>{title}</Text>
        <Text style={[t.type.caption, { color: t.color.textMuted }]}>{caption}</Text>
      </View>
      <Button variant={primary ? 'primary' : 'outline'} accessibilityLabel={accessibilityLabel} onPress={onAction}>
        {actionLabel}
      </Button>
    </View>
  );
}

type InfoNoteProps = {
  icon: IconName;
  /** Текст до ссылки: «Нужна помощь сегодня? Загляните в ». */
  text: string;
  /** Ссылка внутри текста: «службу вашего вуза». */
  linkLabel: string;
  /** Текст после ссылки: «.». */
  tail?: string;
  onLinkPress: () => void;
};

/** Тихая подсказка со ссылкой внутри текста. */
export function InfoNote({ icon, text, linkLabel, tail = '', onLinkPress }: InfoNoteProps) {
  const t = useTheme();
  const font = { fontSize: NOTE_FONT, lineHeight: NOTE_LINE };
  return (
    <View
      style={{
        paddingVertical: NOTE_PAD_V,
        paddingHorizontal: NOTE_PAD_H,
        borderRadius: NOTE_RADIUS,
        backgroundColor: t.color.surfaceAlt,
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.sm,
      }}
    >
      <Icon name={icon} color={t.color.primary} />
      <Text style={[{ flex: 1, fontFamily: t.type.body.fontFamily, color: t.color.text }, font]}>
        {text}
        <Text
          accessibilityRole="link"
          onPress={onLinkPress}
          style={[{ fontFamily: t.fontFamily.text[600], color: t.color.primary, textDecorationLine: 'underline' }, font]}
        >
          {linkLabel}
        </Text>
        {tail}
      </Text>
    </View>
  );
}

/** Буква-разделитель в списке избранных и подпись «Служба вашего вуза». */
export function SectionLetter({ children }: { children: string }) {
  const t = useTheme();
  return (
    <Text
      accessibilityRole="header"
      style={{
        paddingTop: LETTER_PAD_TOP,
        paddingHorizontal: LETTER_PAD_H,
        paddingBottom: LETTER_PAD_BOTTOM,
        fontFamily: t.fontFamily.display[900],
        fontSize: LETTER_FONT,
        lineHeight: LETTER_LINE,
        color: t.color.primary,
      }}
    >
      {children}
    </Text>
  );
}

type PhraseCardProps = {
  /** sweet — «Сахарный»: мягкая карточка с кругами; spicy — «С перчиком»: тёмная, с бейджем и автором. */
  tone: 'sweet' | 'spicy';
  text: string;
  /** «От психотерапевта». */
  badge?: string;
  /** Подпись-автор: «— Ирина Ракович, психотерапевт». Нажимается — открывает шторку автора. */
  author?: string;
  onAuthorPress?: () => void;
};

/** Большая карточка с фразой «Доброго слова». */
export function PhraseCard({ tone, text, badge, author, onAuthorPress }: PhraseCardProps) {
  const t = useTheme();
  const sweet = tone === 'sweet';
  const fg = sweet ? t.color.onPrimarySoft : t.color.onSecondary;
  const quote = sweet ? PHRASE_SWEET : PHRASE_SPICY;
  return (
    <View
      style={{
        minHeight: PHRASE_MIN_HEIGHT,
        borderRadius: PHRASE_RADIUS,
        backgroundColor: sweet ? t.color.primarySoft : t.color.secondary,
        paddingVertical: PHRASE_PAD_V,
        paddingHorizontal: PHRASE_PAD_H,
        justifyContent: 'center',
        gap: PHRASE_GAP,
        overflow: 'hidden',
      }}
    >
      {sweet ? (
        <>
          <View style={{ position: 'absolute', top: PHRASE_CIRCLE_TOP.offset, right: PHRASE_CIRCLE_TOP.offset }}>
            <Svg width={PHRASE_CIRCLE_TOP.size} height={PHRASE_CIRCLE_TOP.size} {...svgA11y()}>
              <Circle
                cx={PHRASE_CIRCLE_TOP.size / 2}
                cy={PHRASE_CIRCLE_TOP.size / 2}
                r={PHRASE_CIRCLE_TOP.size / 2}
                fill={t.logo.apricot}
                opacity={PHRASE_CIRCLE_TOP.opacity}
              />
            </Svg>
          </View>
          <View style={{ position: 'absolute', left: PHRASE_CIRCLE_BOTTOM.left, bottom: PHRASE_CIRCLE_BOTTOM.bottom }}>
            <Svg width={PHRASE_CIRCLE_BOTTOM.size} height={PHRASE_CIRCLE_BOTTOM.size} {...svgA11y()}>
              <Circle
                cx={PHRASE_CIRCLE_BOTTOM.size / 2}
                cy={PHRASE_CIRCLE_BOTTOM.size / 2}
                r={PHRASE_CIRCLE_BOTTOM.size / 2}
                fill={t.color.accent}
                opacity={PHRASE_CIRCLE_BOTTOM.opacity}
              />
            </Svg>
          </View>
        </>
      ) : null}
      {badge ? (
        <View
          style={{
            alignSelf: 'flex-start',
            paddingVertical: PHRASE_BADGE_PAD_V,
            paddingHorizontal: PHRASE_BADGE_PAD_H,
            borderRadius: t.radius.full,
            backgroundColor: t.color.accent,
          }}
        >
          <Text style={[t.type.overline, { color: t.color.onAccent }]}>{badge}</Text>
        </View>
      ) : null}
      <Text
        style={{ fontFamily: t.fontFamily.display[800], fontSize: quote.size, lineHeight: quote.line, color: fg }}
      >
        {text}
      </Text>
      {author ? (
        <Text
          accessibilityRole="button"
          onPress={onAuthorPress}
          // Область касания 48: подпись в одну строку, поэтому добираем сверху и снизу.
          style={{
            alignSelf: 'flex-start',
            paddingVertical: (t.size.touch - t.type.caption.lineHeight) / 2,
            fontFamily: t.fontFamily.text[500],
            fontSize: t.type.caption.fontSize,
            lineHeight: t.type.caption.lineHeight,
            color: fg,
            textDecorationLine: 'underline',
          }}
        >
          {author}
        </Text>
      ) : null}
    </View>
  );
}
