import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BulletItem, EmergencyStrip, NumberedStep, ScreenHeader } from '@/components/blocks';
import { Button, Card, IconButton, TextField, useToast } from '@/components/ui';
import { PSYCH_HELPLINE } from '@/data/emergency';
import { PLAN_ITEM_MAX, PLAN_ITEMS_MAX, filledSections } from '@/data/local/safetyPlan';
import { PLAN_NOTES, PLAN_STEPS, type PlanSection } from '@/data/safetyPlan';
import { useSession } from '@/features/session/Session';
import { SignedInOnly } from '@/features/session/SignInGate';
import { useCallPhone } from '@/lib/phone';
import { useTheme } from '@/theme';
import { useSafetyPlan } from './useSafetyPlan';

// Номер телефона внутри пункта: «Мама +375 29 000-00-00». Короче 7 цифр — не номер (133 и так стоит в шаге 5).
const PHONE = /\+?\d[\d\s()-]{5,}\d/;
const PHONE_MIN_DIGITS = 7;

function phoneIn(text: string): string | null {
  const match = text.match(PHONE)?.[0];
  return match && match.replace(/\D/g, '').length >= PHONE_MIN_DIGITS ? match : null;
}

/** План на трудный момент: семь шагов и «Коробка поддержки». Сохраняется только после входа. */
export function SafetyPlanScreen() {
  return (
    <SignedInOnly
      title="Мой план"
      gate="План на трудный момент сохраняется на этом устройстве, когда вы войдёте через Google."
    >
      <PlanBody />
    </SignedInOnly>
  );
}

function PlanBody() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const call = useCallPhone();
  const { user } = useSession();
  const { plan, loaded, save } = useSafetyPlan(user?.id ?? null);
  // Пустой план сразу открывается для правки, заполненный — для чтения. Решается один раз, когда план прочитан.
  const [editing, setEditing] = useState<boolean | null>(null);
  if (loaded && editing === null) setEditing(filledSections(plan) === 0);

  const change = (section: PlanSection, items: string[]) =>
    save({ ...plan, [section]: items }).catch(() =>
      toast.show({ message: 'Не удалось сохранить план. Попробуйте ещё раз.', tone: 'error' }),
    );
  const sectionProps = (section: PlanSection) => ({
    items: plan[section],
    editing: !!editing,
    onAdd: (text: string) => change(section, [...plan[section], text]),
    onRemove: (index: number) => change(section, plan[section].filter((_, i) => i !== index)),
  });
  const toggle = (
    <Button variant="secondary" fullWidth onPress={() => setEditing(!editing)}>
      {editing ? 'Готово' : 'Изменить план'}
    </Button>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title="Мой план"
        onLeadingPress={() => (router.canGoBack() ? router.back() : router.replace('/?s=anatomy'))}
        onSosPress={() => router.push('/sos')}
      />
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + t.space.xl }}
        >
          <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen, gap: t.space.sm }}>
            <Text accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
              План на трудный момент
            </Text>
            <Text style={[t.type.body, { color: t.color.textMuted }]}>
              Составьте его в спокойный день, своими словами. Когда станет тяжело, откройте план и идите по шагам
              сверху вниз, пока не станет легче. План хранится только на этом устройстве.
            </Text>
            {loaded ? toggle : null}
          </View>

          {loaded ? (
            <>
              {PLAN_STEPS.map((step, i) => (
                <View
                  key={step.id}
                  style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen, gap: t.space.sm }}
                >
                  <NumberedStep number={i + 1}>
                    <Text style={t.type.bodyStrong}>{step.title}</Text>
                  </NumberedStep>
                  <SectionCard
                    label={step.title}
                    hint={step.hint}
                    {...sectionProps(step.id)}
                    extra={
                      step.id === 'pros' ? (
                        <EmergencyStrip
                          label="Экстренная психологическая помощь"
                          number={PSYCH_HELPLINE}
                          onCall={() => call(PSYCH_HELPLINE)}
                        />
                      ) : null
                    }
                  />
                </View>
              ))}

              <View style={{ paddingTop: t.space['2xl'], paddingHorizontal: t.space.screen, gap: t.space.sm }}>
                <Text accessibilityRole="header" style={[t.type.h2, { color: t.color.text }]}>
                  {PLAN_NOTES.title}
                </Text>
                <SectionCard label={PLAN_NOTES.title} hint={PLAN_NOTES.hint} {...sectionProps('notes')} />
              </View>

              {editing ? (
                <View style={{ paddingTop: t.space.xl, paddingHorizontal: t.space.screen }}>{toggle}</View>
              ) : null}
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

type SectionProps = {
  /** Название шага: для подписи поля и кнопок у скринридера. */
  label: string;
  hint: string;
  items: string[];
  editing: boolean;
  onAdd: (text: string) => void;
  onRemove: (index: number) => void;
  /** Что всегда стоит в шаге: номер 133 у «Специалистов и служб». */
  extra?: React.ReactNode;
};

/** Пункты одного шага. При правке — удалить пункт и поле «Добавить», при чтении — звонок по номеру из пункта. */
function SectionCard({ label, hint, items, editing, onAdd, onRemove, extra }: SectionProps) {
  const t = useTheme();
  const call = useCallPhone();
  const [draft, setDraft] = useState('');
  const add = () => {
    const text = draft.trim();
    if (!text) return;
    onAdd(text);
    setDraft('');
  };

  return (
    <Card>
      <View style={{ gap: t.space.sm }}>
        {items.map((item, i) => {
          const phone = editing ? null : phoneIn(item);
          return (
            <View key={`${i}:${item}`} style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.xs }}>
              <View style={{ flex: 1 }}>
                <BulletItem>{item}</BulletItem>
              </View>
              {editing ? (
                <IconButton icon="close" accessibilityLabel={`Удалить пункт: ${item}`} onPress={() => onRemove(i)} />
              ) : phone ? (
                <IconButton
                  icon="phone"
                  color={t.color.primary}
                  accessibilityLabel={`Позвонить: ${item}`}
                  onPress={() => call(phone)}
                />
              ) : null}
            </View>
          );
        })}
        {extra}
        {editing || items.length === 0 ? (
          <Text style={[t.type.caption, { color: t.color.textMuted }]}>{hint}</Text>
        ) : null}
        {editing && items.length < PLAN_ITEMS_MAX ? (
          <View style={{ gap: t.space.xs }}>
            <TextField
              accessibilityLabel={`Новый пункт: ${label}`}
              placeholder="Свой пункт"
              value={draft}
              maxLength={PLAN_ITEM_MAX}
              sensitive
              onChange={setDraft}
            />
            <Button variant="outline" disabled={!draft.trim()} onPress={add} style={{ alignSelf: 'flex-start' }}>
              Добавить
            </Button>
          </View>
        ) : null}
      </View>
    </Card>
  );
}
