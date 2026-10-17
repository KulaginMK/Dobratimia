-- Push «Появился новый специалист» (решение владельца от 17 октября 2026 года): уходит само, когда администратор
-- впервые публикует карточку; получают вошедшие, кто включил «Новые специалисты» в профиле.
-- Рассылку доставляет сервис Expo Push, запрос к нему отправляет расширение pg_net.

-- В Supabase pg_net есть, его нужно только включить. В тестах (PGlite) расширения нет — там его заменяет заглушка.
do $$
begin
  create extension if not exists pg_net;
exception when others then
  raise notice 'pg_net не включён: %', sqlerrm;
end;
$$;

-- Адрес телефона для push (токен Expo Push). Строка живёт, пока включён переключатель.
-- Из приложения таблица не читается и не меняется: только функциями ниже.
create table public.push_tokens (
  token text primary key check (char_length(token) <= 200 and token ~ '^Expo(nent)?PushToken\[[^]\s]+\]$'),
  user_id uuid not null references auth.users on delete cascade,
  created_at timestamptz not null default now()
);
create index push_tokens_by_user on public.push_tokens (user_id, created_at);
alter table public.push_tokens enable row level security;
revoke all on public.push_tokens from anon, authenticated;

-- «Новые специалисты» включены: сохранить токен за вошедшим. Тот же телефон с другим аккаунтом — токен переходит
-- к тому, кто вошёл сейчас. Телефонов у аккаунта не больше пяти: самые старые токены удаляются.
create function public.register_push_token(p_token text) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'Нужен вход в аккаунт' using errcode = '28000';
  end if;
  insert into public.push_tokens (token, user_id) values (p_token, v_uid)
  on conflict (token) do update set user_id = excluded.user_id, created_at = now();
  delete from public.push_tokens
  where user_id = v_uid
    and token not in (
      select token from public.push_tokens where user_id = v_uid order by created_at desc, token limit 5
    );
end;
$$;

-- Переключатель выключен или человек выходит из аккаунта: свой токен удаляется, чужой не трогается.
create function public.unregister_push_token(p_token text) returns void
language plpgsql security definer set search_path = ''
as $$
begin
  delete from public.push_tokens where token = p_token and user_id = (select auth.uid());
end;
$$;

-- Когда карточку объявили; пусто — ещё не объявляли. Push уходит один раз: повторная публикация после снятия
-- и одобренные правки его не повторяют.
alter table public.specialists add column announced_at timestamptz;
-- Карточки, опубликованные до push-уведомлений, считаются уже объявленными.
update public.specialists set announced_at = now() where published;

-- Публикация новой карточки рассылает push всем токенам, по сто в одном запросе (предел Expo Push).
-- Токен доступа Expo, если владелец его завёл, лежит в Vault под именем expo_access_token.
-- Если отправить не удалось, карточка всё равно публикуется: в журнале базы останется предупреждение.
create function public.announce_specialist() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_auth text;
  v_batch jsonb;
begin
  if not new.published or new.announced_at is not null then
    return new;
  end if;
  new.announced_at := now();
  begin
    select 'Bearer ' || decrypted_secret into v_auth from vault.decrypted_secrets where name = 'expo_access_token';
    for v_batch in
      select jsonb_agg(jsonb_build_object(
        'to', token,
        'title', 'Появился новый специалист',
        'body', new.first_name || ' ' || new.last_name || coalesce(', ' || lower(new.title), '') || '. Карточка уже в подборе.',
        'data', jsonb_build_object('url', '/?s=match'),
        'channelId', 'specialists',
        'sound', 'default'
      ))
      from (select token, (row_number() over (order by token) - 1) / 100 as chunk from public.push_tokens) t
      group by chunk
    loop
      perform net.http_post(
        url := 'https://exp.host/--/api/v2/push/send',
        body := v_batch,
        headers := jsonb_strip_nulls(jsonb_build_object('Content-Type', 'application/json', 'Authorization', v_auth))
      );
    end loop;
  exception when others then
    raise warning 'Push о новом специалисте не отправлен: %', sqlerrm;
  end;
  return new;
end;
$$;

create trigger announce_specialist
  before insert or update of published on public.specialists
  for each row execute function public.announce_specialist();

revoke all on function public.register_push_token(text) from public, anon;
revoke all on function public.unregister_push_token(text) from public, anon;
revoke all on function public.announce_specialist() from public, anon, authenticated;

grant execute on function public.register_push_token(text) to authenticated;
grant execute on function public.unregister_push_token(text) to authenticated;
