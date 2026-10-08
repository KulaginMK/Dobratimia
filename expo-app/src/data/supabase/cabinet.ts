import { cardFields, type Cabinet, type CabinetRepo, type CardFields } from '@/data/repos/CabinetRepo';
import { OfflineError } from '@/data/repos/errors';
import { request, supabase } from './client';
import { CARD_COLUMNS, PHOTO_BUCKET, photoUrl, toContacts, toSpecialist, type SpecialistRow } from './specialists';

type CardRow = SpecialistRow & { published: boolean };
type ContactsRow = { phone: string | null; telegram: string | null; booking_url: string | null; consent: boolean };
type DraftRow = {
  payload: Record<string, unknown>;
  status: 'pending' | 'changes_requested';
  admin_comment: string | null;
};
type StatsRow = { total: number; weeks: number[] | null };

/**
 * Поля формы → черновик. Названия — как колонки таблиц: так их читает approve_draft().
 * Очищенное поле уходит как null. Имя в дательном падеже и пол не трогаем: их правит администратор.
 * Фото попадает в черновик, только если его заменили: чего в черновике нет, approve_draft() не меняет.
 */
export function toPayload(fields: CardFields) {
  return {
    first_name: fields.firstName,
    last_name: fields.lastName,
    title: fields.title || null,
    experience: fields.experience || null,
    education: fields.education || null,
    specializations: fields.specializations,
    quote: fields.quote || null,
    about: fields.about || null,
    format_online: fields.formatOnline,
    format_offline: fields.formatOffline,
    city: fields.city || null,
    phone: fields.phone || null,
    telegram: fields.telegram || null,
    booking_url: fields.bookingUrl || null,
    consent: fields.consent,
    ...(fields.newPhotoPath ? { photo_path: fields.newPhotoPath } : {}),
  };
}

/** Черновик поверх опубликованных полей. Чего в черновике нет — берётся из опубликованной версии. */
export function withDraft(base: CardFields, payload: Record<string, unknown>): CardFields {
  const text = (key: string, was: string) => {
    if (!(key in payload)) return was;
    const value = payload[key];
    return typeof value === 'string' ? value : '';
  };
  const flag = (key: string, was: boolean) => (typeof payload[key] === 'boolean' ? (payload[key] as boolean) : was);
  const tags = payload.specializations;
  const photo = typeof payload.photo_path === 'string' && payload.photo_path ? payload.photo_path : undefined;
  return {
    // Имя пустым не бывает: approve_draft() пустое имя не принимает.
    firstName: text('first_name', base.firstName) || base.firstName,
    lastName: text('last_name', base.lastName) || base.lastName,
    title: text('title', base.title),
    specializations: Array.isArray(tags)
      ? tags.filter((tag): tag is string => typeof tag === 'string')
      : base.specializations,
    quote: text('quote', base.quote),
    about: text('about', base.about),
    experience: text('experience', base.experience),
    education: text('education', base.education),
    formatOnline: flag('format_online', base.formatOnline),
    formatOffline: flag('format_offline', base.formatOffline),
    city: text('city', base.city),
    phone: text('phone', base.phone),
    telegram: text('telegram', base.telegram),
    bookingUrl: text('booking_url', base.bookingUrl),
    consent: flag('consent', base.consent),
    // Новое фото из черновика остаётся в нём и при следующем «Сохранить», пока его не одобрят.
    photoUri: photo ? photoUrl(photo) : base.photoUri,
    newPhotoPath: photo,
  };
}

/** Base64 → байты снимка. В хранилище уходит только настоящий JPEG: он начинается с байтов FF D8. */
export function jpegBytes(base64: string): Uint8Array<ArrayBuffer> {
  const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('Файл не похож на снимок JPEG');
  return bytes;
}

export function toCabinet(
  cardRow: CardRow,
  contactsRow: ContactsRow | null,
  draftRow: DraftRow | null,
  statsRow: StatsRow,
): Cabinet {
  const card = toSpecialist(cardRow);
  const published = cardFields(card, toContacts(contactsRow), contactsRow?.consent ?? false);
  return {
    card,
    published: cardRow.published,
    draft: draftRow ? { status: draftRow.status, comment: draftRow.admin_comment ?? undefined } : null,
    fields: draftRow ? withDraft(published, draftRow.payload) : published,
    stats: { total: statsRow.total, weeks: statsRow.weeks ?? [] },
  };
}

// Сервер сам знает, чья карточка: все запросы идут от имени вошедшего специалиста (правила доступа в базе).
export const supabaseCabinetRepo: CabinetRepo = {
  load: async () => {
    const id = await request<string | null>((db) => db.rpc('my_specialist_id'));
    if (!id) throw new Error('Карточка специалиста не привязана к аккаунту');
    const [card, contacts, draft, stats] = await Promise.all([
      request<CardRow>((db) => db.from('specialists').select(`${CARD_COLUMNS}, published`).eq('id', id).single()),
      request<ContactsRow | null>((db) =>
        db
          .from('specialist_contacts')
          .select('phone, telegram, booking_url, consent')
          .eq('specialist_id', id)
          .maybeSingle(),
      ),
      request<DraftRow | null>((db) =>
        db.from('specialist_drafts').select('payload, status, admin_comment').eq('specialist_id', id).maybeSingle(),
      ),
      request<StatsRow>((db) => db.rpc('specialist_like_stats')),
    ]);
    return toCabinet(card, contacts, draft, stats);
  },
  submit: async (fields) => {
    await request((db) => db.rpc('submit_draft', { p_payload: toPayload(fields) }));
  },
  uploadPhoto: async (cardId, jpegBase64) => {
    const body = jpegBytes(jpegBase64);
    // Имя файла каждый раз новое: прежнее фото остаётся на карточке, пока черновик не одобрен.
    // ponytail: старые файлы никто не удаляет; когда их накопится много — чистить по расписанию.
    const path = `${cardId}/${Date.now()}.jpg`;
    let failure: { name: string; message: string } | null;
    try {
      const { error } = await supabase().storage.from(PHOTO_BUCKET).upload(path, body, { contentType: 'image/jpeg' });
      failure = error;
    } catch {
      throw new OfflineError();
    }
    // Так хранилище помечает запрос, который не дошёл до сервера.
    if (failure?.name === 'StorageUnknownError') throw new OfflineError();
    if (failure) throw new Error(failure.message);
    return path;
  },
};
