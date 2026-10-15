import React, { useState } from 'react';
import { Platform, Text, View } from 'react-native';
import Svg, { Ellipse, G, Path, Rect } from 'react-native-svg';
import { svgA11y } from '@/components/brand';
import type { OrganId } from '@/data/anatomy';
import { useTheme } from '@/theme';

// Рисунок перерисован по просьбе владельца (15 октября 2026 года): стиль и цвета макета Anatomy, но органы
// стоят там, где они в теле при взгляде спереди. Человек смотрит на нас, поэтому его левая сторона — справа:
// сердце между лёгкими со сдвигом вправо и верхушкой вниз-вправо, левое лёгкое уже правого (сердечная вырезка),
// желудок под диафрагмой справа, печень — слева, почки с надпочечниками — у поясницы, правая почка ниже левой.
// Печень и почки бледные и не нажимаются: про них в приложении карточек нет.
const VIEW_BOX = '0 0 360 350';
const WIDTH = 360;
const HEIGHT = 350;
const STROKE = 2;
const TRACHEA = 4;
const ARM = 26;
const BACKGROUND_OPACITY = 0.55;
const TAG_PAD_V = 6;
const TAG_PAD_H = 12;
const TAG_FONT = 14;
const TAG_LINE = 18;

/** Подпись выбранного органа — сбоку, где она не закрывает другие органы. x — край подписи со стороны органа. */
const TAGS: Record<OrganId, { x: number; y: number; side: 'left' | 'right' }> = {
  brain: { x: 222, y: 22, side: 'right' },
  lungs: { x: 118, y: 132, side: 'left' },
  heart: { x: 246, y: 166, side: 'right' },
  stomach: { x: 254, y: 212, side: 'right' },
  adrenals: { x: 124, y: 256, side: 'left' },
};

type Props = {
  organs: { id: OrganId; name: string }[];
  selected: OrganId;
  onSelect: (id: OrganId) => void;
};

/**
 * 2D-силуэт с органами: мягкие фигуры без контуров тела, цвета палитры (docs/02).
 * Нажимается сам орган — его форма (решение владельца от 15 октября 2026 года). Для скринридера и тех, кому
 * трудно попасть пальцем в маленький орган, те же органы есть чипами под рисунком (AnatomyPage), поэтому
 * сам рисунок скрыт от скринридера. Выбранный орган закрашен color.primary и подписан — цвет не единственный признак.
 */
