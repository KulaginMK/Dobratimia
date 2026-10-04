import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, BackHandler, Platform, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnswerOption, ScreenHeader } from '@/components/blocks';
import { BottomSheet, Button, ProgressBar } from '@/components/ui';
import { DASS_ANSWERS, DASS_COUNT, DASS_STATEMENTS } from '@/data/dass';
import { plural } from '@/lib/plural';
import { useTheme } from '@/theme';
import { useDassHistory } from './DassHistory';
import { isComplete } from './score';

// Весь тест — около 5 минут, как на кнопке «Тест DASS-21 · 5 минут» на Главной.
const TEST_MINUTES = 5;

/** «≈ 3 минуты» — сколько осталось после вопроса с этим номером. */
function timeLeft(number: number): string {
  const minutes = Math.max(1, Math.round(((DASS_COUNT - number) * TEST_MINUTES) / DASS_COUNT));
  return `≈ ${minutes} ${plural(minutes, 'минута', 'минуты', 'минут')}`;
}

/** DassQuestion: 21 утверждение по одному. Ответы живут в памяти экрана: незаконченный тест не сохраняется. */
export function DassTestScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const history = useDassHistory();
  const [answers, setAnswers] = useState<(number | null)[]>(() => Array<number | null>(DASS_COUNT).fill(null));
  const [index, setIndex] = useState(0);
  const [confirming, setConfirming] = useState(false);
  const statement = useRef<Text>(null);

  const number = index + 1;
  const answer = answers[index];
  const started = answers.some((item) => item !== null);

  const leave = () => (router.canGoBack() ? router.back() : router.replace('/'));
  /** Крестик и системная «Назад»: если ответы уже есть — сначала спросить (docs/06). */
  const close = () => (started ? setConfirming(true) : leave());

  // Пока шторка закрыта, системную «Назад» перехватываем сами; открытую шторку она закроет сама.
  useEffect(() => {
    if (!started || confirming) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      setConfirming(true);
      return true;
    });
    return () => subscription.remove();
  }, [started, confirming]);

  /** Новый вопрос — фокус скринридера на его текст (docs/09). */
  const show = (next: number) => {
    setIndex(next);
    if (Platform.OS !== 'web' && statement.current) {
      AccessibilityInfo.sendAccessibilityEvent(statement.current, 'focus');
    }
  };

  const pick = (score: number) => setAnswers(answers.map((item, i) => (i === index ? score : item)));

  const next = () => {
    if (index < DASS_COUNT - 1) {
      show(index + 1);
      return;
    }
    if (!isComplete(answers)) return;
    history.add(answers);
    router.replace('/dass/result');
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title="DASS-21"
        leading="close"
        leadingLabel="Прервать тест"
        onLeadingPress={close}
        onSosPress={() => router.push('/sos')}
      />
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + t.space.xl }}>
        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen, gap: t.space.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: t.space.sm }}>
            <Text style={[t.type.caption, { color: t.color.textMuted }]}>{`Вопрос ${number} из ${DASS_COUNT}`}</Text>
            <Text style={[t.type.caption, { color: t.color.textMuted }]}>{timeLeft(number)}</Text>
          </View>
          <ProgressBar value={number} max={DASS_COUNT} accessibilityLabel="Прогресс теста" />
        </View>

        <View style={{ paddingTop: t.space['2xl'], paddingHorizontal: t.space.screen, gap: t.space.sm }}>
          <Text style={[t.type.caption, { color: t.color.textMuted }]}>
            Насколько это подходило вам за последнюю неделю?
          </Text>
          <Text ref={statement} accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
            {DASS_STATEMENTS[index]}
          </Text>
        </View>

        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Ответ"
          style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}
        >
          {DASS_ANSWERS.map((text, score) => (
            <AnswerOption key={text} text={text} score={score} selected={answer === score} onPress={() => pick(score)} />
          ))}
        </View>
        <Text
          style={[t.type.caption, { paddingTop: t.space.md, paddingHorizontal: t.space.xl, color: t.color.textMuted }]}
        >
          Здесь нет правильных ответов. Отвечайте так, как было на самом деле.
        </Text>

        <View
          style={{
            marginTop: 'auto',
            flexDirection: 'row',
            gap: t.space.sm,
            paddingTop: t.space.xl,
            paddingHorizontal: t.space.screen,
          }}
        >
          {/* «Назад» — по ширине своей надписи, «Дальше» занимает остальное: так на макете. */}
          <Button variant="outline" size="lg" icon="chevronLeft" disabled={index === 0} onPress={() => show(index - 1)}>
            Назад
          </Button>
          <View style={{ flex: 1 }}>
            <Button size="lg" iconRight="chevronRight" fullWidth disabled={answer === null} onPress={next}>
              Дальше
            </Button>
          </View>
        </View>
      </ScrollView>

      <BottomSheet open={confirming} title="Прервать тест?" onClose={() => setConfirming(false)}>
        <View style={{ gap: t.space.md }}>
          <Text style={[t.type.body, { color: t.color.text }]}>Ответы не сохранятся.</Text>
          <Button fullWidth onPress={() => setConfirming(false)}>
            Продолжить тест
          </Button>
          <Button variant="outline" fullWidth onPress={leave}>
            Прервать
          </Button>
        </View>
      </BottomSheet>
    </View>
  );
}
