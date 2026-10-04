import React from 'react';
import { Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/theme';

// Размеры из макетов Sos (большая карточка) и SosUni (строка).
const CARD_PAD_TOP = 22;
const CARD_PAD = 20;
const CARD_GAP = 6;
const CARD_NUMBER_SIZE = 64;
const CARD_NUMBER_LINE = 67;
const CARD_BUTTON_MARGIN = 12;
const STRIP_PAD = 12;
const STRIP_PAD_LEFT = 18;
const STRIP_GAP = 12;
const STRIP_NUMBER_SIZE = 24;
const STRIP_NUMBER_LINE = 28;
// Кнопка в строке уже обычной: иначе подпись слева не помещается в две строки, как в макете.
const STRIP_BUTTON_PAD = 14;

type Props = {
  /** Что за номер: «Экстренная психологическая помощь». */
  label: string;
  /** Сам номер: «133». Он всегда виден текстом — его можно набрать вручную. */
  number: string;
  onCall: () => void;
};

/** Большая карточка экстренного номера с кнопкой звонка. Только SOS: color.sos больше нигде не используется. */
export function EmergencyCard({ label, number, onCall }: Props) {
  const t = useTheme();
  return (
    <View
      style={{
        paddingTop: CARD_PAD_TOP,
        paddingHorizontal: CARD_PAD,
        paddingBottom: CARD_PAD,
        borderRadius: t.radius['2xl'],
        backgroundColor: t.color.sosSoft,
        gap: CARD_GAP,
      }}
    >
      <Text style={[t.type.overline, { color: t.color.onSosSoft }]}>{label}</Text>
      <Text
        style={{
          fontFamily: t.fontFamily.display[900],
          fontSize: CARD_NUMBER_SIZE,
          lineHeight: CARD_NUMBER_LINE,
          color: t.color.onSosSoft,
        }}
      >
        {number}
      </Text>
      <Button variant="sos" size="lg" icon="phone" fullWidth onPress={onCall} style={{ marginTop: CARD_BUTTON_MARGIN }}>
        {`Позвонить ${number}`}
      </Button>
    </View>
  );
}

/** Компактная строка экстренного номера — вверху экрана «Помощь в моём вузе». */
export function EmergencyStrip({ label, number, onCall }: Props) {
  const t = useTheme();
  return (
    <View
      style={{
        paddingVertical: STRIP_PAD,
        paddingRight: STRIP_PAD,
        paddingLeft: STRIP_PAD_LEFT,
        borderRadius: t.radius.xl,
        backgroundColor: t.color.sosSoft,
        flexDirection: 'row',
        alignItems: 'center',
        gap: STRIP_GAP,
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: t.fontFamily.display[900],
            fontSize: STRIP_NUMBER_SIZE,
            lineHeight: STRIP_NUMBER_LINE,
            color: t.color.onSosSoft,
          }}
        >
          {number}
        </Text>
        <Text style={[t.type.caption, { color: t.color.onSosSoft }]}>{label}</Text>
      </View>
      <Button
        variant="sos"
        icon="phone"
        onPress={onCall}
        accessibilityLabel={`Позвонить ${number}`}
        style={{ paddingHorizontal: STRIP_BUTTON_PAD }}
      >
        Позвонить
      </Button>
    </View>
  );
}
