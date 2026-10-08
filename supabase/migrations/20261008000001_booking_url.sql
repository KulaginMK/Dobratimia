-- Ссылку «Записаться» вписывает сам специалист в кабинете, а приложение открывает её по нажатию.
-- Поэтому в контактах может лежать только адрес обычной веб-страницы: другой вид адреса
-- (например, javascript:…) не пройдёт ни из черновика, ни при правке в Studio.
alter table public.specialist_contacts
  add constraint specialist_contacts_booking_url_web
  check (booking_url ~* '^https?://[^[:space:]]+$');
