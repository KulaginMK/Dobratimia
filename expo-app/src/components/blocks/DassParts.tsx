import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { Icon } from '@/components/brand';
import { focusRing, isFocused } from '@/components/ui/focus';
import { useTheme } from '@/theme';

// Размеры из макетов DassQuestion (.ans, .radio, .num) и DassResult (карточка совета, график, блок «Следующий тест»).
const ANSWER_MIN_HEIGHT = 64;
const ANSWER_PAD_V = 12;
const ANSWER_PAD_H = 16;
const ANSWER_RADIUS = 18;
const ANSWER_BORDER = 1.5;
const ANSWER_GAP = 14;
const ANSWER_FONT = 16;
const ANSWER_LINE = 22;
const RADIO = 24;
const RADIO_BORDER = 2;
const RADIO_DOT = 12;
const SCORE_WIDTH = 28;
const SCORE_FONT = 15;
const SCORE_LINE = 20;
const ADVICE_RADIUS = 24;
const ADVICE_PAD = 20;
const ADVICE_GAP = 10;
const NOTE_SIZE = 15;
const NOTE_LINE = 22;
const CHART_PLOT_HEIGHT = 130;
const CHART_PAD = 10;
const CHART_AXIS_WIDTH = 30;
const CHART_LABEL_SIZE = 12;
const CHART_LABEL_LINE = 16;
const CHART_LINE = 3;
const CHART_LINE_DASHED = 2.5;
const CHART_DASH = '6 5';
const CHART_DOT = 5;
const CHART_DATES_TOP = 6;
const LEGEND_GAP = 16;
const LEGEND_ITEM_GAP = 6;
const LEGEND_MARK_WIDTH = 18;
const LEGEND_MARK_HEIGHT = 4;
const LEGEND_DASH_WIDTH = 4;
const NEXT_PAD_V = 16;
const NEXT_PAD_H = 18;
const NEXT_RADIUS = 20;
const NEXT_ICON = 26;

type AnswerProps = {
  text: string;
  /** Балл ответа: 0…3. */
  score: number;
  selected: boolean;
  onPress: () => void;
};

