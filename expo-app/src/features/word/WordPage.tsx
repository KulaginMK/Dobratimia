import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { FeedHeader, PhraseCard } from '@/components/blocks';
import { BottomSheet, Button, SegmentedControl } from '@/components/ui';
import { phrasesRepo, type Phrase, type PhraseTone, type Specialist } from '@/data/repos';
import type { FeedPageProps } from '@/features/feed/FeedPager';
import { useUserId } from '@/features/session/Session';
import { useSpecialists } from '@/features/specialists/Specialists';
import { fullName, initials, roleExperienceFormat } from '@/features/specialists/labels';
import { useTheme } from '@/theme';
import { NO_REPEAT, nextPhrase } from './pick';

// Размеры шторки «Автор фразы» из макета GoodWordAuthor (.av).
const AVATAR = 56;
const ABOUT_SIZE = 15;
const ABOUT_LINE = 22;

const TONES: { value: PhraseTone; label: string }[] = [
  { value: 'sweet', label: 'Сахарный' },
  { value: 'spicy', label: 'С перчиком' },
];

// «От психотерапевта»: должность автора в родительном падеже.
const TITLE_GENITIVE: Record<string, string> = { Психотерапевт: 'психотерапевта', Психолог: 'психолога' };

type Shown = Record<PhraseTone, Phrase | null>;

/**
 * Доброе слово: фраза в одном из двух тонов, «Ещё» и сердечко. Автор фразы открывается шторкой.
 * Сердечко — отметка «нравится», а не закладка: команда видит число отметок у фразы, списка у пользователя нет.
 */
export function WordPage({ active }: FeedPageProps) {
  const t = useTheme();
  const router = useRouter();
  const { byId } = useSpecialists();
  const userId = useUserId();

  const [phrases, setPhrases] = useState<Phrase[]>([]);
  const [tone, setTone] = useState<PhraseTone>('sweet');
  const [shown, setShown] = useState<Shown>({ sweet: null, spicy: null });
  // Уже показанные фразы каждого тона: «Ещё» не повторяет последние двадцать (docs/07).
  const [recent, setRecent] = useState<Record<PhraseTone, string[]>>({ sweet: [], spicy: [] });
  const [liked, setLiked] = useState<string[]>([]);
  const [authorOpen, setAuthorOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([phrasesRepo.all(), phrasesRepo.liked(userId).catch(() => [])])
      .then(([all, likedIds]) => {
        if (!alive) return;
        const first: Shown = { sweet: nextPhrase(all, 'sweet', []), spicy: nextPhrase(all, 'spicy', []) };
        setPhrases(all);
        setLiked(likedIds);
        setShown(first);
        setRecent({ sweet: first.sweet ? [first.sweet.id] : [], spicy: first.spicy ? [first.spicy.id] : [] });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [userId]);

  const phrase = shown[tone];
  const author: Specialist | null = phrase?.authorSpecialistId ? byId(phrase.authorSpecialistId) : null;
  const isLiked = phrase ? liked.includes(phrase.id) : false;

  const more = () => {
    const next = nextPhrase(phrases, tone, recent[tone]);
    if (!next) return;
    setShown({ ...shown, [tone]: next });
    setRecent({ ...recent, [tone]: [...recent[tone], next.id].slice(-NO_REPEAT) });
  };

  const toggleLiked = () => {
    if (!phrase) return;
    setLiked(isLiked ? liked.filter((id) => id !== phrase.id) : [...liked, phrase.id]);
    // Не отправилось — сердечко всё равно остаётся нажатым до перезапуска.
    phrasesRepo.setLiked(userId, phrase.id, !isLiked).catch(() => {});
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: t.space.xl }}>
      <FeedHeader title="Доброе слово" active={active} onSosPress={() => router.push('/sos')} />
      <View style={{ paddingTop: t.space.md, paddingHorizontal: t.space.screen }}>
        <SegmentedControl accessibilityLabel="Тон фраз" options={TONES} value={tone} onChange={setTone} />
      </View>
      {phrase ? (
        <>
          <View style={{ paddingTop: t.space.lg, paddingHorizontal: t.space.screen }}>
            <PhraseCard
              tone={tone}
              text={phrase.text}
              badge={author ? `От ${TITLE_GENITIVE[author.title] ?? 'специалиста'}` : undefined}
              author={author ? `— ${fullName(author)}, ${author.title.toLowerCase()}` : undefined}
              onAuthorPress={() => setAuthorOpen(true)}
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: t.space.sm,
              paddingTop: t.space.lg,
              paddingHorizontal: t.space.screen,
            }}
          >
            {/* Отмеченная фраза: кнопка залита и для скринридера названа иначе — не только цветом. */}
            <Button
              variant={isLiked ? 'secondary' : 'outline'}
              size="lg"
              icon="heart"
              accessibilityLabel={isLiked ? 'Убрать отметку «Нравится»' : 'Нравится'}
              onPress={toggleLiked}
            />
            <View style={{ flex: 1 }}>
              <Button size="lg" fullWidth onPress={more}>
                Ещё
              </Button>
            </View>
          </View>
        </>
      ) : null}

      <BottomSheet open={authorOpen && author !== null} title="Автор фразы" onClose={() => setAuthorOpen(false)}>
        {author ? (
          <View style={{ gap: t.space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: t.space.sm }}>
              <View
                style={{
                  width: AVATAR,
                  height: AVATAR,
                  borderRadius: t.radius.full,
                  backgroundColor: t.color.surfaceAlt,
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Text aria-hidden style={[t.type.h3, { color: t.color.text }]}>
                  {initials(author)}
                </Text>
              </View>
              <View style={{ flex: 1, gap: t.space.xxs / 2 }}>
                <Text style={[t.type.h3, { color: t.color.text }]}>{fullName(author)}</Text>
                <Text style={[t.type.caption, { color: t.color.textMuted }]}>{roleExperienceFormat(author)}</Text>
              </View>
            </View>
            {author.about ? (
              <Text
                style={{
                  fontFamily: t.type.body.fontFamily,
                  fontSize: ABOUT_SIZE,
                  lineHeight: ABOUT_LINE,
                  color: t.color.text,
                }}
              >
                {author.about}
              </Text>
            ) : null}
            <Button
              fullWidth
              onPress={() => {
                setAuthorOpen(false);
                router.push(`/specialist/${author.id}`);
              }}
            >
              Открыть карточку специалиста
            </Button>
          </View>
        ) : null}
      </BottomSheet>
    </ScrollView>
  );
}
