import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { svgA11y } from '@/components/brand';
import { focusRing, isFocused, pressedState } from '@/components/ui/focus';
import type { OrganId } from '@/data/anatomy';
import { useTheme } from '@/theme';

// Рисунок и точки нажатия из макета Anatomy. Сетка рисунка — viewBox «20 18 372 300».
const VIEW_BOX = '20 18 372 300';
const WIDTH = 372;
const HEIGHT = 300;
const STROKE = 2;
const HOT = 48;
const HOT_RING = 2;
const TAG_SHIFT_X = 62;
const TAG_SHIFT_Y = 8;
const TAG_PAD_V = 6;
const TAG_PAD_H = 12;
const TAG_FONT = 14;
const TAG_LINE = 18;

/** Левый верхний угол точки нажатия 48×48 над органом, в координатах рисунка 372×300. */
const HOT_SPOTS: Record<OrganId, { left: number; top: number }> = {
  brain: { left: 162, top: 6 },
  lungs: { left: 116, top: 116 },
  heart: { left: 170, top: 148 },
  stomach: { left: 192, top: 200 },
  adrenals: { left: 126, top: 208 },
};

type Props = {
  organs: { id: OrganId; name: string }[];
  selected: OrganId;
  onSelect: (id: OrganId) => void;
};

/**
 * 2D-силуэт с органами: мягкие фигуры без контуров тела, цвета палитры (docs/02).
 * Выбранный орган закрашен color.primary и подписан — цвет не единственный признак.
 */
export function AnatomyFigure({ organs, selected, onSelect }: Props) {
  const t = useTheme();
  const [available, setAvailable] = useState(WIDTH);
  // На экране уже 372 dp рисунок уменьшается целиком, точки нажатия остаются 48 dp.
  const scale = Math.min(1, available / WIDTH);

  const organStyle = (id: OrganId) =>
    id === selected
      ? { fill: t.color.primary, stroke: t.color.primaryPressed, strokeWidth: STROKE }
      : { fill: t.logo.apricot, stroke: t.logo.warm, strokeWidth: STROKE };
  const adrenalStyle =
    selected === 'adrenals'
      ? { fill: t.color.primary, stroke: t.color.primaryPressed, strokeWidth: STROKE }
      : { fill: t.color.accent, stroke: t.logo.warm, strokeWidth: STROKE };
  const kidneyStyle = { fill: t.logo.apricot, stroke: t.logo.warm, strokeWidth: STROKE };
  const selectedName = organs.find((organ) => organ.id === selected)?.name;
  const spot = HOT_SPOTS[selected];

  return (
    <View onLayout={(e) => setAvailable(e.nativeEvent.layout.width)} style={{ alignItems: 'center' }}>
      <View style={{ width: WIDTH * scale, height: HEIGHT * scale }}>
        <Svg width={WIDTH * scale} height={HEIGHT * scale} viewBox={VIEW_BOX} {...svgA11y()}>
          <G fill={t.color.primarySoft}>
            <Circle cx={206} cy={50} r={32} />
            <Rect x={196} y={76} width={20} height={18} rx={6} />
            <Path d="M146 98 Q206 84 266 98 Q282 102 284 120 L290 252 Q290 274 270 278 L142 278 Q122 274 122 252 L128 120 Q130 102 146 98Z" />
            <Rect x={94} y={106} width={26} height={160} rx={13} transform="rotate(8 107 106)" />
            <Rect x={292} y={106} width={26} height={160} rx={13} transform="rotate(-8 305 106)" />
            <Rect x={148} y={270} width={48} height={80} rx={20} />
            <Rect x={216} y={270} width={48} height={80} rx={20} />
          </G>
          <Path
            d="M184 52 Q180 32 198 28 Q206 20 216 28 Q232 28 230 46 Q234 60 218 62 L194 62 Q182 62 184 52Z"
            {...organStyle('brain')}
          />
          <Path
            d="M170 122 Q186 112 196 126 L198 188 Q190 198 174 194 Q160 188 162 162 Q164 132 170 122Z"
            {...organStyle('lungs')}
          />
          <Path
            d="M242 122 Q226 112 216 126 L214 188 Q222 198 238 194 Q252 188 250 162 Q248 132 242 122Z"
            {...organStyle('lungs')}
          />
          <Path
            d="M214 204 L198 189 Q190 179 199 171 Q207 166 214 174 Q221 166 229 171 Q238 179 230 189Z"
            {...organStyle('heart')}
          />
          <Path
            d="M216 212 Q236 208 242 224 Q246 244 226 250 Q210 254 206 242 Q216 238 216 228 Q210 220 216 212Z"
            {...organStyle('stomach')}
          />
          <Ellipse cx={180} cy={256} rx={9} ry={13} {...kidneyStyle} />
          <Ellipse cx={232} cy={256} rx={9} ry={13} {...kidneyStyle} />
          <Path d="M171 244 L180 232 L189 244Z" {...adrenalStyle} />
          <Path d="M223 244 L232 232 L241 244Z" {...adrenalStyle} />
        </Svg>

        {organs.map((organ) => {
          const isSelected = organ.id === selected;
          const position = HOT_SPOTS[organ.id];
          return (
            <Pressable
              key={organ.id}
              onPress={() => onSelect(organ.id)}
              accessibilityRole="button"
              accessibilityLabel={isSelected ? `${organ.name}, выбрано` : organ.name}
              {...pressedState(isSelected)}
              style={(state) => [
                {
                  position: 'absolute',
                  left: (position.left + HOT / 2) * scale - HOT / 2,
                  top: (position.top + HOT / 2) * scale - HOT / 2,
                  width: HOT,
                  height: HOT,
                  borderRadius: t.radius.full,
                  borderWidth: isSelected ? HOT_RING : 0,
                  borderColor: t.color.primary,
                },
                focusRing(t, isFocused(state)),
              ]}
            />
          );
        })}

        {selectedName ? (
          <View
            aria-hidden
            style={{
              position: 'absolute',
              left: (spot.left + TAG_SHIFT_X) * scale,
              top: (spot.top + HOT / 2) * scale - HOT / 2 + TAG_SHIFT_Y,
              paddingVertical: TAG_PAD_V,
              paddingHorizontal: TAG_PAD_H,
              borderRadius: t.radius.full,
              backgroundColor: t.color.primary,
              pointerEvents: 'none',
            }}
          >
            <Text
              style={{
                fontFamily: t.fontFamily.text[700],
                fontSize: TAG_FONT,
                lineHeight: TAG_LINE,
                color: t.color.onPrimary,
              }}
            >
              {selectedName}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
