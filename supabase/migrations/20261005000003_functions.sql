-- Функции «Добратимии». Все — security definer с пустым search_path: работают с таблицами в обход RLS,
-- поэтому каждая сама проверяет, кто её вызвал, и делает только одно узкое дело.
-- Вызывать их может только вошедший человек (authenticated); человеку без входа они недоступны.

-- Новый аккаунт → строка профиля. Имя берётся из Google-аккаунта.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Вызывается после каждого входа. Если почту вошедшего администратор вписал в specialist_accounts,
-- привязывает карточку к аккаунту и даёт роль specialist. Возвращает роль.
-- Работает и когда специалист вошёл раньше, чем администратор его создал: связь появится при следующем входе.
create function public.link_specialist() returns text
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_email text;
  v_linked boolean;
  v_role text;
begin
  if v_uid is null then
    raise exception 'Нужен вход в аккаунт' using errcode = '28000';
  end if;

  insert into public.profiles (id) values (v_uid) on conflict (id) do nothing;

  -- Только подтверждённая почта: вход идёт через Google, он её подтверждает.
  select lower(u.email) into v_email
  from auth.users u
  where u.id = v_uid and u.email_confirmed_at is not null;

  if v_email is not null then
    update public.specialist_accounts a
    set user_id = v_uid
    where lower(a.email) = v_email and a.user_id is null;
  end if;

  select exists (select 1 from public.specialist_accounts a where a.user_id = v_uid) into v_linked;
  if v_linked then
    update public.profiles set role = 'specialist' where id = v_uid and role = 'student';
  else
    -- Администратор убрал карточку или почту — кабинет закрывается.
    update public.profiles set role = 'student' where id = v_uid and role = 'specialist';
  end if;

  select p.role into v_role from public.profiles p where p.id = v_uid;
  return v_role;
end;
$$;

-- Статистика для кабинета специалиста: только числа и только по своей карточке.
-- total — всего отметок; last7days — за последние 7 дней; weeks — по 8 календарным неделям
-- (Europe/Minsk, с понедельника), от самой давней к текущей.
create function public.specialist_like_stats() returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_sid uuid := public.my_specialist_id();
  v_week_start timestamp := date_trunc('week', now() at time zone 'Europe/Minsk');
begin
  if v_sid is null then
    raise exception 'Статистика доступна только специалисту' using errcode = '42501';
  end if;

  return jsonb_build_object(
    'total', (select count(*) from public.likes l where l.specialist_id = v_sid),
    'last7days', (
      select count(*) from public.likes l
      where l.specialist_id = v_sid and l.created_at >= now() - interval '7 days'
    ),
    'weeks', (
      select jsonb_agg(w.likes order by w.n)
      from (
        select g.n, (
          select count(*) from public.likes l
          where l.specialist_id = v_sid
            and (l.created_at at time zone 'Europe/Minsk') >= v_week_start - (7 - g.n) * interval '7 days'
            and (l.created_at at time zone 'Europe/Minsk') < v_week_start - (6 - g.n) * interval '7 days'
        ) as likes
        from generate_series(0, 7) as g (n)
      ) w
    )
  );
end;
$$;

-- «Сохранить» в кабинете: черновик уходит на проверку. Студенты видят прежнюю карточку, пока его не одобрят.
create function public.submit_draft(p_payload jsonb) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_sid uuid := public.my_specialist_id();
begin
  if v_sid is null then
    raise exception 'Черновик может отправить только специалист' using errcode = '42501';
  end if;
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Черновик должен быть объектом с полями карточки' using errcode = '22023';
  end if;

  insert into public.specialist_drafts (specialist_id, payload, status, admin_comment, submitted_at)
  values (v_sid, p_payload, 'pending', null, now())
  on conflict (specialist_id) do update
    set payload = excluded.payload, status = 'pending', admin_comment = null, submitted_at = now();
end;
$$;

