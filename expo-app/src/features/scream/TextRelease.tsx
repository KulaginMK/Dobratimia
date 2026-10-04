import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';
import { RELEASE_MS, buildPieces, type Piece, type ReleaseEffect } from './release';

// За какую долю анимации полосы шредера расходятся в стороны.
const CUT_SHARE = 0.1;

type Props = {
  text: string;
  effect: ReleaseEffect;
  /** На сколько текст в поле был прокручен (веб: длинный текст прокручивается внутри поля). */
  scrollTop: number;
};

/**
 * Текст, который разлетается после «Отпустить». Лежит поверх поля ввода, ровно на месте его текста.
 * Каждый кусок — окошко, в котором виден свой участок того же текста; окошки улетают по-разному.
 */
export function TextRelease({ text, effect, scrollTop }: Props) {
  const t = useTheme();
  const [field, setField] = useState<{ width: number; pieces: Piece[] } | null>(null);
  const progress = useSharedValue(0);
  // Те же шрифт и высота строки, что у текста в поле: переносы строк совпадают.
  const textStyle = [t.type.body, { color: t.color.text }];

  const onLayout = (event: LayoutChangeEvent) => {
    if (field) return;
    const { width, height } = event.nativeEvent.layout;
    setField({ width, pieces: buildPieces(effect, width, height, text.length) });
  };

  const ready = field !== null;
  useEffect(() => {
    if (!ready) return;
    // Сюда попадаем, только если «Уменьшить движение» выключено: иначе текст исчезает сразу, без анимации.
    progress.set(
      withTiming(1, { duration: RELEASE_MS[effect], easing: Easing.linear, reduceMotion: ReduceMotion.Never }),
    );
  }, [ready, effect, progress]);

  return (
    <View
      onLayout={onLayout}
      // Скринридеру улетающие копии текста не нужны.
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={StyleSheet.absoluteFill}
    >
      {field ? (
        field.pieces.map((piece) => (
          <PieceView key={piece.key} piece={piece} progress={progress}>
            <Text
              textBreakStrategy="simple"
              style={[textStyle, { position: 'absolute', left: -piece.x, top: -piece.y - scrollTop, width: field.width }]}
            >
              {text}
            </Text>
          </PieceView>
        ))
      ) : (
        // Один кадр, пока поле измеряется: текст стоит на месте целиком.
        <View style={[StyleSheet.absoluteFill, { overflow: 'hidden' }]}>
          <Text textBreakStrategy="simple" style={[textStyle, { marginTop: -scrollTop }]}>
            {text}
          </Text>
        </View>
      )}
    </View>
  );
}

type PieceProps = {
  piece: Piece;
  progress: SharedValue<number>;
  children: React.ReactNode;
};

function PieceView({ piece, progress, children }: PieceProps) {
  const style = useAnimatedStyle(() => {
    const total = progress.get();
    const own = Math.min(1, Math.max(0, (total - piece.delay) / piece.span));
    const eased = piece.accelerate ? own * own : 1 - Math.pow(1 - own, 3);
    const fade = own <= piece.fadeFrom ? 1 : 1 - (own - piece.fadeFrom) / (1 - piece.fadeFrom);
    return {
      opacity: fade,
      transform: [
        { translateX: piece.cut * Math.min(1, total / CUT_SHARE) + piece.dx * eased },
        { translateY: piece.dy * eased + piece.fall * own * own },
        { rotate: `${piece.rotate * eased}deg` },
        { scale: 1 + (piece.scale - 1) * eased },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: piece.x,
          top: piece.y,
          width: piece.width,
          height: piece.height,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}
