import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';

// Карточка в подборе занимает всю ширину экрана: на плотных экранах это около 1100 точек.
const PHOTO_WIDTH = 1080;
const PHOTO_QUALITY = 0.8;
// Фото стоит в широкой рамке: в подборе она примерно 1,9 : 1, в профиле — 1,6 : 1. Кадр 16 : 9 — между ними,
// поэтому специалист сам видит при обрезке почти то же, что увидят студенты, и лицо не срезается.
const PHOTO_ASPECT: [number, number] = [16, 9];

/** Подготовленный снимок: адрес на устройстве — для показа, содержимое в Base64 — для загрузки. */
export type PickedPhoto = { uri: string; base64: string };

/**
 * «Заменить фото»: выбрать снимок из галереи и подготовить его к загрузке. null — человек закрыл выбор.
 * Камера не используется, разрешений на Android выбор из галереи не требует.
 * Снимок всегда пересохраняется: он становится в разы легче и на Android и в вебе теряет служебные данные камеры —
 * в том числе место съёмки, которому нечего делать в открытом хранилище.
 */
export async function pickPhoto(): Promise<PickedPhoto | null> {
  const picked = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: PHOTO_ASPECT,
    quality: 1,
  });
  if (picked.canceled) return null;
  const [asset] = picked.assets;
  const image = await ImageManipulator.manipulate(asset.uri)
    .resize({ width: Math.min(asset.width || PHOTO_WIDTH, PHOTO_WIDTH) })
    .renderAsync();
  // Содержимое берём сразу в Base64: прочитать сохранённый файл по адресу на телефоне удаётся не всегда
  // (в Expo Go в пути есть знаки %, и чтение файла отвечает «File not found»).
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: PHOTO_QUALITY, base64: true });
  if (!saved.base64) throw new Error('Не удалось подготовить снимок');
  return { uri: saved.uri, base64: saved.base64 };
}
