import { describe, expect, jest, test } from '@jest/globals';
import type { DassEntry } from '@/data/local/dass';
import type { MoodEntry } from '@/data/local/mood';
import { scoreDass } from '@/features/dass/score';
import { BackupError, buildBackup, mergeDass, mergeMood, parseBackup } from './backup';

// Модули дневника тянут за собой хранилище устройства; самому файлу дневника оно не нужно.
jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const answers = (value: number) => Array<number>(21).fill(value);
const test1: DassEntry = { date: '2026-10-01', answers: answers(1), ...scoreDass(answers(1)) };
const mood: MoodEntry[] = [
  { date: '2026-10-01', time: '21:05', level: 4, note: 'Сдала анатомию' },
  { date: '2026-10-02', time: '09:10', level: 2 },
];

describe('файл дневника', () => {
  test('выгрузка и загрузка возвращают те же отметки и тесты', () => {
    const parsed = parseBackup(buildBackup(mood, [test1], new Date('2026-10-15T10:00:00Z')));
    expect(parsed).toEqual({ mood, dass: [test1], skipped: 0 });
  });

  test('чужой файл, не JSON и файл из более новой версии не загружаются', () => {
    expect(() => parseBackup('не json')).toThrow(BackupError);
    expect(() => parseBackup('{"mood": []}')).toThrow(BackupError);
    expect(() => parseBackup('{"format": "dobratimia-diary", "version": 99}')).toThrow(BackupError);
  });

  test('испорченные записи пропускаются, баллы теста пересчитываются из ответов', () => {
    const file = JSON.stringify({
      format: 'dobratimia-diary',
      version: 1,
      mood: [
        { date: '2026-10-03', time: '10:00', level: 3, note: 'x'.repeat(500) },
        { date: '2026-13-40', time: '10:00', level: 3 },
        { date: '2026-10-04', time: '10:00', level: 9 },
        { date: '2026-10-05', level: 2 },
      ],
      dass: [
        { date: '2026-10-03', answers: answers(3), stress: 0, anxiety: 0, depression: 0 },
        { date: '2026-10-04', answers: answers(4) },
        { date: '2026-10-05', answers: [1, 2] },
      ],
    });
    const parsed = parseBackup(file);
    expect(parsed.skipped).toBe(5);
    expect(parsed.mood).toHaveLength(1);
    expect(parsed.mood[0].note).toHaveLength(200);
    expect(parsed.dass).toEqual([{ date: '2026-10-03', answers: answers(3), stress: 42, anxiety: 42, depression: 42 }]);
  });

  test('загрузка не перезаписывает отмеченные дни и не удваивает тесты', () => {
    const today: MoodEntry = { date: '2026-10-02', time: '20:00', level: 5 };
    const merged = mergeMood([today], mood);
    expect(merged.added).toBe(1);
    expect(merged.entries).toEqual([mood[0], today]);

    const again = mergeDass([test1], [test1, { ...test1, date: '2026-09-01' }]);
    expect(again.added).toBe(1);
    expect(again.entries.map((entry) => entry.date)).toEqual(['2026-09-01', '2026-10-01']);
  });
});