/** Вариант ответа теста: кружок, текст и балл. Выбранный отмечен точкой и жирным текстом, а не только цветом. */
export function AnswerOption({ text, score, selected, onPress }: AnswerProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={`${text}, балл ${score}`}
      aria-checked={selected}
      style={(state) => [
        {
          minHeight: ANSWER_MIN_HEIGHT,
          paddingVertical: ANSWER_PAD_V,
          paddingHorizontal: ANSWER_PAD_H,
          borderRadius: ANSWER_RADIUS,
          borderWidth: ANSWER_BORDER,
          borderColor: selected ? t.color.primary : t.color.border,
          backgroundColor: selected ? t.color.primarySoft : t.color.surface,
          flexDirection: 'row',
          alignItems: 'center',
          gap: ANSWER_GAP,
        },
        focusRing(t, isFocused(state)),
      ]}
    >
      <View
        style={{
          width: RADIO,
          height: RADIO,
          borderRadius: t.radius.full,
          borderWidth: RADIO_BORDER,
          borderColor: selected ? t.color.primary : t.color.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {selected ? (
          <View
            style={{ width: RADIO_DOT, height: RADIO_DOT, borderRadius: t.radius.full, backgroundColor: t.color.primary }}
          />
        ) : null}
      </View>
      <Text
        style={{
          flex: 1,
          fontFamily: selected ? t.fontFamily.text[600] : t.fontFamily.text[500],
          fontSize: ANSWER_FONT,
          lineHeight: ANSWER_LINE,
          color: selected ? t.color.onPrimarySoft : t.color.text,
        }}
      >
        {text}
      </Text>
      <Text
        style={{
          width: SCORE_WIDTH,
          textAlign: 'center',
          fontFamily: t.fontFamily.display[900],
          fontSize: SCORE_FONT,
          lineHeight: SCORE_LINE,
          color: t.color.textMuted,
          flexShrink: 0,
        }}
      >
        {score}
      </Text>
    </Pressable>
  );
}

type AdviceProps = {
  /** sos — бережный блок «стоит поговорить со специалистом»; soft — мягкая карточка при умеренном уровне. */
  tone: 'sos' | 'soft';
  title?: string;
  body: string;
  /** Кнопки под текстом. */
  children?: React.ReactNode;
};

/** Карточка над шкалами результата: что стоит сделать. Без диагнозов и обещаний (docs/02). */
export function AdviceCard({ tone, title, body, children }: AdviceProps) {
  const t = useTheme();
  const fg = tone === 'sos' ? t.color.onSosSoft : t.color.onPrimarySoft;
  return (
    <View
      style={{
        padding: ADVICE_PAD,
        borderRadius: ADVICE_RADIUS,
        backgroundColor: tone === 'sos' ? t.color.sosSoft : t.color.primarySoft,
        gap: ADVICE_GAP,
      }}
    >
      {title ? (
        <Text accessibilityRole="header" style={[t.type.h2, { color: fg }]}>
          {title}
        </Text>
      ) : null}
      <Text style={{ fontFamily: t.type.body.fontFamily, fontSize: NOTE_SIZE, lineHeight: NOTE_LINE, color: fg }}>
        {body}
      </Text>
      {children ? <View style={{ gap: t.space.xs, marginTop: t.space.xxs }}>{children}</View> : null}
    </View>
  );
}

export type ChartSeries = {
  key: string;
  /** Подпись в легенде: «Стресс». */
  label: string;
  color: string;
  /** Пунктир: линию отличает не только цвет. */
  dashed?: boolean;
  /** Баллы по тестам, от старых к новым. */
  values: number[];
};

type ChartProps = {
  series: ChartSeries[];
  /** Верх шкалы: 42. */
  max: number;
  /** Подписи дат под графиком: первая, средняя, последняя. */
  dates: string[];
  /** Для скринридера: что на графике, словами. */
  accessibilityLabel: string;
};

/** График истории тестов: по линии на шкалу, последняя точка выделена. */
export function HistoryChart({ series, max, dates, accessibilityLabel }: ChartProps) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const height = CHART_PLOT_HEIGHT + CHART_PAD * 2;
  const count = series[0]?.values.length ?? 0;
  const right = width - CHART_DOT;
  // Один тест — точка у правого края; несколько — от левого края до правого.
  const x = (i: number) => (count > 1 ? (i * right) / (count - 1) : right);
  const y = (value: number) => CHART_PAD + CHART_PLOT_HEIGHT * (1 - Math.min(max, Math.max(0, value)) / max);
  const label = {
    fontFamily: t.type.caption.fontFamily,
    fontSize: CHART_LABEL_SIZE,
    lineHeight: CHART_LABEL_LINE,
    color: t.color.textMuted,
  };
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: CHART_AXIS_WIDTH, height, justifyContent: 'space-between' }}>
          <Text style={label}>{max}</Text>
          <Text style={label}>0</Text>
        </View>
        <View style={{ flex: 1, height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
          {width > 0 ? (
            <Svg width={width} height={height}>
              {[0, 1, 2, 3].map((i) => {
                const lineY = CHART_PAD + (CHART_PLOT_HEIGHT * i) / 3;
                return <Line key={i} x1={0} x2={width} y1={lineY} y2={lineY} stroke={t.color.border} strokeWidth={1} />;
              })}
              {series.map((item) => (
                <React.Fragment key={item.key}>
                  {count > 1 ? (
                    <Polyline
                      points={item.values.map((value, i) => `${x(i)},${y(value)}`).join(' ')}
                      fill="none"
                      stroke={item.color}
                      strokeWidth={item.dashed ? CHART_LINE_DASHED : CHART_LINE}
                      strokeDasharray={item.dashed ? CHART_DASH : undefined}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : null}
                  <Circle cx={x(count - 1)} cy={y(item.values[count - 1])} r={CHART_DOT} fill={item.color} />
                </React.Fragment>
              ))}
            </Svg>
          ) : null}
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: dates.length > 1 ? 'space-between' : 'flex-end',
          marginLeft: CHART_AXIS_WIDTH,
          marginTop: CHART_DATES_TOP,
        }}
      >
        {dates.map((date, i) => (
          <Text key={i} style={label}>
            {date}
          </Text>
        ))}
      </View>
      <View
        style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: LEGEND_GAP, rowGap: t.space.xxs, marginTop: t.space.sm }}
      >
        {series.map((item) => (
          <View key={item.key} style={{ flexDirection: 'row', alignItems: 'center', gap: LEGEND_ITEM_GAP }}>
            <View style={{ flexDirection: 'row', width: LEGEND_MARK_WIDTH, justifyContent: 'space-between' }}>
              {(item.dashed ? [0, 1, 2] : [0]).map((i) => (
                <View
                  key={i}
                  style={{
                    width: item.dashed ? LEGEND_DASH_WIDTH : LEGEND_MARK_WIDTH,
                    height: LEGEND_MARK_HEIGHT,
                    borderRadius: LEGEND_MARK_HEIGHT / 2,
                    backgroundColor: item.color,
                  }}
                />
              ))}
            </View>
            <Text style={[t.type.caption, { color: t.color.text }]}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Строка с колокольчиком: «Следующий тест — 8 октября». */
export function NextTestNote({ children }: { children: string }) {
  const t = useTheme();
  return (
    <View
      style={{
        paddingVertical: NEXT_PAD_V,
        paddingHorizontal: NEXT_PAD_H,
        borderRadius: NEXT_RADIUS,
        backgroundColor: t.color.surfaceAlt,
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.space.sm,
      }}
    >
      <Icon name="bell" size={NEXT_ICON} color={t.color.primary} />
      <Text
        style={{ flex: 1, fontFamily: t.type.body.fontFamily, fontSize: NOTE_SIZE, lineHeight: NOTE_LINE, color: t.color.text }}
      >
        {children}
      </Text>
    </View>
  );
}
