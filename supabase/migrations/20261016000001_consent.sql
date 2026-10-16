-- Согласие на обработку персональных данных (legal/consent.md и legal/consent-specialists.md, решение владельца
-- от 16 октября 2026 года). Доказывать, что согласие получено, должен оператор: в профиле хранится, какую редакцию
-- человек принял и когда. Время ставит сервер, а не приложение. Столбцы пишет только give_consent(): прямого права
-- менять их у пользователя нет (grant update в 20261005000002_access.sql — только имя и вуз).
alter table public.profiles
  add column consent_version text,
  add column consent_at timestamptz,
  add column specialist_consent_version text,
  add column specialist_consent_at timestamptz;

-- p_kind: 'user' — согласие студента (вход через Google), 'specialist' — согласие специалиста.
-- p_version — дата редакции документа, например '2026-10-16'. Повторный вызов записывает новую редакцию.
create function public.give_consent(p_kind text, p_version text) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'Нужен вход в аккаунт' using errcode = '28000';
  end if;
  if p_version is null or char_length(p_version) not between 1 and 32 then
    raise exception 'Неизвестная редакция согласия' using errcode = '22023';
  end if;
  if p_kind = 'user' then
    update public.profiles set consent_version = p_version, consent_at = now() where id = v_uid;
  elsif p_kind = 'specialist' then
    update public.profiles set specialist_consent_version = p_version, specialist_consent_at = now() where id = v_uid;
  else
    raise exception 'Неизвестный вид согласия' using errcode = '22023';
  end if;
  if not found then
    raise exception 'Профиль не найден' using errcode = 'P0002';
  end if;
end;
$$;

revoke all on function public.give_consent(text, text) from public, anon;
grant execute on function public.give_consent(text, text) to authenticated;
