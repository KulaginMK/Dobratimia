import { describe, expect, test } from '@jest/globals';
import { feedbackMailUrl } from './mail';

describe('feedbackMailUrl', () => {
  test('письмо на почту команды; знаки & и ? в тексте не ломают адрес', () => {
    const url = feedbackMailUrl('  Привет & спасибо? 100%  ', 'Android');
    expect(url.startsWith('mailto:dobratimia@gmail.com?subject=')).toBe(true);
    const params = new URLSearchParams(url.split('?')[1]);
    expect(params.get('subject')).toBe('Добратимия: обратная связь');
    expect(params.get('body')?.startsWith('Привет & спасибо? 100%\n\n—\nДобратимия ')).toBe(true);
    expect(params.get('body')?.endsWith(' · Android')).toBe(true);
  });
});
