import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { FeedHeader, InfoNote, LikeStamp, PullHint, SpecialistCard, type PhotoTone } from '@/components/blocks';
import { Button, EmptyState, Skeleton } from '@/components/ui';
import type { Specialist } from '@/data/repos';
import type { FeedPageProps } from '@/features/feed/FeedPager';
import { useReportScrollTop } from '@/features/feed/useReportScrollTop';
import { useSpecialists } from '@/features/specialists/Specialists';
import { formatAndCity, fullName, roleAndExperience } from '@/features/specialists/labels';
import { useTheme } from '@/theme';

// Пороги свайпа — те же, что у ленты (docs/06): 60 dp или скорость больше 500 dp/с.
const SWIPE_DISTANCE = 60;
const SWIPE_VELOCITY = 500;
// Сдвиг, после которого жест считается горизонтальным; вертикальный уходит ленте — «потянуть вниз».
const AXIS_LOCK = 12;
// Наклон карточки из макета MatchSwipe: 9° при сдвиге на 64; дальше — не больше 15°.
const TILT_SHIFT = 64;
const TILT_DEG = 9;
const TILT_MAX = 15;
// Карточка под верхней — чуть меньше, ниже и бледнее (макет MatchSwipe).
const UNDER_SCALE = 0.95;
const UNDER_SHIFT = 10;
const UNDER_OPACITY = 0.9;
// Улетающая карточка уходит за край экрана с запасом на наклон.
const FLY_SHARE = 1.4;
// Заглушка загрузки — примерно по высоте карточки специалиста.
const LOADING_CARD_HEIGHT = 480;

const quoted = (quote: string | undefined) => (quote ? `«${quote}».` : undefined);

/**
 * Ease-out, который не выходит за начало и конец. На первом кадре анимации прошедшее время бывает
 * чуть меньше нуля — с обычной кривой карточка на миг дёргалась в обратную сторону.
 */
function easeOut(progress: number): number {
  'worklet';
  const share = Math.min(1, Math.max(0, progress));
  return 1 - Math.pow(1 - share, 3);
}

