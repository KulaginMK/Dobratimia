import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/brand';
import { IconButton } from '@/components/ui/IconButton';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';
import { useTopInset } from './useTopInset';

// Размеры из макетов (.top, .ibtn, .sos).
const ROW_HEIGHT = 56;
const PAD_LEFT = 4;
const PAD_RIGHT = 12;
const GAP = 4;
const BACK_ICON = 26;
const CLOSE_ICON = 22;
const SOS_PAD_H = 16;
const SOS_GAP = 6;
const SOS_ICON = 20;
const SOS_FONT = 15;

type Props = {
  title: string;
  /** back — стрелка «Назад»; close — крестик (DASS-21); none — без кнопки слева. */
  leading?: 'back' | 'close' | 'none';
  /** Что скажет скринридер: «Назад», «Назад к техникам», «Прервать тест». */
  leadingLabel?: string;
  onLeadingPress?: () => void;
  /** Кнопка SOS справа. Без обработчика её нет — так в онбординге, на самом SOS и в кабинете специалиста. */
  onSosPress?: () => void;
  /** Действие справа вместо SOS: «Сохранить» в редактировании карточки специалиста. */
  trailing?: React.ReactNode;
};

/** Шапка экранов вне ленты: «Назад» или «Закрыть», заголовок и SOS справа. */
export function ScreenHeader({ title, leading = 'back', leadingLabel, onLeadingPress, onSosPress, trailing }: Props) {
  const t = useTheme();
  const topInset = useTopInset();
  return (
    <View
      style={{
        paddingTop: topInset,
        paddingLeft: leading === 'none' ? t.space.screen : PAD_LEFT,
        paddingRight: PAD_RIGHT,
      }}
    >
      <View style={{ height: ROW_HEIGHT, flexDirection: 'row', alignItems: 'center', gap: GAP }}>
        {leading === 'none' ? null : (
          <IconButton
            icon={leading === 'close' ? 'close' : 'chevronLeft'}
            iconSize={leading === 'close' ? CLOSE_ICON : BACK_ICON}
            accessibilityLabel={leadingLabel ?? (leading === 'close' ? 'Закрыть' : 'Назад')}
            onPress={onLeadingPress}
          />
        )}
        <Text
          accessibilityRole="header"
          numberOfLines={1}
          style={[t.type.h3, { flexGrow: 1, flexShrink: 1, color: t.color.text }]}
        >
          {title}
        </Text>
        {onSosPress ? (
          <Pressable
            onPress={onSosPress}
            accessibilityRole="button"
            accessibilityLabel="SOS — экстренная помощь"
            style={(state) => [
              {
                height: t.size.touch,
                paddingHorizontal: SOS_PAD_H,
                borderRadius: t.radius.full,
                backgroundColor: t.color.sos,
                flexDirection: 'row',
                alignItems: 'center',
                gap: SOS_GAP,
                flexShrink: 0,
                transform: [{ scale: state.pressed ? 0.98 : 1 }],
              },
              focusRing(t, isFocused(state)),
            ]}
          >
            <Icon name="sos" size={SOS_ICON} color={t.color.onSos} />
            <Text style={{ fontFamily: t.fontFamily.text[700], fontSize: SOS_FONT, color: t.color.onSos }}>SOS</Text>
          </Pressable>
        ) : null}
        {trailing}
      </View>
    </View>
  );
}
