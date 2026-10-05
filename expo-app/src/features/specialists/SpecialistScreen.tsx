import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ContactAction, ScreenHeader, SpecialistPhoto, SuccessBanner } from '@/components/blocks';
import { BottomSheet, Button, ChipBadge } from '@/components/ui';
import { useCallPhone } from '@/lib/phone';
import { useTheme } from '@/theme';
import { useSpecialists } from './Specialists';
import { addedToFavorites, experienceAndFormat, fullName, roleExperienceFormat } from './labels';

// Размеры из макета SpecialistProfile: цитата, карточка «Контакты», текст разделов.
const QUOTE_PAD_V = 16;
const QUOTE_PAD_H = 18;
const QUOTE_RADIUS = 20;
const QUOTE_LINE = 25;
const CONTACTS_PAD_V = 6;
const CONTACTS_PAD_H = 18;
const CONTACTS_RADIUS = 24;
const TAGS_GAP = 6;
const TEXT_SIZE = 15;
const TEXT_LINE = 22;

/**
 * Профиль специалиста. Три состояния (docs/05): сразу после «Нравится» — с плашкой «Контакты открыты»;
 * из Избранных — без плашки; без отметки (из шторки автора в «Добром слове») — контакты закрыты.
 * Параметры: ?from=match — «Назад к подбору»; ?opened=1 — показать плашку.
 */
