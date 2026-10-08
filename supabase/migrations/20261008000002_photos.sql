-- Фото специалистов (handoff/docs/08): хранилище Supabase Storage, bucket specialist-photos.
-- Читают все по прямой ссылке (bucket публичный): фото показывается на карточке в подборе.
-- Приложение перед загрузкой уменьшает снимок и сохраняет его как JPEG, поэтому другие форматы
-- и файлы больше 2 МБ хранилище не принимает.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('specialist-photos', 'specialist-photos', true, 2097152, array['image/jpeg'])
on conflict (id) do nothing;

-- Загружает только специалист и только в папку со своим id. Заменить или удалить файл нельзя:
-- прежнее фото остаётся на карточке, пока администратор не одобрит черновик с новым.
create policy specialist_photos_insert on storage.objects for insert to authenticated
  with check (
    bucket_id = 'specialist-photos'
    and (storage.foldername(name))[1] = public.my_specialist_id()::text
  );

-- Свои файлы специалист видит в списке хранилища; чужих — нет. Показу фото по прямой ссылке это правило не нужно.
create policy specialist_photos_read_own on storage.objects for select to authenticated
  using (
    bucket_id = 'specialist-photos'
    and (storage.foldername(name))[1] = public.my_specialist_id()::text
  );

-- Путь к фото приходит из черновика специалиста, поэтому в карточке может стоять только файл из её же папки.
alter table public.specialists
  add constraint specialists_photo_path_own
  check (photo_path ~ ('^' || id::text || '/[A-Za-z0-9_-]+\.jpg$'));
