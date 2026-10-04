import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/brand';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme, type Theme } from '@/theme';

// Размеры из макетов Favorites и SosUni (.ct, .av, .call).
const ROW_MIN_HEIGHT = 68;
const ROW_GAP = 12;
const INITIALS_FONT = 16;
const CALL_ICON = 22;

export type AvatarTone = 'neutral' | 'primary' | 'growth' | 'sos';

function avatarColors(t: Theme, tone: AvatarTone) {
  switch (tone) {
    case 'primary':
      return { bg: t.color.primarySoft, fg: t.color.onPrimarySoft };
    case 'growth':
      return { bg: t.color.growthSoft, fg: t.color.text };
    case 'sos':
      return { bg: t.color.sosSoft, fg: t.color.onSosSoft };
    default:
      return { bg: t.color.surfaceAlt, fg: t.color.text };
  }
}

type Props = {
  name: string;
  /** Роль и формат: «Психолог · онлайн и очно, Витебск». */
  caption?: string;
  /** Инициалы в аватаре: «ОМ». */
  initials?: string;
  /** Иконка вместо инициалов: sos у службы вуза. */
  avatarIcon?: IconName;
  avatarTone?: AvatarTone;
  /** Подпись кнопки звонка для скринридера, имя в дательном падеже: «Позвонить Ольге Мирошник». */
  callLabel: string;
  onCall?: () => void;
  /** Разделитель снизу — между строками списка. */
  divider?: boolean;
};

/** Строка контакта: аватар-инициалы, имя, подпись и звонок в одно касание. */
export function ContactRow({ name, caption, initials, avatarIcon, avatarTone = 'neutral', callLabel, onCall, divider }: Props) {
  const t = useTheme();
  const avatar = avatarColors(t, avatarTone);
  return (
    <View
      style={{
        minHeight: ROW_MIN_HEIGHT,
        flexDirection: 'row',
        alignItems: 'center',
        gap: ROW_GAP,
        borderBottomWidth: divider ? 1 : 0,
        borderBottomColor: t.color.border,
      }}
    >
      <View
        style={{
          width: t.size.avatar,
          height: t.size.avatar,
          borderRadius: t.radius.full,
          backgroundColor: avatar.bg,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {avatarIcon ? (
          <Icon name={avatarIcon} color={avatar.fg} />
        ) : (
          <Text
            aria-hidden
            style={{ fontFamily: t.fontFamily.display[800], fontSize: INITIALS_FONT, color: avatar.fg }}
          >
            {initials}
          </Text>
        )}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[t.type.bodyStrong, { color: t.color.text }]}>{name}</Text>
        {caption ? <Text style={[t.type.caption, { color: t.color.textMuted }]}>{caption}</Text> : null}
      </View>
      <Pressable
        onPress={onCall}
        accessibilityRole="button"
        accessibilityLabel={callLabel}
        style={(state) => [
          {
            width: t.size.touch,
            height: t.size.touch,
            borderRadius: t.radius.full,
            backgroundColor: state.pressed ? t.color.primaryPressed : t.color.primary,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          },
          focusRing(t, isFocused(state)),
        ]}
      >
        <Icon name="phone" size={CALL_ICON} color={t.color.onPrimary} />
      </Pressable>
    </View>
  );
}