export function SpecialistScreen() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const call = useCallPhone();
  const { id, from, opened } = useLocalSearchParams<{ id: string; from?: string; opened?: string }>();
  const { ready, offline, retry, byId, toneOf, isLiked, contactsOf, like, unlike } = useSpecialists();
  // «Нравится» нажали прямо здесь — плашку показываем так же, как после подбора.
  const [likedHere, setLikedHere] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!ready) return <View style={{ flex: 1, backgroundColor: t.color.background }} />;
  const specialist = byId(id);
  // Неизвестный специалист (старая ссылка) — возвращаем к подбору.
  if (!specialist) return <Redirect href="/?s=match" />;

  const name = fullName(specialist);
  const liked = isLiked(specialist.id);
  const contacts = contactsOf(specialist.id);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/?s=match'));
  const text = { fontFamily: t.type.body.fontFamily, fontSize: TEXT_SIZE, lineHeight: TEXT_LINE, color: t.color.text };
  const section = { paddingTop: t.space.lg, paddingHorizontal: t.space.screen, gap: t.space.xs };
  const ways = contacts
    ? [
        contacts.phone
          ? {
              key: 'phone',
              icon: 'phone' as const,
              title: contacts.phone,
              caption: 'Телефон',
              actionLabel: 'Позвонить',
              accessibilityLabel: `Позвонить ${specialist.nameDative}`,
              onAction: () => call(contacts.phone as string),
            }
          : null,
        contacts.telegram
          ? {
              key: 'telegram',
              icon: 'message' as const,
              title: contacts.telegram,
              caption: 'Telegram',
              actionLabel: 'Написать',
              accessibilityLabel: `Написать ${specialist.nameDative} в Telegram`,
              onAction: () => {
                Linking.openURL(`https://t.me/${(contacts.telegram as string).replace(/^@/, '')}`).catch(() => {});
              },
            }
          : null,
        contacts.bookingUrl
          ? {
              key: 'booking',
              icon: 'diary' as const,
              title: 'Онлайн-запись',
              caption: 'Свободные окна на неделе',
              actionLabel: 'Записаться',
              accessibilityLabel: `Записаться к ${specialist.nameDative}`,
              onAction: () => {
                Linking.openURL(contacts.bookingUrl as string).catch(() => {});
              },
            }
          : null,
      ].filter((way) => way !== null)
    : [];

  return (
    <View style={{ flex: 1, backgroundColor: t.color.background }}>
      <ScreenHeader
        title="Специалист"
        leadingLabel={from === 'match' ? 'Назад к подбору' : 'Назад'}
        onLeadingPress={back}
        onSosPress={() => router.push('/sos')}
      />
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + t.space.xl }}>
        {liked && (opened === '1' || likedHere) ? (
          <View style={{ paddingTop: t.space.sm, paddingHorizontal: t.space.screen }}>
            <SuccessBanner lead="Контакты открыты." text={addedToFavorites(specialist)} />
          </View>
        ) : null}
        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen }}>
          <SpecialistPhoto name={name} tone={toneOf(specialist.id)} />
        </View>
        <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen, gap: t.space.xs }}>
          <Text accessibilityRole="header" style={[t.type.h1, { color: t.color.text }]}>
            {name}
          </Text>
          <Text style={[t.type.caption, { color: t.color.textMuted }]}>{roleExperienceFormat(specialist)}</Text>
          {specialist.specializations.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: TAGS_GAP }}>
              {specialist.specializations.map((tag) => (
                <ChipBadge key={tag}>{tag}</ChipBadge>
              ))}
            </View>
          ) : null}
        </View>
        {specialist.quote ? (
          <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen }}>
            <Text
              style={[
                t.type.bodyLarge,
                {
                  lineHeight: QUOTE_LINE,
                  paddingVertical: QUOTE_PAD_V,
                  paddingHorizontal: QUOTE_PAD_H,
                  borderRadius: QUOTE_RADIUS,
                  backgroundColor: t.color.surfaceAlt,
                  color: t.color.text,
                },
              ]}
            >
              {`«${specialist.quote}».`}
            </Text>
          </View>
        ) : null}

        <View style={{ paddingTop: t.space.lg, paddingHorizontal: t.space.screen }}>
          <View
            style={{
              paddingVertical: CONTACTS_PAD_V,
              paddingHorizontal: CONTACTS_PAD_H,
              borderRadius: CONTACTS_RADIUS,
              backgroundColor: t.color.surface,
              boxShadow: t.shadow.md,
            }}
          >
            {liked ? (
              <>
                <Text accessibilityRole="header" style={[t.type.h3, { paddingTop: t.space.sm, color: t.color.text }]}>
                  Контакты
                </Text>
                {ways.map((way, i) => (
                  <ContactAction
                    key={way.key}
                    icon={way.icon}
                    title={way.title}
                    caption={way.caption}
                    actionLabel={way.actionLabel}
                    accessibilityLabel={way.accessibilityLabel}
                    primary={way.key === 'phone'}
                    divider={i < ways.length - 1}
                    onAction={way.onAction}
                  />
                ))}
                {contacts === null ? (
                  <Text style={[t.type.caption, { paddingVertical: t.space.sm, color: t.color.textMuted }]}>
                    Специалист пока не опубликовал контакты.
                  </Text>
                ) : null}
                {/* Отметка поставлена без сети: она не потеряна, контакты придут, когда сеть появится. */}
                {contacts === undefined && offline ? (
                  <View style={{ paddingVertical: t.space.sm, gap: t.space.sm }}>
                    <Text style={[t.type.caption, { color: t.color.textMuted }]}>
                      Нет интернета. Отметка сохранена — контакты откроются, когда появится сеть.
                    </Text>
                    <Button variant="outline" fullWidth onPress={retry}>
                      Повторить
                    </Button>
                  </View>
                ) : null}
              </>
            ) : (
              // Без отметки «Нравится» контакты с сервера не запрашиваются вообще (docs/07).
              <View style={{ paddingVertical: t.space.sm, gap: t.space.sm }}>
                <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
                  Контакты откроются после отметки «Нравится»
                </Text>
                <Button
                  icon="heart"
                  fullWidth
                  onPress={() => {
                    like(specialist.id);
                    setLikedHere(true);
                  }}
                >
                  Нравится
                </Button>
              </View>
            )}
          </View>
        </View>

        {specialist.about ? (
          <View style={section}>
            <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
              О себе
            </Text>
            <Text style={text}>{specialist.about}</Text>
          </View>
        ) : null}
        <View style={section}>
          <Text accessibilityRole="header" style={[t.type.h3, { color: t.color.text }]}>
            Опыт и формат
          </Text>
          <Text style={text}>{experienceAndFormat(specialist)}</Text>
        </View>

        {liked ? (
          <View style={section}>
            <Text style={[t.type.caption, { color: t.color.textMuted }]}>
              Контакты опубликованы с согласия специалиста. Связывайтесь напрямую — переписки внутри приложения нет.
            </Text>
            <Button variant="text" fullWidth onPress={() => setConfirming(true)}>
              Убрать из избранных
            </Button>
          </View>
        ) : null}
      </ScrollView>

      <BottomSheet open={confirming} title="Убрать из избранных?" onClose={() => setConfirming(false)}>
        <View style={{ gap: t.space.md }}>
          <Text style={[t.type.body, { color: t.color.text }]}>Контакты специалиста снова скроются.</Text>
          <Button
            fullWidth
            onPress={() => {
              setConfirming(false);
              unlike(specialist.id);
              back();
            }}
          >
            Убрать
          </Button>
          <Button variant="outline" fullWidth onPress={() => setConfirming(false)}>
            Оставить
          </Button>
        </View>
      </BottomSheet>
    </View>
  );
}
