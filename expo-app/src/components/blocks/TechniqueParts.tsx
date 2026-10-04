import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/theme';

// Размеры из макетов Technique (.phase, .st, .sn), Anatomy (.li) и ScreamNoMic (.stepn).
const PHASE_GAP = 10;
const PHASE_PAD_V = 14;
const PHASE_PAD_H = 6;
const PHASE_RADIUS = 18;
const PHASE_NUMBER_SIZE = 34;
const PHASE_NUMBER_LINE = 38;
const PHASE_TEXT_GAP = 2;
const STEP_GAP = 12;
const STEP_BADGE = 28;
const STEP_NUMBER_SIZE = 14;
const STEP_PLAIN_SIZE = 15;
const STEP_PLAIN_LINE = 20;
const BULLET_GAP = 10;
const BULLET = 6;
const BULLET_TOP = 9;

/** Крупные цифры схемы: «4 вдох носом · 7 задержка · 8 выдох ртом». Первая — терракотовая, последняя — зелёная. */
export function PhaseTiles({ phases }: { phases: { value: string; label: string }[] }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: PHASE_GAP }}>
      {phases.map((phase, i) => {
        const first = i === 0;
        const last = i === phases.length - 1;
        const fg = first ? t.color.onPrimarySoft : t.color.text;
        return (
          <View
            key={phase.label}
            accessible
            accessibilityLabel={`${phase.label}: ${phase.value}`}
            style={{
              flex: 1,
              alignItems: 'center',
              gap: PHASE_TEXT_GAP,
              paddingVertical: PHASE_PAD_V,
              paddingHorizontal: PHASE_PAD_H,
              borderRadius: PHASE_RADIUS,
              backgroundColor: first ? t.color.primarySoft : last ? t.color.growthSoft : t.color.surfaceAlt,
            }}
          >
            <Text
              style={{
                fontFamily: t.fontFamily.display[900],
                fontSize: PHASE_NUMBER_SIZE,
                lineHeight: PHASE_NUMBER_LINE,
                color: fg,
              }}
            >
              {phase.value}
            </Text>
            <Text style={[t.type.caption, { color: fg, textAlign: 'center' }]}>{phase.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

type StepProps = {
  number: number;
  /** accent — шаг техники: терракотовый кружок; plain — служебная инструкция (как дать доступ к микрофону). */
  tone?: 'accent' | 'plain';
  children: React.ReactNode;
};

/** Шаг инструкции с номером в кружке. */
export function NumberedStep({ number, tone = 'accent', children }: StepProps) {
  const t = useTheme();
  const plain = tone === 'plain';
  return (
    <View style={{ flexDirection: 'row', alignItems: plain ? 'center' : 'flex-start', gap: STEP_GAP }}>
      <View
        style={{
          width: STEP_BADGE,
          height: STEP_BADGE,
          borderRadius: t.radius.full,
          backgroundColor: plain ? t.color.surfaceAlt : t.color.primarySoft,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Text
          style={{
            fontFamily: t.fontFamily.display[800],
            fontSize: STEP_NUMBER_SIZE,
            color: plain ? t.color.text : t.color.onPrimarySoft,
          }}
        >
          {number}
        </Text>
      </View>
      <Text
        style={[
          t.type.body,
          { flex: 1, color: t.color.text },
          plain && { fontSize: STEP_PLAIN_SIZE, lineHeight: STEP_PLAIN_LINE },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

/** Пункт списка с точкой цвета color.primary. */
export function BulletItem({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: BULLET_GAP }}>
      <View
        style={{
          width: BULLET,
          height: BULLET,
          borderRadius: t.radius.full,
          backgroundColor: t.color.primary,
          marginTop: BULLET_TOP,
          flexShrink: 0,
        }}
      />
      <Text style={[t.type.body, { flex: 1, color: t.color.text }]}>{children}</Text>
    </View>
  );
}
