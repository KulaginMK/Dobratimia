import { describe, expect, jest, test } from '@jest/globals';
import { OfflineError } from '@/data/repos/errors';
import { unwrap } from './client';

jest.mock('@react-native-async-storage/async-storage', () =>
  jest.requireActual('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

const failed = (status: number) => ({ data: null, error: { message: 'сбой', code: 'X' }, status });

describe('ответ сервера', () => {
  test('запрос не дошёл или сервер сбоит — это «нет сети»: действие повторяют, отметка ждёт в очереди', () => {
    expect(() => unwrap(failed(0))).toThrow(OfflineError);
    expect(() => unwrap(failed(503))).toThrow(OfflineError);
  });

  test('отказ сервера — обычная ошибка с кодом: очередь его не повторяет', () => {
    const refuse = () => unwrap(failed(403));
    expect(refuse).toThrow('сбой');
    expect(refuse).not.toThrow(OfflineError);
  });

  test('успешный ответ отдаёт данные', () => {
    expect(unwrap({ data: [1, 2], error: null, status: 200 })).toEqual([1, 2]);
  });
});
