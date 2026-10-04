import { describe, expect, test } from '@jest/globals';
import type { Phrase } from '@/data/repos';
import { nextPhrase } from './pick';

const sweet = (n: number): Phrase[] =>
  Array.from({ length: n }, (_, i) => ({ id: `s${i}`, tone: 'sweet' as const, text: `Фраза ${i}` }));
const spicy: Phrase = { id: 'p0', tone: 'spicy', text: 'С перчиком' };

describe('nextPhrase', () => {
  test('берёт фразу только своего тона', () => {
    const phrases = [...sweet(3), spicy];
    for (let i = 0; i < 20; i++) {
      expect(nextPhrase(phrases, 'spicy', [])?.id).toBe('p0');
      expect(nextPhrase(phrases, 'sweet', [])?.tone).toBe('sweet');
    }
  });

  test('не повторяет фразы из последних двадцати', () => {
    const phrases = sweet(25);
    const recent = phrases.slice(0, 20).map((phrase) => phrase.id);
    for (let i = 0; i < 50; i++) {
      expect(recent).not.toContain(nextPhrase(phrases, 'sweet', recent)?.id);
    }
  });

  test('когда фраз мало — не повторяет хотя бы только что показанную', () => {
    const phrases = sweet(3);
    for (let i = 0; i < 30; i++) {
      expect(nextPhrase(phrases, 'sweet', ['s0', 's1', 's2'])?.id).not.toBe('s2');
    }
  });

  test('фраза одна — возвращается она же; фраз нет — null', () => {
    expect(nextPhrase([spicy], 'spicy', ['p0'])?.id).toBe('p0');
    expect(nextPhrase([spicy], 'sweet', [])).toBeNull();
  });
});