export function AnatomyFigure({ organs, selected, onSelect }: Props) {
  const t = useTheme();
  const [available, setAvailable] = useState(WIDTH);
  // На экране уже 360 dp рисунок уменьшается целиком.
  const scale = Math.min(1, available / WIDTH);

  // На вебе react-native-svg и сам превращает onPress в onClick, но вдобавок вешает на <path> обработчики жестов RN,
  // которых нет у DOM, и React ругается в консоли. Поэтому на вебе — сразу onClick, а onPress — null.
  const press = (id: OrganId) =>
    (Platform.OS === 'web'
      ? { onPress: null, onClick: () => onSelect(id), style: { cursor: 'pointer' } }
      : { onPress: () => onSelect(id) }) as unknown as { onPress?: () => void };
  const organ = (id: OrganId, fill: string = t.logo.apricot) => ({
    ...press(id),
    ...(id === selected
      ? { fill: t.color.primary, stroke: t.color.primaryPressed, strokeWidth: STROKE }
      : { fill, stroke: t.logo.warm, strokeWidth: STROKE }),
  });
  const line = (id: OrganId, width: number) => ({
    ...press(id),
    fill: 'none',
    stroke: id === selected ? t.color.primaryPressed : t.logo.warm,
    strokeWidth: width,
    strokeLinecap: 'round' as const,
  });
  const background = { fill: t.logo.apricot, stroke: t.logo.warm, strokeWidth: STROKE, opacity: BACKGROUND_OPACITY };
  const selectedName = organs.find((item) => item.id === selected)?.name;
  const tag = TAGS[selected];

  return (
    <View onLayout={(e) => setAvailable(e.nativeEvent.layout.width)} style={{ alignItems: 'center' }}>
      <View style={{ width: WIDTH * scale, height: HEIGHT * scale }}>
        <Svg width={WIDTH * scale} height={HEIGHT * scale} viewBox={VIEW_BOX} {...svgA11y()}>
          {/* Тело: голова, шея, руки от плеч, овальный торс без «боков» внизу. */}
          <G fill={t.color.primarySoft}>
            <Ellipse cx={180} cy={46} rx={34} ry={40} />
            <Rect x={166} y={78} width={28} height={30} rx={10} />
            <Path d="M126 102 Q180 92 234 102 Q262 108 264 132 Q270 230 252 300 Q238 346 180 348 Q122 346 108 300 Q90 230 96 132 Q98 108 126 102Z" />
          </G>
          <Path
            d="M102 122 L76 290 M258 122 L284 290"
            fill="none"
            stroke={t.color.primarySoft}
            strokeWidth={ARM}
            strokeLinecap="round"
          />

          {/* Мозг с продольной щелью. */}
          <Path
            d="M152 46 Q146 30 160 24 Q166 12 180 16 Q194 12 200 24 Q214 30 208 46 Q206 58 192 58 L168 58 Q154 58 152 46Z"
            {...organ('brain')}
          />
          <Path d="M180 20 L180 54" {...line('brain', STROKE)} />

          {/* Трахея и лёгкие: левое (справа на рисунке) уже, с вырезкой под сердце. */}
          <Path d="M180 90 L180 124 M180 124 Q172 128 166 134 M180 124 Q188 128 194 134" {...line('lungs', TRACHEA)} />
          <Path
            d="M164 116 Q150 110 140 124 Q124 148 124 182 Q124 202 142 204 Q160 206 172 196 L172 130 Q172 120 164 116Z"
            {...organ('lungs')}
          />
          <Path
            d="M196 116 Q210 110 220 124 Q236 148 236 182 Q236 202 218 204 Q206 205 202 198 Q210 186 202 176 Q196 170 188 170 L188 130 Q188 120 196 116Z"
            {...organ('lungs')}
          />

          {/* Сердце поверх лёгких: верхушка вниз и влево от человека (на рисунке — вправо). */}
          <Path
            d="M0 16 L-16 0 Q-24 -10 -16 -17 Q-7 -23 0 -13 Q7 -23 16 -17 Q24 -10 16 0Z"
            transform="translate(184 180) rotate(-20)"
            {...organ('heart')}
          />

          {/* Печень под правым куполом диафрагмы (на рисунке — слева): толстая справа, сужается к середине. */}
          <Path
            d="M128 210 Q160 204 196 212 Q200 216 194 222 Q170 238 140 246 Q126 248 124 234 Q122 216 128 210Z"
            {...background}
          />

          {/* Желудок под диафрагмой слева от человека: дно вверху, привратник ближе к середине. */}
          <Path
            d="M198 208 Q206 196 224 198 Q246 202 246 224 Q246 248 222 252 Q204 254 192 248 Q184 244 186 236 Q190 230 198 232 Q214 234 220 226 Q224 216 214 212 Q206 210 198 208Z"
            {...organ('stomach')}
          />

          {/* Почки у поясницы и надпочечники на их верхних полюсах — крупнее, чем в жизни, чтобы в них можно было попасть. */}
          <Ellipse cx={140} cy={290} rx={11} ry={17} {...background} />
          <Ellipse cx={220} cy={287} rx={11} ry={17} {...background} />
          <Path d="M129 278 L140 259 L151 278Z" {...organ('adrenals', t.color.accent)} />
          <Path d="M209 275 L220 256 L231 275Z" {...organ('adrenals', t.color.accent)} />
        </Svg>

        {selectedName ? (
          <View
            aria-hidden
            style={{
              position: 'absolute',
              top: tag.y * scale,
              ...(tag.side === 'right' ? { left: tag.x * scale } : { right: (WIDTH - tag.x) * scale }),
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
