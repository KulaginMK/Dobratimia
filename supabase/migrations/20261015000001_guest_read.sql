-- Вход необязателен (решения владельца от 14 и 15 октября 2026 года): гость смотрит карточки специалистов
-- и фразы «Доброго слова». Только опубликованные. Контакты, отметки «Нравится» и сердечки — по-прежнему
-- только после входа: их таблицы гостю закрыты.
grant select on table public.specialists to anon;
create policy specialists_read_guest on public.specialists for select to anon using (published);

grant select on table public.phrases to anon;
create policy phrases_read_guest on public.phrases for select to anon using (published);
