-- Черновик карточки пишет сам специалист (submit_draft), а читает его администратор. Состав и размер черновика
-- проверяло только приложение: в обход него в черновик можно было положить что угодно и сколько угодно.
-- База принимает только поля, которые понимает approve_draft(), и не больше 20 000 знаков:
-- у настоящей карточки их в разы меньше.
alter table public.specialist_drafts
  add constraint specialist_drafts_payload_fields check (
    payload - array[
      'first_name', 'last_name', 'name_dative', 'gender', 'title', 'experience', 'education', 'specializations',
      'quote', 'about', 'format_online', 'format_offline', 'city', 'photo_path',
      'phone', 'telegram', 'booking_url', 'consent'
    ] = '{}'::jsonb
  ),
  add constraint specialist_drafts_payload_size check (length(payload::text) <= 20000);
