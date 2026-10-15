import { useToast } from '@/components/ui';
import { useDassHistory } from '@/features/dass/DassHistory';
import { useMoodDiary } from '@/features/mood/MoodDiary';
import { toDateKey } from '@/lib/dates';
import { plural } from '@/lib/plural';
import { pickTextFile, shareTextFile } from '@/lib/textFile';
import { BACKUP_MAX_BYTES, BackupError, backupFileName, buildBackup, mergeDass, mergeMood, parseBackup } from './backup';

/** «Скачать дневник» и «Загрузить из файла» из профиля. Только для вошедшего: у гостя дневника нет. */
export function useDiaryBackup() {
  const toast = useToast();
  const mood = useMoodDiary();
  const dass = useDassHistory();

  const exportFile = async () => {
    const now = new Date();
    try {
      await shareTextFile(backupFileName(toDateKey(now)), buildBackup(mood.entries, dass.entries, now), 'application/json');
    } catch (error) {
      if (__DEV__) console.warn('Экспорт дневника:', error);
      toast.show({ message: 'Не удалось сохранить файл. Попробуйте ещё раз.', tone: 'error' });
    }
  };

  const importFile = async () => {
    let text: string | null;
    try {
      text = await pickTextFile(BACKUP_MAX_BYTES);
    } catch (error) {
      if (__DEV__) console.warn('Импорт дневника:', error);
      toast.show({ message: 'Не удалось открыть файл.', tone: 'error' });
      return;
    }
    if (text === null) return;
    let backup: ReturnType<typeof parseBackup>;
    try {
      backup = parseBackup(text);
    } catch (error) {
      const message =
        error instanceof BackupError && error.message === 'newer'
          ? 'Файл сделан в более новой версии Добратимии. Обновите приложение.'
          : 'Это не файл дневника Добратимии.';
      toast.show({ message, tone: 'error' });
      return;
    }
    const moodMerged = mergeMood(mood.entries, backup.mood);
    const dassMerged = mergeDass(dass.entries, backup.dass);
    mood.setAll(moodMerged.entries);
    dass.setAll(dassMerged.entries);
    const added = moodMerged.added + dassMerged.added;
    toast.show({
      message:
        added === 0
          ? 'Новых записей в файле нет: всё уже есть в дневнике.'
          : `Добавлено: ${moodMerged.added} ${plural(moodMerged.added, 'отметка', 'отметки', 'отметок')}, ` +
            `${dassMerged.added} ${plural(dassMerged.added, 'тест', 'теста', 'тестов')}.`,
      tone: 'success',
    });
  };

  return { exportFile, importFile };
}