/** Подбор специалиста: колода карточек. Свайп листает карточки и ленту не двигает (docs/06). */
export function MatchPage({ active, onScrollAtTop }: FeedPageProps) {
  const t = useTheme();
  const router = useRouter();
  const onScroll = useReportScrollTop(onScrollAtTop);
  const { ready, offline, retry, deck, deckPosition, deckTotal, liked, toneOf, like, reject, resetRejected } =
    useSpecialists();
  const current = deck[0];
  const count = liked.length > 0 ? ` (${liked.length})` : '';
  const openFavorites = () => router.push('/favorites');

  return (
    <ScrollView
      onScroll={onScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: t.space.xl }}
    >
      <FeedHeader title="Подбор специалиста" active={active} onSosPress={() => router.push('/sos')} />
      {!ready ? (
        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen }}>
          <Skeleton variant="card" height={LOADING_CARD_HEIGHT} />
        </View>
      ) : current ? (
        <>
          <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen }}>
            <PullHint label={`Потяните вниз — избранные контакты${count}`} onPress={openFavorites} />
          </View>
          {/* Новый специалист — новая колода: сдвиг карточки начинается с нуля. */}
          <Deck
            key={current.id}
            current={current}
            next={deck[1]}
            counter={`${deckPosition} из ${deckTotal}`}
            toneOf={toneOf}
            onLike={() => {
              like(current.id);
              router.push(`/specialist/${current.id}?from=match&opened=1`);
            }}
            onReject={() => reject(current.id)}
          />
        </>
      ) : offline ? (
        // Подбор работает только с сетью (docs/08). Тимки здесь нет: это ошибка, а не пустое состояние.
        <View style={{ paddingTop: t.space['3xl'], paddingHorizontal: t.space.screen, gap: t.space.sm }}>
          <Text accessibilityRole="header" style={[t.type.h2, { color: t.color.text, textAlign: 'center' }]}>
            Нет интернета
          </Text>
          <Text style={[t.type.body, { color: t.color.textMuted, textAlign: 'center' }]}>
            Подбор специалистов работает только с сетью. Избранные контакты и SOS доступны и без неё.
          </Text>
          <Button fullWidth onPress={retry}>
            Повторить
          </Button>
          <Button variant="outline" icon="heart" fullWidth onPress={openFavorites}>
            {`Открыть избранные${count}`}
          </Button>
        </View>
      ) : (
        <>
          <View style={{ paddingTop: t.space['3xl'] }}>
            {/* В макете текст кончается словами «мы пришлём уведомление». Решение владельца (этап 14): вернуть их,
                когда появятся push-уведомления с сервера, — локальные о новом специалисте сообщить не могут. */}
            <EmptyState
              icon="specialist"
              title="Специалисты закончились"
              text="Вы посмотрели всех, кто сейчас принимает. Новые специалисты появляются каждую неделю."
            />
          </View>
          <View style={{ paddingTop: t.space.xs, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
            <Button size="lg" icon="heart" fullWidth onPress={openFavorites}>
              {`Открыть избранные${count}`}
            </Button>
            <Button variant="outline" fullWidth onPress={resetRejected}>
              Посмотреть всех заново
            </Button>
          </View>
          <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen }}>
            <InfoNote
              icon="sos"
              text="Нужна помощь сегодня? Загляните в "
              linkLabel="службу вашего вуза"
              tail="."
              onLinkPress={() => router.push('/sos/university')}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

type DeckProps = {
  current: Specialist;
  next?: Specialist;
  /** «3 из 12». */
  counter: string;
  toneOf: (id: string) => PhotoTone;
  onLike: () => void;
  onReject: () => void;
};

/** Верхняя карточка, следующая под ней и кнопки. Вправо — «Нравится», влево — «Не подходит». */
function Deck({ current, next, counter, toneOf, onLike, onReject }: DeckProps) {
  const t = useTheme();
  const reduced = useReducedMotion();
  const { width } = useWindowDimensions();
  const x = useSharedValue(0);
  // Карточку дотянули вправо до порога: отпустить — значит «Нравится».
  const [armed, setArmed] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const timing = { duration: t.motion.feed, easing: easeOut };

  /** Кнопки делают то же, что свайп: карточка улетает, потом срабатывает действие. */
  const leave = (toRight: boolean) => {
    if (leaving) return;
    setLeaving(true);
    const done = toRight ? onLike : onReject;
    if (reduced) {
      done();
      return;
    }
    x.set(
      withTiming((toRight ? 1 : -1) * width * FLY_SHARE, timing, (finished) => {
        if (finished) scheduleOnRN(done);
      }),
    );
  };

  const pan = Gesture.Pan()
    .enabled(!leaving)
    .activeOffsetX([-AXIS_LOCK, AXIS_LOCK])
    .failOffsetY([-AXIS_LOCK, AXIS_LOCK])
    .onUpdate((e) => {
      x.set(e.translationX);
    })
    .onEnd((e) => {
      const fast = Math.abs(e.velocityX) > SWIPE_VELOCITY;
      const far = Math.abs(e.translationX) > SWIPE_DISTANCE;
      if (!fast && !far) {
        x.set(withTiming(0, timing));
        return;
      }
      scheduleOnRN(leave, (fast ? e.velocityX : e.translationX) > 0);
    });

  useAnimatedReaction(
    () => x.get() > SWIPE_DISTANCE,
    (now, before) => {
      if (now !== before) scheduleOnRN(setArmed, now);
    },
  );

  const topStyle = useAnimatedStyle(() => {
    const tilt = Math.min(TILT_MAX, Math.max(-TILT_MAX, (x.get() / TILT_SHIFT) * TILT_DEG));
    return { transform: [{ translateX: x.get() }, { rotate: `${tilt}deg` }] };
  });
  const stampStyle = useAnimatedStyle(() => ({ opacity: Math.min(1, Math.max(0, x.get() / SWIPE_DISTANCE)) }));
  // Чем дальше уходит верхняя карточка, тем ближе нижняя к своему полному размеру.
  const underStyle = useAnimatedStyle(() => {
    const share = Math.min(1, Math.abs(x.get()) / (width / 2));
    return {
      opacity: UNDER_OPACITY + (1 - UNDER_OPACITY) * share,
      transform: [{ translateY: UNDER_SHIFT * (1 - share) }, { scale: UNDER_SCALE + (1 - UNDER_SCALE) * share }],
    };
  });

  return (
    <>
      <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen }}>
        <View>
          {next ? (
            <Animated.View
              aria-hidden
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={[
                StyleSheet.absoluteFill,
                { borderRadius: t.radius['2xl'], backgroundColor: t.color.surface, overflow: 'hidden' },
                underStyle,
              ]}
            >
              <SpecialistCard
                name={fullName(next)}
                subtitle={roleAndExperience(next)}
                specializations={next.specializations}
                quote={quoted(next.quote)}
                format={formatAndCity(next)}
                photoUri={next.photoUri}
                tone={toneOf(next.id)}
              />
            </Animated.View>
          ) : null}
          <GestureDetector gesture={pan}>
            <Animated.View
              accessible
              accessibilityLabel={`Карточка специалиста ${counter}`}
              style={[{ transformOrigin: 'bottom', userSelect: 'none' }, topStyle]}
            >
              <SpecialistCard
                name={fullName(current)}
                subtitle={roleAndExperience(current)}
                specializations={current.specializations}
                quote={quoted(current.quote)}
                format={formatAndCity(current)}
                counter={counter}
                photoUri={current.photoUri}
                tone={toneOf(current.id)}
                photoOverlay={
                  <Animated.View style={[StyleSheet.absoluteFill, stampStyle]}>
                    <LikeStamp />
                  </Animated.View>
                }
              />
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
      <View style={{ flexDirection: 'row', gap: t.space.sm, paddingTop: t.space.md, paddingHorizontal: t.space.screen }}>
        <View style={{ flex: 1 }}>
          <Button variant="outline" size="lg" icon="close" fullWidth onPress={() => leave(false)}>
            Не подходит
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button size="lg" icon="heart" fullWidth onPress={() => leave(true)}>
            Нравится
          </Button>
        </View>
      </View>
      <Text
        style={[
          t.type.caption,
          { paddingTop: t.space.sm, paddingHorizontal: t.space.xl, color: t.color.textMuted, textAlign: 'center' },
        ]}
      >
        {armed ? 'Отпустите карточку — откроются контакты' : 'Свайп листает карточки. К другим экранам — через точки внизу'}
      </Text>
    </>
  );
}
