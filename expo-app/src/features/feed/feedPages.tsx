import type React from 'react';
import { AnatomyPage } from '@/features/anatomy/AnatomyPage';
import { HomePage } from '@/features/home/HomePage';
import { MatchPage } from '@/features/match/MatchPage';
import { TechniquesPage } from '@/features/techniques/TechniquesPage';
import { signedInPage } from '@/features/session/SignInGate';
import { WordPage } from '@/features/word/WordPage';
import type { FeedPageProps } from './FeedPager';
import type { FeedKey } from './feedScreens';

/** Экраны ленты слева направо: Анатомия · Техники · Главная · Подбор специалиста · Доброе слово. */
export const feedPages: Record<FeedKey, React.ComponentType<FeedPageProps>> = {
  anatomy: AnatomyPage,
  techniques: TechniquesPage,
  home: HomePage,
  match: signedInPage(MatchPage, 'Подбор специалиста', 'Карточки психологов и их контакты доступны, когда вы войдёте через Google.'),
  word: signedInPage(WordPage, 'Доброе слово', 'Фразы поддержки доступны, когда вы войдёте через Google.'),
};