-- Одобрить черновик: переносит его поля в карточку и контакты и удаляет черновик.
-- Вызывает администратор: из Supabase Studio (select public.approve_draft('<id карточки>');)
-- или из приложения — тогда у вызвавшего должна быть роль admin.
-- Поля черновика называются как колонки: first_name, last_name, name_dative, gender, title, experience,
-- education, specializations, quote, about, format_online, format_offline, city, photo_path,
-- phone, telegram, booking_url, consent. Чего в черновике нет — не меняется.
create function public.approve_draft(p_specialist_id uuid) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  d jsonb;
begin
  -- В Studio входа в приложение нет (auth.uid() пуст) — это администратор базы. Из приложения — только роль admin.
  if (select auth.uid()) is not null and not public.is_admin() then
    raise exception 'Одобрять черновики может только администратор' using errcode = '42501';
  end if;

  select payload into d from public.specialist_drafts where specialist_id = p_specialist_id;
  if d is null then
    raise exception 'Черновика для этой карточки нет' using errcode = 'P0002';
  end if;

  update public.specialists s set
    first_name = coalesce(nullif(d ->> 'first_name', ''), s.first_name),
    last_name = coalesce(nullif(d ->> 'last_name', ''), s.last_name),
    name_dative = coalesce(nullif(d ->> 'name_dative', ''), s.name_dative),
    gender = case when d ? 'gender' then d ->> 'gender' else s.gender end,
    title = case when d ? 'title' then d ->> 'title' else s.title end,
    experience = case when d ? 'experience' then d ->> 'experience' else s.experience end,
    education = case when d ? 'education' then d ->> 'education' else s.education end,
    specializations = case
      when jsonb_typeof(d -> 'specializations') = 'array'
        then array(select jsonb_array_elements_text(d -> 'specializations'))
      else s.specializations
    end,
    quote = case when d ? 'quote' then d ->> 'quote' else s.quote end,
    about = case when d ? 'about' then d ->> 'about' else s.about end,
    format_online = coalesce((d ->> 'format_online')::boolean, s.format_online),
    format_offline = coalesce((d ->> 'format_offline')::boolean, s.format_offline),
    city = case when d ? 'city' then d ->> 'city' else s.city end,
    photo_path = case when d ? 'photo_path' then d ->> 'photo_path' else s.photo_path end,
    updated_at = now()
  where s.id = p_specialist_id;

  insert into public.specialist_contacts as c (specialist_id, phone, telegram, booking_url, consent)
  values (
    p_specialist_id,
    d ->> 'phone',
    d ->> 'telegram',
    d ->> 'booking_url',
    coalesce((d ->> 'consent')::boolean, false)
  )
  on conflict (specialist_id) do update set
    phone = case when d ? 'phone' then excluded.phone else c.phone end,
    telegram = case when d ? 'telegram' then excluded.telegram else c.telegram end,
    booking_url = case when d ? 'booking_url' then excluded.booking_url else c.booking_url end,
    consent = case when d ? 'consent' then excluded.consent else c.consent end;

  delete from public.specialist_drafts where specialist_id = p_specialist_id;
end;
$$;

-- «Я сегодня здесь»: клиент вызывает раз в день. Хранится только факт; строки старше двух дней удаляются тут же.
create function public.mark_presence() returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_today date := (now() at time zone 'Europe/Minsk')::date;
begin
  if v_uid is null then
    raise exception 'Нужен вход в аккаунт' using errcode = '28000';
  end if;
  insert into public.daily_presence (day, user_id) values (v_today, v_uid) on conflict do nothing;
  delete from public.daily_presence where day < v_today - 2;
end;
$$;

-- «Сегодня вы не одни: N человек» — сколько разных людей открыли приложение сегодня (Europe/Minsk).
create function public.today_count() returns integer
language sql stable security definer set search_path = ''
as $$
  select count(*)::integer
  from public.daily_presence
  where day = (now() at time zone 'Europe/Minsk')::date;
$$;

-- «Удалить мои данные»: удаляет аккаунт вызвавшего. Профиль, отметки «Нравится», сердечки и «был сегодня»
-- удаляются следом (on delete cascade); карточка специалиста остаётся, но отвязывается от аккаунта.
create function public.delete_account() returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
begin
  if v_uid is null then
    raise exception 'Нужен вход в аккаунт' using errcode = '28000';
  end if;
  delete from auth.users where id = v_uid;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.link_specialist() from public, anon;
revoke all on function public.specialist_like_stats() from public, anon;
revoke all on function public.submit_draft(jsonb) from public, anon;
revoke all on function public.approve_draft(uuid) from public, anon;
revoke all on function public.mark_presence() from public, anon;
revoke all on function public.today_count() from public, anon;
revoke all on function public.delete_account() from public, anon;

grant execute on function public.link_specialist() to authenticated;
grant execute on function public.specialist_like_stats() to authenticated;
grant execute on function public.submit_draft(jsonb) to authenticated;
grant execute on function public.approve_draft(uuid) to authenticated;
grant execute on function public.mark_presence() to authenticated;
grant execute on function public.today_count() to authenticated;
grant execute on function public.delete_account() to authenticated;
