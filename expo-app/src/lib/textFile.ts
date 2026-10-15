import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Файл с телефона: сохранить — через меню «Поделиться» (Диск, «Файлы», Telegram, почта), открыть — через выбор файла.
// Веб-версия — в textFile.web.ts.

/** Записывает текст во временный файл и открывает меню «Поделиться». */
export async function shareTextFile(name: string, text: string, mimeType: string): Promise<void> {
  const file = new File(Paths.cache, name);
  if (file.exists) file.delete();
  file.create();
  file.write(text);
  await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: name });
}

/** Человек выбирает файл; null — передумал. Файл больше maxBytes не читается. */
export async function pickTextFile(maxBytes: number): Promise<string | null> {
  // Тип не ограничиваем: Диск и мессенджеры часто отдают JSON как «двоичный файл». Содержимое проверяется потом.
  const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if ((asset.size ?? 0) > maxBytes) throw new Error('Файл слишком большой');
  // Не fetch: в Expo Go он не читает файлы из кеша приложения (TODO.md, этап 13).
  return new File(asset.uri).text();
}
